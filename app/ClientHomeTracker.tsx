"use client";

import { useEffect } from "react";
import { track } from "@/app/lib/analytics";

export default function ClientHomeTracker() {
    useEffect(() => {
        track("view_home");
    }, []);
    return null;
}
