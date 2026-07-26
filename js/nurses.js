/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
NURSING MANAGEMENT MODULE
=====================================================

Functions:
- Triage
- Vital signs
- BMI calculation
- Nursing assessment
- Patient observations
- Nursing workflow
=====================================================
*/




// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeNursing();

});






async function initializeNursing(){

    try{

        await loadNursingQueue();

        setupNursingRealtime();

    }

    catch(error){

        console.error(

            "Nursing initialization error",

            error

        );

    }

}






// =====================================
// LOAD NURSING QUEUE
// =====================================

async function loadNursingQueue(){

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

            "Nursing"

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
// RECORD VITAL SIGNS
// =====================================

async function recordVitalSigns(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("vital_signs")

        .insert({

            patient_id:
            data.patient_id,

            nurse_id:
            data.nurse_id,

            temperature:
            data.temperature,

            blood_pressure:
            data.blood_pressure,

            pulse_rate:
            data.pulse_rate,

            respiratory_rate:
            data.respiratory_rate,

            oxygen_saturation:
            data.oxygen_saturation,

            weight:
            data.weight,

            height:
            data.height,

            bmi:
            calculateBMI(

                data.weight,

                data.height

            ),

            created_at:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "VITAL_SIGNS_RECORDED",

            data.patient_id

        );

        showNotification(

            "Vital signs recorded",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// BMI CALCULATION
// =====================================

function calculateBMI(

weight,

height

){

    const metres =
    height / 100;

    return Number(

        (

            weight /

            (metres * metres)

        ).toFixed(1)

    );

}






// =====================================
// TRIAGE ASSESSMENT
// =====================================

async function performTriage(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("triage")

        .insert({

            patient_id:
            data.patient_id,

            nurse_id:
            data.nurse_id,

            priority:
            data.priority,

            complaint:
            data.complaint,

            notes:
            data.notes,

            created_at:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "TRIAGE_COMPLETED",

            data.patient_id

        );

        showNotification(

            "Triage completed",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// NURSING ASSESSMENT
// =====================================

async function saveNursingAssessment(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("nursing_assessments")

        .insert({

            patient_id:
            data.patient_id,

            nurse_id:
            data.nurse_id,

            assessment:
            data.assessment,

            observations:
            data.observations,

            recommendations:
            data.recommendations,

            created_at:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "NURSING_ASSESSMENT",

            data.patient_id

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// PATIENT OBSERVATIONS
// =====================================

async function addObservation(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("patient_observations")

        .insert({

            patient_id:
            data.patient_id,

            nurse_id:
            data.nurse_id,

            observation:
            data.observation,

            observation_time:
            new Date()

        });

        if(error)

        throw error;

        await createAuditLog(

            "OBSERVATION_RECORDED",

            data.patient_id

        );

    }

    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED NURSING MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// ADMINISTER MEDICATION
// =====================================

async function administerMedication(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("medication_administration")

        .insert({

            patient_id:
            data.patient_id,

            nurse_id:
            data.nurse_id,

            prescription_id:
            data.prescription_id,

            medicine:
            data.medicine,

            dosage:
            data.dosage,

            route:
            data.route,

            administered_at:
            new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "MEDICATION_ADMINISTERED",

            data.patient_id

        );

        showNotification(

            "Medication administered successfully",

            "success"

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// RECORD NURSING HANDOVER
// =====================================

async function recordHandover(data){

    try{

        const {

            error

        } =
        await supabaseClient

        .from("nursing_handovers")

        .insert({

            patient_id:
            data.patient_id,

            outgoing_nurse:
            data.outgoing_nurse,

            incoming_nurse:
            data.incoming_nurse,

            notes:
            data.notes,

            created_at:
            new Date()

        });

        if(error)
        throw error;

        await createAuditLog(

            "NURSING_HANDOVER",

            data.patient_id

        );

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD OBSERVATIONS
// =====================================

async function loadPatientObservations(

patientID

){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("patient_observations")

        .select("*")

        .eq(

            "patient_id",

            patientID

        )

        .order(

            "observation_time",

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
// NURSING STATISTICS
// =====================================

async function getNursingStatistics(){

    try{

        const {

            count:triage

        } =
        await supabaseClient

        .from("triage")

        .select("*",{

            count:"exact",

            head:true

        });

        const {

            count:vitals

        } =
        await supabaseClient

        .from("vital_signs")

        .select("*",{

            count:"exact",

            head:true

        });

        const {

            count:assessments

        } =
        await supabaseClient

        .from("nursing_assessments")

        .select("*",{

            count:"exact",

            head:true

        });

        return{

            triageCompleted:
            triage || 0,

            vitalSignsRecorded:
            vitals || 0,

            assessmentsCompleted:
            assessments || 0

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME NURSING
// =====================================

function setupNursingRealtime(){

    supabaseClient

    .channel("nursing-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"triage"

        },

        ()=>{

            loadNursingQueue();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT NURSING REPORT
// =====================================

async function exportNursingReport(){

    const {

        data

    } =
    await supabaseClient

    .from("nursing_assessments")

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

window.loadNursingQueue =
loadNursingQueue;

window.recordVitalSigns =
recordVitalSigns;

window.calculateBMI =
calculateBMI;

window.performTriage =
performTriage;

window.saveNursingAssessment =
saveNursingAssessment;

window.addObservation =
addObservation;

window.administerMedication =
administerMedication;

window.recordHandover =
recordHandover;

window.loadPatientObservations =
loadPatientObservations;

window.getNursingStatistics =
getNursingStatistics;

window.setupNursingRealtime =
setupNursingRealtime;

window.exportNursingReport =
exportNursingReport;