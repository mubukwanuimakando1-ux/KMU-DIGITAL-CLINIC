/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
PATIENT RECORDS MANAGEMENT MODULE
=====================================================

Functions:
- Patient registration
- Electronic medical records
- Medical history
- Diagnosis records
- Treatment plans
- Prescriptions
- Secure patient lookup

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{

    initializePatientRecords();

});






async function initializePatientRecords(){

    try{

        await loadRecentPatients();

    }
    catch(error){

        console.error(
            "Patient module error",
            error
        );

    }

}







// =====================================
// REGISTER PATIENT
// =====================================


async function registerPatient(patient){


    try{

        const patientID =
        generateID("PAT");



        const {

            error

        } =
        await supabaseClient
        .from("patients")
        .insert({

            id:patientID,

            full_name:patient.full_name,

            student_staff_number:
            patient.student_staff_number,

            clinic_card_number:
            patient.clinic_card_number,

            phone:
            patient.phone,

            email:
            patient.email,

            gender:
            patient.gender,

            date_of_birth:
            patient.date_of_birth,

            address:
            patient.address,

            created_at:
            new Date()

        });



        if(error)
        throw error;



        await createAuditLog(

            "PATIENT_REGISTERED",

            patientID

        );



        showNotification(

            "Patient registered successfully",

            "success"

        );



        return patientID;

    }
    catch(error){

        handleError(error);

    }

}







// =====================================
// CREATE MEDICAL RECORD
// =====================================


async function createMedicalRecord(record){


    try{

        const {

            error

        } =
        await supabaseClient
        .from("medical_records")
        .insert({

            patient_id:
            record.patient_id,

            diagnosis:
            record.diagnosis,

            symptoms:
            record.symptoms,

            treatment:
            record.treatment,

            doctor_id:
            record.doctor_id,

            visit_date:
            record.visit_date,

            notes:
            record.notes,

            created_at:
            new Date()

        });



        if(error)
        throw error;



        await createAuditLog(

            "MEDICAL_RECORD_CREATED",

            record.patient_id

        );



        showNotification(

            "Medical record saved",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}







// =====================================
// LOAD PATIENT
// =====================================


async function loadPatient(patientID){


    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("patients")
        .select("*")
        .eq(

            "id",

            patientID

        )
        .single();



        if(error)
        throw error;



        await monitorDataAccess(

            "patients",

            patientID

        );



        return data;

    }
    catch(error){

        console.error(error);

    }

}







// =====================================
// LOAD MEDICAL HISTORY
// =====================================


async function loadMedicalHistory(patientID){


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
// SEARCH PATIENTS
// =====================================


async function searchPatients(keyword){


    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("patients")
        .select("*")
        .or(

`full_name.ilike.%${keyword}%,student_staff_number.ilike.%${keyword}%,clinic_card_number.ilike.%${keyword}%`

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
// LOAD RECENT PATIENTS
// =====================================


async function loadRecentPatients(){


    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("patients")
        .select("*")
        .order(

            "created_at",

            {

                ascending:false

            }

        )
        .limit(20);



        if(error)
        throw error;



        return data;

    }
    catch(error){

        console.error(error);

    }

}







// =====================================
// EXPORT
// =====================================


window.registerPatient =
registerPatient;

window.createMedicalRecord =
createMedicalRecord;

window.loadPatient =
loadPatient;

window.loadMedicalHistory =
loadMedicalHistory;

window.searchPatients =
searchPatients;

window.loadRecentPatients =
loadRecentPatients;
/*
=====================================================
PATIENT RECORDS ADVANCED MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/




// =====================================
// UPDATE PATIENT
// =====================================

async function updatePatient(patientID, updates){

    try{

        updates.updated_at = new Date();

        const { error } =
        await supabaseClient
        .from("patients")
        .update(updates)
        .eq("id", patientID);

        if(error) throw error;

        await createAuditLog(
            "PATIENT_UPDATED",
            patientID
        );

        showNotification(
            "Patient updated successfully",
            "success"
        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// ARCHIVE PATIENT
// =====================================

async function archivePatient(patientID){

    try{

        const { error } =
        await supabaseClient
        .from("patients")
        .update({

            archived:true,
            archived_at:new Date()

        })
        .eq("id", patientID);

        if(error) throw error;

        await createAuditLog(
            "PATIENT_ARCHIVED",
            patientID
        );

        showNotification(
            "Patient archived",
            "success"
        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// CREATE PRESCRIPTION
// =====================================

async function createPrescription(data){

    try{

        const prescriptionID =
        generateID("RX");

        const { error } =
        await supabaseClient
        .from("prescriptions")
        .insert({

            id:prescriptionID,

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            medicines:data.medicines,

            dosage:data.dosage,

            instructions:data.instructions,

            status:"pending",

            created_at:new Date()

        });

        if(error) throw error;

        await createAuditLog(
            "PRESCRIPTION_CREATED",
            prescriptionID
        );

        return prescriptionID;

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// CREATE LAB REQUEST
// =====================================

async function createLaboratoryRequest(data){

    try{

        const requestID =
        generateID("LAB");

        const { error } =
        await supabaseClient
        .from("laboratory_requests")
        .insert({

            id:requestID,

            patient_id:data.patient_id,

            doctor_id:data.doctor_id,

            test_name:data.test_name,

            notes:data.notes,

            status:"pending",

            created_at:new Date()

        });

        if(error) throw error;

        await createAuditLog(
            "LAB_REQUEST_CREATED",
            requestID
        );

        return requestID;

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// PATIENT VISIT HISTORY
// =====================================

async function loadPatientVisits(patientID){

    try{

        const { data, error } =
        await supabaseClient
        .from("patient_visits")
        .select("*")
        .eq("patient_id", patientID)
        .order(
            "created_at",
            {
                ascending:false
            }
        );

        if(error) throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// PRINT EMR
// =====================================

function printMedicalRecord(){

    window.print();

}






// =====================================
// REALTIME PATIENT RECORDS
// =====================================

function setupPatientRealtime(){

    supabaseClient

    .channel("patients-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"patients"

        },

        ()=>{

            loadRecentPatients();

        }

    )

    .subscribe();

}






// =====================================
// PATIENT STATISTICS
// =====================================

async function getPatientStatistics(){

    try{

        const { count } =
        await supabaseClient
        .from("patients")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );

        return {

            totalPatients:
            count || 0

        };

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    setupPatientRealtime();

});






// =====================================
// EXPORT
// =====================================

window.updatePatient =
updatePatient;

window.archivePatient =
archivePatient;

window.createPrescription =
createPrescription;

window.createLaboratoryRequest =
createLaboratoryRequest;

window.loadPatientVisits =
loadPatientVisits;

window.printMedicalRecord =
printMedicalRecord;

window.setupPatientRealtime =
setupPatientRealtime;

window.getPatientStatistics =
getPatientStatistics;