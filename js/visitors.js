/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
VISITOR MANAGEMENT MODULE
=====================================================

Functions:
- Visitor registration
- Visitor records
- Visitor check-in
- Visitor check-out
- Visitor approval
- Visitor security logging

=====================================================
*/






// =====================================
// VISITOR FORM INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    const visitorForm =
    document.getElementById(
        "visitorForm"
    );



    if(visitorForm){


        visitorForm.addEventListener(

            "submit",

            registerVisitor

        );


    }


});







// =====================================
// REGISTER VISITOR
// =====================================


async function registerVisitor(event){


    event.preventDefault();





    const name =
    document.getElementById(
        "visitorName"
    ).value;





    const nrc =
    document.getElementById(
        "visitorNRC"
    ).value;





    const phone =
    document.getElementById(
        "visitorPhone"
    ).value;





    const email =
    document.getElementById(
        "visitorEmail"
    ).value;





    const person =
    document.getElementById(
        "personToVisit"
    ).value;





    const organisation =
    document.getElementById(
        "visitorOrganisation"
    ).value;





    const purpose =
    document.getElementById(
        "visitorPurpose"
    ).value;







    if(
        !name ||
        !person ||
        !purpose
    ){


        showNotification(

            "Please complete required visitor information",

            "error"

        );


        return;


    }







    try{


        showLoader();





        const visitorID =
        generateID(
            "VIS"
        );







        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .insert({



            id:

            visitorID,



            full_name:

            name,



            nrc:

            nrc,



            phone:

            phone,



            email:

            email,



            person_to_visit:

            person,



            organisation:

            organisation,



            purpose:

            purpose,



            status:

            "pending",



            check_in_time:

            null,



            check_out_time:

            null,



            created_at:

            new Date()



        });







        if(error){

            throw error;

        }







        await createAuditLog(

            "VISITOR_REGISTERED",

            visitorID

        );








        await createVisitorNotification(

            visitorID,

            name

        );








        showNotification(

            "Visitor registration completed",

            "success"

        );






        document
        .getElementById(
            "visitorForm"
        )
        .reset();





    }
    catch(error){


        console.error(

            "Visitor registration error",

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
// CREATE VISITOR NOTIFICATION
// =====================================


async function createVisitorNotification(

visitorID,

visitorName

){


    try{


        await supabaseClient

        .from("notifications")

        .insert({


            title:

            "New Visitor Registration",



            message:

            `${visitorName} registered as a visitor`,



            type:

            "visitor",



            reference_id:

            visitorID,



            read:

            false,



            created_at:

            new Date()



        });



    }
    catch(error){


        console.error(

            "Visitor notification error",

            error

        );


    }


}







// =====================================
// LOAD VISITORS
// =====================================


async function loadVisitors(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("visitors")
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

            "Loading visitors failed",

            error

        );


    }


}







// =====================================
// APPROVE VISITOR
// =====================================


async function approveVisitor(

visitorID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .update({


            status:

            "approved"



        })
        .eq(

            "id",

            visitorID

        );







        if(error){

            throw error;

        }






        await createAuditLog(

            "VISITOR_APPROVED",

            visitorID

        );






        showNotification(

            "Visitor approved",

            "success"

        );





    }
    catch(error){



        handleError(error);



    }


}







// =====================================
// REJECT VISITOR
// =====================================


async function rejectVisitor(

visitorID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .update({


            status:

            "rejected"



        })
        .eq(

            "id",

            visitorID

        );






        if(error){

            throw error;

        }





        await createAuditLog(

            "VISITOR_REJECTED",

            visitorID

        );






        showNotification(

            "Visitor rejected",

            "success"

        );



    }
    catch(error){


        handleError(error);


    }


}

/*
=====================================================
VISITOR ADVANCED MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Visitor check-in
- Visitor check-out
- Visitor search
- Visitor history
- Active visitor monitoring
- Real-time visitor updates

=====================================================
*/






// =====================================
// VISITOR CHECK-IN
// =====================================


async function checkInVisitor(

visitorID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .update({


            status:

            "checked_in",



            check_in_time:

            new Date()



        })
        .eq(

            "id",

            visitorID

        );






        if(error){

            throw error;

        }







        await createAuditLog(

            "VISITOR_CHECK_IN",

            visitorID

        );






        showNotification(

            "Visitor checked in successfully",

            "success"

        );





    }
    catch(error){



        handleError(error);



    }


}







// =====================================
// VISITOR CHECK-OUT
// =====================================


async function checkOutVisitor(

visitorID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .update({


            status:

            "checked_out",



            check_out_time:

            new Date()



        })
        .eq(

            "id",

            visitorID

        );







        if(error){

            throw error;

        }






        await createAuditLog(

            "VISITOR_CHECK_OUT",

            visitorID

        );






        showNotification(

            "Visitor checked out successfully",

            "success"

        );





    }
    catch(error){



        handleError(error);



    }


}







// =====================================
// SEARCH VISITORS
// =====================================


async function searchVisitors(

keyword

){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("visitors")
        .select("*")
        .or(

            `full_name.ilike.%${keyword}%,nrc.ilike.%${keyword}%,phone.ilike.%${keyword}%`

        );






        if(error){

            throw error;

        }





        return data;



    }
    catch(error){


        console.error(

            "Visitor search error",

            error

        );


    }


}







// =====================================
// GET ACTIVE VISITORS
// =====================================


async function getActiveVisitors(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("visitors")
        .select("*")
        .eq(

            "status",

            "checked_in"

        )
        .order(

            "check_in_time",

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

            "Active visitor error",

            error

        );


    }


}







// =====================================
// FILTER VISITORS
// =====================================


async function filterVisitors(

status

){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("visitors")
        .select("*")
        .eq(

            "status",

            status

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

            "Visitor filter error",

            error

        );


    }


}







// =====================================
// DELETE VISITOR RECORD
// =====================================


async function deleteVisitor(

visitorID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("visitors")
        .delete()
        .eq(

            "id",

            visitorID

        );






        if(error){

            throw error;

        }





        await createAuditLog(

            "VISITOR_RECORD_DELETED",

            visitorID

        );






        showNotification(

            "Visitor record deleted",

            "success"

        );





    }
    catch(error){


        handleError(error);


    }


}







// =====================================
// REAL-TIME VISITOR UPDATES
// =====================================


function setupVisitorRealtime(){


    supabaseClient

    .channel(

        "visitor-live"

    )

    .on(

        "postgres_changes",

        {


            event:"*",


            schema:"public",


            table:"visitors"


        },


        payload=>{


            console.log(

                "Visitor update:",

                payload

            );



            showNotification(

                "Visitor records updated",

                "success"

            );



        }

    )

    .subscribe();



}







// =====================================
// VISITOR STATISTICS
// =====================================


async function loadVisitorStatistics(){


    try{


        const {

            count:total

        } =
        await supabaseClient
        .from("visitors")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        );







        const {

            count:active

        } =
        await supabaseClient
        .from("visitors")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        )
        .eq(

            "status",

            "checked_in"

        );







        return {


            total:

            total || 0,


            active:

            active || 0


        };



    }
    catch(error){


        console.error(

            "Visitor statistics error",

            error

        );


    }


}







// =====================================
// INITIALIZE VISITOR SYSTEM
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupVisitorRealtime();


});








// =====================================
// EXPORT FUNCTIONS
// =====================================


window.checkInVisitor =
checkInVisitor;


window.checkOutVisitor =
checkOutVisitor;


window.searchVisitors =
searchVisitors;


window.getActiveVisitors =
getActiveVisitors;


window.filterVisitors =
filterVisitors;


window.deleteVisitor =
deleteVisitor;


window.setupVisitorRealtime =
setupVisitorRealtime;


window.loadVisitorStatistics =
loadVisitorStatistics;
