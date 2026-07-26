/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
DASHBOARD MANAGEMENT MODULE
=====================================================

Functions:
- Dashboard initialization
- Role-based dashboard loading
- Statistics display
- Patient analytics
- Staff dashboard preparation
- Admin overview

=====================================================
*/






// =====================================
// DASHBOARD INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

async()=>{


    await initializeDashboard();


});







// =====================================
// INITIALIZE DASHBOARD
// =====================================


async function initializeDashboard(){


    try{


        const user =
        await getCurrentUser();






        if(!user){


            console.log(

                "No logged in user"

            );


            return;


        }







        const role =
        await getUserRole(

            user.id

        );






        loadDashboardByRole(

            role

        );






    }
    catch(error){


        console.error(

            "Dashboard initialization error",

            error

        );


    }


}







// =====================================
// GET CURRENT USER
// =====================================


async function getCurrentUser(){


    try{


        const {

            data

        } =
        await supabaseClient
        .auth
        .getUser();






        return data.user || null;



    }
    catch(error){


        return null;


    }


}







// =====================================
// GET USER ROLE
// =====================================


async function getUserRole(

userID

){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("profiles")
        .select(

            "role"

        )
        .eq(

            "id",

            userID

        )
        .single();






        if(error){

            throw error;

        }






        return data.role;



    }
    catch(error){


        console.error(

            "Role error",

            error

        );



        return "student";


    }


}







// =====================================
// LOAD DASHBOARD BY ROLE
// =====================================


function loadDashboardByRole(

role

){


    switch(role){



        case "admin":


            loadAdminDashboard();


            break;





        case "doctor":


            loadDoctorDashboard();


            break;





        case "nurse":


            loadNurseDashboard();


            break;





        case "pharmacist":


            loadPharmacyDashboard();


            break;





        case "laboratory":


            loadLaboratoryDashboard();


            break;





        case "student":


            loadStudentDashboard();


            break;





        default:


            loadStudentDashboard();


            break;


    }


}







// =====================================
// ADMIN DASHBOARD
// =====================================


async function loadAdminDashboard(){


    try{


        await loadSystemStatistics();


        await loadRecentActivities();


        await loadSecuritySummary();





        console.log(

            "Admin dashboard loaded"

        );





    }
    catch(error){


        console.error(

            "Admin dashboard error",

            error

        );


    }


}







// =====================================
// SYSTEM STATISTICS
// =====================================


async function loadSystemStatistics(){


    try{


        const tables = {


            patients:
            "patient_visits",



            appointments:
            "appointments",



            visitors:
            "visitors",



            staff:
            "staff"



        };





        for(
            const item in tables
        ){


            const {

                count

            } =
            await supabaseClient
            .from(
                tables[item]
            )
            .select(

                "*",

                {

                count:"exact",

                head:true

                }

            );







            const element =
            document.getElementById(

                item+"Count"

            );





            if(element){


                element.innerHTML =
                count || 0;


            }



        }




    }
    catch(error){


        console.error(

            "Statistics loading error",

            error

        );


    }


}







// =====================================
// RECENT ACTIVITIES
// =====================================


async function loadRecentActivities(){


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

        )
        .limit(10);






        if(error){

            throw error;

        }





        const container =
        document.getElementById(

            "activityList"

        );





        if(!container)
        return;






        container.innerHTML="";






        data.forEach(

            activity=>{


                container.innerHTML +=


                `

                <div class="activity-item">


                <h4>

                ${activity.action}

                </h4>


                <p>

                ${activity.details || ""}

                </p>


                <small>

                ${formatDate(activity.created_at)}

                </small>


                </div>


                `;



            }

        );





    }
    catch(error){


        console.error(

            "Activity error",

            error

        );


    }


}/*
=====================================================
DASHBOARD ROLE MODULES
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Doctor dashboard
- Nurse dashboard
- Pharmacy dashboard
- Laboratory dashboard
- Student dashboard
- Security overview

=====================================================
*/






// =====================================
// DOCTOR DASHBOARD
// =====================================


async function loadDoctorDashboard(){


    try{


        await loadDoctorPatients();


        await loadDoctorAppointments();


        await loadMedicalRecords();





        console.log(

            "Doctor dashboard loaded"

        );



    }
    catch(error){


        console.error(

            "Doctor dashboard error",

            error

        );


    }


}







// =====================================
// LOAD DOCTOR PATIENTS
// =====================================


async function loadDoctorPatients(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("patient_visits")
        .select("*")
        .eq(

            "status",

            "waiting"

        )
        .order(

            "created_at",

            {

            ascending:true

            }

        );






        if(error){

            throw error;

        }






        const element =
        document.getElementById(

            "doctorPatientCount"

        );





        if(element){


            element.innerHTML =
            data.length;



        }



    }
    catch(error){


        console.error(

            "Doctor patients error",

            error

        );


    }


}







// =====================================
// LOAD DOCTOR APPOINTMENTS
// =====================================


async function loadDoctorAppointments(){


    try{


        const today =
        getCurrentDate();






        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .eq(

            "appointment_date",

            today

        )
        .eq(

            "status",

            "approved"

        );







        if(error){

            throw error;

        }






        const element =
        document.getElementById(

            "doctorAppointmentCount"

        );





        if(element){


            element.innerHTML =
            data.length;


        }




    }
    catch(error){


        console.error(

            "Doctor appointments error",

            error

        );


    }


}







// =====================================
// LOAD MEDICAL RECORDS
// =====================================


async function loadMedicalRecords(){


    try{


        const {

            count

        } =
        await supabaseClient
        .from("medical_records")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        );






        const element =
        document.getElementById(

            "medicalRecordCount"

        );





        if(element){


            element.innerHTML =
            count || 0;


        }





    }
    catch(error){


        console.error(

            "Medical record error",

            error

        );


    }


}








// =====================================
// NURSE DASHBOARD
// =====================================


async function loadNurseDashboard(){


    try{


        const {

            count

        } =
        await supabaseClient
        .from("patient_visits")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        )
        .eq(

            "status",

            "waiting"

        );







        const element =
        document.getElementById(

            "nurseQueueCount"

        );





        if(element){


            element.innerHTML =
            count || 0;


        }






        console.log(

            "Nurse dashboard loaded"

        );



    }
    catch(error){


        console.error(

            "Nurse dashboard error",

            error

        );


    }


}







// =====================================
// PHARMACY DASHBOARD
// =====================================


async function loadPharmacyDashboard(){


    try{


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

        )
        .eq(

            "status",

            "pending"

        );







        const element =
        document.getElementById(

            "pendingPrescriptionCount"

        );





        if(element){


            element.innerHTML =
            count || 0;


        }






        console.log(

            "Pharmacy dashboard loaded"

        );



    }
    catch(error){


        console.error(

            "Pharmacy dashboard error",

            error

        );


    }


}







// =====================================
// LABORATORY DASHBOARD
// =====================================


async function loadLaboratoryDashboard(){


    try{


        const {

            count

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







        const element =
        document.getElementById(

            "pendingLabCount"

        );





        if(element){


            element.innerHTML =
            count || 0;


        }







        console.log(

            "Laboratory dashboard loaded"

        );



    }
    catch(error){


        console.error(

            "Laboratory dashboard error",

            error

        );


    }


}







// =====================================
// STUDENT DASHBOARD
// =====================================


async function loadStudentDashboard(){


    try{


        await loadUserAppointments();


        console.log(

            "Student dashboard loaded"

        );



    }
    catch(error){


        console.error(

            "Student dashboard error",

            error

        );


    }


}







// =====================================
// SECURITY SUMMARY
// =====================================


async function loadSecuritySummary(){


    try{


        const {

            count

        } =
        await supabaseClient
        .from("audit_logs")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        )
        .eq(

            "severity",

            "high"

        );






        const element =
        document.getElementById(

            "securityAlertCount"

        );





        if(element){


            element.innerHTML =
            count || 0;


        }





    }
    catch(error){


        console.error(

            "Security summary error",

            error

        );


    }


}







// =====================================
// DASHBOARD REAL-TIME UPDATES
// =====================================


function setupDashboardRealtime(){


    supabaseClient

    .channel(

        "dashboard-live"

    )

    .on(

        "postgres_changes",

        {


            event:"*",


            schema:"public",


            table:"patient_visits"


        },


        ()=>{


            loadSystemStatistics();



        }

    )

    .subscribe();



}







document.addEventListener(

"DOMContentLoaded",

()=>{


    setupDashboardRealtime();



});








// =====================================
// EXPORT FUNCTIONS
// =====================================


window.initializeDashboard =
initializeDashboard;


window.loadAdminDashboard =
loadAdminDashboard;


window.loadDoctorDashboard =
loadDoctorDashboard;


window.loadNurseDashboard =
loadNurseDashboard;


window.loadPharmacyDashboard =
loadPharmacyDashboard;


window.loadLaboratoryDashboard =
loadLaboratoryDashboard;


window.loadStudentDashboard =
loadStudentDashboard;


window.setupDashboardRealtime =
setupDashboardRealtime;