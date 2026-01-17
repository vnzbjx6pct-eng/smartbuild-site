import Link from "next/link";
import { Metadata } from "next";
import PartnerContactForm from "./ContactForm";

export const metadata: Metadata = {
    title: "Partnerlus — SmartBuild B2B",
    description: "Kasvata oma ehitusäri SmartBuildi abil. Saa ligipääs aktiivsetele ehitusmaterjalide ostjatele.",
};

export default function PartnerPage() {
    return (
        <div className="bg-white min-h-screen font-sans text-slate-900">

            {/* 1. HERO SECTION */}
            <section className="relative py-24 bg-[#0f172a] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-400 to-transparent"></div>
                <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
                        SmartBuild – valmis platvorm hinnapäringute vastuvõtmiseks ja jaotamiseks
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Me toome teile reaalsed ostukavatsusega kliendid ja jaotame päringud automaatselt teie meeskonna vahel.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/partner/join" className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            Liitu partnerina (Start)
                        </Link>
                        <Link href="#solution" className="inline-block bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-10 rounded-xl transition-all border border-white/20">
                            Vaata, kuidas see töötab
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. PROBLEM SECTION */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Probleem, mida kõik ehitusmaterjalide müüjad tunnevad</h2>
                        <p className="text-slate-600">Tänane müügiprotsess on tihti ebaefektiivne ja kaootiline.</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            "Hinnapäringud tulevad ebaühtlaselt ja tihti valesse postkasti",
                            "Osa müüjaid on ülekoormatud, samal ajal kui teised ootavad tööd",
                            "Kliendid küsivad hindu mitmest poest korraga, tekitades infomüra",
                            "Väikesed ja suured kliendid vajavad erinevat käsitlust, kuid saabuvad ühte kanalisse"
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">!</div>
                                <p className="font-medium text-slate-800 pt-1">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SOLUTION SECTION */}
            <section id="solution" className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">SmartBuild lahendab selle automaatselt</h2>
                            <ul className="space-y-6">
                                {[
                                    "Klient teeb ühe kvaliteetse hinnapäringu meie keskkonnas",
                                    "Klient valib konkreetse linna, kus ta kaupa vajab",
                                    "Teie kauplused ja müügijuhid saavad päringud automaatselt õigesse postkasti",
                                    "Süsteem jaotab päringud õiglaselt (round-robin), vältides ühe töötaja ülekoormust"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">✓</div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-100 p-8 rounded-3xl relative overflow-hidden">
                            {/* Visual representation of routing */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                            <div className="space-y-4 relative z-10">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 opacity-50 scale-95">
                                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                    <span className="text-xs text-slate-400">Sisenev päring (Tallinn)</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-emerald-500 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">SB</div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">SmartBuild Ruuter</div>
                                        <div className="text-xs text-emerald-600">Tuvastatud: Tallinn → Espak</div>
                                    </div>
                                </div>
                                <div className="pl-8 space-y-2">
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 flex justify-between">
                                        <span>Müügijuht Mari (Hõivatud)</span>
                                        <span className="text-red-400">X</span>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-slate-700 font-bold flex justify-between shadow-sm">
                                        <span>Müügijuht Toomas (Vaba)</span>
                                        <span className="text-emerald-500">➜</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. WHO IS THIS FOR? */}
            <section className="py-20 bg-[#0f172a] text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Kellele SmartBuild sobib?</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { title: "Suured jaeketid", desc: "Mitu linna, mitu poodi, tsentraalne juhtimine." },
                            { title: "Piirkondlikud kauplused", desc: "Tugev kohalik tegija (nt. Saaremaa, Tartu)." },
                            { title: "Hulgimüüjad", desc: "Soovivad leida uusi B2B püsikliente." },
                            { title: "Kasvuettevõtted", desc: "Ettevõtted, kes soovivad automatiseerida müügivihjeid." }
                        ].map((card, i) => (
                            <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                                <h3 className="font-bold text-lg mb-2 text-emerald-400">{card.title}</h3>
                                <p className="text-sm text-slate-400">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. REQUIREMENTS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Mida me vajame koostöö alustamiseks?</h2>
                    <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 inline-block text-left w-full">
                        <ul className="space-y-4 mb-8">
                            {[
                                "Linnad, kus teil on esindused (nt. Tallinn, Tartu)",
                                "Kaupluste täpsed nimed nendes linnades",
                                "Müügijuhtide või osakondade e-postid, kuhu päringud saata"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">{i + 1}</span>
                                    <span className="text-slate-800 text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-white p-4 rounded-xl border border-orange-200 text-center">
                            <span className="font-bold text-slate-900">Meie seadistame kõik. Teie IT-meeskonda ei ole vaja kaasata.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SAFETY */}
            <section className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Miks see on teie jaoks riskivaba</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { title: "Ei vaja arendust", desc: "Null rida koodi teie poolt. Meie süsteem töötab iseseisvalt." },
                            { title: "Ei mõjuta olemasolevaid süsteeme", desc: "Päringud saabuvad tavalise e-kirjana. Ei mingeid uusi programme müüjatele." },
                            { title: "Võimalik alustada pilootprojektiga", desc: "Proovime ühe linna või ühe poega. Kohustusi ei ole." },
                            { title: "Turvaline varuplaan", desc: "Kui müügijuht ei vasta, suuname päringu üldmeilile, et ükski klient ei kaoks." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-1.5 h-full bg-emerald-500 rounded-full shrink-0"></div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{item.title}</h3>
                                    <p className="text-slate-600">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6.5. SELF-ONBOARDING CTA */}
            <section className="py-20 bg-emerald-600 text-white text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Valmis alustama?</h2>
                    <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
                        Lisage oma kauplused ja kontaktid iseseisvalt meie süsteemi. <br />
                        See võtab vaid 3 minutit.
                    </p>
                    <Link
                        href="/partner/join"
                        className="inline-flex items-center gap-2 bg-white text-emerald-700 font-black text-xl py-5 px-10 rounded-2xl shadow-xl shadow-emerald-900/20 hover:scale-105 transition-all"
                    >
                        Alusta siit →
                    </Link>
                    <p className="text-sm text-emerald-200 mt-4 opacity-80">
                        Ei nõua sisselogimist ega lepingut.
                    </p>
                </div>
            </section>

            {/* 7. CONTACT FORM (Final CTA) */}
            <section id="contact" className="py-24 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">Võtame ühendust</h2>
                            <p className="text-lg text-slate-600 mb-8">
                                Täitke vorm ja meie partnersuhete juht võtab teiega 1 tööpäeva jooksul ühendust, et arutada koostöövõimalusi.
                            </p>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">Otsekontakt:</h4>
                                <p className="text-slate-600 mb-1">Dmitri (Partnersuhete juht)</p>
                                <a href="mailto:partner@smartbuild.ee" className="text-emerald-600 font-bold hover:underline">partner@smartbuild.ee</a>
                            </div>
                        </div>

                        {/* Interactive Form Component */}
                        <PartnerContactForm />
                    </div>
                </div>
            </section>
        </div>
    );
}
