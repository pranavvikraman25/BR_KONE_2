import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';

export default function ElevatorDetailScreen({
  elevator,
  onSelectFloor,
  onBack,
  user,
}) {
  const floors = Array.from({ length: elevator.floors }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Text style={styles.back}>⬅</Text>
        </Pressable>
        <Text style={styles.title}>{elevator.id}</Text>
      </View>

      <FlatList
        data={floors}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.floorCard}
            onPress={() => onSelectFloor(item)}
          >
            <Text style={styles.floorText}>Floor {item}</Text>
            <Text style={styles.floorSubtext}>Tap to start maintenance</Text>
          </Pressable>
        )}
      />
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
  },
  floorCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0071CE',
  },
  floorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  floorSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
