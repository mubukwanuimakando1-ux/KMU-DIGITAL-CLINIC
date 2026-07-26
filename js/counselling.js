/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
COUNSELLING MANAGEMENT MODULE
=====================================================

Functions:
- Counselling appointments
- Student counselling records
- Confidential case management
- Counsellor workflow
- Mental health support tracking

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeCounselling();

});






async function initializeCounselling(){

    try{

        await loadCounsellingAppointments();

        setupCounsellingRealtime();

    }

    catch(error){

        console.error(

            "Counselling initialization error",

            error

        );

    }

}






// =====================================
// LOAD COUNSELLING APPOINTMENTS
// =====================================

async function loadCounsellingAppointments(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

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
// CREATE COUNSELLING SESSION
// =====================================

async function createCounsellingSession(data){

    try{

        const sessionID =

        generateID("COU");



        const {

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .insert({

            id:sessionID,

            student_id:
            data.student_id,

            counsellor_id:
            data.counsellor_id,

            session_type:
            data.session_type,

            reason:
            data.reason,

            status:"scheduled",

            appointment_date:
            data.appointment_date,

            created_at:
            new Date()

        });


        if(error)

        throw error;



        await createAuditLog(

            "COUNSELLING_SESSION_CREATED",

            sessionID

        );



        showNotification(

            "Counselling session booked",

            "success"

        );


        return sessionID;

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// START COUNSELLING SESSION
// =====================================

async function startCounsellingSession(

sessionID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .update({

            status:"active",

            started_at:new Date()

        })

        .eq(

            "id",

            sessionID

        );


        if(error)

        throw error;



        await createAuditLog(

            "COUNSELLING_STARTED",

            sessionID

        );


    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// SAVE COUNSELLING NOTES
// =====================================

async function saveCounsellingNotes(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("counselling_notes")

        .insert({

            session_id:
            data.session_id,

            counsellor_id:
            data.counsellor_id,

            notes:
            data.notes,

            recommendations:
            data.recommendations,

            follow_up_required:
            data.follow_up_required,

            created_at:
            new Date()

        });


        if(error)

        throw error;



        await createAuditLog(

            "CONFIDENTIAL_COUNSELLING_NOTE_CREATED",

            data.session_id,

            "high"

        );



        showNotification(

            "Counselling notes saved securely",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// COMPLETE COUNSELLING SESSION
// =====================================

async function completeCounsellingSession(

sessionID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .update({

            status:"completed",

            completed_at:new Date()

        })

        .eq(

            "id",

            sessionID

        );


        if(error)

        throw error;



        await createAuditLog(

            "COUNSELLING_COMPLETED",

            sessionID

        );


    }

    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED COUNSELLING MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// LOAD STUDENT COUNSELLING HISTORY
// =====================================

async function loadCounsellingHistory(

studentID

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .select(`

            *,

            counselling_notes(*)

        `)

        .eq(

            "student_id",

            studentID

        )

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
// CREATE FOLLOW-UP SESSION
// =====================================

async function createCounsellingFollowUp(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .insert({

            student_id:
            data.student_id,

            counsellor_id:
            data.counsellor_id,

            session_type:
            "Follow Up",

            reason:
            data.reason,

            appointment_date:
            data.follow_up_date,

            status:
            "scheduled",

            created_at:
            new Date()

        });


        if(error)

        throw error;



        await createAuditLog(

            "COUNSELLING_FOLLOWUP_CREATED",

            data.student_id

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// SEARCH COUNSELLING CASES
// =====================================

async function searchCounsellingCases(

keyword

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("counselling_sessions")

        .select("*")

        .ilike(

            "reason",

            `%${keyword}%`

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
// COUNSELLOR STATISTICS
// =====================================

async function getCounsellingStatistics(){

    try{

        const {

            count:totalSessions

        } =
        await supabaseClient

        .from("counselling_sessions")

        .select("*",{

            count:"exact",

            head:true

        });



        const {

            count:activeSessions

        } =
        await supabaseClient

        .from("counselling_sessions")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "active"

        );



        const {

            count:completedSessions

        } =
        await supabaseClient

        .from("counselling_sessions")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "completed"

        );



        return{

            total:

            totalSessions || 0,


            active:

            activeSessions || 0,


            completed:

            completedSessions || 0

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME COUNSELLING UPDATES
// =====================================

function setupCounsellingRealtime(){

    supabaseClient

    .channel("counselling-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"counselling_sessions"

        },

        ()=>{

            loadCounsellingAppointments();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT COUNSELLING REPORT
// =====================================

async function exportCounsellingReport(){

    const {

        data

    } =
    await supabaseClient

    .from("counselling_sessions")

    .select("*");


    return JSON.stringify(

        data || [],

        null,

        2

    );

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadCounsellingAppointments =
loadCounsellingAppointments;

window.createCounsellingSession =
createCounsellingSession;

window.startCounsellingSession =
startCounsellingSession;

window.saveCounsellingNotes =
saveCounsellingNotes;

window.completeCounsellingSession =
completeCounsellingSession;

window.loadCounsellingHistory =
loadCounsellingHistory;

window.createCounsellingFollowUp =
createCounsellingFollowUp;

window.searchCounsellingCases =
searchCounsellingCases;

window.getCounsellingStatistics =
getCounsellingStatistics;

window.setupCounsellingRealtime =
setupCounsellingRealtime;

window.exportCounsellingReport =
exportCounsellingReport;