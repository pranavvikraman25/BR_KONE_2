import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export default function useAccelerometer(active = false) {
  const [trajectory, setTrajectory] = useState([]);
  const position = useRef({ x: 0, y: 0, z: 0 });
  const last = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!active) return;

    Accelerometer.setUpdateInterval(200);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const dx = x - last.current.x;
      const dy = y - last.current.y;
      const dz = z - last.current.z;

      if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 0.03) {
        position.current.x += dx;
        position.current.y += dy;
        position.current.z += dz;

        setTrajectory((prev) => [
          ...prev,
          { t: Date.now(), ...position.current },
        ]);
      }

      last.current = { x, y, z };
    });

    return () => sub.remove();
  }, [active]);

  return { trajectory };
}
