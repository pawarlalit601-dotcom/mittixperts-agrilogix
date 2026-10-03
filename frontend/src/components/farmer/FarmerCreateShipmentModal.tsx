import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Truck,
  Scale,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRCodeGenerator } from '../common/QRCodeGenerator';
import { CropType, QualityGrade } from '../../types';
import { VEHICLE_CLASSES } from '../../data/vehicleClasses';

export const FarmerCreateShipmentModal: React.FC = () => {
  const {
    isCreateShipmentModalOpen,
    closeCreateShipmentModal,
    createNewShipment
  } = useApp();

  const [cropType, setCropType] = useState<CropType>('Tomato');
  const [quantityKg, setQuantityKg] = useState('1000');
  const [harvestDate, setHarvestDate] = useState('2026-09-17');
  const [harvestTime, setHarvestTime] = useState('06:30');
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A (Export/Premium)');
  const [pickupLocation, setPickupLocation] = useState('Sahyadri Valley Farm Gate, Nashik');
  const [destination, setDestination] = useState('Pune Market');
  const [deliveryWindow, setDeliveryWindow] = useState('Within 6 hours');
  const [cargoVolumeM3, setCargoVolumeM3] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [requiresRefrigeration, setRequiresRefrigeration] = useState(false);

  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadWeightKg = Number(quantityKg);
  const loadVolumeM3 = Number(cargoVolumeM3);
  const eligibleVehicleClasses = VEHICLE_CLASSES.filter((vehicleClass) =>
    Number.isFinite(loadWeightKg) && loadWeightKg > 0 && vehicleClass.maxPayloadKg >= loadWeightKg &&
    Number.isFinite(loadVolumeM3) && loadVolumeM3 > 0 && vehicleClass.maxVolumeM3 >= loadVolumeM3
  );

  if (!isCreateShipmentModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    try {
      if (!eligibleVehicleClasses.some((vehicleClass) => vehicleClass.id === vehicleType)) {
        setSubmissionError('Choose a vehicle class that fits both the entered weight and packed volume.');
        return;
      }
      const generatedLotId = await createNewShipment({
        cropType,
        quantityKg: Number(quantityKg),
        cargoVolumeM3: loadVolumeM3,
        vehicleType,
        quality: qualityGrade,
        farmName: pickupLocation,
        harvestTimestamp: new Date(`${harvestDate}T${harvestTime}`).toISOString(),
        destination,
        storageCondition: requiresRefrigeration ? 'Refrigerated transport requested' : 'Standard transport requested',
        deliveryAt: new Date(Date.now() + (Number(deliveryWindow.match(/[\d.]+/)?.[0] || 6) * 60 * 60 * 1000)).toISOString(),
      });
      setCreatedBatchId(generatedLotId);
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Shipment could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Create New Agricultural Shipment</h3>
              <p className="text-xs text-slate-500">Initiate harvest batch, digital weight verification & QR seal</p>
            </div>
          </div>

          <button
            onClick={closeCreateShipmentModal}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdBatchId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900">Shipment Batch Generated!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Produce lot ID <strong className="font-mono text-emerald-700">{createdBatchId}</strong> has been created automatically and linked to the shipment record.
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                AI-generated estimate. Final acceptance is subject to buyer requirements and actual condition on arrival.
              </p>
            </div>

            {/* Scannable QR Code */}
            <div className="flex justify-center py-1">
              <QRCodeGenerator
                value={createdBatchId}
                size={140}
                label={`ID: ${createdBatchId}`}
                subLabel="Scannable produce tag ready for crate labeling."
                showActions={true}
              />
            </div>

            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your vehicle preference is attached to the shipment request. Carrier and driver assignment will be confirmed separately.
            </p>

            <button
              onClick={() => {
                setCreatedBatchId(null);
                closeCreateShipmentModal();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Open Live Tracking
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {submissionError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{submissionError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crop Type *
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as CropType)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Potato">Potato</option>
                  <option value="Strawberries">Strawberries</option>
                  <option value="Bell Pepper">Bell Pepper</option>
                  <option value="Grapes">Grapes</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    required
                    min="50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 1000"
                  />
                  <Scale className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Harvest Date & Time */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harvest Date & Time *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="time"
                    value={harvestTime}
                    onChange={(e) => setHarvestTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Grade *
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                >
                  <option value="Grade A (Export/Premium)">Grade A (Export / Premium)</option>
                  <option value="Grade B (Standard Retail)">Grade B (Standard Retail)</option>
                  <option value="Grade C (Processing Only)">Grade C (Processing Only)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Market *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <label className="block text-xs font-bold text-slate-700">Expected delivery window<input type="text" value={deliveryWindow} onChange={(event) => setDeliveryWindow(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900" /></label>

            <section className="space-y-3 rounded-lg border border-sky-100 bg-sky-50/60 p-4">
              <div><h4 className="text-sm font-bold text-slate-900">Choose a vehicle size</h4><p className="mt-1 text-xs text-slate-600">Options are filtered by load weight and approximate packed volume. Final payload and body dimensions must be confirmed by the carrier.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700">Approx packed volume (m³)<input type="number" min="0.1" max="1000" step="0.1" value={cargoVolumeM3} onChange={(event) => { setCargoVolumeM3(event.target.value); setVehicleType(''); }} required className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm" placeholder="e.g. 8.5" /></label>
                <label className="flex items-center gap-2 self-end rounded-md border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-700"><input type="checkbox" checked={requiresRefrigeration} onChange={(event) => setRequiresRefrigeration(event.target.checked)} className="h-4 w-4 accent-emerald-700" />Refrigerated vehicle required</label>
              </div>
              {eligibleVehicleClasses.length ? <div className="grid gap-2 sm:grid-cols-2">
                {eligibleVehicleClasses.map((vehicleClass) => <label key={vehicleClass.id} className={`flex cursor-pointer gap-3 rounded-md border p-3 transition ${vehicleType === vehicleClass.id ? 'border-emerald-700 bg-white ring-1 ring-emerald-700' : 'border-slate-200 bg-white hover:border-emerald-400'}`}>
                  <input type="radio" name="vehicleType" value={vehicleClass.id} checked={vehicleType === vehicleClass.id} onChange={() => setVehicleType(vehicleClass.id)} required className="mt-0.5 h-4 w-4 accent-emerald-700" />
                  <span><strong className="flex items-center gap-1.5 text-xs text-slate-900"><Truck className="h-4 w-4 text-emerald-700" />{vehicleClass.label}</strong><span className="mt-1 block text-[11px] text-slate-600">Up to {vehicleClass.maxPayloadKg.toLocaleString()} kg · {vehicleClass.maxVolumeM3} m³ body</span><span className="mt-1 block text-[10px] text-slate-500">{vehicleClass.body}</span></span>
                </label>)}
              </div> : <p role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">No listed vehicle class fits this load. Split the produce into smaller shipments or adjust the packed-volume estimate.</p>}
              <p className="text-[10px] text-slate-500">Vehicle capacities are indicative selection guides, not a carrier offer or legal payload confirmation.</p>
            </section>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeCreateShipmentModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>{isSubmitting ? 'SAVING SHIPMENT…' : 'CREATE SHIPMENT'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
