/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
REPORTS & ANALYTICS MODULE
=====================================================

Functions:
- Patient reports
- Appointment reports
- Pharmacy reports
- Laboratory reports
- Dashboard analytics
- Export preparation

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeReports();

});






async function initializeReports(){

    try{

        await loadDashboardAnalytics();

    }
    catch(error){

        console.error(

            "Reports initialization error",

            error

        );

    }

}






// =====================================
// DASHBOARD ANALYTICS
// =====================================

async function loadDashboardAnalytics(){

    try{

        const analytics = {

            patients:
            await getPatientCount(),

            appointments:
            await getAppointmentCount(),

            laboratory:
            await getLaboratoryCount(),

            prescriptions:
            await getPrescriptionCount()

        };

        return analytics;

    }
    catch(error){

        console.error(error);

    }

}






// =====================================
// PATIENT REPORT
// =====================================

async function generatePatientReport(){

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
// APPOINTMENT REPORT
// =====================================

async function generateAppointmentReport(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .order(

            "appointment_date",

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
// PHARMACY REPORT
// =====================================

async function generatePharmacyReport(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("dispensed_medicines")
        .select("*")
        .order(

            "dispensed_at",

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
// LABORATORY REPORT
// =====================================

async function generateLaboratoryReport(){

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
// TOTAL PATIENTS
// =====================================

async function getPatientCount(){

    const {

        count

    } =
    await supabaseClient
    .from("patients")
    .select(

        "*",

        {

            count:"exact",

            head:true

        }

    );

    return count || 0;

}






// =====================================
// TOTAL APPOINTMENTS
// =====================================

async function getAppointmentCount(){

    const {

        count

    } =
    await supabaseClient
    .from("appointments")
    .select(

        "*",

        {

            count:"exact",

            head:true

        }

    );

    return count || 0;

}






// =====================================
// TOTAL LAB TESTS
// =====================================

async function getLaboratoryCount(){

    const {

        count

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

    return count || 0;

}






// =====================================
// TOTAL PRESCRIPTIONS
// =====================================

async function getPrescriptionCount(){

    const {

        count

    } =
    await supabaseClient
    .from("prescriptions")
    .select(

        "*",

        {

            count:"exact",

            head:true

        }

    );

    return count || 0;

}
/*
=====================================================
ADVANCED REPORTS & EXPORT MODULE
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/




// =====================================
// AUDIT LOG REPORT
// =====================================

async function generateAuditReport(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("audit_logs")
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
// SECURITY REPORT
// =====================================

async function generateSecurityReport(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient
        .from("security_alerts")
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
// DATE FILTER
// =====================================

function filterReportByDate(

records,

startDate,

endDate

){

    return records.filter(

        item=>{

            const date =
            new Date(item.created_at);

            return (

                date >= new Date(startDate)

                &&

                date <= new Date(endDate)

            );

        }

    );

}






// =====================================
// EXPORT JSON
// =====================================

function exportJSON(

filename,

data

){

    const blob =
    new Blob(

        [

            JSON.stringify(

                data,

                null,

                2

            )

        ],

        {

            type:

            "application/json"

        }

    );

    const url =
    URL.createObjectURL(blob);

    const link =
    document.createElement("a");

    link.href = url;

    link.download =
    filename + ".json";

    link.click();

    URL.revokeObjectURL(url);

}






// =====================================
// EXPORT CSV
// =====================================

function exportCSV(

filename,

rows

){

    if(

        !rows ||

        rows.length===0

    ){

        return;

    }

    const headers =
    Object.keys(rows[0]);

    const csv = [

        headers.join(","),

        ...rows.map(

            row=>

            headers.map(

                h=>JSON.stringify(row[h] ?? "")

            ).join(",")

        )

    ].join("\n");

    const blob =
    new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );

    const url =
    URL.createObjectURL(blob);

    const link =
    document.createElement("a");

    link.href = url;

    link.download =
    filename + ".csv";

    link.click();

    URL.revokeObjectURL(url);

}






// =====================================
// PRINT REPORT
// =====================================

function printReport(){

    window.print();

}






// =====================================
// SYSTEM SUMMARY
// =====================================

async function generateSystemSummary(){

    return{

        patients:
        await getPatientCount(),

        appointments:
        await getAppointmentCount(),

        laboratory:
        await getLaboratoryCount(),

        prescriptions:
        await getPrescriptionCount(),

        inventory:
        await getInventoryStatistics(),

        labStatistics:
        await getLaboratoryStatistics()

    };

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadDashboardAnalytics =
loadDashboardAnalytics;

window.generatePatientReport =
generatePatientReport;

window.generateAppointmentReport =
generateAppointmentReport;

window.generatePharmacyReport =
generatePharmacyReport;

window.generateLaboratoryReport =
generateLaboratoryReport;

window.generateAuditReport =
generateAuditReport;

window.generateSecurityReport =
generateSecurityReport;

window.generateSystemSummary =
generateSystemSummary;

window.filterReportByDate =
filterReportByDate;

window.exportJSON =
exportJSON;

window.exportCSV =
exportCSV;

window.printReport =
printReport;