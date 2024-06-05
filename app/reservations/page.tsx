// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './page.css';

// interface Reservation {
//     idReservation: number;
//     userId: number;
//     reservationStartDate: Date;
//     reservationEndDate: Date;
//     // Autres propriétés
// }


// const ReservationsPage = () => {
//   const [reservations, setReservations] = useState([]);

//   useEffect(() => {
//     loadReservations(); // Loads reservations at page load
//   }, []);

//   const loadReservations = async () => {
//     try {
//       const response = await axios.get('/api/user/reservations');
//       setReservations(response.data);
//     } catch (error) {
//       console.error('Erreur lors du chargement des réservations :', error);
//     }
//   };

//   const handleCancelReservation = async (reservationId: any) => {
//     try {
//       await axios.post(`/api/user/reservations/${reservationId}/cancel`);
//       // Refreshes list after canceling a reservation
//       loadReservations();
//     } catch (error) {
//       console.error('Erreur lors de l\'annulation de la réservation :', error);
//     }
//   };

//   return (
//     <div className="reservations-container">
//       <h1>Mes réservations</h1>
//       {reservations.length === 0 ? (
//         <p>Vous n'avez aucune réservation pour le moment.</p>
//       ) : (
//         <ul>
//           {reservations.map((reservation) => (
//             <li key={reservation.idReservation}>
//               <p>Date de début : {reservation.reservationStartDate}</p>
//               <p>Date de fin : {reservation.reservationEndDate}</p>
//               <button onClick={() => handleCancelReservation(reservation.idReservation)}>Annuler</button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ReservationsPage;
