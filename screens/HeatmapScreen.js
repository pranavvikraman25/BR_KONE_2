// screens/HeatmapScreen.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';

const ELEVATOR_WIDTH = Dimensions.get('window').width - 40;
const ELEVATOR_HEIGHT = ELEVATOR_WIDTH * 1.2;

export default function HeatmapScreen({ sessionData, onContinue, onBack }) {
  // Create heatmap visualization from trajectory
  const heatmapData = useMemo(() => {
    if (!sessionData?.trajectory || sessionData.trajectory.length === 0) {
      return [];
    }

    // Normalize trajectory to screen coordinates
    const xs = sessionData.trajectory.map(p => p.x || 0);
    const ys = sessionData.trajectory.map(p => p.y || 0);
    const zs = sessionData.trajectory.map(p => p.z || 0);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const rangeZ = maxZ - minZ || 1;

    return sessionData.trajectory.map((point, idx) => ({
      id: idx,
      x: ((point.x - minX) / rangeX) * (ELEVATOR_WIDTH - 40) + 20,
      y: ((point.y - minY) / rangeY) * (ELEVATOR_HEIGHT - 40) + 20,
      z: point.z,
      intensity: 0.3 + (Math.abs(point.z - minZ) / rangeZ) * 0.7,
    }));
  }, [sessionData]);

  // Classify zone based on final trajectory
  const classifyZone = () => {
    if (!sessionData?.trajectory) return 'Unknown';

    const zs = sessionData.trajectory.map(p => p.z || 0);
    const avgZ = zs.reduce((a, b) => a + b, 0) / zs.length;

    if (avgZ < -1) return 'Pit Area';
    if (avgZ > 1) return 'Machine Room';
    if (Math.abs(avgZ) < 0.5) return 'Car Top';
    return 'Landing Area';
  };

  const inferredZone = classifyZone();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>⬅</Text>
        </Pressable>
        <Text style={styles.title}>Movement Heatmap</Text>
      </View>

      {/* Elevator Schematic with Heatmap */}
      <View style={styles.elevatorSection}>
        <Text style={styles.sectionTitle}>Technician Movement Path</Text>
        
        <View style={styles.elevatorBox}>
          {/* Grid Background */}
          <View style={styles.grid}>
            {[0, 1, 2].map((row) =>
              [0, 1, 2].map((col) => (
                <View
                  key={`${row}-${col}`}
                  style={[
                    styles.gridCell,
                    {
                      borderRightWidth: col < 2 ? 0.5 : 0,
                      borderBottomWidth: row < 2 ? 0.5 : 0,
                    },
                  ]}
                />
              ))
            )}
          </View>

          {/* Heatmap Dots */}
          {heatmapData.map((point) => (
            <View
              key={point.id}
              style={[
                styles.heatDot,
                {
                  left: point.x,
                  top: point.y,
                  opacity: point.intensity,
                  width: 10 + point.intensity * 10,
                  height: 10 + point.intensity * 10,
                },
              ]}
            />
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { opacity: 0.4 }]} />
            <Text style={styles.legendText}>Light = Moving</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { opacity: 0.9 }]} />
            <Text style={styles.legendText}>Dark = Stationary</Text>
          </View>
        </View>
      </View>

      {/* Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Analysis</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Inferred Working Zone:</Text>
          <Text style={[styles.value, { color: getZoneColor(inferredZone) }]}>
            {inferredZone}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Movement Samples:</Text>
          <Text style={styles.value}>{heatmapData.length}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Confidence:</Text>
          <Text style={styles.value}>{sessionData?.confidence || 'Medium'}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Fault Code:</Text>
          <Text style={styles.value}>{sessionData?.faultCode || 'N/A'}</Text>
        </View>

        <View style={styles.zoneGuide}>
          <Text style={styles.zoneGuideTitle}>Expected Zones for Fault 0021:</Text>
          <Text style={styles.zoneGuideText}>
            • Pit Area: Buffer/safety switch near shaft bottom
          </Text>
          <Text style={styles.zoneGuideText}>
            • Landing: Door contacts on specific floors
          </Text>
          <Text style={styles.zoneGuideText}>
            • Car Top: Header access and car safety
          </Text>
          <Text style={styles.zoneGuideText}>
            • Machine Room: Overtravel limits
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Continue to Report</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function getZoneColor(zone) {
  const colors = {
    'Pit Area': '#ef4444',
    'Landing Area': '#f59e0b',
    'Car Top': '#3b82f6',
    'Machine Room': '#8b5cf6',
    'Unknown': '#6b7280',
  };
  return colors[zone] || '#6b7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  back: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0071CE',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  elevatorSection: {
    padding: 16,
  },
  elevatorBox: {
    width: '100%',
    height: ELEVATOR_HEIGHT,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#0071CE',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '33.33%',
    height: '33.33%',
    borderColor: '#ddd',
  },
  heatDot: {
    position: 'absolute',
    backgroundColor: '#dc2626',
    borderRadius: 50,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#dc2626',
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  analysisSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  zoneGuide: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  zoneGuideTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 12,
  },
  zoneGuideText: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: '#0071CE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
