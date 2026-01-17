import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/app/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://smartbuild.ee';

    // Static pages
    const routes = [
        '',
        '/products',
        '/rfq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic products
    // Note: In real app, fetch IDs from DB. Here we use PRODUCTS mock.
    const productRoutes = PRODUCTS.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(), // In real app, use product.updated_at
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }));

    return [...routes, ...productRoutes];
}
