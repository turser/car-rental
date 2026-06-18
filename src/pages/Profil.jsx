import { useSelector } from 'react-redux';

const ROLE = {
    admin:   { label: 'Administrateur', cls: 'bg-violet-50 text-violet-700 border border-violet-100' },
    employe: { label: 'Employé',        cls: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
};

export default function Profil() {
    const user = useSelector(state => state.auth.user);

    if (!user) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-slate-400 text-sm">Aucun utilisateur trouvé.</p>
        </div>
    );

    const role     = ROLE[user.role] || { label: user.role, cls: 'bg-slate-100 text-slate-600 border border-slate-200' };
    const initials = user.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <div className="max-w-lg">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Mon Profil</h1>
                <p className="text-sm text-slate-500 mt-0.5">Informations de votre compte</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="h-20 bg-gradient-to-br from-indigo-600 to-indigo-500" />
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-7 mb-5">
                        <div className="w-14 h-14 rounded-xl bg-indigo-600 border-4 border-white shadow flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                            {initials}
                        </div>
                        <div className="pb-1">
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.cls}`}>{role.label}</span>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {[
                            { label: 'ID',          value: `#${user.id}` },
                            { label: 'Nom complet', value: user.name },
                            { label: 'Email',       value: user.email },
                            { label: 'Agence ID',   value: `#${user.agency_id}` },
                        ].map(item => (
                            <div key={item.label} className="py-3 flex justify-between items-center">
                                <span className="text-sm text-slate-500">{item.label}</span>
                                <span className="text-sm font-medium text-slate-800">{item.value}</span>
                            </div>
                        ))}
                        <div className="py-3 flex justify-between items-center">
                            <span className="text-sm text-slate-500">Rôle</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.cls}`}>{role.label}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
