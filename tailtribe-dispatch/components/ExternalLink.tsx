import type { AnchorHTMLAttributes, ReactNode } from 'react'

type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  href: string
  children: ReactNode
}

/**
 * Safe external link wrapper.
 * - Uses <a> (never next/link) for external destinations
 * - Defaults to target=_blank + rel=noopener noreferrer
 */
export function ExternalLink({
  href,
  children,
  target,
  rel,
  ...rest
}: ExternalLinkProps) {
  const safeTarget = target ?? '_blank'
  const safeRel = rel ?? (safeTarget === '_blank' ? 'noopener noreferrer' : undefined)

  return (
    <a href={href} target={safeTarget} rel={safeRel} {...rest}>
      {children}
    </a>
  )
}

