import Reservations from '../pages/reservation/Reservations';
import AjouterReservation from '../pages/reservation/AjouterReservation';
import ReservationsCalendrier from '../pages/reservation/ReservationsCalendrier';
import Facture from '../pages/reservation/Facture';
import ReservationDetail from '../pages/reservation/ReservationDetail';

// Routes du domaine "réservation" (locations), à monter dans App.js sous le Layout protégé.
const reservationRoutes = [
    { path: '/reservations',              element: <Reservations /> },
    { path: '/reservations/calendrier',   element: <ReservationsCalendrier /> },
    { path: '/reservations/ajouter',      element: <AjouterReservation /> },
    { path: '/reservations/:id/facture',  element: <Facture /> },
    { path: '/reservations/:id',          element: <ReservationDetail /> },
];

export default reservationRoutes;
