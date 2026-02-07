import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
            title="Toggle Theme"
        >
            {theme === 'light' ? (
                <Sun size={20} className="text-orange-500" />
            ) : (
                <Moon size={20} className="text-blue-400" />
            )}
        </button>
    );
}
