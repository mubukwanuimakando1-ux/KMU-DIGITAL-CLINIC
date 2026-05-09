// js/config.js - Supabase Configuration
const SUPABASE_URL = 'https://oxziulqygcnwenlmcttm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94eml1bHF5Z2Nud2VubG1jdHRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzI1MzYsImV4cCI6MjA5Mzc0ODUzNn0.TmOsRY6fLedk4vxQ3OeirvDp_ZWRa2j88lVTQmuYmq4';

console.log('=== CONFIG.JS LOADED ===');
console.log('SUPABASE_URL:', SUPABASE_URL);
console.log('SUPABASE_ANON_KEY length:', SUPABASE_ANON_KEY.length);

// Check if supabase library is available
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Check the CDN.');
} else {
    console.log('✅ Supabase library found');
}

// Create Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('✅ Supabase client created');

// Make available globally
window.supabase = supabaseClient;

// Test the connection immediately
supabaseClient.from('users').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
        if (error) {
            console.error('❌ Connection test failed:', error);
        } else {
            console.log('✅ Connection successful! Total users:', count);
        }
    });
