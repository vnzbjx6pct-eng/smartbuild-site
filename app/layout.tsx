import "./globals.css";
import Link from "next/link";
import { Metadata } from "next";
import { Providers } from "@/app/providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Analytics } from "@vercel/analytics/react";
import { UserProvider } from "@/components/auth/UserProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";

// Estonian Metadata
export const metadata: Metadata = {
    title: {
        default: "SmartBuild - Ehitusmaterjalide Hinnavõrdlus",
        template: "%s | SmartBuild Eesti"
    },
    description: "Eesti suurim ehitusmaterjalide hinnavõrdlus. Leia parim pakkumine Espakist, Bauhofist, K-Rautast ja mujalt. Säästa aega ja raha.",
    keywords: ["ehitusmaterjalid", "ehitusmaterjalide hind", "hinnavõrdlus", "ehituspood", "bauhof", "k-rauta", "espak"],
    openGraph: {
        type: 'website',
        locale: 'et_EE',
        url: 'https://smartbuild.ee',
        siteName: 'SmartBuild Eesti',
        images: [
            {
                url: '/og-image.jpg', // Placeholder
                width: 1200,
                height: 630,
                alt: 'SmartBuild Ehitusmaterjalide Hinnavõrdlus',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://smartbuild.ee/#organization',
                name: 'SmartBuild Eesti',
                url: 'https://smartbuild.ee',
                logo: 'https://smartbuild.ee/logo.png', // Placeholder
                sameAs: [
                    'https://facebook.com/smartbuild', // Placeholder
                ]
            },
            {
                '@type': 'WebSite',
                '@id': 'https://smartbuild.ee/#website',
                url: 'https://smartbuild.ee',
                name: 'SmartBuild',
                publisher: {
                    '@id': 'https://smartbuild.ee/#organization'
                }
            }
        ]
    };

    return (
        <html lang="et">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>

            {/* ... */}

            <body className="flex flex-col min-h-screen bg-[#020617] text-slate-100 font-sans antialiased selection:bg-emerald-500/30">
                <Providers>
                    <LanguageProvider>
                        <UserProvider>
                            {/* Header extracted to client component */}
                            <Header />

                            {/* Main Content */}
                            <main className="flex-grow">
                                {children}
                            </main>

                            {/* Footer extracted to client component */}
                            <Footer />
                            <BottomNav />
                        </UserProvider>
                    </LanguageProvider>
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}

// This tool call is cancelled in favor of extraction strategy.