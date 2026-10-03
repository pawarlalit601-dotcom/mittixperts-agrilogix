const shipmentStatusLabels: Record<string, string> = {
  AT_RISK: 'Freshness Attention',
  RESCUE_ACTIVE: 'Freshness-Based Rerouting',
  REROUTE_REQUESTED: 'Route Adjustment Requested',
  REROUTED: 'Route Updated',
};

const verificationStatusLabels: Record<string, string> = {
  REJECTED: 'Not approved',
  EXPIRED: 'Renewal required',
  REQUEST_REUPLOAD: 'Update requested',
};

export const formatShipmentStatus = (status: string): string =>
  shipmentStatusLabels[status] || status.replace(/_/g, ' ');

export const formatVerificationStatus = (status: string): string =>
  verificationStatusLabels[status] || status.replace(/_/g, ' ');