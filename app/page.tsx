'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Play, Download, Archive, Scissors, Sparkles, GalleryVerticalEnd, ClipboardPaste, Settings, Zap, Library, Target, AudioLines, Gauge } from 'lucide-react';
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import HomeMotion from '@/components/partials/animation-home';
import ThemeToggle from '@/components/partials/theme-toggle';
import VideoForm from '@/components/partials/video-form';
import HistoryService from '@/lib/history-service';

const staggerContainer = {
    initial: { opacity: 1 },
    animate: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const PLATFORMS = [
    { name: 'YouTube', emoji: '▶️' },
    { name: 'Vimeo', emoji: '🎬' },
    { name: 'TikTok', emoji: '🎵' },
    { name: 'Instagram', emoji: '📸' },
    { name: 'Twitter / X', emoji: '🐦' },
    { name: 'Dailymotion', emoji: '📺' },
    { name: 'Twitch', emoji: '🎮' },
    { name: 'Reddit', emoji: '🤖' },
    { name: 'Facebook', emoji: '👥' },
    { name: 'SoundCloud', emoji: '🎧' },
];

function Header() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50 shadow-sm'
                : 'bg-transparent border-b'
                }`}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div onClick={() => window.location.href = '/'} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="p-2 bg-amber-100/80 dark:bg-amber-900/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm"
                        >
                            <GalleryVerticalEnd className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                                VynilTube
                            </span>
                            <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium -mt-1">
                                préserver l&apos;essentiel
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <nav className="hidden md:flex space-x-8">
                            <motion.a href="/history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                Historique
                            </motion.a>
                            <motion.a href="#features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                className="text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                L'expérience
                            </motion.a>
                            <motion.a href="#platforms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                                className="text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                Plateformes
                            </motion.a>
                            <motion.a href="#how-it-works" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                L'alchimie
                            </motion.a>
                        </nav>
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                            <ThemeToggle />
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

function LandingContent() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => { HistoryService.makeGlobal(); }, []);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 3000);
        return () => clearTimeout(t);
    }, []);

    if (!mounted) return <HomeMotion />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-amber-50/30 to-neutral-100/80 dark:from-neutral-900 dark:via-amber-900/5 dark:to-neutral-800/95 text-neutral-900 dark:text-neutral-100 transition-colors">
            <Header />

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center space-x-2 mb-8 px-4 py-3 rounded-2xl bg-white/70 dark:bg-neutral-800/70 border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm shadow-lg"
                    >
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            10+ plateformes supportées · YouTube, TikTok, Vimeo et plus
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 dark:from-amber-400 dark:via-amber-300 dark:to-amber-200 bg-clip-text text-transparent">
                            Collectionnez
                        </span>
                        <br />
                        <span className="text-neutral-700 dark:text-neutral-200">
                            l'éphémère
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Téléchargez vidéos et audios depuis n'importe quelle plateforme.
                        Une expérience consciente pour ceux qui valorisent le contenu hors-ligne.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                        <VideoForm />
                    </motion.div>

                    <motion.div
                        initial="initial" animate="animate" variants={staggerContainer}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
                    >
                        {[
                            { icon: Target, label: 'Multi-plateformes', desc: '10+ sources supportées', color: 'text-red-500 dark:text-red-400' },
                            { icon: AudioLines, label: 'Qualité audio', desc: 'MP3 192kbps préservé', color: 'text-blue-500 dark:text-blue-400' },
                            { icon: Gauge, label: 'Progression réelle', desc: 'Suivi en temps réel', color: 'text-emerald-500 dark:text-emerald-400' },
                        ].map((item, index) => (
                            <motion.div
                                key={index} variants={scaleIn} whileHover={{ scale: 1.05 }}
                                className="text-center p-6 bg-white/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-700 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                                    <item.icon className={`w-6 h-6 ${item.color}`} />
                                </div>
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{item.label}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="container mx-auto px-6 py-20 dark:bg-neutral-800/30 border rounded-2xl bg-gray-50/80">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-serif font-bold mb-4">
                            Une expérience <span className="text-amber-600 dark:text-amber-400">consciente</span>
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                            Plus qu&apos;un simple téléchargeur, un atelier numérique pour les esprits curieux
                        </p>
                    </motion.div>

                    <motion.div
                        initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
                        className="grid lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Download,
                                title: 'Téléchargement intelligent',
                                description: 'Audio MP3 haute qualité ou vidéo HD préservée depuis YouTube, TikTok, Vimeo et 10+ autres plateformes.',
                                color: 'text-blue-500 dark:text-blue-400'
                            },
                            {
                                icon: Scissors,
                                title: 'Progression en temps réel',
                                description: 'Suivez chaque octet téléchargé grâce à notre système de streaming SSE — aucune simulation, que du réel.',
                                color: 'text-amber-500 dark:text-amber-400'
                            },
                            {
                                icon: Archive,
                                title: 'Médiathèque historique',
                                description: 'Collectionnez et retrouvez tous vos téléchargements dans un espace personnel raffiné.',
                                color: 'text-emerald-500 dark:text-emerald-400'
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index} variants={scaleIn} whileHover={{ y: -8 }}
                                className="group p-8 bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-xl"
                            >
                                <motion.div
                                    className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                    whileHover={{ rotate: 5 }}
                                >
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">{feature.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Plateformes supportées */}
            <section id="platforms" className="container mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-serif font-bold mb-4">
                        Toutes vos <span className="text-amber-600 dark:text-amber-400">sources</span>
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">
                        Un seul outil pour télécharger depuis les plateformes que vous aimez
                    </p>
                </motion.div>

                <motion.div
                    initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto"
                >
                    {PLATFORMS.map((p, i) => (
                        <motion.div
                            key={i} variants={scaleIn} whileHover={{ scale: 1.08, y: -4 }}
                            className="flex flex-col items-center gap-2 p-4 bg-white/60 dark:bg-neutral-800/60 rounded-2xl border border-neutral-100 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all duration-200 cursor-default"
                        >
                            <span className="text-2xl">{p.emoji}</span>
                            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 text-center">{p.name}</span>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
                    className="text-center text-sm text-neutral-400 dark:text-neutral-500 mt-8"
                >
                    Propulsé par yt-dlp · 1000+ extracteurs supportés
                </motion.p>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="container border border-amber-100 dark:border-amber-800/30 mx-auto px-6 py-20 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl my-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-serif font-bold mb-4">
                            L&apos;alchimie <span className="text-amber-600 dark:text-amber-400">VynilTube</span>
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto">
                            Un processus raffiné en quatre actes simples
                        </p>
                    </motion.div>

                    <motion.div
                        initial="initial" whileInView="animate" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
                        className="grid md:grid-cols-4 gap-8 max-md:grid-cols-2 relative"
                    >
                        <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-amber-200 dark:bg-amber-800/50 -z-10" />
                        {[
                            { step: '01', title: 'Coller', desc: "Le lien de n'importe quelle plateforme", icon: ClipboardPaste, color: 'text-blue-500' },
                            { step: '02', title: 'Sélectionner', desc: 'Format vidéo ou audio', icon: Settings, color: 'text-amber-500' },
                            { step: '03', title: 'Extraire', desc: 'Progression en temps réel', icon: Zap, color: 'text-emerald-500' },
                            { step: '04', title: 'Archiver', desc: 'Dans votre collection', icon: Library, color: 'text-purple-500' },
                        ].map((item) => (
                            <motion.div key={item.step} variants={scaleIn} whileHover={{ scale: 1.05 }} className="relative">
                                <div className="w-20 h-20 mx-auto mb-4 bg-white dark:bg-neutral-800 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm flex items-center justify-center">
                                    <item.icon className={`w-8 h-8 ${item.color}`} />
                                </div>
                                <div className="w-8 h-8 mx-auto mb-3 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {item.step}
                                </div>
                                <h3 className="font-semibold text-lg mb-2 text-neutral-800 dark:text-neutral-200">{item.title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center bg-gradient-to-r from-amber-400/10 to-amber-600/10 dark:from-amber-400/5 dark:to-amber-600/5 rounded-3xl p-16 border border-amber-200 dark:border-amber-800/30"
                >
                    <h2 className="text-4xl font-serif font-bold mb-6">
                        Prêt à collectionner <span className="text-amber-600 dark:text-amber-400">l&apos;éphémère</span> ?
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 max-w-xl mx-auto">
                        YouTube, TikTok, Vimeo, Instagram — tout ce qui compte, préservé hors-ligne.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all inline-flex items-center space-x-3 shadow-lg hover:shadow-xl"
                    >
                        <Play className="w-5 h-5" />
                        <span>Commencer l'expérience</span>
                    </motion.button>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-12 border-t border-neutral-200 dark:border-neutral-700">
                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row justify-between items-center"
                >
                    <div className="flex flex-col items-start mb-4 md:mb-0">
                        <div className="flex items-center space-x-3">
                            <GalleryVerticalEnd className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            <span className="font-serif font-bold text-lg text-neutral-800 dark:text-neutral-200">VynilTube</span>
                        </div>
                        <div className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">
                            <Button className="hover:cursor-pointer" variant="default">Développé par @Bestbeedev</Button>
                        </div>
                    </div>
                    <div className="text-neutral-500 dark:text-neutral-400 text-center md:text-right">
                        <div className="text-sm">Fait avec soin pour les amateurs de contenu précieux • 2025</div>
                        <div className="text-xs mt-1 text-neutral-400 dark:text-neutral-500">Préservation numérique consciente</div>
                    </div>
                </motion.div>
            </footer>
        </div>
    );
}

export default function LandingPage() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LandingContent />
        </ThemeProvider>
    );
}
