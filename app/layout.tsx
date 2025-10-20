import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Configuration des polices élégantes
const playfairDisplay = Playfair_Display({
    variable: "--font-playfair-display",
    subsets: ["latin"],
    display: "swap",
});

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "VynilTube - Collectionnez l'éphémère",
    description: "Transformez vos vidéos YouTube en pièces de collection raffinées. Une expérience consciente pour ceux qui valorisent le contenu hors-ligne.",
    keywords: ["youtube downloader", "téléchargement vidéo", "extraction audio", "collection numérique", "vidéo hors-ligne"],
    authors: [{ name: "VynilTube" }],
    creator: "VynilTube",
    publisher: "VynilTube",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://vyniltube.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "fr_FR",
        url: "https://vyniltube.com",
        title: "VynilTube - Collectionnez l'éphémère",
        description: "Transformez vos vidéos YouTube en pièces de collection raffinées.",
        siteName: "VynilTube",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "VynilTube - Collectionnez l'éphémère",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "VynilTube - Collectionnez l'éphémère",
        description: "Transformez vos vidéos YouTube en pièces de collection raffinées.",
        images: ["/og-image.jpg"],
        creator: "@vyniltube",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head>
                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/site.webmanifest" />

                {/* Préchargement des polices critiques */}
                <link
                    rel="preload"
                    href="/_next/static/media/playfair-display-latin-400.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="/_next/static/media/inter-latin-400.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
            </head>
            <body
                className={`${playfairDisplay.variable} ${inter.variable} font-sans antialiased`}
                suppressHydrationWarning
            >
                {children}
                <Toaster
                    richColors
                    position="top-center"
                    closeButton
                    expand={false}
                    toastOptions={{
                        style: { fontSize: "14px", borderRadius: "10px" },
                    }}
                />
            </body>
        </html>
    );
}
