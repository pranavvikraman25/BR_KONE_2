import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { getAllSessions } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

export default function AdminDashboard({ user, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 3000); // Refresh every 3s
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          color="#0071CE"
        />
        <StatCard
          title="Unique Technicians"
          value={new Set(sessions.map(s => s.userId)).size}
          color="#10b981"
        />
        <StatCard
          title="Elevators Serviced"
          value={new Set(sessions.map(s => s.elevator)).size}
          color="#f59e0b"
        />
      </View>

      <Text style={styles.sectionTitle}>Live Session Feed</Text>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>No sessions yet</Text>
      ) : (
        <FlatList
          data={sessions.sort((a, b) => b.createdAt - a.createdAt)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionId}>{item.elevator} - F{item.floor}</Text>
                <Text style={styles.sessionTime}>
                  {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.sessionUser}>👤 {item.userId?.slice(0, 8)}</Text>
              <Text style={styles.sessionZone}>
                Zone: {item.inferredZone || 'Calculating...'}
              </Text>
              <View style={styles.sessionFooter}>
                <Text style={styles.sessionDuration}>
                  ⏱ {Math.floor(item.totalTime / 60)}m {item.totalTime % 60}s
                </Text>
                <Text
                  style={[
                    styles.sessionConfidence,
                    item.confidence === 'High' && styles.highConfidence,
                  ]}
                >
                  {item.confidence}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function StatCard({ title, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#0071CE',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 12,
    color: '#cce5ff',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginVertical: 12,
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  sessionCard: {
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0071CE',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionId: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  sessionTime: {
    fontSize: 11,
    color: '#999',
  },
  sessionUser: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  sessionZone: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 6,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDuration: {
    fontSize: 11,
    color: '#666',
  },
  sessionConfidence: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  highConfidence: {
    color: '#10b981',
  },
});
