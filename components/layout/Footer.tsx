"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
            <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 className="text-white font-bold mb-4">SmartBuild</h3>
                    <p className="text-sm">{(t as any).footer?.desc ?? "Sõltumatu ehitusmaterjalide hinnavõrdlusportaal Eestis."}</p>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">{(t as any).footer?.customer ?? "Kliendile"}</h4>
                    <ul className="text-sm space-y-2">
                        <li><Link href="/products" className="hover:text-white">{(t as any).footer?.catalog ?? "Kataloog"}</Link></li>
                        <li><Link href="/cart" className="hover:text-white">{(t as any).footer?.rfq ?? "Hinnapäring"}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-semibold mb-3">{(t as any).footer?.company ?? "Ettevõte"}</h4>
                    <ul className="text-sm space-y-2">
                        <li><Link href="/meist" className="hover:text-white">{(t as any).footer?.about_us ?? "Meist"}</Link></li>
                        <li><Link href="/contact" className="hover:text-white">{(t as any).footer?.contact ?? "Kontakt"}</Link></li>
                        <li><Link href="/partner/plans" className="hover:text-emerald-400 text-emerald-500/80">{(t as any).footer?.partners ?? "Partneritele"}</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="text-xs text-slate-500 mt-4">&copy; {new Date().getFullYear()} {(t as any).footer?.copyright ?? "SmartBuild Eesti."}</p>
                </div>
            </div>
        </footer>
    );
}
