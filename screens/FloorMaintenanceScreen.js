import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { saveMaintenance Session } from '../utils/firebase';

export default function FloorMaintenanceScreen({
  elevator,
  floor,
  user,
  onFinish,
  onBack,
}) {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [trajectory, setTrajectory] = useState([]);
  const [movementState, setMovementState] = useState('Idle');
  const timerRef = useRef(null);
  const accelRef = useRef(null);
  const position = useRef({ x: 0, y: 0, z: 0 });
  const last = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (!running) return;

    Accelerometer.setUpdateInterval(200);
    accelRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const dx = x - last.current.x;
      const dy = y - last.current.y;
      const dz = z - last.current.z;

      const diff = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);

      if (diff > 0.05) {
        position.current.x += dx;
        position.current.y += dy;
        position.current.z += dz;

        setTrajectory((prev) => [
          ...prev,
          { t: Date.now(), ...position.current },
        ]);
        setMovementState('Moving');
      } else {
        setMovementState('Stationary');
      }

      last.current = { x, y, z };
    });

    return () => accelRef.current?.remove();
  }, [running]);

  const formatTime = (totalSeconds) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}m ${sec}s`;
  };

  const startMaintenance = () => {
    setSeconds(0);
    setTrajectory([]);
    position.current = { x: 0, y: 0, z: 0 };
    last.current = { x: 0, y: 0, z: 0 };
    setRunning(true);
  };

  const endMaintenance = () => {
    setRunning(false);
    
    const report = {
      elevator: elevator.id,
      floor,
      faultCode: '0021',
      startTime: new Date(Date.now() - seconds * 1000),
      totalTime: seconds,
      trajectory,
      confidence: trajectory.length > 50 ? 'High' : 'Medium',
    };

    onFinish(report);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>⬅</Text>
        </Pressable>
        <Text style={styles.title}>
          {elevator.id} - Floor {floor}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Total Time</Text>
        <Text style={styles.value}>{formatTime(seconds)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Movement Status</Text>
        <Text
          style={[
            styles.value,
            movementState === 'Moving'
              ? styles.moving
              : styles.stationary,
          ]}
        >
          {movementState}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Samples Captured</Text>
        <Text style={styles.value}>{trajectory.length}</Text>
      </View>

      {!running ? (
        <Pressable
          style={[styles.button, styles.startBtn]}
          onPress={startMaintenance}
        >
          <Text style={styles.buttonText}>▶ Start Maintenance</Text>
        </Pressable>
      ) : (
        <Pressable
          style={[styles.button, styles.endBtn]}
          onPress={endMaintenance}
        >
          <Text style={styles.buttonText}>⏹ End Maintenance</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  moving: {
    color: '#ef4444',
  },
  stationary: {
    color: '#16a34a',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  startBtn: {
    backgroundColor: '#0071CE',
  },
  endBtn: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
