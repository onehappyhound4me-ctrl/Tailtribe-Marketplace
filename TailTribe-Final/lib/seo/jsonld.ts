// Consolidated JSON-LD helpers
export interface ServiceSchema {
  "@context": "https://schema.org"
  "@type": "Service"
  name: string
  description: string
  areaServed: {
    "@type": "Country"
    name: string
  }
  provider: {
    "@type": "Organization"
    name: string
    url: string
  }
}

export interface BreadcrumbSchema {
  "@context": "https://schema.org"
  "@type": "BreadcrumbList"
  itemListElement: Array<{
    "@type": "ListItem"
    position: number
    name: string
    item: string
  }>
}

export function generateServiceSchema(service: {
  title: string
  shortDescription: string
}): ServiceSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    areaServed: {
      "@type": "Country",
      name: "België"
    },
    provider: {
      "@type": "Organization",
      name: "TailTribe",
      url: "https://tailtribe.be"
    }
  }
}

export function generateBreadcrumbSchema(serviceTitle: string, serviceSlug: string): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://tailtribe.be"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Diensten",
        item: "https://tailtribe.be/diensten"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: serviceTitle,
        item: `https://tailtribe.be/diensten/${serviceSlug}`
      }
    ]
  }
}
