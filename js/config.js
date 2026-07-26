/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
SUPABASE CONFIGURATION
=====================================================

Before using this file:

1. Create a Supabase project
2. Go to:
   Project Settings
        ↓
   API
3. Copy:
   - Project URL
   - anon public key

Replace the values below.

=====================================================
*/


// ===============================
// SUPABASE SETTINGS
// ===============================


const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";


const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";




// ===============================
// CREATE SUPABASE CLIENT
// ===============================


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);




// ===============================
// SYSTEM INFORMATION
// ===============================


const SYSTEM_CONFIG = {


    systemName:
    "KMU Digital Health Centre Management System",


    university:
    "Kapasa Makasa University",


    version:
    "1.0.0",


    timezone:
    "Africa/Lusaka",


    supportEmail:
    "healthcentre@kmu.ac.zm",


    appointmentDuration:
    30,


    maxLoginAttempts:
    5,


    sessionTimeout:
    30 * 60 * 1000


};





// ===============================
// USER ROLES
// ===============================


const USER_ROLES = {


    ADMIN:
    "admin",


    DOCTOR:
    "doctor",


    NURSE:
    "nurse",


    LAB_TECH:
    "laboratory",


    PHARMACIST:
    "pharmacist",


    COUNSELLOR:
    "counsellor",


    RECEPTIONIST:
    "receptionist",


    STUDENT:
    "student",


    STAFF:
    "staff",


    VISITOR:
    "visitor"


};





// ===============================
// DEPARTMENTS
// ===============================


const DEPARTMENTS = [


    "Reception",


    "Nursing",


    "Doctor Consultation",


    "Laboratory",


    "Pharmacy",


    "Counselling"


];





// ===============================
// APPOINTMENT STATUS
// ===============================


const APPOINTMENT_STATUS = {


    PENDING:
    "pending",


    APPROVED:
    "approved",


    COMPLETED:
    "completed",


    CANCELLED:
    "cancelled"


};





// ===============================
// QUEUE STATUS
// ===============================


const QUEUE_STATUS = {


    WAITING:
    "waiting",


    CALLED:
    "called",


    SERVING:
    "serving",


    COMPLETED:
    "completed"


};





// ===============================
// GLOBAL NOTIFICATION FUNCTION
// ===============================


function showNotification(
    message,
    type="success"
){


    const alert =
    document.createElement("div");


    alert.className =
    `alert alert-${type}`;


    alert.innerHTML =
    message;


    document.body.appendChild(alert);



    setTimeout(()=>{


        alert.remove();


    },4000);


}






// ===============================
// EXPORT VARIABLES
// ===============================


window.KMU_CONFIG = SYSTEM_CONFIG;


window.USER_ROLES = USER_ROLES;


window.DEPARTMENTS = DEPARTMENTS;


window.APPOINTMENT_STATUS =
APPOINTMENT_STATUS;


window.QUEUE_STATUS =
QUEUE_STATUS;


window.supabaseClient =
supabaseClient;


window.showNotification =
showNotification;
