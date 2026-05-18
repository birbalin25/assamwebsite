import { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebase/admin';

const baseUrl = 'https://assamindallas.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/performances`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/gallery/photos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/gallery/videos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/community`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/donate`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const db = getAdminDb();

    const [events, performances, announcements, albums, members] = await Promise.all([
      db.collection('events').where('status', '==', 'published').select('year', 'slug', 'updatedAt').get(),
      db.collection('performances').where('status', '==', 'published').select('updatedAt').get(),
      db.collection('announcements').where('status', '==', 'published').select('slug', 'updatedAt').get(),
      db.collection('albums').where('status', '==', 'published').select('slug', 'updatedAt').get(),
      db.collection('members').where('status', '==', 'published').select('updatedAt', 'isPerformer').get(),
    ]);

    events.docs.forEach((doc) => {
      const data = doc.data();
      if (data.year && data.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}/events/${data.year}/${data.slug}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    });

    performances.docs.forEach((doc) => {
      dynamicRoutes.push({
        url: `${baseUrl}/performances/${doc.id}`,
        lastModified: doc.data().updatedAt?.toDate() || new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });

    announcements.docs.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}/news/${data.slug}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    });

    albums.docs.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        dynamicRoutes.push({
          url: `${baseUrl}/gallery/albums/${data.slug}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    });

    members.docs.forEach((doc) => {
      const data = doc.data();
      dynamicRoutes.push({
        url: `${baseUrl}/community/${doc.id}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: 'yearly',
        priority: 0.4,
      });
      if (data.isPerformer) {
        dynamicRoutes.push({
          url: `${baseUrl}/artists/${doc.id}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: 'yearly',
          priority: 0.5,
        });
      }
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap routes:', error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
