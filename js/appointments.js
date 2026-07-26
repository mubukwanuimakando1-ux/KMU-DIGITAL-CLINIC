/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
APPOINTMENT MANAGEMENT MODULE
=====================================================

Functions:
- Create appointments
- Validate appointment details
- Store appointments in Supabase
- Track appointment status
- Load user appointments
- Send appointment notifications

=====================================================
*/






// =====================================
// APPOINTMENT FORM INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    const appointmentForm =
    document.getElementById(
        "appointmentForm"
    );



    if(appointmentForm){


        appointmentForm.addEventListener(

            "submit",

            submitAppointment

        );


    }


});








// =====================================
// SUBMIT APPOINTMENT
// =====================================


async function submitAppointment(event){


    event.preventDefault();




    const name =
    document.getElementById(
        "appointmentName"
    ).value;




    const identifier =
    document.getElementById(
        "appointmentIdentifier"
    ).value;




    const card =
    document.getElementById(
        "appointmentCard"
    ).value;




    const phone =
    document.getElementById(
        "appointmentPhone"
    ).value;




    const department =
    document.getElementById(
        "appointmentDepartment"
    ).value;




    const date =
    document.getElementById(
        "appointmentDate"
    ).value;




    const reason =
    document.getElementById(
        "appointmentReason"
    ).value;








    // Validation


    if(!name || !identifier || !department || !date || !reason){


        showNotification(

            "Please complete all required fields",

            "error"

        );


        return;


    }






    try{


        showLoader();





        const user =
        await supabaseClient
        .auth
        .getUser();






        const appointmentID =
        generateID(
            "APT"
        );






        const {

            error

        } = await supabaseClient
        .from("appointments")
        .insert({



            id:
            appointmentID,



            user_id:
            user.data.user?.id || null,



            patient_name:
            name,



            identifier:
            identifier,



            clinic_card:
            card,



            phone:
            phone,



            department:
            department,



            appointment_date:
            date,



            reason:
            reason,



            status:
            "pending",



            created_at:
            new Date()



        });






        if(error){

            throw error;

        }







        // Security log


        await createAuditLog(

            "APPOINTMENT_CREATED",

            `Appointment ${appointmentID}`

        );








        // Create notification


        await createAppointmentNotification(

            appointmentID,

            name

        );








        showNotification(

            "Appointment booked successfully",

            "success"

        );






        document
        .getElementById(
            "appointmentForm"
        )
        .reset();





    }
    catch(error){


        console.error(

            "Appointment error:",

            error

        );


        showNotification(

            error.message,

            "error"

        );



    }
    finally{


        hideLoader();


    }


}








// =====================================
// CREATE APPOINTMENT NOTIFICATION
// =====================================


async function createAppointmentNotification(

appointmentID,

patientName

){


    try{


        await supabaseClient

        .from("notifications")

        .insert({


            title:
            "New Appointment",



            message:
            `${patientName} booked an appointment`,



            type:
            "appointment",



            reference_id:
            appointmentID,



            read:
            false,



            created_at:
            new Date()



        });



    }
    catch(error){


        console.error(

            "Notification creation failed",

            error

        );


    }


}








// =====================================
// LOAD USER APPOINTMENTS
// =====================================


async function loadUserAppointments(){


    try{


        const {

            data:userData

        } =
        await supabaseClient
        .auth
        .getUser();





        if(!userData.user){

            return;

        }







        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .eq(

            "user_id",

            userData.user.id

        )
        .order(

            "created_at",

            {

            ascending:false

            }

        );







        if(error){

            throw error;

        }







        return data;





    }
    catch(error){


        console.error(

            "Loading appointments failed",

            error

        );


    }


}







// =====================================
// CANCEL APPOINTMENT
// =====================================


async function cancelAppointment(
appointmentID
){



    try{


        const {

            error

        } =
        await supabaseClient
        .from("appointments")
        .update({


            status:
            "cancelled"



        })
        .eq(

            "id",

            appointmentID

        );







        if(error){

            throw error;

        }





        await createAuditLog(

            "APPOINTMENT_CANCELLED",

            appointmentID

        );





        showNotification(

            "Appointment cancelled",

            "success"

        );






    }
    catch(error){



        showNotification(

            error.message,

            "error"

        );


    }


}







// =====================================
// APPROVE APPOINTMENT
// =====================================


async function approveAppointment(
appointmentID
){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("appointments")
        .update({


            status:
            "approved"



        })
        .eq(

            "id",

            appointmentID

        );






        if(error){

            throw error;

        }





        showNotification(

            "Appointment approved",

            "success"

        );






    }
    catch(error){


        handleError(error);


    }


}







// =====================================
// EXPORT FUNCTIONS
// =====================================


window.submitAppointment =
submitAppointment;


window.loadUserAppointments =
loadUserAppointments;


window.cancelAppointment =
cancelAppointment;


window.approveAppointment =
approveAppointment;
/*
=====================================================
APPOINTMENT ADVANCED MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Appointment search
- Filtering
- Calendar loading
- Doctor/reception management
- Real-time appointment monitoring

=====================================================
*/





// =====================================
// LOAD ALL APPOINTMENTS (STAFF)
// =====================================


async function loadAllAppointments(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .order(

            "created_at",

            {

            ascending:false

            }

        );





        if(error){

            throw error;

        }





        return data;



    }
    catch(error){


        console.error(

            "Failed loading appointments",

            error

        );


    }


}







// =====================================
// SEARCH APPOINTMENTS
// =====================================


async function searchAppointments(
keyword
){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .or(

            `patient_name.ilike.%${keyword}%,identifier.ilike.%${keyword}%`

        );






        if(error){

            throw error;

        }



        return data;



    }
    catch(error){


        console.error(

            "Search error",

            error

        );


    }


}







// =====================================
// FILTER APPOINTMENTS BY STATUS
// =====================================


async function filterAppointments(
status
){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("appointments")
        .select("*")
        .eq(

            "status",

            status

        )
        .order(

            "appointment_date",

            {

            ascending:true

            }

        );






        if(error){

            throw error;

        }




        return data;



    }
    catch(error){


        console.error(

            "Filter error",

            error

        );


    }


}







// =====================================
// UPDATE APPOINTMENT STATUS
// =====================================


async function updateAppointmentStatus(

appointmentID,

status

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("appointments")
        .update({


            status:
            status,


            updated_at:
            new Date()



        })
        .eq(

            "id",

            appointmentID

        );







        if(error){

            throw error;

        }






        await createAuditLog(

            "APPOINTMENT_STATUS_CHANGED",

            `${appointmentID} changed to ${status}`

        );






        showNotification(

            "Appointment status updated",

            "success"

        );




    }
    catch(error){



        handleError(error);



    }


}







// =====================================
// LOAD TODAY APPOINTMENTS
// =====================================


async function loadTodayAppointments(){


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
        .order(

            "created_at",

            {

            ascending:true

            }

        );






        if(error){

            throw error;

        }





        return data;



    }
    catch(error){


        console.error(

            "Today's appointments error",

            error

        );


    }


}







// =====================================
// APPOINTMENT REMINDER
// =====================================


async function sendAppointmentReminder(

appointmentID,

userID

){


    try{


        await supabaseClient
        .from("notifications")
        .insert({


            user_id:

            userID,



            title:

            "Appointment Reminder",



            message:

            "You have an upcoming health centre appointment.",



            type:

            "reminder",



            reference_id:

            appointmentID,



            read:

            false,



            created_at:

            new Date()



        });







        await createAuditLog(

            "APPOINTMENT_REMINDER_SENT",

            appointmentID

        );



    }
    catch(error){


        console.error(

            "Reminder error",

            error

        );


    }


}







// =====================================
// REAL-TIME APPOINTMENT UPDATES
// =====================================


function setupAppointmentRealtime(){


    supabaseClient

    .channel(
        "appointments-live"
    )

    .on(

        "postgres_changes",

        {


            event:"*",


            schema:"public",


            table:"appointments"


        },


        payload=>{


            console.log(

                "Appointment update",

                payload

            );



            showNotification(

                "Appointment information updated",

                "success"

            );


        }


    )

    .subscribe();


}







// =====================================
// APPOINTMENT DATE RESTRICTION
// =====================================


function restrictPastAppointments(){


    const dateInput =
    document.getElementById(
        "appointmentDate"
    );



    if(dateInput){


        dateInput.min =
        getCurrentDate();


    }


}







// =====================================
// APPOINTMENT INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    restrictPastAppointments();


    setupAppointmentRealtime();



});








// =====================================
// EXPORT FUNCTIONS
// =====================================


window.loadAllAppointments =
loadAllAppointments;


window.searchAppointments =
searchAppointments;


window.filterAppointments =
filterAppointments;


window.updateAppointmentStatus =
updateAppointmentStatus;


window.loadTodayAppointments =
loadTodayAppointments;


window.sendAppointmentReminder =
sendAppointmentReminder;


window.setupAppointmentRealtime =
setupAppointmentRealtime;