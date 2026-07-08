import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

// Barre supérieure : utilisateur connecté, déconnexion et bascule du thème clair/sombre.
export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (_) {}
        dispatch({ type: 'auth/logout' });
        navigate('/login');
    };

    const initials = user?.name
        ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <header className="flex items-center justify-end gap-2 px-6 py-3 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex-shrink-0">
            {user && (
                <button
                    onClick={() => navigate('/profil')}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                    <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {initials}
                    </div>
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{user.name}</span>
                </button>
            )}

            <button
                onClick={handleLogout}
                title="Déconnexion"
                className="w-9 h-9 rounded-md flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
                <i className="ti ti-logout text-[17px]" />
            </button>

            <button
                onClick={toggleTheme}
                title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
                className="w-9 h-9 rounded-md flex items-center justify-center text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
                <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} text-[17px]`} />
            </button>
        </header>
    );
}
