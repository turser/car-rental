import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const ROLE = {
    admin:   { label: 'Administrateur', cls: 'bg-violet-50 text-violet-700 border border-violet-100' },
    employe: { label: 'Employé',        cls: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
};

export default function Profil() {
    const user = useSelector(state => state.auth.user);

    if (!user) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-stone-400 text-sm">Aucun utilisateur trouvé.</p>
        </div>
    );

    const role     = ROLE[user.role] || { label: user.role, cls: 'bg-stone-100 text-stone-600 border border-stone-200' };
    const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <div className="max-w-lg">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-stone-900">Mon Profil</h1>
                <p className="text-sm text-stone-500 mt-0.5">Informations de votre compte</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm"
            >
                <div className="h-20 bg-gradient-to-br from-emerald-700 to-emerald-500" />
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-7 mb-5">
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
                            className="w-14 h-14 rounded-lg bg-emerald-700 border-4 border-white shadow flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                        >
                            {initials}
                        </motion.div>
                        <div className="pb-1">
                            <p className="font-semibold text-stone-900">{user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.cls}`}>{role.label}</span>
                        </div>
                    </div>

                    <div className="divide-y divide-stone-100">
                        {[
                            { label: 'ID',          value: `#${user.id}` },
                            { label: 'Nom complet', value: user.name },
                            { label: 'Email',       value: user.email },
                            { label: 'Agence ID',   value: `#${user.agency_id}` },
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
                        <div className="py-3 flex justify-between items-center">
                            <span className="text-sm text-stone-500">Rôle</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.cls}`}>{role.label}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
