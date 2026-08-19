import { MetadataRoute } from 'next';

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DokoDoko',
    short_name: 'DokoDoko',
    description: 'ふたりの思い出をひとつの地図に。',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e293b',
    icons: [
      {
        src: '/favicon_new.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
