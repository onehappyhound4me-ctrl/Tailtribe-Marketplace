// Shared styling + cache busting for service icons.
//
// These icons are served from /public/assets and can be aggressively cached by browsers.
// By appending a version query param we force a refresh after deployments.

export const SERVICE_ICON_FILTER =
  'hue-rotate(28deg) saturate(0.62) brightness(0.98) contrast(1.08)'

// Bump this when icon assets change or when mobile Safari cache gets "stuck".
const ICON_ASSET_VERSION = '2026-01-27-1'

export function withAssetVersion(src: string) {
  if (!src) return src
  const encoded = encodeURI(src)
  return encoded.includes('?')
    ? `${encoded}&v=${ICON_ASSET_VERSION}`
    : `${encoded}?v=${ICON_ASSET_VERSION}`
}

