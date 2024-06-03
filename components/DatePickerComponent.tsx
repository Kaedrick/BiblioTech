import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import swal from 'sweetalert';
import moment from 'moment';

interface DatePickerComponentProps {
  idBook: string;
  userId: number;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({ idBook, userId }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [reservedDates, setReservedDates] = useState<Map<string, number>>(new Map());
  //const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
          const response = await axios.get('http://localhost:3001/api/reservations', {
              params: { idBook },
          });
          const reservations = response.data;
          const dateCountMap = new Map<string, number>();
  
          reservations.forEach((reservation: any) => {
              let currentDate = moment(reservation.reservationStartDate);
              const endDate = moment(reservation.reservationEndDate);
              while (currentDate <= endDate) {
                  const dateString = currentDate.format('YYYY-MM-DD');
                  dateCountMap.set(dateString, (dateCountMap.get(dateString) || 0) + 1);
                  currentDate.add(1, 'day');
              }
          });
  
          setReservedDates(dateCountMap);
      } catch (error) {
          console.error("Erreur lors de la récupération des réservations :", error);
      }
  };  

    fetchReservedDates();
  }, [idBook]);

  const fetchCurrentUserID = async () => {
    try {
        const response = await axios.get(`http://localhost:3001/getUserID`, { withCredentials: true });
        const userId = response.data.userID; 
        return userId; 
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error; 
    }
  };

  const isDateReserved = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const reservedCount = reservedDates.get(dateString) || 0;
    return reservedCount >= 2; // Adjust based on the available quantity
  };

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleReservation = async () => {
    if (startDate && userId) {
      try {
        const reservationStartDate = moment(startDate).format('YYYY-MM-DD');
        console.log(userId, idBook, reservationStartDate);
        await axios.post('http://localhost:3001/api/books/reservations', {
          userId,
          idBook: [idBook], 
          reservationStartDate,
        });
        swal('Succès', 'Réservation réussie !', 'success');
        const updatedDates = new Map(reservedDates);
        const dateString = moment(startDate).format('YYYY-MM-DD');
        updatedDates.set(dateString, (updatedDates.get(dateString) || 0) + 1);
        setReservedDates(updatedDates);
      } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        swal('Erreur', 'Erreur lors de la réservation', 'error');
      }
    }
  };

  const test = () => {
    console.log(fetchCurrentUserID());
  }

  return (
    <div className="date-picker-container">
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        inline
        minDate={new Date()}
        maxDate={addDays(new Date(), 365)}
        filterDate={date => !isDateReserved(date)}
      />
      <button className="reserve-button" onClick={handleReservation}>
        Confirmer la réservation
      </button>
    </div>
  );
};

export default DatePickerComponent;
