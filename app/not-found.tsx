import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-slate-800/50 text-slate-500 rounded-full flex items-center justify-center mb-8">
                <FileQuestion size={48} />
            </div>

            <h1 className="text-4xl font-black text-slate-100 mb-4">404</h1>
            <h2 className="text-xl font-bold text-slate-300 mb-2">Lehte ei leitud</h2>
            <p className="text-slate-500 max-w-md mb-8">
                Otsitud lehte ei eksisteeri või on see liigutatud. / The page you are looking for does not exist.
            </p>

            <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3 rounded-xl transition-colors"
            >
                <ArrowLeft size={18} />
                Tagasi kataloogi
            </Link>
        </div>
    );
}
