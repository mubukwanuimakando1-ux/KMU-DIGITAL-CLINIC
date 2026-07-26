/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
ADMINISTRATION MODULE
=====================================================

Functions:
- User management
- Role management
- Announcements
- Notifications
- System settings
- Administrative dashboard

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeAdmin();

});






async function initializeAdmin(){

    try{

        const allowed =
        await protectPage([

            "admin"

        ]);

        if(!allowed)
        return;

        await loadUsers();

        await loadRoles();

        await loadAnnouncements();

    }
    catch(error){

        console.error(

            "Admin initialization error",

            error

        );

    }

}






// =====================================
// LOAD USERS
// =====================================

async function loadUsers(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("profiles")
        .select("*")
        .order(

            "created_at",

            {

                ascending:false

            }

        );

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// LOAD ROLES
// =====================================

async function loadRoles(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("roles")
        .select("*")
        .order(

            "name",

            {

                ascending:true

            }

        );

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// CHANGE USER ROLE
// =====================================

async function updateUserRole(

userID,

role

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("profiles")
        .update({

            role:role,

            updated_at:new Date()

        })
        .eq(

            "id",

            userID

        );

        if(error)
        throw error;

        await createAuditLog(

            "ROLE_UPDATED",

            userID

        );

        showNotification(

            "Role updated successfully",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// DISABLE USER
// =====================================

async function disableUser(

userID

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("profiles")
        .update({

            active:false,

            updated_at:new Date()

        })
        .eq(

            "id",

            userID

        );

        if(error)
        throw error;

        await createAuditLog(

            "USER_DISABLED",

            userID,

            "high"

        );

        showNotification(

            "User disabled",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// ENABLE USER
// =====================================

async function enableUser(

userID

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("profiles")
        .update({

            active:true,

            updated_at:new Date()

        })
        .eq(

            "id",

            userID

        );

        if(error)
        throw error;

        await createAuditLog(

            "USER_ENABLED",

            userID

        );

        showNotification(

            "User enabled",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD ANNOUNCEMENTS
// =====================================

async function loadAnnouncements(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("announcements")
        .select("*")
        .order(

            "created_at",

            {

                ascending:false

            }

        );

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// CREATE ANNOUNCEMENT
// =====================================

async function createAnnouncement(

announcement

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("announcements")
        .insert({

            title:
            announcement.title,

            message:
            announcement.message,

            audience:
            announcement.audience,

            created_at:
            new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "ANNOUNCEMENT_CREATED",

            announcement.title

        );

        showNotification(

            "Announcement published",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED ADMINISTRATION MODULE
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/




// =====================================
// SEND NOTIFICATION
// =====================================

async function sendNotification(notification){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("notifications")
        .insert({

            user_id:
            notification.user_id,

            title:
            notification.title,

            message:
            notification.message,

            read:false,

            created_at:new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "NOTIFICATION_SENT",

            notification.title

        );

        showNotification(

            "Notification sent",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD SYSTEM SETTINGS
// =====================================

async function loadSystemSettings(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("system_settings")
        .select("*");

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// SAVE SYSTEM SETTINGS
// =====================================

async function saveSystemSettings(settings){

    try{

        for(const setting of settings){

            await supabaseClient
            .from("system_settings")
            .update({

                value:
                setting.value,

                updated_at:
                new Date()

            })
            .eq(

                "key",

                setting.key

            );

        }

        await createAuditLog(

            "SYSTEM_SETTINGS_UPDATED",

            "Configuration updated"

        );

        showNotification(

            "Settings saved successfully",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// SYSTEM BACKUP
// =====================================

async function createSystemBackup(){

    try{

        const backup = {

            patients:
            await generatePatientReport(),

            appointments:
            await generateAppointmentReport(),

            pharmacy:
            await generatePharmacyReport(),

            laboratory:
            await generateLaboratoryReport(),

            audit:
            await generateAuditReport(),

            created_at:
            new Date()

        };

        exportJSON(

            "kmu_system_backup",

            backup

        );

        await createAuditLog(

            "SYSTEM_BACKUP_CREATED",

            "Backup exported"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD ADMIN DASHBOARD SUMMARY
// =====================================

async function loadAdminSummary(){

    try{

        return await generateSystemSummary();

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME ADMIN UPDATES
// =====================================

function setupAdminRealtime(){

    supabaseClient

    .channel("admin-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"profiles"

        },

        ()=>{

            loadUsers();

        }

    )

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"announcements"

        },

        ()=>{

            loadAnnouncements();

        }

    )

    .subscribe();

}






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    setupAdminRealtime();

});






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadUsers =
loadUsers;

window.loadRoles =
loadRoles;

window.updateUserRole =
updateUserRole;

window.disableUser =
disableUser;

window.enableUser =
enableUser;

window.loadAnnouncements =
loadAnnouncements;

window.createAnnouncement =
createAnnouncement;

window.sendNotification =
sendNotification;

window.loadSystemSettings =
loadSystemSettings;

window.saveSystemSettings =
saveSystemSettings;

window.createSystemBackup =
createSystemBackup;

window.loadAdminSummary =
loadAdminSummary;

window.setupAdminRealtime =
setupAdminRealtime;