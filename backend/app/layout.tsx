import type { Metadata } from 'next'

import '@/styles/globals.css'

export const metadata: Metadata = {
    title: '<Nom_du_site>',
    description: 'Projet web neutralise pour publication.',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='fr'>
            <body>{children}</body>
        </html>
    )
}
