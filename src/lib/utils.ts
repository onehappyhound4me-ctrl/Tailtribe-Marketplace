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