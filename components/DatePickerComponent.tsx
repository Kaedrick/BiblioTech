import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import swal from 'sweetalert';

interface DatePickerComponentProps {
  idBook: string;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({ idBook }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/reservations?idBook=${idBook}&status=0`);
        const dates = response.data.map((reservation: any) => new Date(reservation.date));
        setReservedDates(dates);
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations :", error);
      }
    };

    fetchReservedDates();
  }, [idBook]);

  const isDateReserved = (date: Date) => {
    return reservedDates.some(reservedDate => format(reservedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  };

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
  };

  const handleReservation = async () => {
    if (startDate) {
      try {
        await axios.post('http://localhost:3001/api/reservations', {
          idBook,
          date: format(startDate, 'yyyy-MM-dd'),
          // idUser = ?,
          status: 1, 
        });
        swal("Succès", "Réservation réussie !", "success");
      setReservedDates([...reservedDates, startDate]);
      } catch (error) {
        console.error("Erreur lors de la réservation :", error);
        swal("Erreur", "Une erreur est survenue lors de la réservation.", "error");
      }
    }
  };

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
