export interface VehicleClass {
  id: string;
  label: string;
  maxPayloadKg: number;
  maxVolumeM3: number;
  body: string;
}

export const VEHICLE_CLASSES: VehicleClass[] = [
  { id: 'mini-pickup', label: 'Small goods vehicle', maxPayloadKg: 750, maxVolumeM3: 4, body: 'Local farm and short-lane loads' },
  { id: 'light-truck', label: 'Eicher / light truck', maxPayloadKg: 3000, maxVolumeM3: 16, body: 'Compact bulk produce loads' },
  { id: 'medium-truck', label: 'Medium truck', maxPayloadKg: 7000, maxVolumeM3: 34, body: 'Multi-pallet harvests' },
  { id: 'heavy-truck', label: 'Heavy truck', maxPayloadKg: 15000, maxVolumeM3: 50, body: 'Large consolidated harvests' },
];
