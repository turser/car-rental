import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';

const RENTAL_STATUS = {
    completed: { label: 'Terminée',   cls: 'bg-emerald-100 text-emerald-700' },
    active:    { label: 'En cours',   cls: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Annulée',    cls: 'bg-red-100 text-red-600' },
    pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
};

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const toKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Construit la grille de 42 jours (6 semaines, lundi en premier) couvrant le mois affiché.
function buildGrid(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7; // lundi = 0
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, i) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + i);
        return date;
    });
}

// Page calendrier des réservations : affiche les locations en cours / planifiées sur une vue mensuelle.
export default function ReservationsCalendrier() {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');
    const [cursor, setCursor]   = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    useEffect(() => {
        api.get('/rentals')
            .then(res => setRentals(res.data.data))
            .catch(() => setError('Erreur lors du chargement des réservations.'))
            .finally(() => setLoading(false));
    }, []);

    const grid = useMemo(() => buildGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

    const rentalsByDay = useMemo(() => {
        const map = {};
        for (const r of rentals) {
            if (!r.start_date || !r.end_date) continue;
            const start = new Date(r.start_date);
            const end = new Date(r.end_date);
            for (const day of grid) {
                if (day >= new Date(start.getFullYear(), start.getMonth(), start.getDate())
                    && day <= new Date(end.getFullYear(), end.getMonth(), end.getDate())) {
                    const key = toKey(day);
                    (map[key] ??= []).push(r);
                }
            }
        }
        return map;
    }, [rentals, grid]);

    const today = new Date();
    const goToMonth = delta => setCursor(c => new Date(c.getFullYear(), c.getMonth() + delta, 1));
    const goToday = () => setCursor(new Date(today.getFullYear(), today.getMonth(), 1));

    if (loading) return (
        <div className="space-y-4">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-[600px] bg-slate-200 rounded-xl animate-pulse" />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-200 text-sm">
            <i className="ti ti-alert-circle" /> {error}
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-slate-900">Calendrier des réservations</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Vue mensuelle des locations en cours et planifiées</p>
                </div>
                <button
                    onClick={() => navigate('/reservations')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
                >
                    <i className="ti ti-list text-[14px]" />
                    Liste
                </button>
            </div>

            {/* Légende + navigation */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => goToMonth(-1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                    >
                        <i className="ti ti-chevron-left text-[15px]" />
                    </button>
                    <h2 className="text-base font-semibold text-slate-900 w-44 text-center capitalize">
                        {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
                    </h2>
                    <button
                        onClick={() => goToMonth(1)}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 transition"
                    >
                        <i className="ti ti-chevron-right text-[15px]" />
                    </button>
                    <button
                        onClick={goToday}
                        className="ml-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
                    >
                        Aujourd'hui
                    </button>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    {Object.entries(RENTAL_STATUS).map(([key, s]) => (
                        <span key={key} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${s.cls.split(' ')[0]}`} />
                            {s.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Grille du calendrier */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                    {WEEKDAYS.map(d => (
                        <div key={d} className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {grid.map((day, i) => {
                        const key = toKey(day);
                        const dayRentals = rentalsByDay[key] || [];
                        const isCurrentMonth = day.getMonth() === cursor.getMonth();
                        const isToday = isSameDay(day, today);
                        return (
                            <div
                                key={i}
                                className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}`}
                            >
                                <p className={`text-xs font-medium mb-1 inline-flex items-center justify-center w-5 h-5 rounded-full
                                    ${isToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}
                                >
                                    {day.getDate()}
                                </p>
                                <div className="space-y-1">
                                    {dayRentals.slice(0, 3).map(r => {
                                        const rs = RENTAL_STATUS[r.status] || { label: r.status, cls: 'bg-slate-100 text-slate-600' };
                                        return (
                                            <p
                                                key={r.id}
                                                title={`${r.client?.full_name || ''} — ${r.car?.brand || ''} ${r.car?.model || ''}`}
                                                className={`truncate px-1.5 py-0.5 rounded text-[11px] font-medium ${rs.cls}`}
                                            >
                                                {r.client?.full_name || `#${r.id}`}
                                            </p>
                                        );
                                    })}
                                    {dayRentals.length > 3 && (
                                        <p className="text-[11px] text-slate-400 px-1.5">+{dayRentals.length - 3} autres</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
