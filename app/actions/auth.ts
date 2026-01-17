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

    cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
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

    try {
        return JSON.parse(cookie.value) as UserSession;
    } catch {
        return null;
    }
}
