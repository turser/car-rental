import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/api';

const links = [
    { to: '/',             label: 'Dashboard',    icon: 'ti-layout-dashboard', group: 'main' },
    { to: '/voitures',     label: 'Voitures',     icon: 'ti-car',              group: 'main' },
    { to: '/clients',      label: 'Clients',      icon: 'ti-users',            group: 'main' },
    { to: '/reservations', label: 'Réservations', icon: 'ti-calendar-event',   group: 'gestion' },
    { to: '/factures',     label: 'Factures',     icon: 'ti-receipt',          group: 'gestion' },
    { to: '/parametres',   label: 'Paramètres',   icon: 'ti-settings',         group: 'other' },
];

export default function Sidebar() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const user      = useSelector(state => state.auth.user);

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (_) {}
        dispatch({ type: 'auth/logout' });
        navigate('/login');
    };

    const initials = user?.name
        ?.split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? '?';

    return (
        <aside className="flex flex-col w-60 h-screen sticky top-0 bg-[#0d1117] text-white border-r border-[#1a2333] relative overflow-y-auto">

            {/* top shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-900/60 to-transparent" />

            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#1a2333]">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#1a3a5c] border border-[#2a5080] flex items-center justify-center text-[#5ba3e0]">
                        <i className="ti ti-car text-[15px]" />
                    </div>
                    <div>
                        <p className="font-mono text-[13px] font-bold tracking-widest text-[#e2e8f0] uppercase">CarRental</p>
                        <p className="text-[10px] tracking-widest text-[#4a6580] uppercase mt-0.5">Fleet Manager</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
                <p className="text-[9px] tracking-[0.12em] uppercase text-[#3a4d63] font-semibold px-2 py-2 mt-1">Main</p>

                {links.filter(l => l.group === 'main').map(link => (
                    <NavLink key={link.to} to={link.to} end={link.to === '/'}
                        className={({ isActive }) =>
                            `relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-sm
                            ${isActive
                                ? 'bg-[#0e2340] border-[#1a4070] [&_.icon]:bg-[#1a3a60] [&_.icon]:border-[#2a5888] [&_.icon]:text-[#5ba3e0] [&_.label]:text-[#c8dff5]'
                                : 'border-transparent hover:bg-[#111d2e] hover:border-[#1a2d45] [&_.icon]:text-[#4a7fa8] [&_.label]:text-[#6b8199]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-500 rounded-r" />}
                                <div className="icon w-[30px] h-[30px] rounded-[7px] bg-[#141c27] border border-[#1a2840] flex items-center justify-center flex-shrink-0 transition-all">
                                    <i className={`ti ${link.icon} text-[14px]`} />
                                </div>
                                <span className="label font-medium flex-1 transition-colors">{link.label}</span>
                                {link.badge && (
                                    <span className="text-[10px] font-semibold bg-[#0e2340] text-[#5ba3e0] border border-[#1a4070] px-1.5 py-0.5 rounded-full">
                                        {link.badge}
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}

                <div className="h-px bg-[#141e2e] mx-1 my-1.5" />
                <p className="text-[9px] tracking-[0.12em] uppercase text-[#3a4d63] font-semibold px-2 py-1">Gestion</p>

                {links.filter(l => l.group === 'gestion').map(link => (
                    <NavLink key={link.to} to={link.to}
                        className={({ isActive }) =>
                            `relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-sm
                            ${isActive
                                ? 'bg-[#0e2340] border-[#1a4070] [&_.icon]:bg-[#1a3a60] [&_.icon]:border-[#2a5888] [&_.icon]:text-[#5ba3e0] [&_.label]:text-[#c8dff5]'
                                : 'border-transparent hover:bg-[#111d2e] hover:border-[#1a2d45] [&_.icon]:text-[#4a7fa8] [&_.label]:text-[#6b8199]'
                            }`
                        }
                    >
                        <div className="icon w-[30px] h-[30px] rounded-[7px] bg-[#141c27] border border-[#1a2840] flex items-center justify-center flex-shrink-0 transition-all">
                            <i className={`ti ${link.icon} text-[14px]`} />
                        </div>
                        <span className="label font-medium flex-1 transition-colors">{link.label}</span>
                        {link.badge && (
                            <span className="text-[10px] font-semibold bg-[#0e2340] text-[#5ba3e0] border border-[#1a4070] px-1.5 py-0.5 rounded-full">
                                {link.badge}
                            </span>
                        )}
                    </NavLink>
                ))}

                <div className="h-px bg-[#141e2e] mx-1 my-1.5" />

                {links.filter(l => l.group === 'other').map(link => (
                    <NavLink key={link.to} to={link.to}
                        className={({ isActive }) =>
                            `relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg border transition-all text-sm
                            ${isActive
                                ? 'bg-[#0e2340] border-[#1a4070] [&_.icon]:bg-[#1a3a60] [&_.icon]:border-[#2a5888] [&_.icon]:text-[#5ba3e0] [&_.label]:text-[#c8dff5]'
                                : 'border-transparent hover:bg-[#111d2e] hover:border-[#1a2d45] [&_.icon]:text-[#4a7fa8] [&_.label]:text-[#6b8199]'
                            }`
                        }
                    >
                        <div className="icon w-[30px] h-[30px] rounded-[7px] bg-[#141c27] border border-[#1a2840] flex items-center justify-center flex-shrink-0 transition-all">
                            <i className={`ti ${link.icon} text-[14px]`} />
                        </div>
                        <span className="label font-medium flex-1 transition-colors">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-3 pb-4 pt-2 border-t border-[#141e2e]">
                {user && (
                    <button
                        onClick={() => navigate('/profil')}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0b1520] border border-[#1a2840] mb-2 w-full text-left hover:bg-[#0e1e30] hover:border-[#2a4060] transition-all"
                    >
                        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#1a3a60] border border-[#2a5888] flex items-center justify-center font-mono text-[12px] font-bold text-[#5ba3e0] flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#c8dff5] truncate">{user.name}</p>
                            <p className="text-[11px] text-[#3d5c78] uppercase tracking-wider mt-0.5">{user.role}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 border-2 border-[#0d1117] flex-shrink-0" />
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-transparent hover:bg-[#1a0f0f] hover:border-[#3a1a1a] transition-all group"
                >
                    <div className="w-[30px] h-[30px] rounded-[7px] bg-[#141c27] border border-[#1a2840] flex items-center justify-center text-[#7a3030] group-hover:bg-[#2a1010] group-hover:border-[#4a2020] group-hover:text-red-400 transition-all">
                        <i className="ti ti-logout text-[14px]" />
                    </div>
                    <span className="text-[13px] font-medium text-[#5a3a3a] group-hover:text-red-400 transition-colors">Déconnexion</span>
                </button>
            </div>

        </aside>
    );
}
