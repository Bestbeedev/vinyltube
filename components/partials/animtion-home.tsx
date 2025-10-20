import React from 'react'
import { GalleryVerticalEnd } from 'lucide-react'
import { motion } from 'framer-motion'
export default function HomeMotion() {
    return (
        <div className="flex flex-col items-center  min-h-screen justify-center ">
            <div className='space-x-3 flex items-center'>
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
                    préserver l'essentiel
                </div>
            </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="w-5 h-5 border-2 my-8 text-center border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
        </div>
    )
}
