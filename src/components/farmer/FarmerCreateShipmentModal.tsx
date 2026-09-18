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
  const [vehicle, setVehicle] = useState('MH-15-TC-4402 (Refrigerated)');
  const [buyer, setBuyer] = useState('FreshMart Regional Procurement Terminal');

  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  if (!isCreateShipmentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const batchId = `TG102-2026-${Math.floor(100 + Math.random() * 900)}`;
    setCreatedBatchId(batchId);

    createNewShipment({
      cropType,
      quantityKg: Number(quantityKg),
      quality: qualityGrade,
      farmName: pickupLocation,
    });
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
                Batch ID <strong className="font-mono text-emerald-700">{createdBatchId}</strong> has been converted into a scannable QR verification code.
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
              Vehicle assigned and dispatch checkpoint recorded. Moving to Live Truck Tracking screen.
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
                  <option value="Tomato">Tomato (Vine Ripened)</option>
                  <option value="Strawberry">Strawberry (Mahabaleshwar Sweet)</option>
                  <option value="Spinach">Spinach / Leafy Greens</option>
                  <option value="Capsicum">Capsicum / Bell Pepper</option>
                  <option value="Grapes">Thompson Seedless Grapes</option>
                  <option value="Onion">Nashik Red Onion</option>
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
                  <option value="Grade B (Commercial Wholesale)">Grade B (Commercial Wholesale)</option>
                  <option value="Grade C (Processing/Pulp)">Grade C (Processing / Pulp)</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Expected Delivery Window */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Delivery Window *
                </label>
                <input
                  type="text"
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Vehicle (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Vehicle (Optional)
                </label>
                <input
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Buyer (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Buyer (Optional)
                </label>
                <input
                  type="text"
                  value={buyer}
                  onChange={(e) => setBuyer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
              >
                <QrCode className="w-4 h-4" />
                <span>CREATE SHIPMENT</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
