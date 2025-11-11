import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Switches to the target country domain and path
 * @param currentPathname - The current pathname (e.g., '/about', '/nl/search')
 * @param targetCountry - The target country ('BE' or 'NL')
 * @returns The full URL with correct domain
 */
export function switchCountryDomain(currentPathname: string | null | undefined, targetCountry: 'BE' | 'NL'): string {
  const beDomain = process.env.NEXT_PUBLIC_BE_DOMAIN || 'https://tailtribe.be'
  const nlDomain = process.env.NEXT_PUBLIC_NL_DOMAIN || 'https://tailtribe.nl'
  
  const targetDomain = targetCountry === 'NL' ? nlDomain : beDomain
  
  if (!currentPathname) {
    return targetDomain
  }
  
  // Detect if we're currently on NL domain by checking if pathname starts with /nl
  // or if we can detect from window.location
  const isCurrentlyNL = currentPathname.startsWith('/nl')
  
  // If switching to same country, just ensure correct domain
  if ((targetCountry === 'NL' && isCurrentlyNL) || (targetCountry === 'BE' && !isCurrentlyNL)) {
    // Keep current path but ensure correct domain
    // If on NL domain, remove /nl prefix; if on BE domain, keep as is
    let path = currentPathname
    if (targetCountry === 'NL' && path.startsWith('/nl')) {
      path = path.replace(/^\/nl/, '') || '/'
    }
    return `${targetDomain}${path}`
  }
  
  // Remove /nl prefix if switching to BE
  if (targetCountry === 'BE' && isCurrentlyNL) {
    const pathWithoutNL = currentPathname.replace(/^\/nl/, '') || '/'
    return `${targetDomain}${pathWithoutNL}`
  }
  
  // Switching to NL - remove /nl prefix since we're using nlDomain
  if (targetCountry === 'NL' && !isCurrentlyNL) {
    // Preserve query params
    const [path, query] = currentPathname.split('?')
    const cleanPath = path === '/' ? '' : path
    const fullPath = query ? `${cleanPath}?${query}` : cleanPath
    return `${targetDomain}${fullPath}`
  }
  
  return targetDomain
}

/**
 * Switches the current pathname to the target country
 * @param currentPathname - The current pathname (e.g., '/about', '/nl/search')
 * @param targetCountry - The target country ('BE' or 'NL')
 * @returns The new pathname for the target country
 */
export function switchCountryPath(currentPathname: string | null | undefined, targetCountry: 'BE' | 'NL'): string {
  if (!currentPathname) return targetCountry === 'NL' ? '/nl' : '/'
  
  const isCurrentlyNL = currentPathname.startsWith('/nl')
  
  // If already on target country, return current path
  if ((targetCountry === 'NL' && isCurrentlyNL) || (targetCountry === 'BE' && !isCurrentlyNL)) {
    return currentPathname
  }
  
  // Remove /nl prefix if switching to BE
  if (targetCountry === 'BE' && isCurrentlyNL) {
    const pathWithoutNL = currentPathname.replace(/^\/nl/, '') || '/'
    return pathWithoutNL
  }
  
  // Add /nl prefix if switching to NL
  if (targetCountry === 'NL' && !isCurrentlyNL) {
    // Preserve query params
    const [path, query] = currentPathname.split('?')
    const newPath = path === '/' ? '/nl' : `/nl${path}`
    return query ? `${newPath}?${query}` : newPath
  }
  
  return targetCountry === 'NL' ? '/nl' : '/'
}

/**
 * Gets the current country from hostname or pathname
 * @param pathname - The current pathname (optional)
 * @returns 'BE' or 'NL'
 */
export function getCurrentCountry(pathname?: string | null | undefined): 'BE' | 'NL' {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') {
      return 'NL'
    }
    if (hostname.includes('tailtribe.be') || hostname === 'tailtribe.be') {
      return 'BE'
    }
  }
  // Fallback to pathname detection
  return pathname?.startsWith('/nl') ? 'NL' : 'BE'
}

/**
 * Adds country prefix to a path if needed
 * @param path - The path to add prefix to (e.g., '/search', '/diensten')
 * @param country - The target country ('BE' or 'NL')
 * @returns The path with country prefix if NL and on BE domain, otherwise original path
 */
export function addCountryPrefix(path: string, country: 'BE' | 'NL'): string {
  // If on NL domain, never add /nl prefix
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') {
      // On NL domain, remove /nl prefix if present
      if (path.startsWith('/nl')) {
        return path.replace(/^\/nl/, '') || '/'
      }
      return path
    }
  }
  
  // On BE domain or server-side
  if (country === 'NL' && !path.startsWith('/nl')) {
    return path === '/' ? '/nl' : `/nl${path}`
  }
  if (country === 'BE' && path.startsWith('/nl')) {
    return path.replace(/^\/nl/, '') || '/'
  }
  return path
}