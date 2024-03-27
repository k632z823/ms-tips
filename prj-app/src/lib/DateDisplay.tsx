import { Component, createSignal, createEffect } from 'solid-js';

const DateDisplay = () => {
  const [currentDate, setCurrentDate] = createSignal(new Date());

  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); 

    return () => clearInterval(interval);
  });

  const getDayOfWeek = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getMonthName = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[date.getMonth()];
  };

  const formatHour = (date: Date) => {
    if (date.getHours() == 0 || date.getHours() == 12) {
      return 12;
    } else if (date.getHours() < 10) {
      return `0${date.getHours()}`;
    } else if (date.getHours() > 12 && date.getHours() <= 21) {
      return `0${date.getHours() - 12}`;
    } else if (date.getHours() > 21) {
      return date.getHours() - 12;
    } else {
      return date.getHours();
    }
  }

  return (
    <div>
      <p>{formatHour(currentDate())}:{currentDate().getMinutes()}</p>
      <p>{getDayOfWeek(currentDate())}</p>
      <p>{getMonthName(currentDate())} {currentDate().getDate()}</p>
      <p>{currentDate().getFullYear()}</p>
    </div>
  );
};

export default DateDisplay;