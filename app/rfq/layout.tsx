import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Küsi hinnapakkumist — SmartBuild",
    description: "Saada tasuta hinnapäring kõigile ehituspoodidele korraga. Säästa aega ja saa parimad projektimüügi hinnad.",
};

export default function RFQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
