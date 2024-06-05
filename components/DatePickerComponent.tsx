import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import swal from 'sweetalert';
import moment from 'moment';
require('dotenv').config();
const serverUrl = process.env.BASE_URL || 'http://localhost:3001';
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

interface DatePickerComponentProps {
  idBook: string;
  userId: number;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({ idBook, userId }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [reservedDates, setReservedDates] = useState(new Map<string, number>());

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
          const response = await axios.get(`${serverUrl}/api/books/reserved-dates/${idBook}`);
          const blockedDates = response.data;
          const dateCountMap = new Map<string, number>();

          blockedDates.forEach((date: string) => {
              dateCountMap.set(date, 1);
          });

          setReservedDates(dateCountMap);
      } catch (error) {
          console.error("Erreur lors de la récupération des dates réservées :", error);
      }
  };

    fetchReservedDates();
  }, [idBook]);

  const fetchCurrentUserID = async () => {
    try {
        const response = await axios.get(`${serverUrl}/getUserID`, { withCredentials: true });
        const userId = response.data.userID; 
        return userId; 
    } catch (error) {
        console.error("Error fetching user ID:", error);
        throw error; 
    }
  };

  const isDateReserved = (date: any) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    return reservedDates.has(dateString);
};

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleReservation = async () => {
    if (startDate && userId) {
      try {
        const reservationStartDate = moment(startDate).format('YYYY-MM-DD');
        console.log(userId, idBook, reservationStartDate);
        await axios.post(`${serverUrl}/api/books/reservations`, {
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
        swal('Erreur', 'Erreur lors de la réservation. Le livre est peut-être hors de stock.', 'error');
        console.log(error);
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
      <br/>
      <button className="reserve-button" onClick={handleReservation}>
        Confirmer la réservation
      </button>
      <br/>
    </div>
  );
};

export default DatePickerComponent;
