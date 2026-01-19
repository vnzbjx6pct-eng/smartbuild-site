import Link from "next/link";
import type { Metadata } from "next";
import ClientHomeTracker from "./ClientHomeTracker";
import TrustLogos from "@/components/home/TrustLogos";
import HowItWorks from "@/components/home/HowItWorks";
import Hero from "@/components/home/Hero";
import SeoBlock from "@/components/home/SeoBlock";
import FinalCTA from "@/components/home/FinalCTA";

export const metadata: Metadata = {
    title: "Ehitusmaterjalide hinnavõrdlus — SmartBuild Eesti",
    description: "Võrdle ehitusmaterjalide hindu: Bauhof, K-Rauta, Espak, Decora. Leia parim pakkumine ja säästa aega. Tasuta hinnapäring kõigile poodidele.",
};

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <ClientHomeTracker />

            {/* HERO Section (Client Component) */}
            <Hero />

            {/* SEO Text Block (Client Component) */}
            <SeoBlock />

            {/* TRUST LOGOS */}
            <TrustLogos />

            {/* PROCESS */}
            <HowItWorks />

            {/* Final CTA link (Client Component) */}
            <FinalCTA />
        </main>
    );
}