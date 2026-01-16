import Link from "next/link";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* HERO */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">

                {/* Subtle Gradient Background */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 via-white to-white" />

                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600 mb-8">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sõltumatu ehitusmaterjalide võrdlus
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Võrdle ehitusmaterjalide hindu Eestis
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Leia parim hind ja küsi soodsamat pakkumist suurematele kogustele.
                        Koondame hinnad Espakist, Bauhofist, K-Rautast ja mujalt.
                    </p>

                    {/* Search Input */}
                    <div className="max-w-md mx-auto mb-10 relative">
                        <input
                            type="text"
                            placeholder="Otsi toodet (nt 'kipsplaat')..."
                            className="w-full pl-5 pr-12 py-3.5 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-base"
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/products"
                            className="w-full sm:w-auto rounded-xl bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-slate-800 transition-transform active:scale-95"
                        >
                            Ava kataloog
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            Kuidas see töötab
                        </Link>
                    </div>
                </div>
            </section>

            {/* ABOUT / MEIST */}
            <section className="py-12 bg-white border-y border-slate-50">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Mis on SmartBuild?</h2>
                    <p className="text-slate-600 leading-relaxed">
                        SmartBuild Eesti on ehitusmaterjalide hinnavõrdlusportaal, mis aitab sul leida parimad pakkumised Pärnus ja üle Eesti.
                        Me ei ole ehituspood, vaid sõltumatu abimees, mis toob kokku erinevate poodide hinnad ühele lehele.
                    </p>
                </div>
            </section>

            {/* TRUST / STORES */}
            <section className="py-10 bg-slate-50/50">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
                        Koostöös Eesti ehituspoodidega
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-70 grayscale transition-all hover:grayscale-0">
                        {["Espak", "Bauhof", "K-Rauta", "Ehituse ABC", "Decora", "Karl Bilder"].map(store => (
                            <span key={store} className="text-lg md:text-xl font-bold text-slate-800">{store}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8 justify-center">
                        <StepCard
                            step="01"
                            title="Vali materjalid"
                            desc="Leia kataloogist vajalikud ehitusmaterjalid."
                        />
                        <StepCard
                            step="02"
                            title="Võrdle hindu"
                            desc="Vaata, millises poes on soodsaim pakkumine."
                        />
                        <StepCard
                            step="03"
                            title="Küsi hinnapakkumist"
                            desc="Saada päring korraga mitmele poele."
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
    return (
        <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-emerald-50 transition-colors" />
            <div className="relative z-10">
                <div className="text-4xl font-bold text-slate-200 mb-4 group-hover:text-emerald-200 transition-colors">{step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}