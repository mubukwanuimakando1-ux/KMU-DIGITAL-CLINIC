/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
LABORATORY MANAGEMENT MODULE
=====================================================

Functions:
- Laboratory requests
- Sample collection
- Test processing
- Test result entry
- Laboratory workflow
- Status tracking

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeLaboratory();

});






async function initializeLaboratory(){

    try{

        await loadPendingLabRequests();

        await loadCompletedTests();

    }
    catch(error){

        console.error(
            "Laboratory initialization error",
            error
        );

    }

}






// =====================================
// LOAD PENDING REQUESTS
// =====================================

async function loadPendingLabRequests(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("laboratory_requests")
        .select("*")
        .eq(
            "status",
            "pending"
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
// COLLECT SAMPLE
// =====================================

async function collectSample(data){

    try{

        const sampleID =
        generateID("SMP");

        const {

            error

        } =
        await supabaseClient
        .from("laboratory_samples")
        .insert({

            id:sampleID,

            request_id:data.request_id,

            patient_id:data.patient_id,

            sample_type:data.sample_type,

            collected_by:data.collected_by,

            collection_time:new Date(),

            status:"collected"

        });

        if(error)
        throw error;

        await supabaseClient
        .from("laboratory_requests")
        .update({

            status:"sample_collected"

        })
        .eq(
            "id",
            data.request_id
        );

        await createAuditLog(

            "SAMPLE_COLLECTED",

            sampleID

        );

        showNotification(

            "Sample collected successfully",

            "success"

        );

        return sampleID;

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// START TEST
// =====================================

async function startLaboratoryTest(requestID){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("laboratory_requests")
        .update({

            status:"processing",

            started_at:new Date()

        })
        .eq(
            "id",
            requestID
        );

        if(error)
        throw error;

        await createAuditLog(

            "LAB_TEST_STARTED",

            requestID

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// SAVE TEST RESULT
// =====================================

async function saveLaboratoryResult(result){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("laboratory_results")
        .insert({

            request_id:result.request_id,

            patient_id:result.patient_id,

            test_name:result.test_name,

            result:result.result,

            remarks:result.remarks,

            performed_by:result.performed_by,

            created_at:new Date()

        });

        if(error)
        throw error;

        await supabaseClient
        .from("laboratory_requests")
        .update({

            status:"completed",

            completed_at:new Date()

        })
        .eq(
            "id",
            result.request_id
        );

        await createAuditLog(

            "LAB_RESULT_SAVED",

            result.request_id

        );

        showNotification(

            "Laboratory result saved",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD COMPLETED TESTS
// =====================================

async function loadCompletedTests(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("laboratory_results")
        .select("*")
        .order(
            "created_at",
            {
                ascending:false
            }
        )
        .limit(50);

        if(error)
        throw error;

        return data;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// SEARCH LAB REQUESTS
// =====================================

async function searchLaboratoryRequests(keyword){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("laboratory_requests")
        .select("*")
        .ilike(
            "patient_id",
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
/*
=====================================================
ADVANCED LABORATORY MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// LOAD PATIENT RESULTS
// =====================================

async function loadPatientResults(patientID){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("laboratory_results")
        .select("*")
        .eq(
            "patient_id",
            patientID
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
// LABORATORY STATISTICS
// =====================================

async function getLaboratoryStatistics(){

    try{

        const {

            count:requests

        } =
        await supabaseClient
        .from("laboratory_requests")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );



        const {

            count:results

        } =
        await supabaseClient
        .from("laboratory_results")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );



        const {

            count:pending

        } =
        await supabaseClient
        .from("laboratory_requests")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        )
        .eq(
            "status",
            "pending"
        );



        return{

            totalRequests:
            requests || 0,

            completedResults:
            results || 0,

            pendingRequests:
            pending || 0

        };

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// PRINT LAB RESULT
// =====================================

function printLaboratoryResult(){

    window.print();

}






// =====================================
// DELETE LAB RESULT
// =====================================

async function deleteLaboratoryResult(resultID){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("laboratory_results")
        .delete()
        .eq(
            "id",
            resultID
        );

        if(error)
        throw error;

        await createAuditLog(

            "LAB_RESULT_DELETED",

            resultID,

            "high"

        );

        showNotification(

            "Laboratory result deleted",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// REALTIME LABORATORY
// =====================================

function setupLaboratoryRealtime(){

    supabaseClient

    .channel("laboratory-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"laboratory_requests"

        },

        ()=>{

            loadPendingLabRequests();

        }

    )

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"laboratory_results"

        },

        ()=>{

            loadCompletedTests();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT LAB RESULTS
// =====================================

async function exportLaboratoryResults(){

    const results =
    await loadCompletedTests();

    return JSON.stringify(

        results,

        null,

        2

    );

}






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    setupLaboratoryRealtime();

});






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadPendingLabRequests =
loadPendingLabRequests;

window.collectSample =
collectSample;

window.startLaboratoryTest =
startLaboratoryTest;

window.saveLaboratoryResult =
saveLaboratoryResult;

window.loadCompletedTests =
loadCompletedTests;

window.searchLaboratoryRequests =
searchLaboratoryRequests;

window.loadPatientResults =
loadPatientResults;

window.getLaboratoryStatistics =
getLaboratoryStatistics;

window.printLaboratoryResult =
printLaboratoryResult;

window.deleteLaboratoryResult =
deleteLaboratoryResult;

window.setupLaboratoryRealtime =
setupLaboratoryRealtime;

window.exportLaboratoryResults =
exportLaboratoryResults;