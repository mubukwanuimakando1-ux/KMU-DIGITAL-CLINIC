/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
QUEUE MANAGEMENT MODULE
=====================================================

Functions:
- Queue number generation
- Department queues
- Call next patient
- Waiting time estimation
- Live queue updates

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeQueue();

});






async function initializeQueue(){

    try{

        await loadDepartmentQueues();

        setupQueueRealtime();

    }

    catch(error){

        console.error(

            "Queue initialization error",

            error

        );

    }

}






// =====================================
// GENERATE QUEUE NUMBER
// =====================================

async function generateQueueNumber(

department,

patientID

){

    try{

        const prefix={

            Reception:"REC",

            Nursing:"NUR",

            Doctor:"DOC",

            Laboratory:"LAB",

            Pharmacy:"PHA",

            Counselling:"COU"

        };



        const today=
        new Date()
        .toISOString()
        .split("T")[0];



        const {

            count

        }=
        await supabaseClient
        .from("queues")
        .select("*",{

            count:"exact",

            head:true

        })
        .eq(

            "department",

            department

        )
        .eq(

            "queue_date",

            today

        );



        const queueNumber=

        `${prefix[department]}-${String((count||0)+1).padStart(3,"0")}`;



        const {

            error

        }=
        await supabaseClient
        .from("queues")
        .insert({

            patient_id:

            patientID,

            department:

            department,

            queue_number:

            queueNumber,

            queue_date:

            today,

            status:

            "waiting",

            created_at:

            new Date()

        });



        if(error)

        throw error;



        await createAuditLog(

            "QUEUE_CREATED",

            queueNumber

        );



        return queueNumber;

    }

    catch(error){

        handleError(error);

    }

}






// =====================================
// LOAD DEPARTMENT QUEUES
// =====================================

async function loadDepartmentQueues(){

    try{

        const {

            data,

            error

        }=
        await supabaseClient
        .from("queues")
        .select("*")
        .neq(

            "status",

            "completed"

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
// LOAD SPECIFIC QUEUE
// =====================================

async function loadQueue(

department

){

    try{

        const {

            data,

            error

        }=
        await supabaseClient
        .from("queues")
        .select("*")
        .eq(

            "department",

            department

        )
        .neq(

            "status",

            "completed"

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
// CALL NEXT PATIENT
// =====================================

async function callNextPatient(

department

){

    try{

        const queue=

        await loadQueue(

            department

        );



        if(

            !queue ||

            queue.length===0

        ){

            return null;

        }



        const patient=

        queue[0];



        const {

            error

        }=
        await supabaseClient
        .from("queues")
        .update({

            status:"called",

            called_at:new Date()

        })
        .eq(

            "id",

            patient.id

        );



        if(error)

        throw error;



        await createAuditLog(

            "PATIENT_CALLED",

            patient.queue_number

        );



        return patient;

    }

    catch(error){

        handleError(error);

    }

}
/*
=====================================================
ADVANCED QUEUE MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// COMPLETE PATIENT VISIT
// =====================================

async function completePatientVisit(

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

            completed_at:new Date()

        })
        .eq(

            "id",

            queueID

        );

        if(error)
        throw error;

        await createAuditLog(

            "PATIENT_COMPLETED",

            queueID

        );

        showNotification(

            "Patient visit completed",

            "success"

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// SKIP PATIENT
// =====================================

async function skipPatient(

queueID

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("queues")
        .update({

            status:"skipped",

            skipped_at:new Date()

        })
        .eq(

            "id",

            queueID

        );

        if(error)
        throw error;

        await createAuditLog(

            "PATIENT_SKIPPED",

            queueID

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// TRANSFER PATIENT
// =====================================

async function transferPatient(

queueID,

department

){

    try{

        const {

            error

        } =
        await supabaseClient
        .from("queues")
        .update({

            department:department,

            transferred_at:new Date(),

            status:"waiting"

        })
        .eq(

            "id",

            queueID

        );

        if(error)
        throw error;

        await createAuditLog(

            "PATIENT_TRANSFERRED",

            department

        );

    }
    catch(error){

        handleError(error);

    }

}






// =====================================
// WAITING TIME
// =====================================

function calculateWaitingTime(

createdAt

){

    const now =
    new Date();

    const start =
    new Date(createdAt);

    const minutes =
    Math.floor(

        (now-start)/(1000*60)

    );

    return minutes;

}






// =====================================
// QUEUE STATISTICS
// =====================================

async function getQueueStatistics(){

    try{

        const {

            count:waiting

        } =
        await supabaseClient
        .from("queues")
        .select("*",{

            count:"exact",

            head:true

        })
        .eq(

            "status",

            "waiting"

        );



        const {

            count:called

        } =
        await supabaseClient
        .from("queues")
        .select("*",{

            count:"exact",

            head:true

        })
        .eq(

            "status",

            "called"

        );



        const {

            count:completed

        } =
        await supabaseClient
        .from("queues")
        .select("*",{

            count:"exact",

            head:true

        })
        .eq(

            "status",

            "completed"

        );



        return{

            waiting:
            waiting || 0,

            called:
            called || 0,

            completed:
            completed || 0

        };

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// REALTIME QUEUE
// =====================================

function setupQueueRealtime(){

    supabaseClient

    .channel("queue-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"queues"

        },

        ()=>{

            loadDepartmentQueues();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT QUEUE
// =====================================

async function exportQueue(){

    const queue =
    await loadDepartmentQueues();

    return JSON.stringify(

        queue,

        null,

        2

    );

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.generateQueueNumber =
generateQueueNumber;

window.loadDepartmentQueues =
loadDepartmentQueues;

window.loadQueue =
loadQueue;

window.callNextPatient =
callNextPatient;

window.completePatientVisit =
completePatientVisit;

window.skipPatient =
skipPatient;

window.transferPatient =
transferPatient;

window.calculateWaitingTime =
calculateWaitingTime;

window.getQueueStatistics =
getQueueStatistics;

window.setupQueueRealtime =
setupQueueRealtime;

window.exportQueue =
exportQueue;