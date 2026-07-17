import { useEffect, useRef } from 'react';
import { useSolarStore } from '../store/useSolarStore';

export function useTime() {
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const simDate = useSolarStore((state) => state.simDate);
  const setSimDate = useSolarStore((state) => state.setSimDate);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Store speed and date in refs to prevent triggering effect on changes
  const speedRef = useRef(timeSpeed);
  const dateRef = useRef(simDate);

  useEffect(() => {
    speedRef.current = timeSpeed;
  }, [timeSpeed]);

  useEffect(() => {
    dateRef.current = simDate;
  }, [simDate]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaMs = time - previousTimeRef.current;
        const deltaSec = deltaMs / 1000;

        if (speedRef.current !== 0) {
          // speed = 1 means 1 day of simulation time per real-world second.
          // 1 day = 24 * 60 * 60 * 1000 milliseconds = 86,400,000 ms.
          // Simulation ms to add = deltaSec * speed * 86,400,000.
          const simTimeDelta = deltaSec * speedRef.current * 86400000;
          
          const nextDate = new Date(dateRef.current.getTime() + simTimeDelta);
          setSimDate(nextDate);
        }
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [setSimDate]);
}
export default useTime;
