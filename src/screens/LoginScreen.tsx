import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erreur', error.message);
      console.log('SignUp Error:', error);
    }
    else if (data.user) {
      Alert.alert('Succès', 'Compte créé avec succès!');
    }
    setLoading(false);
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PhotoApp</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8E8E93"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#8E8E93"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Créer un compte</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#38383A',
    color: '#FFFFFF',
    placeholderTextColor: '#8E8E93',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});