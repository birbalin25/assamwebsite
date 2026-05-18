export const siteConfig = {
  name: 'Assam in Dallas, USA',
  shortName: 'AiD',
  description: 'Connecting cultures, celebrating heritage, and building community. Proudly promoting the rich traditions and vibrant spirit of Assam and North East India in Dallas, USA.',
  url: 'https://assamindallas.org',
  ogImage: '/api/og',
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

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

export function generatePageMeta(
  title: string,
  description?: string,
  options?: { url?: string; image?: string }
) {
  const desc = description || siteConfig.description;
  const url = options?.url || siteConfig.url;
  const image = options?.image || siteConfig.ogImage;
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'website' as const,
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${siteConfig.name}`,
      description: desc,
    },
  };
}
