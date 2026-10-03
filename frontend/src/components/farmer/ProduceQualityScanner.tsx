import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  ImagePlus,
  LoaderCircle,
  X,
} from 'lucide-react';
import { apiClient, type ProduceScanResult } from '../../services/apiClient';

interface ProduceQualityScannerProps {
  suggestedTransitHours: number;
  suggestedTemperatureC?: number;
  suggestedHumidityPct?: number;
  onAnalyzed: (result: Extract<ProduceScanResult, { status: 'ANALYZED' }>) => void;
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const riskStyles: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-800 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-800 border-red-200',
};

export const ProduceQualityScanner: React.FC<ProduceQualityScannerProps> = ({
  suggestedTransitHours,
  suggestedTemperatureC,
  suggestedHumidityPct,
  onAnalyzed,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [harvestedHoursAgo, setHarvestedHoursAgo] = useState('');
  const [result, setResult] = useState<ProduceScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRequestingCamera, setIsRequestingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanInFlightRef = useRef(false);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  useEffect(() => {
    setError(null);
    setResult(null);
  }, [suggestedTransitHours, suggestedTemperatureC, suggestedHumidityPct]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !cameraStream) return;
    video.srcObject = cameraStream;
    void video.play().catch(() => setCameraError('Camera preview could not start. Please import an image from your folder.'));
  }, [cameraStream, scannerOpen]);

  useEffect(() => () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
  }, [cameraStream]);

  const analyzeFile = async (file: File) => {
    if (scanInFlightRef.current) return;
    const harvestAge = Number(harvestedHoursAgo);
    if (harvestedHoursAgo.trim() === '' || !Number.isFinite(harvestAge) || harvestAge < 0 || harvestAge > 8760) {
      setError('Enter hours since harvest before scanning so Agrilogix can estimate remaining shelf life.');
      return;
    }

    setError(null);
    setResult(null);
    scanInFlightRef.current = true;
    setIsScanning(true);
    try {
      const scanResult = await apiClient.analyzeProduce(file, {
        transitHours: Math.max(0, suggestedTransitHours),
        temperatureC: suggestedTemperatureC,
        humidityPct: suggestedHumidityPct,
        harvestedHoursAgo: harvestAge,
      });
      setResult(scanResult);
      if (scanResult.status === 'ANALYZED') onAnalyzed(scanResult);
      if (scanResult.status === 'UNSUPPORTED_IMAGE') {
        cameraStream?.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraStream(null);
        setImage(null);
        setHarvestedHoursAgo('');
      }
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'The produce scan could not be completed.');
    } finally {
      scanInFlightRef.current = false;
      setIsScanning(false);
    }
  };

  const openScanner = async () => {
    setScannerOpen(true);
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is unavailable in this browser or connection. You can still import an image from your folder.');
      return;
    }

    setIsRequestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      setCameraStream(stream);
    } catch (cameraAccessError) {
      const denied = cameraAccessError instanceof DOMException && cameraAccessError.name === 'NotAllowedError';
      setCameraError(denied
        ? 'Camera access was denied. Allow camera access in your browser settings or import an image from your folder.'
        : 'Could not access a camera. Connect or enable a camera, or import an image from your folder.');
    } finally {
      setIsRequestingCamera(false);
    }
  };

  const closeScanner = () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setScannerOpen(false);
    setCameraError(null);
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('The camera image is not ready yet. Wait a moment or import an image from your folder.');
      return;
    }
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Could not capture the camera image. Please import an image from your folder.');
      return;
    }
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Could not capture the camera image. Please try again or import an image from your folder.');
        return;
      }
      const capturedImage = new File([blob], `agrilogix-produce-${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (selectImage(capturedImage)) void analyzeFile(capturedImage);
      setCameraError(null);
    }, 'image/jpeg', 0.82);
  };

  const selectImage = (file?: File): File | null => {
    setError(null);
    setResult(null);
    if (!file) return null;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImage(null);
      setHarvestedHoursAgo('');
      setError('Unsupported file. Choose a JPEG, PNG, or WebP image.');
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImage(null);
      setError('The image must be 10 MB or smaller.');
      return null;
    }
    setImage(file);
    return file;
  };

  const scan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) {
      setError('Choose a clear photo of harvested produce to scan.');
      return;
    }
    await analyzeFile(image);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Produce quality scanner</h2>
        <p className="mt-1 text-sm text-slate-500">Scan harvested produce for quality and remaining shelf life.</p>
      </div>

      {!scannerOpen ? (
        <div className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h3 className="text-sm font-medium text-slate-900">Take a photo or select an image</h3>
            <p className="mt-1 text-sm text-slate-500">Camera access is requested when you open the scanner.</p>
          </div>
          <button type="button" onClick={() => void openScanner()} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
            <Camera className="h-4 w-4" /> Open scanner
          </button>
        </div>
      ) : (
      <form onSubmit={scan} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.75fr)]">
        <div className="space-y-4">
          {cameraStream ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
              <video ref={videoRef} autoPlay playsInline muted aria-label="Live produce camera preview" className="aspect-video w-full object-contain" />
              <div className="flex items-center justify-between gap-3 bg-slate-900 px-3 py-3">
                <span className="text-xs text-slate-300">Position harvested produce clearly in frame.</span>
                <button type="button" onClick={captureImage} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                  <Camera className="h-4 w-4" /> Capture
                </button>
              </div>
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                {isRequestingCamera ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
              </span>
              <p className="text-sm font-semibold text-slate-800">{isRequestingCamera ? 'Waiting for camera permission…' : 'Camera is not active'}</p>
              <p className="mt-1 text-xs text-slate-500">Allow access when your browser asks, or import a photo below.</p>
            </div>
          )}
          {previewUrl && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5">
              <img src={previewUrl} alt="Selected harvested produce" className="h-16 w-16 rounded-lg bg-slate-50 object-contain" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{image?.name}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {isScanning ? 'Analyzing…' : result?.status === 'ANALYZED' ? 'Analysis complete' : result?.status === 'UNSUPPORTED_IMAGE' ? 'Unsupported image' : result?.status === 'IMAGE_QUALITY_INSUFFICIENT' ? 'Image quality insufficient' : error ? 'Analysis needs attention' : 'Photo selected'}
                </p>
              </div>
            </div>
          )}
          <label className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 sm:w-auto">
            <ImagePlus className="h-4 w-4 text-emerald-700" />
            Import from folder
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const selectedFile = selectImage(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
                if (selectedFile) void analyzeFile(selectedFile);
              }}
            />
          </label>
          {cameraError && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">{cameraError}</p>}
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <Camera className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            Photograph the harvested crop close-up in clear, even lighting. Growing plants, leaves, flowers, and unrelated objects are not evaluated.
          </p>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-800">
            Hours since harvest
            <input type="number" min="0" max="8760" step="0.5" required placeholder="e.g. 12" value={harvestedHoursAgo} onChange={(event) => setHarvestedHoursAgo(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <p className="mb-4 mt-2 text-xs leading-5 text-slate-500">Route, temperature, and humidity are filled from Agrilogix data when available.</p>
          <button type="submit" disabled={isScanning || !image} className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70">
            {isScanning ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isScanning ? 'Analyzing…' : image ? 'Analyze again' : 'Analyze produce'}
          </button>
          <button type="button" onClick={closeScanner} className="mt-2 inline-flex min-h-9 items-center justify-center gap-2 self-center rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800">
            <X className="h-3.5 w-3.5" /> Close scanner
          </button>
          {error && <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">{error}</p>}
        </div>
      </form>
      )}

      {isScanning && (
        <div role="status" className="mx-5 mb-5 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:mx-6">
          <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-blue-700" />
          <div>
            <h3 className="font-semibold text-blue-950">Analyzing image</h3>
            <p className="mt-1 text-sm text-blue-900">Checking produce type and visible quality. This usually takes a few seconds.</p>
          </div>
        </div>
      )}

      {result?.status === 'UNSUPPORTED_IMAGE' && (
        <div role="status" className="mx-5 mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:mx-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-semibold text-amber-950">Unsupported Image</h3>
            <p className="mt-1 text-sm text-amber-900">This scanner only evaluates harvested agricultural produce.</p>
            <p className="mt-1 text-sm text-amber-900">Import another photo of harvested produce to scan again.</p>
          </div>
        </div>
      )}

      {result?.status === 'IMAGE_QUALITY_INSUFFICIENT' && (
        <div role="status" className="mx-5 mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:mx-6">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <h3 className="font-semibold text-amber-950">Image quality is insufficient.</h3>
            <p className="mt-1 text-sm text-amber-900">Please capture the produce clearly in good lighting.</p>
          </div>
        </div>
      )}

      {result?.status === 'ANALYZED' && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Produce scanned</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{result.produceName}</h3>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Freshness score</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{result.freshnessScore}<span className="ml-1 text-sm font-medium text-slate-400">/100</span></p>
              <p className="mt-1 text-xs text-slate-600">{result.freshnessReason}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${result.freshnessScore}%` }} /></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Estimated Remaining Shelf Life</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{result.shelfLife.minDays}–{result.shelfLife.maxDays}<span className="ml-1 text-sm font-medium text-slate-500">days</span></p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Spoilage risk</p>
              <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${riskStyles[result.logistics.spoilageRisk]}`}>{result.logistics.spoilageRisk}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900">Visible quality</h4>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
              <div><dt className="text-slate-500">Ripeness</dt><dd className="mt-0.5 font-semibold capitalize text-slate-800">{result.quality.ripeness}</dd></div>
              <div><dt className="text-slate-500">Color / uniformity</dt><dd className="mt-0.5 font-semibold text-slate-800">{result.quality.color || 'Not clear'} · {result.quality.colorUniformity}%</dd></div>
              {(['bruising', 'cuts', 'cracks', 'discoloration', 'mold', 'rot', 'shriveling'] as const).map((defect) => (
                <div key={defect}><dt className="capitalize text-slate-500">{defect}</dt><dd className="mt-0.5 font-semibold capitalize text-slate-800">{result.quality[defect]}</dd></div>
              ))}
            </dl>
            {result.quality.otherVisibleDefects.length > 0 && (
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-700">Other visible defects: {result.quality.otherVisibleDefects.join(', ')}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
