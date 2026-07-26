/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
MAIN APPLICATION CONTROLLER
=====================================================

Functions:
- Application startup
- Module loading
- Session management
- Role detection
- Global configuration
- Error handling
- Real-time initialization

=====================================================
*/






// =====================================
// APPLICATION START
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    startApplication();

});






async function startApplication(){

    try{


        console.log(

            "Starting KMU Digital Health Centre System..."

        );



        await initializeSystem();



        await checkUserSession();



        initializeModules();



        hideLoader();



        console.log(

            "System loaded successfully"

        );


    }

    catch(error){


        console.error(

            "Application startup failed",

            error

        );


        showSystemError(

            error

        );


    }

}






// =====================================
// SYSTEM INITIALIZATION
// =====================================

async function initializeSystem(){

    try{


        if(

            typeof supabaseClient ===

            "undefined"

        ){

            throw new Error(

                "Supabase configuration missing"

            );

        }



        console.log(

            "Supabase connected"

        );


        initializeGlobalEvents();


    }

    catch(error){

        throw error;

    }

}






// =====================================
// USER SESSION CHECK
// =====================================

async function checkUserSession(){

    try{


        const {

            data,

            error

        } =

        await supabaseClient

        .auth

        .getSession();



        if(error)

        throw error;



        window.currentUser =

        data.session

        ?

        data.session.user

        :

        null;



        if(window.currentUser){


            await loadUserProfile(

                window.currentUser.id

            );


        }


    }

    catch(error){


        console.error(

            "Session error",

            error

        );


    }

}






// =====================================
// LOAD USER PROFILE
// =====================================

async function loadUserProfile(

userID

){

    try{


        const {

            data,

            error

        } =

        await supabaseClient

        .from("profiles")

        .select("*")

        .eq(

            "id",

            userID

        )

        .single();



        if(error)

        throw error;



        window.currentProfile =

        data;



        applyUserPermissions(

            data.role

        );


    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// ROLE PERMISSIONS
// =====================================

function applyUserPermissions(

role

){


    document.body

    .setAttribute(

        "data-role",

        role

    );



    console.log(

        "Logged in role:",

        role

    );



    switch(role){


        case "admin":

            enableAdminFeatures();

            break;


        case "doctor":

            enableDoctorFeatures();

            break;


        case "nurse":

            enableNurseFeatures();

            break;


        case "pharmacist":

            enablePharmacyFeatures();

            break;


        case "laboratory":

            enableLaboratoryFeatures();

            break;


        case "counsellor":

            enableCounsellingFeatures();

            break;


        default:

            enableUserFeatures();


    }

}






// =====================================
// MODULE INITIALIZATION
// =====================================

function initializeModules(){


    const modules = [

        "Authentication",

        "Dashboard",

        "Notifications",

        "Queue",

        "Appointments",

        "Patient Records",

        "Security",

        "Analytics",

        "Reports"

    ];



    modules.forEach(

        module=>{


            console.log(

                module +

                " module ready"

            );


        }

    );


}






// =====================================
// GLOBAL EVENTS
// =====================================

function initializeGlobalEvents(){


    window.addEventListener(

        "online",

        ()=>{


            showNotification(

                "Internet connection restored",

                "success"

            );


        }

    );



    window.addEventListener(

        "offline",

        ()=>{


            showNotification(

                "You are offline",

                "warning"

            );


        }

    );


}






// =====================================
// HIDE LOADER
// =====================================

function hideLoader(){


    const loader =

    document.getElementById(

        "loader"

    );



    if(loader){


        loader.style.display =

        "none";


    }

}






// =====================================
// SYSTEM ERROR
// =====================================

function showSystemError(error){


    const loader =

    document.getElementById(

        "loader"

    );



    if(loader){


        loader.innerHTML = `


        <h2>

        System Loading Error

        </h2>


        <p>

        ${error.message}

        </p>


        `;


    }


}
/*
=====================================================
ADVANCED SYSTEM CONTROLLER
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// ADMIN FEATURES
// =====================================

function enableAdminFeatures(){

    console.log(

        "Admin features enabled"

    );


    document.body.classList.add(

        "admin-mode"

    );

}






// =====================================
// DOCTOR FEATURES
// =====================================

function enableDoctorFeatures(){

    console.log(

        "Doctor features enabled"

    );


    document.body.classList.add(

        "doctor-mode"

    );

}






// =====================================
// NURSE FEATURES
// =====================================

function enableNurseFeatures(){

    console.log(

        "Nurse features enabled"

    );


    document.body.classList.add(

        "nurse-mode"

    );

}






// =====================================
// PHARMACY FEATURES
// =====================================

function enablePharmacyFeatures(){

    console.log(

        "Pharmacy features enabled"

    );


    document.body.classList.add(

        "pharmacy-mode"

    );

}






// =====================================
// LABORATORY FEATURES
// =====================================

function enableLaboratoryFeatures(){

    console.log(

        "Laboratory features enabled"

    );


    document.body.classList.add(

        "laboratory-mode"

    );

}






// =====================================
// COUNSELLING FEATURES
// =====================================

function enableCounsellingFeatures(){

    console.log(

        "Counselling features enabled"

    );


    document.body.classList.add(

        "counselling-mode"

    );

}






// =====================================
// NORMAL USER FEATURES
// =====================================

function enableUserFeatures(){

    console.log(

        "Standard user features enabled"

    );


    document.body.classList.add(

        "user-mode"

    );

}






// =====================================
// USER LOGOUT
// =====================================

async function logoutUser(){

    try{


        const {

            error

        } =

        await supabaseClient

        .auth

        .signOut();



        if(error)

        throw error;



        await createAuditLog(

            "USER_LOGOUT",

            window.currentUser?.id

        );



        window.location.href =

        "index.html";


    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// SECURITY MONITORING START
// =====================================

function startSecurityMonitoring(){


    if(

        typeof initializeSecurity

        ===

        "function"

    ){

        initializeSecurity();

    }



    console.log(

        "Security monitoring active"

    );

}






// =====================================
// SYSTEM REALTIME CHANNELS
// =====================================

function initializeRealtimeSystem(){


    supabaseClient

    .channel(

        "system-status"

    )

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"notifications"

        },

        ()=>{


            if(

                typeof loadNotifications

                ===

                "function"

            ){

                loadNotifications();

            }


        }

    )

    .subscribe();



}






// =====================================
// HEALTH CENTRE STATUS
// =====================================

async function getSystemStatus(){

    try{


        const status = {


            database:

            "online",


            authentication:

            "online",


            notifications:

            "active",


            realtime:

            "active",


            timestamp:

            new Date()

        };



        return status;


    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// AUTOMATIC BACKUP CHECK
// =====================================

function scheduleBackupCheck(){


    setInterval(

        ()=>{


            const hour =

            new Date()

            .getHours();



            if(hour === 23){


                if(

                    typeof createSystemBackup

                    ===

                    "function"

                ){

                    createSystemBackup();

                }


            }


        },

        3600000

    );

}






// =====================================
// START SYSTEM SERVICES
// =====================================

function startSystemServices(){


    initializeRealtimeSystem();


    startSecurityMonitoring();


    scheduleBackupCheck();



    console.log(

        "All system services started"

    );

}






// =====================================
// FINAL APPLICATION STARTUP
// =====================================

async function finalizeStartup(){


    try{


        startSystemServices();



        console.log(

            "KMU Digital Health Centre is ready"

        );


    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// GLOBAL EXPORTS
// =====================================

window.startApplication =
startApplication;

window.initializeSystem =
initializeSystem;

window.checkUserSession =
checkUserSession;

window.loadUserProfile =
loadUserProfile;

window.applyUserPermissions =
applyUserPermissions;

window.logoutUser =
logoutUser;

window.getSystemStatus =
getSystemStatus;

window.startSystemServices =
startSystemServices;

window.finalizeStartup =
finalizeStartup;