'use client';

import useAuth from "@/hooks/useAuth";

export default function BaseLayout({ children }: { children: React.ReactNode }) {

    useAuth();

    return (
        <>
            {children}
        </>
    )
};