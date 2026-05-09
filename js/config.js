// js/config.js - Supabase Configuration (WORKING VERSION)
const SUPABASE_URL = 'https://oxziulqygcnwenlmcttm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eml1bHF5Z2Nud2VubG1jdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI1MzYsImV4cCI6MjA5Mzc0ODUzNn0.TmOsRY6fLedk4vxQ3OeirvDp_ZWRa2j88lVTQmuYmq4';

console.log('=== CONFIG.JS LOADING ===');

// Create the Supabase client - DIRECT APPROACH
let supabaseClient = null;

try {
    // Check if the global supabase object exists (from the CDN)
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created successfully via supabase global');
    } 
    // Fallback: check window.supabase
    else if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client created successfully via window.supabase');
    }
    else {
        console.error('❌ Supabase library not loaded - CDN may be blocked');
    }
} catch (error) {
    console.error('❌ Error creating Supabase client:', error);
}

// Make available globally
window.supabase = supabaseClient;

// Test the connection
if (window.supabase) {
    window.supabase.from('users').select('count', { count: 'exact', head: true })
        .then(({ count, error }) => {
            if (error) {
                console.error('❌ Supabase connection test FAILED:', error.message);
            } else {
                console.log('✅ Supabase connection SUCCESSFUL! Total users:', count);
            }
        })
        .catch(err => console.error('❌ Connection test error:', err));
}
