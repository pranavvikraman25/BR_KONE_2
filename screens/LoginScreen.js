// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ onLoginSuccess, auth }) {
  const [email, setEmail] = useState('technician@kone.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Auth Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>KONE</Text>
        <Text style={styles.subtitle}>Maintenance Tracking</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Login'}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggle}>
            {isSignUp
              ? 'Already have account? Login'
              : 'New? Create Account'}
          </Text>
        </Pressable>
      </View>

      {/* Demo Credentials */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Demo Credentials:</Text>
        <Text style={styles.demoText}>Email: manager@kone.com</Text>
        <Text style={styles.demoText}>Pass: demo123</Text>
        <Text style={styles.demoText} style={{marginTop: 10}}>
          Email: technician@kone.com
        </Text>
        <Text style={styles.demoText}>Pass: demo123</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0071CE',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0071CE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggle: {
    color: '#0071CE',
    textAlign: 'center',
    marginTop: 12,
    textDecorationLine: 'underline',
  },
  demoBox: {
    backgroundColor: '#f5f7fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0071CE',
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});
