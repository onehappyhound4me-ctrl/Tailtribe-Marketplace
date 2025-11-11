import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
 * Gets the current country from pathname
 * @param pathname - The current pathname
 * @returns 'BE' or 'NL'
 */
export function getCurrentCountry(pathname: string | null | undefined): 'BE' | 'NL' {
  return pathname?.startsWith('/nl') ? 'NL' : 'BE'
}

/**
 * Adds country prefix to a path if needed
 * @param path - The path to add prefix to (e.g., '/search', '/diensten')
 * @param country - The target country ('BE' or 'NL')
 * @returns The path with country prefix if NL, otherwise original path
 */
export function addCountryPrefix(path: string, country: 'BE' | 'NL'): string {
  if (country === 'NL' && !path.startsWith('/nl')) {
    return path === '/' ? '/nl' : `/nl${path}`
  }
  if (country === 'BE' && path.startsWith('/nl')) {
    return path.replace(/^\/nl/, '') || '/'
  }
  return path
}