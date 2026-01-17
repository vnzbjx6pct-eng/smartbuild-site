import { Metadata } from "next";
import Link from "next/link";
import JoinForm from "./JoinForm";

export const metadata: Metadata = {
    title: "Liitu Partnerina — SmartBuild",
    description: "Aktiveeri oma kauplused SmartBuild võrgustikus. Lihtne liitumine, IT-arendust pole vaja.",
};

export default function PartnerJoinPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <Link href="/partner" className="inline-block text-sm font-bold text-emerald-600 hover:underline mb-6">
                        ← Tagasi tutvustuse juurde
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">
                        Liitu SmartBuildi partnerina
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Ilma IT-arenduseta. Ilma riskita.
                        <br />
                        Aktiveeri oma kauplused 2 minutiga.
                    </p>

                    {/* Value Props */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-700">
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> Tasuta liitumine
                        </span>
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> Õiglane päringute jaotus
                        </span>
                        <span className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                            <span className="text-emerald-500">✓</span> Teie kontrollite kontakte
                        </span>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="mb-12">
                    <JoinForm />
                </div>

                {/* Footer Explanation */}
                <div className="text-center max-w-2xl mx-auto text-slate-500 text-sm space-y-4">
                    <p>
                        <strong>Kuidas süsteem töötab?</strong> SmartBuildi "Routing Engine" tuvastab kliendi asukoha ja suunab päringu automaatselt
                        vastava linna kauplusesse. Kui olete lisanud mitu müügijuhti, jaotatakse päringud nende vahel võrdselt (Round-Robin).
                    </p>
                    <p>
                        Küsimuste korral kirjutage <a href="mailto:partner@smartbuild.ee" className="text-emerald-600 underline">partner@smartbuild.ee</a>
                    </p>
                </div>

            </div>
        </div>
    );
}
