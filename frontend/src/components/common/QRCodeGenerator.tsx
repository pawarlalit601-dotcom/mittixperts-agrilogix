import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Check, Copy, QrCode as QrIcon, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  label?: string;
  subLabel?: string;
  showActions?: boolean;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  includeMargin?: boolean;
  altText?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 180,
  label,
  subLabel,
  showActions = true,
  className = '',
  darkColor = '#0f172a', // slate-900
  lightColor = '#ffffff',
  includeMargin = true,
  altText = 'Agricultural Batch Verification QR Code'
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      return;
    }

    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 360), // Generate crisp retina 2x resolution
      margin: includeMargin ? 2 : 1,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H' // High error tolerance (up to 30% damage/distortion safe for farm field tags)
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to generate QR Code:', err);
          setError('QR code could not be generated. Please try again.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor, includeMargin]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy QR value:', err);
    }
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Batch-QR-${value.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* QR Code Frame */}
      <div className="relative group p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm transition-all duration-200 hover:shadow-md">
        {dataUrl ? (
          <div className="relative overflow-hidden rounded-xl bg-white flex items-center justify-center">
            <img
              src={dataUrl}
              alt={altText}
              width={size}
              height={size}
              className="block rounded-lg select-none"
              style={{ width: `${size}px`, height: `${size}px` }}
            />
            {/* Center Branding Accent */}
            <div
              className="absolute pointer-events-none rounded-md bg-emerald-600/90 text-white font-black text-[9px] px-1 py-0.5 shadow-sm border border-white"
              style={{ fontSize: Math.max(8, Math.floor(size / 18)) }}
            >
              AGRI
            </div>

            {/* Quick Action Overlay on hover */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                title="Expand Fullscreen"
                className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white transition cursor-pointer shadow-md"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                title="Download PNG"
                className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center p-4 text-xs text-red-600 bg-red-50 rounded-xl"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <span>{error}</span>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-4 bg-slate-50 animate-pulse rounded-xl text-slate-400"
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <QrIcon className="w-8 h-8 opacity-40 mb-2 animate-spin" />
            <span className="text-[11px]">Generating QR...</span>
          </div>
        )}

        {/* Verified Scan Badge */}
        <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-white">
          <ShieldCheck className="w-3 h-3" />
          <span>SCANNABLE</span>
        </div>
      </div>

      {/* Label and Payload */}
      {label && (
        <div className="mt-2.5 font-mono font-bold text-xs text-slate-900 flex items-center justify-center gap-1.5">
          <span>{label}</span>
        </div>
      )}
      {subLabel && (
        <p className="text-[11px] text-slate-500 mt-0.5 max-w-[240px] leading-tight">
          {subLabel}
        </p>
      )}

      {/* Action Buttons */}
      {showActions && dataUrl && (
        <div className="flex items-center gap-2 mt-3 text-xs">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer text-[11px] shadow-2xs"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Save PNG</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer text-[11px] shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Data</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && dataUrl && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    Official Cryptographic QR
                  </h4>
                  <p className="text-[10px] text-slate-500">Scan directly with camera</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <img
                src={dataUrl}
                alt={altText}
                width={260}
                height={260}
                className="rounded-xl shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="font-mono font-black text-sm text-slate-900 break-all bg-slate-100 p-2 rounded-xl">
                {value}
              </div>
              <p className="text-xs text-slate-500">
                Point any smartphone camera or buyer receiving scanner to instantly verify chain-of-custody.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Image</span>
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
