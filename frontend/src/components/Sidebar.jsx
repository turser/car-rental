import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../api/api';

const MotionNavLink = motion.create(NavLink);

const sections = [
    {
        title: null,
        links: [
            { to: '/', label: 'Tableau de bord', icon: 'ti-layout-dashboard' },
        ],
    },
    {
        title: 'Flotte',
        links: [
            { to: '/voitures', label: 'Voitures', icon: 'ti-car' },
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
            { to: '/reservations', label: 'Réservations', icon: 'ti-calendar-event' },
            { to: '/factures',     label: 'Factures',     icon: 'ti-receipt' },
            { to: '/impots',       label: 'Impôts',        icon: 'ti-receipt-tax' },
            { to: '/assurance',    label: 'Assurance',     icon: 'ti-shield-check' },
            { to: '/services',     label: 'Services',      icon: 'ti-briefcase' },
            { to: '/maintenance',  label: 'Maintenance',   icon: 'ti-tool' },
        ],
    },
    {
        title: 'Autre',
        links: [
            { to: '/parametres', label: 'Paramètres', icon: 'ti-settings' },
        ],
    },
];

const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${isActive ? 'bg-emerald-800 text-white' : 'text-emerald-100/60 hover:text-white hover:bg-emerald-900/60'}`;

export default function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user      = useSelector(state => state.auth.user);

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (_) {}
        dispatch({ type: 'auth/logout' });
        navigate('/login');
    };

    const initials = user?.name
        ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <aside className="flex flex-col w-60 h-screen fixed inset-y-0 left-0 bg-emerald-950 text-emerald-100 overflow-hidden">

            {/* Logo */}
            <div className="flex items-center gap-2.5 px-4 py-5 flex-shrink-0 border-b border-emerald-900">
                <motion.div
                    whileHover={{ rotate: -12, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                    className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center text-white flex-shrink-0"
                >
                    <i className="ti ti-car text-[16px]" />
                </motion.div>
                <p className="font-bold text-white text-[15px] tracking-wide uppercase">CarRental</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 flex flex-col">
                {sections.map((section, i) => (
                    <div key={i}>
                        {section.title && (
                            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/60">
                                {section.title}
                            </p>
                        )}
                        <div className="flex flex-col gap-0.5">
                            {section.links.map(link => (
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

            {/* User + Logout */}
            <div className="px-3 py-3 border-t border-emerald-900 flex-shrink-0">
                {user && (
                    <button
                        onClick={() => navigate('/profil')}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5 w-full text-left hover:bg-emerald-900/60 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-100 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-emerald-50 truncate">{user.name}</p>
                        </div>
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-emerald-200/70 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                >
                    <i className="ti ti-logout text-[16px] flex-shrink-0" />
                    <span>Déconnexion</span>
                </button>
            </div>

        </aside>
    );
}
