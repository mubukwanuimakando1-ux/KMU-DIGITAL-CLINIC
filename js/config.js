// js/config.js - UNIVERSAL WORKING VERSION
const SUPABASE_URL = 'https://oxziulqygcnwenlmcttm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eml1bHF5Z2Nud2VubG1jdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI1MzYsImV4cCI6MjA5Mzc0ODUzNn0.TmOsRY6fLedk4vxQ3OeirvDp_ZWRa2j88lVTQmuYmq4';

console.log('=== CONFIG.JS ===');

// Try all possible initialization methods
let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    if (typeof supabase.createClient === 'function') {
        // Supabase v2
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Created with supabase.createClient (v2)');
    } else if (typeof supabase.Client === 'function') {
        // Supabase v1
        supabaseClient = new supabase.Client(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Created with new supabase.Client (v1)');
    } else {
        // Direct assignment
        supabaseClient = supabase;
        console.log('✅ Using direct supabase instance');
    }
}

// If still null, try window.supabaseJs
if (!supabaseClient && typeof window.supabaseJs !== 'undefined') {
    if (typeof window.supabaseJs.createClient === 'function') {
        supabaseClient = window.supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Created with window.supabaseJs.createClient');
    }
}

// Make globally available
window.supabase = supabaseClient;

// Test the connection
if (window.supabase) {
    window.supabase.from('users').select('count', { count: 'exact', head: true })
        .then(({ count, error }) => {
            if (error) {
                console.error('❌ Supabase test FAILED:', error.message);
            } else {
                console.log('✅ Supabase CONNECTED! Total users:', count);
            }
        })
        .catch(err => console.error('❌ Test error:', err));
} else {
    console.error('❌ Could not create Supabase client');
}
