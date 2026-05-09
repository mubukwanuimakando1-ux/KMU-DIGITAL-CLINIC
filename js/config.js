// js/config.js - Supabase Configuration
const SUPABASE_URL = 'https://oxziulqygcnwenlmcttm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eml1bHF5Z2Nud2VubG1jdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI1MzYsImV4cCI6MjA5Mzc0ODUzNn0.TmOsRY6fLedk4vxQ3OeirvDp_ZWRa2j88lVTQmuYmq4';

// Initialize Supabase client
let supabase;

try {
    if (typeof supabaseJs !== 'undefined') {
        supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
    } else if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized successfully');
    } else {
        console.error('❌ Supabase library not loaded');
    }
} catch (error) {
    console.error('❌ Error initializing Supabase:', error);
}

// Make supabase available globally
window.supabase = supabase;