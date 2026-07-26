/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
ANALYTICS & REPORTING MODULE
=====================================================

Functions:
- Healthcare analytics
- Patient statistics
- Department performance
- System KPIs
- Trend analysis
- Dashboard data preparation

=====================================================
*/






// =====================================
// INITIALIZATION
// =====================================

document.addEventListener(

"DOMContentLoaded",

()=>{

    initializeAnalytics();

});






async function initializeAnalytics(){

    try{

        await loadAnalyticsDashboard();

        setupAnalyticsRealtime();

    }

    catch(error){

        console.error(

            "Analytics initialization error",

            error

        );

    }

}






// =====================================
// LOAD ANALYTICS DASHBOARD
// =====================================

async function loadAnalyticsDashboard(){

    try{

        const data = {

            patients:
            await getPatientAnalytics(),


            appointments:
            await getAppointmentAnalytics(),


            queue:
            await getQueueAnalytics(),


            pharmacy:
            await getPharmacyAnalytics(),


            laboratory:
            await getLaboratoryAnalytics(),


            departments:
            await getDepartmentPerformance()

        };


        return data;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// PATIENT ANALYTICS
// =====================================

async function getPatientAnalytics(){

    try{

        const {

            count:totalPatients

        } =
        await supabaseClient

        .from("patients")

        .select("*",{

            count:"exact",

            head:true

        });



        const today =
        new Date()

        .toISOString()

        .split("T")[0];



        const {

            count:todayVisits

        } =
        await supabaseClient

        .from("patient_visits")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "visit_date",

            today

        );



        return {

            totalPatients:
            totalPatients || 0,


            todayVisits:
            todayVisits || 0

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// APPOINTMENT ANALYTICS
// =====================================

async function getAppointmentAnalytics(){

    try{

        const {

            count:total

        } =
        await supabaseClient

        .from("appointments")

        .select("*",{

            count:"exact",

            head:true

        });



        const {

            count:completed

        } =
        await supabaseClient

        .from("appointments")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "completed"

        );



        const {

            count:pending

        } =
        await supabaseClient

        .from("appointments")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "scheduled"

        );



        return{

            total:
            total || 0,


            completed:
            completed || 0,


            pending:
            pending || 0

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// QUEUE ANALYTICS
// =====================================

async function getQueueAnalytics(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("queues")

        .select("department,status");


        if(error)

        throw error;



        const statistics = {};


        data.forEach(item=>{


            if(!statistics[item.department]){


                statistics[item.department]={

                    waiting:0,

                    completed:0

                };


            }



            if(item.status==="waiting"){

                statistics[item.department]
                .waiting++;

            }



            if(item.status==="completed"){

                statistics[item.department]
                .completed++;

            }


        });



        return statistics;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// DEPARTMENT PERFORMANCE
// =====================================

async function getDepartmentPerformance(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("departments")

        .select("*");


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
ADVANCED ANALYTICS MODULE
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/






// =====================================
// PHARMACY ANALYTICS
// =====================================

async function getPharmacyAnalytics(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("medicine_inventory")

        .select("*");


        if(error)

        throw error;



        let totalItems = data.length;

        let lowStock = 0;


        data.forEach(item=>{


            if(

                item.quantity <= item.minimum_stock

            ){

                lowStock++;

            }


        });



        return {

            totalItems:

            totalItems,


            lowStock:

            lowStock

        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// LABORATORY ANALYTICS
// =====================================

async function getLaboratoryAnalytics(){

    try{

        const {

            count:totalTests

        } =
        await supabaseClient

        .from("laboratory_requests")

        .select("*",{

            count:"exact",

            head:true

        });



        const {

            count:completedTests

        } =
        await supabaseClient

        .from("laboratory_requests")

        .select("*",{

            count:"exact",

            head:true

        })

        .eq(

            "status",

            "completed"

        );



        return {


            totalTests:

            totalTests || 0,


            completedTests:

            completedTests || 0


        };

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// STAFF PERFORMANCE
// =====================================

async function getStaffPerformance(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("staff_attendance")

        .select("*");


        if(error)

        throw error;



        const performance = {};



        data.forEach(record=>{


            if(

                !performance[record.staff_id]

            ){

                performance[record.staff_id]={

                    present:0,

                    absent:0

                };

            }



            if(

                record.status==="present"

            ){

                performance[record.staff_id]
                .present++;

            }


            if(

                record.status==="absent"

            ){

                performance[record.staff_id]
                .absent++;

            }


        });



        return performance;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// HEALTH TRENDS
// =====================================

async function getHealthTrends(){

    try{

        const {

            data,

            error

        } =
        await supabaseClient

        .from("diagnoses")

        .select(

            "diagnosis,created_at"

        );


        if(error)

        throw error;



        const trends={};



        data.forEach(item=>{


            if(

                !trends[item.diagnosis]

            ){

                trends[item.diagnosis]=0;

            }



            trends[item.diagnosis]++;


        });



        return trends;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// AI INSIGHTS PREPARATION
// =====================================

async function generateAIInsights(){

    try{

        const analytics =

        await loadAnalyticsDashboard();



        const insights=[];



        if(

            analytics.pharmacy.lowStock > 0

        ){

            insights.push({

                type:"warning",

                message:

                "Some medicines require restocking"

            });

        }



        if(

            analytics.appointments.pending > 20

        ){

            insights.push({

                type:"alert",

                message:

                "High number of pending appointments"

            });

        }



        if(

            analytics.queue

        ){

            insights.push({

                type:"information",

                message:

                "Queue performance analysis available"

            });

        }



        return insights;

    }

    catch(error){

        console.error(error);

    }

}






// =====================================
// FORMAT CHART DATA
// =====================================

function prepareChartData(data){

    return {

        labels:

        Object.keys(data),


        values:

        Object.values(data)

    };

}






// =====================================
// REALTIME ANALYTICS
// =====================================

function setupAnalyticsRealtime(){

    supabaseClient

    .channel("analytics-live")

    .on(

        "postgres_changes",

        {

            event:"*",

            schema:"public",

            table:"patient_visits"

        },

        ()=>{

            loadAnalyticsDashboard();

        }

    )

    .subscribe();

}






// =====================================
// EXPORT ANALYTICS REPORT
// =====================================

async function exportAnalyticsReport(){

    const report =

    await loadAnalyticsDashboard();



    return JSON.stringify(

        report,

        null,

        2

    );

}






// =====================================
// EXPORT FUNCTIONS
// =====================================

window.loadAnalyticsDashboard =
loadAnalyticsDashboard;

window.getPatientAnalytics =
getPatientAnalytics;

window.getAppointmentAnalytics =
getAppointmentAnalytics;

window.getQueueAnalytics =
getQueueAnalytics;

window.getDepartmentPerformance =
getDepartmentPerformance;

window.getPharmacyAnalytics =
getPharmacyAnalytics;

window.getLaboratoryAnalytics =
getLaboratoryAnalytics;

window.getStaffPerformance =
getStaffPerformance;

window.getHealthTrends =
getHealthTrends;

window.generateAIInsights =
generateAIInsights;

window.prepareChartData =
prepareChartData;

window.setupAnalyticsRealtime =
setupAnalyticsRealtime;

window.exportAnalyticsReport =
exportAnalyticsReport;