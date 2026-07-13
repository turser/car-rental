import { STEPS } from './constants';

export default function Stepper({ current }) {
    return (
        <div className="flex items-start">
            {STEPS.map((s, i) => (
                <div key={s.label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className="flex flex-col items-center flex-shrink-0 w-28">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                            i < current  ? 'bg-emerald-600 text-white' :
                            i === current ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
                            'bg-white border-2 border-stone-200 text-stone-400'
                        }`}>
                            {i < current ? <i className="ti ti-check text-[16px]" /> : i + 1}
                        </div>
                        <p className={`text-xs text-center mt-2 leading-tight ${i === current ? 'font-semibold text-stone-900' : i < current ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                            {s.label}
                        </p>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mt-[18px] transition-colors ${i < current ? 'bg-emerald-600' : 'bg-stone-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
