'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-700/50 cursor-pointer transition-all flex items-center justify-center">
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Changer le thème</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-neutral-200 dark:border-neutral-700 backdrop-blur-sm">
                <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ThemeToggle;
