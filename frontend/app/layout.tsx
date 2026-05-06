import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AetherPanel',
    description: 'Separated frontend for the AetherPanel control plane.',
    icons: {
        icon: [{ url: '/branding/aether-mark.png', type: 'image/png' }],
        apple: [{ url: '/branding/aether-mark.png', type: 'image/png' }],
        shortcut: ['/branding/aether-mark.png'],
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
