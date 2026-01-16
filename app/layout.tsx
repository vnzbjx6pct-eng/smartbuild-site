import "./globals.css";
import Link from "next/link";
import { Metadata } from "next";
import { Providers } from "@/app/providers";
import NavbarCartLink from "@/components/layout/NavbarCartLink";
import BottomNav from "@/components/layout/BottomNav";

// Estonian Metadata
export const metadata: Metadata = {
    title: "SmartBuild - Ehitusmaterjalide Hinnavõrdlus",
    description: "Eesti suurim ehitusmaterjalide hinnavõrdlus. Leia parim pakkumine Espakist, Bauhofist, K-Rautast ja mujalt.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="et">
            <body className="flex flex-col min-h-screen bg-white text-slate-900 font-sans antialiased">
                <Providers>
                    {/* Navigation - Neutral B2B Style (Dark Blue + White) */}
                    <header className="sticky top-0 z-50 bg-[#0f172a] text-white shadow-md border-b border-slate-700">
                        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                            {/* Brand Logo */}
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="bg-orange-500 rounded p-1">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-white group-hover:text-slate-200 transition-colors">
                                    SmartBuild
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex gap-8 items-center">
                                <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                    Kataloog
                                </Link>
                                <NavbarCartLink />
                                <div className="h-5 w-px bg-slate-700"></div>
                                <Link href="/login" className="text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-all border border-slate-600">
                                    Logi sisse
                                </Link>
                            </nav>

                            {/* Mobile Menu Icon (Placeholder) */}
                            <button className="md:hidden text-slate-300 hover:text-white">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-grow">
                        {children}
                    </main>

                    {/* Footer - Minimal B2B */}
                    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
                        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h3 className="text-white font-bold mb-4">SmartBuild</h3>
                                <p className="text-sm">Sõltumatu ehitusmaterjalide hinnavõrdlusportaal Eestis.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-3">Kliendile</h4>
                                <ul className="text-sm space-y-2">
                                    <li><Link href="/products" className="hover:text-white">Kataloog</Link></li>
                                    <li><Link href="/cart" className="hover:text-white">Hinnapäring</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-3">Ettevõte</h4>
                                <ul className="text-sm space-y-2">
                                    <li><Link href="/about" className="hover:text-white">Meist</Link></li>
                                    <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mt-4">&copy; {new Date().getFullYear()} SmartBuild Eesti.</p>
                            </div>
                        </div>
                    </footer>
                    <BottomNav />
                </Providers>
            </body>
        </html>
    );
}

// Client component extracted to separate file