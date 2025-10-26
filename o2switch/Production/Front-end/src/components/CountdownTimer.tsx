import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: Date;
  className?: string;
  onEnd?: () => void;
}

const calculateTimeLeft = (endDate: Date) => {
  const difference = +new Date(endDate) - +new Date();
  let timeLeft: { [key: string]: number } = {};

  if (difference > 0) {
    timeLeft = {
      Jours: Math.floor(difference / (1000 * 60 * 60 * 24)),
      Heures: Math.floor((difference / (1000 * 60 * 60)) % 24),
      Min: Math.floor((difference / 1000 / 60) % 60),
      Sec: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, className, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timerId = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endDate);
      setTimeLeft(newTimeLeft);

      if (Object.keys(newTimeLeft).length === 0) {
        clearInterval(timerId);
        if (onEnd) {
          onEnd();
        }
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [endDate, onEnd]);

  const timerComponents = Object.entries(timeLeft)
    .filter(([interval]) => {
      if (timeLeft['Jours'] > 0) {
        return true;
      }
      if (timeLeft['Heures'] > 0) {
        return ['Heures', 'Min', 'Sec'].includes(interval);
      }
      if (timeLeft['Min'] > 0) {
        return ['Min', 'Sec'].includes(interval);
      }
      return interval === 'Sec';
    })
    .map(([interval, value]) => (
        <div key={interval} className="text-center p-2 bg-gray-100 rounded">
          <span className="font-bold font-heading text-xl text-expert-blue">{(value as number).toString().padStart(2, '0')}</span>
          <span className="text-xs block text-expert-gray">{interval}</span>
        </div>
      )
    );


  if (!timerComponents.length) {
    return <div className="text-red-500 font-bold text-lg">Enchère terminée</div>;
  }
  
  return (
    <div className={`flex space-x-2 items-center ${className}`}>
      {timerComponents}
    </div>
  );
};

export default CountdownTimer;
