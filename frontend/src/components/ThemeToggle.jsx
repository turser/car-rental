import { useTheme } from '../context/ThemeContext';

// Bouton bascule thème clair/sombre, fixé en haut à droite de l'écran sur toutes les pages.
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
            className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-center text-stone-500 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-700 transition"
        >
            <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} text-[18px]`} />
        </button>
    );
}
