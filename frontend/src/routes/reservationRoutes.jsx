import Reservations from '../pages/reservation/Reservations';
import AjouterReservation from '../pages/reservation/AjouterReservation';
import ReservationsCalendrier from '../pages/reservation/ReservationsCalendrier';

// Routes du domaine "réservation" (locations), à monter dans App.js sous le Layout protégé.
const reservationRoutes = [
    { path: '/reservations',              element: <Reservations /> },
    { path: '/reservations/calendrier',   element: <ReservationsCalendrier /> },
    { path: '/reservations/ajouter',      element: <AjouterReservation /> },
];

export default reservationRoutes;
