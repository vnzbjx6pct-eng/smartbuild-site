import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Müügitingimused — SmartBuild",
    description: "SmartBuildi müügitingimused ja teenuse kasutamise põhimõtted.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">Müügitingimused</h1>
                <div className="space-y-4 text-slate-700 leading-relaxed">
                    <p>
                        SmartBuild on vahenduskeskkond, mis koondab ehitusmaterjalide pakkumised ja edastab
                        kliendi hinnapäringu partneritele. Tehing toimub kliendi ja partneri vahel.
                    </p>
                    <p>
                        Tarnetingimused, hinnad ja maksetingimused võivad erineda sõltuvalt partnerist ja valitud
                        teenusest. Täpsed tingimused kuvatakse enne tellimuse kinnitamist.
                    </p>
                    <p>
                        Küsimuste korral palume võtta ühendust meie klienditoega lehel{" "}
                        <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Kontakt
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
