/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
DOCTOR MANAGEMENT MODULE
=====================================================

Functions:
- Doctor profile management
- Consultation workflow
- Patient assignments
- Diagnosis
- Treatment plans
- Referrals
=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeDoctors();

});






async function initializeDoctors(){

    try{

        await loadDoctors();

        await loadAssignedPatients();

        setupDoctorRealtime();

    }

    catch(error){

        console.error(

            "Doctor module error",

            error

        );

    }

}






// =====================================
// LOAD DOCTORS
// =====================================

async function loadDoctors(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff")

        .select("*")

        .eq(

            "role",

            "doctor"

        )

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
// LOAD ASSIGNED PATIENTS
// =====================================

async function loadAssignedPatients(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("queues")

        .select("*")

        .eq(

            "department",

            "Doctor"

        )

        .in(

            "status",

            [

                "waiting",

                "called"

            ]

        )

        .order(

            "created_at",

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
// START CONSULTATION
// =====================================

async function startConsultation(

queueID,

doctorID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("queues")

        .update({

            status:"consultation",

            doctor_id:doctorID,

            consultation_started_at:new Date()

        })

        .eq(

            "id",

            queueID

        );

        if(error)

        throw error;

        await createAuditLog(

            "CONSULTATION_STARTED",

            queueID

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// SAVE DIAGNOSIS
// =====================================

async function saveDiagnosis(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("diagnoses")

        .insert({

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            diagnosis:data.diagnosis,

            symptoms:data.symptoms,

            notes:data.notes,

            created_at:new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "DIAGNOSIS_CREATED",

            data.patient_id

        );

        showNotification(

            "Diagnosis saved",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// CREATE TREATMENT PLAN
// =====================================

async function createTreatmentPlan(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("treatment_plans")

        .insert({

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            treatment:data.treatment,

            duration:data.duration,

            follow_up:data.follow_up,

            created_at:new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "TREATMENT_PLAN_CREATED",

            data.patient_id

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// CREATE REFERRAL
// =====================================

async function createReferral(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("referrals")

        .insert({

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            referred_to:data.referred_to,

            reason:data.reason,

            status:"pending",

            created_at:new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "REFERRAL_CREATED",

            data.patient_id

        );

        showNotification(

            "Referral created",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED DOCTOR MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// COMPLETE CONSULTATION
// =====================================

async function completeConsultation(

queueID

){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("queues")

        .update({

            status:"completed",

            consultation_completed_at:new Date()

        })

        .eq(

            "id",

            queueID

        );

        if(error)

        throw error;

        await createAuditLog(

            "CONSULTATION_COMPLETED",

            queueID

        );

        showNotification(

            "Consultation completed",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// CREATE FOLLOW UP
// =====================================

async function createFollowUp(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("appointments")

        .insert({

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            department:"Doctor",

            appointment_date:data.follow_up_date,

            reason:"Follow-up Consultation",

            status:"scheduled",

            created_at:new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "FOLLOW_UP_CREATED",

            data.patient_id

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD PATIENT HISTORY
// =====================================

async function loadPatientHistory(

patientID

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("medical_records")

        .select("*")

        .eq(

            "patient_id",

            patientID

        )

        .order(

            "visit_date",

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
// DOCTOR STATISTICS
// =====================================

async function getDoctorStatistics(

doctorID

){

    try{

        const {

            count:consultations

        } =
        await supabaseClient

        .from("diagnoses")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "doctor_id",

            doctorID

        );



        const {

            count:referrals

        } =
        await supabaseClient

        .from("referrals")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "doctor_id",

            doctorID

        );



        return{

            consultations:
            consultations || 0,

            referrals:
            referrals || 0

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME DOCTOR DASHBOARD
// =====================================

function setupDoctorRealtime(){

    supabaseClient

    .channel("doctor-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"queues"

        },

        ()=>{

            loadAssignedPatients();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT CONSULTATIONS
// =====================================

async function exportConsultations(){

    const consultations =
    await supabaseClient

    .from("diagnoses")

    .select("*");



    return JSON.stringify(

        consultations.data || [],

        null,

        2

    );

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadDoctors =
loadDoctors;

window.loadAssignedPatients =
loadAssignedPatients;

window.startConsultation =
startConsultation;

window.completeConsultation =
completeConsultation;

window.saveDiagnosis =
saveDiagnosis;

window.createTreatmentPlan =
createTreatmentPlan;

window.createReferral =
createReferral;

window.createFollowUp =
createFollowUp;

window.loadPatientHistory =
loadPatientHistory;

window.getDoctorStatistics =
getDoctorStatistics;

window.setupDoctorRealtime =
setupDoctorRealtime;

window.exportConsultations =
exportConsultations;