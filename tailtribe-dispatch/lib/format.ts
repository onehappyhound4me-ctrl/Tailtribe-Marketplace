export function formatUserName(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  name?: string | null
}): string {
  const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  return full || user.name?.trim() || user.email?.trim() || 'Onbekend'
}

