// screens/DashboardScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

export default function DashboardScreen({
  user,
  onSelectElevator,
  onOpenAdmin,
  isAdmin,
  onLogout,
}) {
  const [elevators, setElevators] = useState([
    {
      id: 'ELV-001',
      building: 'Tower A',
      floors: 12,
      faultCode: '0021',
    },
    {
      id: 'ELV-002',
      building: 'Tower B',
      floors: 10,
      faultCode: '0021',
    },
    {
      id: 'ELV-003',
      building: 'Annex',
      floors: 8,
      faultCode: null,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newElevId, setNewElevId] = useState('');
  const [newBuilding, setNewBuilding] = useState('');

  const addElevator = () => {
    if (!newElevId || !newBuilding) {
      Alert.alert('Error', 'Fill all fields');
      return;
    }
    setElevators([
      ...elevators,
      {
        id: newElevId,
        building: newBuilding,
        floors: 12,
        faultCode: null,
      },
    ]);
    setNewElevId('');
    setNewBuilding('');
    setShowAddModal(false);
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      onLogout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.email?.split('@')[0]}</Text>
          <Text style={styles.subtext}>Available Elevators</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={handleLogout}>
          <Text style={styles.headerBtnText}>Logout</Text>
        </Pressable>
      </View>

      {/* Admin Button (if manager) */}
      {isAdmin && (
        <Pressable
          style={styles.adminBtn}
          onPress={onOpenAdmin}
        >
          <Text style={styles.adminBtnText}>📊 Admin Dashboard</Text>
        </Pressable>
      )}

      {/* Elevator List */}
      <FlatList
        data={elevators}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => onSelectElevator(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.elvId}>{item.id}</Text>
              {item.faultCode && (
                <Text style={styles.faultBadge}>Fault: {item.faultCode}</Text>
              )}
            </View>
            <Text style={styles.building}>{item.building}</Text>
            <Text style={styles.floors}>{item.floors} Floors</Text>
          </Pressable>
        )}
      />

      {/* Add Elevator Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Elevator</Text>
            <TextInput
              style={styles.input}
              placeholder="Elevator ID (ELV-004)"
              value={newElevId}
              onChangeText={setNewElevId}
            />
            <TextInput
              style={styles.input}
              placeholder="Building Name"
              value={newBuilding}
              onChangeText={setNewBuilding}
            />
            <Pressable style={styles.modalBtn} onPress={addElevator}>
              <Text style={styles.modalBtnText}>Add</Text>
            </Pressable>
            <Pressable onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.navBtnText}>➕ Add New Data</Text>
        </Pressable>
        <Pressable style={styles.navBtn}>
          <Text style={styles.navBtnText}>📄 Reports</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
  },
  header: {
    backgroundColor: '#0071CE',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtext: {
    fontSize: 12,
    color: '#cce5ff',
    marginTop: 4,
  },
  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  headerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  adminBtn: {
    margin: 12,
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0071CE',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  elvId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  faultBadge: {
    backgroundColor: '#ef4444',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
  },
  building: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  floors: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: '#0071CE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancel: {
    textAlign: 'center',
    color: '#666',
    marginTop: 12,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingBottom: 10,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#0071CE',
  },
  navBtnText: {
    color: '#0071CE',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
