


const SUPABASE_URL = "https://yzjcfdhfkhnablrexibw.supabase.co/rest/v1/";


const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6amNmZGhma2huYWJscmV4aWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzIyMzAsImV4cCI6MjEwMDg0ODIzMH0.9vVqT2x2Ft69EUIQdab8Kj-ItG-BMgA6e4mse5S3r9g";






const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);






const SYSTEM_CONFIG = {


    systemName:
    "IMAKANDO ZED DIGITAL HEALTH 1",


    NATION:
    "ZAMBIA",


    version:
    "1.0.0",


    timezone:
    "Africa/Lusaka",


    supportEmail:
    "healthcentre@IMAKANDO.ac.zm",


    appointmentDuration:
    30,


    maxLoginAttempts:
    5,


    sessionTimeout:
    30 * 60 * 1000


};







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






const DEPARTMENTS = [


    "Reception",


    "Nursing",


    "Doctor Consultation",


    "Laboratory",


    "Pharmacy",


    "Counselling"


];







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
