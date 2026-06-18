import { useSelector } from 'react-redux';

export default function Dashboard() {
    const user = useSelector(state => state.auth.user);

    const initials = user?.name
        ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <div className="max-w-xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-slate-900">Tableau de bord</h1>
                <p className="text-sm text-slate-500 mt-0.5">Bienvenue dans votre espace de gestion</p>
            </div>

            {user && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-20 bg-gradient-to-br from-indigo-600 to-indigo-500" />
                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-7 mb-5">
                            <div className="w-14 h-14 rounded-xl bg-indigo-600 border-4 border-white shadow flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                                {initials}
                            </div>
                            <div className="pb-1">
                                <p className="font-semibold text-slate-900">{user.name}</p>
                                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium capitalize">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {[
                                { label: 'Nom',    value: user.name },
                                { label: 'Email',  value: user.email },
                                { label: 'Rôle',   value: user.role },
                                { label: 'Agence', value: `#${user.agency_id}` },
                            ].map(item => (
                                <div key={item.label} className="py-3 flex justify-between items-center">
                                    <span className="text-sm text-slate-500">{item.label}</span>
                                    <span className="text-sm font-medium text-slate-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
