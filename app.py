import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ElevatorDetailScreen from './screens/ElevatorDetailScreen';
import FloorMaintenanceScreen from './screens/FloorMaintenanceScreen';
import HeatmapScreen from './screens/HeatmapScreen';
import ReportScreen from './screens/ReportScreen';
import AdminDashboard from './screens/AdminDashboard';

// Firebase Config (FREE TIER)
const firebaseConfig = {
  apiKey: "AIzaSyDyrFzbiqsr7cfSGtq3ynjDrV1Aax_PNF8",
  authDomain: "ai-based-back-reporting.firebaseapp.com",
  projectId: "ai-based-back-reporting",
  storageBucket: "ai-based-back-reporting.firebasestorage.app",
  messagingSenderId: "1040193816941",
  appId: "1:1040193816941:web:03056e24dd78e09e4c7264"
};


"""
const firebaseConfig = {
  apiKey: "AIzaSyDyrFzbiqsr7cfSGtq3ynjDrV1Aax_PNF8",
  authDomain: "ai-based-back-reporting.firebaseapp.com",
  projectId: "ai-based-back-reporting",
  storageBucket: "ai-based-back-reporting.firebasestorage.app",
  messagingSenderId: "1040193816941",
  appId: "1:1040193816941:web:03056e24dd78e09e4c7264",
  measurementId: "G-00VEF6ZLJ7"
};
"""


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setCurrentScreen('dashboard');
        // Check if admin (you can add custom claims later)
        setIsAdmin(currentUser.email === 'manager@kone.com');
      }
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  const renderScreen = () => {
    if (!user) {
      return (
        <LoginScreen
          onLoginSuccess={() => setCurrentScreen('dashboard')}
          auth={auth}
        />
      );
    }

    // Admin-only dashboard
    if (isAdmin && currentScreen === 'admin') {
      return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
    }

    // Technician screens
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            onSelectElevator={(elv) => {
              setSelectedElevator(elv);
              setCurrentScreen('elevator');
            }}
            onOpenAdmin={() => setCurrentScreen('admin')}
            isAdmin={isAdmin}
            onLogout={() => setUser(null)}
          />
        );

      case 'elevator':
        return (
          <ElevatorDetailScreen
            elevator={selectedElevator}
            onSelectFloor={(floor) => {
              setSelectedFloor(floor);
              setCurrentScreen('floor');
            }}
            onBack={() => setCurrentScreen('dashboard')}
            user={user}
          />
        );

      case 'floor':
        return (
          <FloorMaintenanceScreen
            elevator={selectedElevator}
            floor={selectedFloor}
            user={user}
            onFinish={(data) => {
              setSessionData(data);
              setCurrentScreen('heatmap');
            }}
            onBack={() => setCurrentScreen('elevator')}
          />
        );

      case 'heatmap':
        return (
          <HeatmapScreen
            sessionData={sessionData}
            onContinue={() => setCurrentScreen('report')}
            onBack={() => setCurrentScreen('floor')}
          />
        );

      case 'report':
        return (
          <ReportScreen
            sessionData={sessionData}
            user={user}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
          />
        );

      default:
        return <DashboardScreen user={user} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
