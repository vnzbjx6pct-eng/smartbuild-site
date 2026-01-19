import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartbuild.ee';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account/', '/partner/', '/api/', '/_next/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
