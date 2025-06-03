
import { useState, useEffect, useRef } from 'react';

interface UseUserActivityOptions {
  timeout?: number; // Temps d'inactivité en millisecondes (défaut: 5 minutes)
  events?: string[]; // Événements à écouter
}

export const useUserActivity = (options: UseUserActivityOptions = {}) => {
  const {
    timeout = 5 * 60 * 1000, // 5 minutes par défaut
    events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  } = options;

  const [isActive, setIsActive] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsActive(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, timeout);
  };

  useEffect(() => {
    // Initialiser le timeout
    resetTimeout();

    // Ajouter les listeners d'événements
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Nettoyage
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [timeout]);

  return { isActive, resetActivity: resetTimeout };
};
