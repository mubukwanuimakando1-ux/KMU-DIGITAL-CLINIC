/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
STAFF MANAGEMENT MODULE
=====================================================

Functions:
- Staff management
- Attendance
- Department assignment
- Staff profiles
- Permissions

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeStaff();

});






async function initializeStaff(){

    try{

        await loadStaff();

        await loadDepartments();

        setupStaffRealtime();

    }

    catch(error){

        console.error(

            "Staff initialization error",

            error

        );

    }

}






// =====================================
// LOAD STAFF
// =====================================

async function loadStaff(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff")

        .select("*")

        .order(

            "full_name",

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
// LOAD DEPARTMENTS
// =====================================

async function loadDepartments(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("departments")

        .select("*")

        .order(

            "department_name",

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
// ADD STAFF MEMBER
// =====================================

async function addStaffMember(staff){

    try{

        const staffID =

        generateID("STF");



        const {

            error

        } =
        await supabaseClient

        .from("staff")

        .insert({

            id:staffID,

            full_name:
            staff.full_name,

            employee_number:
            staff.employee_number,

            email:
            staff.email,

            phone:
            staff.phone,

            department:
            staff.department,

            role:
            staff.role,

            status:"active",

            created_at:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "STAFF_CREATED",

            staffID

        );

        showNotification(

            "Staff member added successfully",

            "success"

        );

        return staffID;

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// UPDATE STAFF
// =====================================

async function updateStaff(

staffID,

updates

){

    try{

        updates.updated_at =
        new Date();



        const {

            error

        } =
        await supabaseClient

        .from("staff")

        .update(updates)

        .eq(

            "id",

            staffID

        );

        if(error)

        throw error;

        await createAuditLog(

            "STAFF_UPDATED",

            staffID

        );

        showNotification(

            "Staff updated successfully",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// STAFF ATTENDANCE
// =====================================

async function recordAttendance(

staffID,

status

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("staff_attendance")

        .insert({

            staff_id:
            staffID,

            status:
            status,

            recorded_at:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "ATTENDANCE_RECORDED",

            staffID

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// ASSIGN DEPARTMENT
// =====================================

async function assignDepartment(

staffID,

department

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("staff")

        .update({

            department:
            department,

            updated_at:
            new Date()

        })

        .eq(

            "id",

            staffID

        );

        if(error)

        throw error;

        await createAuditLog(

            "DEPARTMENT_ASSIGNED",

            department

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD STAFF PROFILE
// =====================================

async function loadStaffProfile(

staffID

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff")

        .select("*")

        .eq(

            "id",

            staffID

        )

        .single();

        if(error)

        throw error;

        return data;

    }

    catch(error){

        console.error(error);

    }

}
/*
=====================================================
ADVANCED STAFF MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/




// =====================================
// DEACTIVATE STAFF
// =====================================

async function deactivateStaff(

staffID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("staff")

        .update({

            status:"inactive",

            updated_at:
            new Date()

        })

        .eq(

            "id",

            staffID

        );

        if(error)

        throw error;

        await createAuditLog(

            "STAFF_DEACTIVATED",

            staffID,

            "high"

        );

        showNotification(

            "Staff deactivated",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// ACTIVATE STAFF
// =====================================

async function activateStaff(

staffID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("staff")

        .update({

            status:"active",

            updated_at:
            new Date()

        })

        .eq(

            "id",

            staffID

        );

        if(error)

        throw error;

        await createAuditLog(

            "STAFF_ACTIVATED",

            staffID

        );

        showNotification(

            "Staff activated",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// ATTENDANCE HISTORY
// =====================================

async function loadAttendanceHistory(

staffID

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff_attendance")

        .select("*")

        .eq(

            "staff_id",

            staffID

        )

        .order(

            "recorded_at",

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
// STAFF SEARCH
// =====================================

async function searchStaff(

keyword

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff")

        .select("*")

        .or(

            `full_name.ilike.%${keyword}%,employee_number.ilike.%${keyword}%,email.ilike.%${keyword}%`

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
// STAFF STATISTICS
// =====================================

async function getStaffStatistics(){

    try{

        const {

            count:total

        } =
        await supabaseClient

        .from("staff")

        .select("*",{

            count:"exact",

            head:true

        });



        const {

            count:active

        } =
        await supabaseClient

        .from("staff")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "active"

        );



        return{

            total:
            total || 0,

            active:
            active || 0,

            inactive:
            (total || 0) - (active || 0)

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME STAFF UPDATES
// =====================================

function setupStaffRealtime(){

    supabaseClient

    .channel("staff-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"staff"

        },

        ()=>{

            loadStaff();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT STAFF REPORT
// =====================================

async function exportStaffReport(){

    const staff =
    await loadStaff();

    return JSON.stringify(

        staff,

        null,

        2

    );

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadStaff =
loadStaff;

window.loadDepartments =
loadDepartments;

window.addStaffMember =
addStaffMember;

window.updateStaff =
updateStaff;

window.recordAttendance =
recordAttendance;

window.assignDepartment =
assignDepartment;

window.loadStaffProfile =
loadStaffProfile;

window.deactivateStaff =
deactivateStaff;

window.activateStaff =
activateStaff;

window.loadAttendanceHistory =
loadAttendanceHistory;

window.searchStaff =
searchStaff;

window.getStaffStatistics =
getStaffStatistics;

window.setupStaffRealtime =
setupStaffRealtime;

window.exportStaffReport =
exportStaffReport;