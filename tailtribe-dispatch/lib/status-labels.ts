export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'In afwachting',
  UNASSIGNED: 'Nog niet toegewezen',
  ASSIGNED: 'Toegewezen',
  CONFIRMED: 'Bevestigd',
  COMPLETED: 'Afgerond',
  CANCELLED: 'Geannuleerd',
  APPROVED: 'Goedgekeurd',
  REJECTED: 'Geweigerd',
  PENDING_ADMIN: 'Wacht op beheerder',
  NEW: 'Nieuw',
  ISSUE: 'Probleem',
  NO_SHOW: 'Niet komen opdagen',
  ACTIVE: 'Actief',
  LOCKED: 'Vergrendeld',
}

export const getStatusLabel = (status?: string | null) => {
  if (!status) return 'Onbekend'
  return STATUS_LABELS[status] ?? status
}
