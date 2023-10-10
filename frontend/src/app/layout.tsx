import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import BaseLayout from '@/components/Layouts/Base'

export const metadata: Metadata = {
    title: 'CodeConverse',
    description: 'Platform for coding interviews',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <BaseLayout>
                <body className={inter.className}>{children}</body>
            </BaseLayout>
        </html>
    )
}
