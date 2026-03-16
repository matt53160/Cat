import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jglrgibqrjxzvcornaxg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbHJnaWJxcmp4enZjb3JuYXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjI2MDgsImV4cCI6MjA3Mjk5ODYwOH0.nnOg96INLLv1kbRKKBdAUl-fTtP3oDBVcsVudCLECqY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});