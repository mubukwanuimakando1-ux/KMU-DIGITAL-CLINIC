// js/config.js - Supabase Configuration (FIXED VERSION)
const SUPABASE_URL = 'https://oxziulqygcnwenlmcttm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eml1bHF5Z2Nud2VubG1jdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI1MzYsImV4cCI6MjA5Mzc0ODUzNn0.TmOsRY6fLedk4vxQ3OeirvDp_ZWRa2j88lVTQmuYmq4';

console.log('=== CONFIG.JS LOADED ===');

// Create the Supabase client (the library is now properly loaded)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client created successfully');

// Make available globally
window.supabase = supabaseClient;

// Test the connection
supabaseClient.from('users').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
        if (error) {
            console.error('❌ Supabase connection test FAILED:', error.message);
        } else {
            console.log('✅ Supabase connection SUCCESSFUL! Total users:', count);
        }
    })
    .catch(err => console.error('❌ Test error:', err));
