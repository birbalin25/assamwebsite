export const siteConfig = {
  name: 'Assam in Dallas, USA',
  shortName: 'AiD',
  description: 'Connecting cultures, celebrating heritage, and building community. Proudly promoting the rich traditions and vibrant spirit of Assam and North East India in Dallas, USA.',
  url: 'https://assamindallas.org',
  ogImage: '/images/og-default.jpg',
  contactEmail: 'info@assameseassociationofdallas.org',
  keywords: [
    'Assamese community',
    'Assamese culture USA',
    'Bihu celebration',
    'Assam cultural events',
    'Assamese Americans',
    'Rongali Bihu',
    'Bohag Bihu',
    'Magh Bihu',
    'Assamese performances',
    'Indian community USA',
  ],
};

export function generatePageMeta(title: string, description?: string) {
  return {
    title: `${title} | ${siteConfig.name}`,
    description: description || siteConfig.description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description || siteConfig.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${siteConfig.name}`,
      description: description || siteConfig.description,
    },
  };
}
