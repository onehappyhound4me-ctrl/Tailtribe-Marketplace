// Re-export admin bookings API route handlers.
// Use relative import to avoid path-alias resolution issues during Vercel builds.
export { GET, PATCH, DELETE } from '../../api/admin/bookings/route'
