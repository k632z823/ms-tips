import { Component, createSignal, createEffect } from 'solid-js';

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
  if (date.getHours() < 10) {
    return `0${date.getHours()}`;
  } else {
    return date.getHours();
  }
}

const formatMinutes = (date: Date) => {
  return date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
}

const DateDisplay: Component = () => {
  const [currentDate, setCurrentDate] = createSignal(new Date());
  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); 
  
    return () => clearInterval(interval);
  });

  return (
    <div>
      <p>{formatHour(currentDate())}:{formatMinutes(currentDate())}</p>
      <p>{getDayOfWeek(currentDate())}</p>
      <p>{getMonthName(currentDate())} {currentDate().getDate()}</p>
      <p>{currentDate().getFullYear()}</p>
    </div>
  );
};

export default DateDisplay;