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
    <div class='flex justify-center'>
      <div class='border border-border-gray  rounded-md w-11/12 p-2.5'>
        <div class='flex justify-between items-center'>
          <div>{formatHour(currentDate())}:{formatMinutes(currentDate())}</div>
          {/* <div>{getDayOfWeek(currentDate())}</div> */}
          <div>{getMonthName(currentDate())} {currentDate().getDate()}, {currentDate().getFullYear()}</div>
        </div>
      </div>
    </div>
  );
};

export default DateDisplay;