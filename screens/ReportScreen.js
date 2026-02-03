import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
} from 'react-native';
import { saveMaintenance Session } from '../utils/firebase';

export default function ReportScreen({
  sessionData,
  user,
  onBackToDashboard,
}) {
  const [saved, setSaved] = React.useState(false);

  useEffect(() => {
    saveReport();
  }, []);

  const saveReport = async () => {
    try {
      await saveMaintenance Session(sessionData, user.uid);
      setSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const shareReport = async () => {
    try {
      const message = `
KONE Maintenance Report
━━━━━━━━━━━━━━━━━
Elevator: ${sessionData.elevator}
Floor: ${sessionData.floor}
Fault Code: ${sessionData.faultCode}
Total Time: ${Math.floor(sessionData.totalTime / 60)}m ${sessionData.totalTime % 60}s
Movement Samples: ${sessionData.trajectory?.length || 0}
Confidence: ${sessionData.confidence}
Technician: ${user.email}
Date: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━
✓ Report saved to cloud
      `.trim();

      await Share.share({
        message,
        title: 'Maintenance Report',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance Report</Text>
      </View>

      {saved ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ Report Saved to Cloud</Text>
        </View>
      ) : (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Saving to cloud...</Text>
        </View>
      )}

      <View style={styles.reportCard}>
        <Row label="Elevator" value={sessionData.elevator} />
        <Row label="Floor" value={sessionData.floor} />
        <Row label="Fault Code" value={sessionData.faultCode} />
        <Row
          label="Duration"
          value={`${Math.floor(sessionData.totalTime / 60)}m ${sessionData.totalTime % 60}s`}
        />
        <Row label="Movement Samples" value={sessionData.trajectory?.length} />
        <Row label="Confidence" value={sessionData.confidence} />
        <Row label="Technician" value={user.email?.split('@')[0]} />
      </View>

      <Pressable style={styles.button} onPress={shareReport}>
        <Text style={styles.buttonText}>📤 Share Report</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.primaryBtn]}
        onPress={onBackToDashboard}
      >
        <Text style={styles.buttonText}>← Back to Dashboard</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  successBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#d1fae5',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    borderRadius: 8,
  },
  successText: {
    color: '#065f46',
    fontWeight: 'bold',
  },
  loadingBox: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderRadius: 8,
  },
  loadingText: {
    color: '#78350f',
  },
  reportCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  button: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0071CE',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
});
