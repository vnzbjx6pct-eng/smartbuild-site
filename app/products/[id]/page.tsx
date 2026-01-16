import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: product } = await supabase.from('products').select('name').eq('id', id).single();
    return {
        title: product ? `${product.name} - Hindade võrdlus` : 'Toode puudub',
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch product and ALL offers with brand info
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      offers (
        id,
        price,
        updated_at,
        url,
        brands (
           name,
           slug,
           logo_url
        )
      )
    `)
        .eq('id', id)
        .single();

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Toodet ei leitud</h1>
                <Link href="/products" className="text-orange-600 hover:underline">Tagasi kataloogi</Link>
            </div>
        );
    }

    // Sort offers by price (ascending)
    const offers = product.offers?.sort((a: any, b: any) => a.price - b.price) || [];
    const bestPrice = offers.length > 0 ? offers[0].price : null;

    return (
        <div className="bg-slate-50 min-h-screen py-10">
            <div className="container mx-auto px-4">

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link href="/" className="hover:text-slate-900">Avaleht</Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-slate-900">Kataloog</Link>
                    <span>/</span>
                    <span className="text-slate-900 truncate max-w-xs">{product.name}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Product Image & Info */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
                            <div className="aspect-square bg-slate-50 rounded-xl relative overflow-hidden mb-6 flex items-center justify-center">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-slate-300">Pilt puudub</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Toote info</h3>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <dt className="text-slate-500">Kategooria</dt>
                                    <dd className="font-medium text-slate-900 text-right">{product.category || '-'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <dt className="text-slate-500">Ühik</dt>
                                    <dd className="font-medium text-slate-900 text-right">{product.unit || 'tk'}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt className="text-slate-500">Tootekood</dt>
                                    <dd className="font-medium text-slate-900 text-right text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{product.id.split('-')[0]}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right: Comparison Table */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
                                <p className="text-slate-500">
                                    {offers.length > 0 ? (
                                        <>Leidsime <strong className="text-slate-900">{offers.length} pakkumist</strong> alates <strong className="text-green-600">{bestPrice} €</strong></>
                                    ) : (
                                        "Hetkel pakkumised puuduvad."
                                    )}
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Pood</th>
                                            <th className="px-6 py-4">Hind ({product.unit})</th>
                                            <th className="px-6 py-4 hidden sm:table-cell">Uuendatud</th>
                                            <th className="px-6 py-4 text-right">Tegevus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {offers.map((offer: any, index: number) => {
                                            const isCheapest = index === 0;
                                            return (
                                                <tr key={offer.id} className={`hover:bg-slate-50 transition-colors ${isCheapest ? 'bg-orange-50/30' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="font-bold text-slate-900">{offer.brands?.name}</div>
                                                            {isCheapest && (
                                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Parim hind</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-lg font-bold text-slate-900">{offer.price} €</div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden sm:table-cell text-slate-500">
                                                        {new Date(offer.updated_at).toLocaleDateString('et-EE')}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {/* Note: This button currently just links to cart page for MVP. 
                                                   In reality, it should Add to Context/Local Storage Cart.
                                                   For now, valid flow is just visual or simple link.
                                               */}
                                                        <Link
                                                            href={`/cart?add=${product.id}&offer=${offer.id}`} // Simple query param mock add
                                                            className="inline-block bg-[#0f172a] hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                        >
                                                            Lisa ostukorvi
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
                            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Kas soovite osta suuremat kogust?</h4>
                                <p className="text-blue-700 text-sm mt-1">
                                    Lisage tooted ostukorvi ja saatke meile hinnapäring. Saadame selle automaatselt poodide projektimüügi osakondadesse, et saaksite personaalse pakkumise.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
