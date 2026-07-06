import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const user = useSelector(state => state.auth.user);

    const initials = user?.name
        ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <div className="max-w-xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-stone-900">Tableau de bord</h1>
                <p className="text-sm text-stone-500 mt-0.5">Bienvenue dans votre espace de gestion</p>
            </div>

            {user && (
                <motion.div
                    initial={{ opacity: 0, y: 28, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm"
                >
                    <div className="h-20 bg-gradient-to-br from-emerald-600 to-emerald-500" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-7 mb-5">
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
                                className="w-14 h-14 rounded-lg bg-emerald-600 border-4 border-white shadow flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                            >
                                {initials}
                            </motion.div>
                            <div className="pb-1">
                                <p className="font-semibold text-stone-900">{user.name}</p>
                                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-medium capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-stone-100">
                            {[
                                { label: 'Nom',    value: user.name },
                                { label: 'Email',  value: user.email },
                                { label: 'Rôle',   value: user.role },
                                { label: 'Agence', value: `#${user.agency_id}` },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.2 + index * 0.05 }}
                                    className="py-3 flex justify-between items-center"
                                >
                                    <span className="text-sm text-stone-500">{item.label}</span>
                                    <span className="text-sm font-medium text-stone-800">{item.value}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
