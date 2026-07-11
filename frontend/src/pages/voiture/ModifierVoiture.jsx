import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { translateError, translateErrors } from '../../utils/translateError';

const FUEL_OPTIONS = [
    { value: 'diesel',   label: 'Diesel' },
    { value: 'petrol',   label: 'Essence' },
    { value: 'electric', label: 'Électrique' },
    { value: 'hybrid',   label: 'Hybride' },
];

const inputCls = 'w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 px-3 py-2 rounded-md text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition';

function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}

export default function ModifierVoiture() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        brand: '',
        model: '',
        plateNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        mileage: '',
        dailyPrice: '',
        fuelType: 'diesel',
    });
    const [primaryImage, setPrimaryImage]     = useState(null);
    const [images, setImages]                 = useState([]);
    const [primaryPreview, setPrimaryPreview] = useState(null);
    const [imagePreviews, setImagePreviews]   = useState([]);
    const [loading, setLoading]               = useState(true);
    const [submitting, setSubmitting]         = useState(false);
    const [error, setError]                   = useState('');

    useEffect(() => {
        api.get(`/cars/${id}`)
            .then(res => {
                const car = res.data;
                setForm({
                    brand: car.brand || '',
                    model: car.model || '',
                    plateNumber: car.registration_number || '',
                    purchaseDate: car.purchase_date ? car.purchase_date.slice(0, 10) : '',
                    purchasePrice: car.purchase_price || '',
                    mileage: car.mileage || '',
                    dailyPrice: car.daily_price || '',
                    fuelType: car.fuel_type || 'diesel',
                });
                const img = car.images?.find(i => i.is_primary) || car.images?.[0];
                if (img) setPrimaryPreview(img.image_path);
            })
            .catch(() => setError('Voiture introuvable.'))
            .finally(() => setLoading(false));
    }, [id]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handlePrimaryImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPrimaryImage(file);
        setPrimaryPreview(URL.createObjectURL(file));
    };

    const handleImages = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImagePreviews(files.map(f => URL.createObjectURL(f)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('_method', 'PUT');
            Object.entries(form).forEach(([k, v]) => data.append(k, v));
            if (primaryImage) data.append('primaryImage', primaryImage);
            images.forEach(img => data.append('images[]', img));
            await api.post(`/cars/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate(`/voitures/${id}`);
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(translateErrors(errors));
            } else {
                setError(translateError(err.response?.data?.message) || 'Erreur lors de la modification.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-7 w-56 bg-stone-200 rounded-sm animate-pulse" />
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-stone-200 rounded-lg animate-pulse" />)}
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate(`/voitures/${id}`)}
                    className="w-8 h-8 rounded-md border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:bg-stone-50 transition"
                >
                    <i className="ti ti-arrow-left text-[15px]" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-stone-900">Modifier la voiture</h1>
                    <p className="text-sm text-stone-500 mt-0.5">Mettez à jour les informations du véhicule</p>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-200 text-sm mb-5">
                    <i className="ti ti-alert-circle mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Informations générales */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-car text-emerald-500" /> Informations générales
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Marque" required>
                            <input
                                type="text"
                                placeholder="ex : Toyota"
                                value={form.brand}
                                onChange={e => set('brand', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Modèle" required>
                            <input
                                type="text"
                                placeholder="ex : Corolla"
                                value={form.model}
                                onChange={e => set('model', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Immatriculation" required>
                            <input
                                type="text"
                                placeholder="ex : 12345-A-1"
                                value={form.plateNumber}
                                onChange={e => set('plateNumber', e.target.value)}
                                required
                                className={`${inputCls} font-mono`}
                            />
                        </Field>
                        <Field label="Type de carburant" required>
                            <select
                                value={form.fuelType}
                                onChange={e => set('fuelType', e.target.value)}
                                required
                                className={inputCls}
                            >
                                {FUEL_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Données financières & techniques */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-coin text-emerald-500" /> Données financières &amp; techniques
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Date d'achat" required>
                            <input
                                type="date"
                                value={form.purchaseDate}
                                onChange={e => set('purchaseDate', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Prix d'achat (MAD)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 150000"
                                value={form.purchasePrice}
                                onChange={e => set('purchasePrice', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Kilométrage (km)" required>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                placeholder="ex : 45000"
                                value={form.mileage}
                                onChange={e => set('mileage', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Prix / jour (MAD)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="ex : 350"
                                value={form.dailyPrice}
                                onChange={e => set('dailyPrice', e.target.value)}
                                required
                                className={inputCls}
                            />
                        </Field>
                    </div>
                </div>

                {/* Photos */}
                <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-stone-700 mb-4 flex items-center gap-2">
                        <i className="ti ti-photo text-emerald-500" /> Photos du véhicule
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Photo principale */}
                        <div>
                            <p className="text-xs font-medium text-stone-600 mb-2">
                                Photo principale
                            </p>
                            <label className="block cursor-pointer">
                                {primaryPreview ? (
                                    <div className="relative group w-full h-40 rounded-md overflow-hidden border border-stone-200">
                                        <img src={primaryPreview} alt="Aperçu" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <span className="text-white text-xs font-medium flex items-center gap-1">
                                                <i className="ti ti-refresh" /> Changer
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-40 rounded-md border-2 border-dashed border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex flex-col items-center justify-center gap-1.5">
                                        <i className="ti ti-upload text-stone-300 text-[28px]" />
                                        <p className="text-xs text-stone-400">Cliquer pour sélectionner</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePrimaryImage}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Photos supplémentaires */}
                        <div>
                            <p className="text-xs font-medium text-stone-600 mb-2">
                                Ajouter des photos
                            </p>
                            <label className="block cursor-pointer">
                                <div className="w-full h-40 rounded-md border-2 border-dashed border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition overflow-hidden relative flex flex-col items-center justify-center gap-1.5">
                                    {imagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
                                            {imagePreviews.slice(0, 6).map((src, i) => (
                                                <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-sm" />
                                            ))}
                                            {imagePreviews.length > 6 && (
                                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                    +{imagePreviews.length - 6}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <i className="ti ti-photos text-stone-300 text-[28px]" />
                                            <p className="text-xs text-stone-400">Sélectionner plusieurs photos</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImages}
                                    className="hidden"
                                />
                            </label>
                            {imagePreviews.length > 0 && (
                                <p className="text-xs text-stone-400 mt-1.5">{imagePreviews.length} photo{imagePreviews.length > 1 ? 's' : ''} sélectionnée{imagePreviews.length > 1 ? 's' : ''}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-6">
                    <button
                        type="button"
                        onClick={() => navigate(`/voitures/${id}`)}
                        className="px-4 py-2 rounded-md border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition shadow-sm"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                                </svg>
                                Enregistrement…
                            </>
                        ) : (
                            <>
                                <i className="ti ti-check text-[15px]" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
