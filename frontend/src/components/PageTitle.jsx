import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageTitle } from '../utils/pageTitles';

// Met à jour le titre de l'onglet du navigateur selon la page affichée.
export default function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        const title = getPageTitle(location.pathname);
        document.title = title ? `${title} · CarRental` : 'CarRental';
    }, [location.pathname]);

    return null;
}
