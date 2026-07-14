import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

const MotionNavLink = motion.create(NavLink);

const sections = [
    {
        title: null,
        links: [
            { to: '/', label: 'Tableau de bord', icon: 'ti-layout-dashboard' },
        ],
    },
    {
        title: 'Réservations',
        links: [
            { to: '/reservations', label: 'Réservations', icon: 'ti-calendar-event' },
        ],
    },
    {
        title: 'Clients',
        links: [
            { to: '/clients', label: 'Clients', icon: 'ti-users' },
        ],
    },
    {
        title: 'Gestion',
        links: [
            { to: '/voitures',     label: 'Voitures',      icon: 'ti-car' },
            { to: '/impots',       label: 'Impôts',        icon: 'ti-receipt-tax' },
            { to: '/assurance',    label: 'Assurance',     icon: 'ti-shield-check' },
            { to: '/services',     label: 'Services',      icon: 'ti-briefcase' },
            { to: '/maintenance',  label: 'Maintenance',   icon: 'ti-tool' },
        ],
    },
    {
        title: 'Autre',
        links: [
            { to: '/utilisateurs', label: 'Utilisateurs', icon: 'ti-user-cog', roles: ['admin'] },
            { to: '/profil',       label: 'Profil',       icon: 'ti-user' },
        ],
    },
];

const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${isActive ? 'bg-emerald-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`;

export default function Sidebar() {
    const role = useSelector(state => state.auth.user?.role);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
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
        <aside className="flex flex-col w-60 h-screen fixed inset-y-0 left-0 bg-black text-white overflow-hidden">

            {/* Logo */}
            <div className="flex items-center justify-center px-4 py-1 flex-shrink-0">
                <img src="/Hayas-logo.png" alt="Hayas" className="h-16 w-auto object-contain" />
            </div>

            {/* Nav */}
            <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 flex flex-col">
                {sections.map((section, i) => (
                    <div key={i}>
                        {section.title && (
                            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                {section.title}
                            </p>
                        )}
                        <div className="flex flex-col gap-0.5">
                            {section.links
                                .filter(link => !link.roles || link.roles.includes(role))
                                .map(link => (
                                <MotionNavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.to === '/'}
                                    className={linkCls}
                                    whileHover={{ x: 5, scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                >
                                    <i className={`ti ${link.icon} text-[16px] flex-shrink-0`} />
                                    <span>{link.label}</span>
                                </MotionNavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer : utilisateur, thème, déconnexion */}
            <div className="flex-shrink-0 border-t border-white/10 px-3 py-3 space-y-2">
                {user && (
                    <button
                        onClick={() => navigate('/profil')}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-900 text-emerald-300 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <span className="text-sm font-medium truncate">{user.name}</span>
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'} text-[15px]`} />
                        {isDark ? 'Clair' : 'Sombre'}
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Déconnexion"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <i className="ti ti-logout text-[15px]" />
                        Sortir
                    </button>
                </div>
            </div>
        </aside>
    );
}
