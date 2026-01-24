"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "sb_user_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type UserSession = {
    id: string;
    email: string;
    name?: string;
    city?: string;
    createdAt: number;
};

function serializeSession(session: UserSession) {
    const params = new URLSearchParams();
    params.set("id", session.id);
    params.set("email", session.email);
    if (session.name) params.set("name", session.name);
    if (session.city) params.set("city", session.city);
    params.set("createdAt", String(session.createdAt));
    return params.toString();
}

function parseSession(value: string): UserSession | null {
    const params = new URLSearchParams(value);
    const id = params.get("id");
    const email = params.get("email");
    const createdAt = params.get("createdAt");
    if (!id || !email || !createdAt) return null;

    return {
        id,
        email,
        name: params.get("name") ?? undefined,
        city: params.get("city") ?? undefined,
        createdAt: Number(createdAt),
    };
}

export async function login(data: { email: string; name?: string; city?: string }) {
    const session: UserSession = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        city: data.city,
        createdAt: Date.now(),
    };

    // Need to await hooks in server actions
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, serializeSession(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
    });

    return session;
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<UserSession | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    return parseSession(cookie.value);
}
