// assets/js/config.js
// KMU Digital Health Centre Management System
// Supabase Configuration

const SUPABASE_URL = "https://oxziulqygcnwenlmcttm.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        },
        realtime: {
            params: {
                eventsPerSecond: 20
            }
        },
        global: {
            headers: {
                "X-Application-Name": "KMU Digital Health Centre"
            }
        }
    }
);

// Make available everywhere
window.db = supabase;
window.supabaseClient = supabase;

/* ==========================================================
   SYSTEM SETTINGS
========================================================== */

window.APP = {

    NAME: "KMU Digital Health Centre",

    VERSION: "2.0.0",

    UNIVERSITY: "Kapasa Makasa University",

    SESSION_TIMEOUT: 30 * 60 * 1000,

    AUTO_REFRESH: 5 * 60 * 1000,

    LOW_STOCK_LEVEL: 10

};

/* ==========================================================
   CONNECTION TEST
========================================================== */

async function testConnection() {

    try {

        const { error } = await supabase
            .from("roles")
            .select("*")
            .limit(1);

        if (error) throw error;

        console.log("✅ Supabase Connected");

    } catch (e) {

        console.error("❌ Database Connection Failed");

        console.error(e);

    }

}

testConnection();

/* ==========================================================
   REALTIME CHANNELS
========================================================== */

window.channels = {

    notifications: supabase.channel("notifications"),

    queue: supabase.channel("queue"),

    appointments: supabase.channel("appointments"),

    inventory: supabase.channel("inventory"),

    chat: supabase.channel("chat")

};

/* ==========================================================
   DATE HELPERS
========================================================== */

window.now = () => new Date();

window.today = () =>
    new Date().toISOString().split("T")[0];

window.time = () =>
    new Date().toLocaleTimeString();

/* ==========================================================
   EXPORT
========================================================== */

export { supabase };
