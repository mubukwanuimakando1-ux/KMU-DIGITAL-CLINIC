/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
MAIN APPLICATION MODULE
=====================================================

Functions:
- Homepage initialization
- Statistics loading
- Announcements
- Queue monitoring
- Real-time database updates
- Dashboard data preparation

=====================================================
*/





// =====================================
// APPLICATION START
// =====================================


document.addEventListener(

"DOMContentLoaded",

async()=>{


    try{


        await loadStatistics();


        await loadAnnouncements();


        await loadQueue();



        setupRealtimeUpdates();



    }
    catch(error){


        console.error(
            "Application startup error:",
            error
        );


    }


});







// =====================================
// LOAD SYSTEM STATISTICS
// =====================================


async function loadStatistics(){


    try{


        const today =
        getCurrentDate();





        // Patients today


        const {

            count:patients

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
        .gte(
            "created_at",
            today
        );





        // Waiting patients


        const {

            count:waiting

        } =
        await supabaseClient
        .from("queue")
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






        // Completed patients


        const {

            count:completed

        } =
        await supabaseClient
        .from("queue")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        )
        .eq(
            "status",
            "completed"
        );






        // Medicine stock


        const {

            count:medicine

        } =
        await supabaseClient
        .from("medicine_inventory")
        .select(
            "*",
            {
                count:"exact",
                head:true
            }
        );







        updateElement(

            "todayPatients",

            patients || 0

        );



        updateElement(

            "waitingPatients",

            waiting || 0

        );



        updateElement(

            "completedPatients",

            completed || 0

        );



        updateElement(

            "medicineStock",

            medicine || 0

        );





    }
    catch(error){


        console.error(

            "Statistics Error:",
            error

        );


    }


}







// =====================================
// UPDATE HTML ELEMENT
// =====================================


function updateElement(
    id,
    value
){


    const element =
    document.getElementById(id);



    if(element){


        element.innerHTML =
        value;


    }


}







// =====================================
// LOAD ANNOUNCEMENTS
// =====================================


async function loadAnnouncements(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("announcements")
        .select("*")
        .order(
            "created_at",
            {
                ascending:false
            }
        )
        .limit(6);





        if(error)
        throw error;





        const container =
        document.getElementById(
            "announcementContainer"
        );



        if(!container)
        return;





        container.innerHTML="";





        if(!data || data.length===0){


            container.innerHTML =

            `

            <div class="announcement-card">

            <h3>No announcements available</h3>

            <p>
            Health centre announcements will appear here.
            </p>

            </div>

            `;


            return;


        }





        data.forEach(item=>{


            container.innerHTML +=


            `

            <div class="announcement-card">


            <h3>
            ${item.title}
            </h3>


            <p>
            ${item.message}
            </p>


            <small>

            ${formatDate(item.created_at)}

            </small>


            </div>


            `;



        });





    }
    catch(error){


        console.error(

            "Announcement Error:",
            error

        );


    }


}






// =====================================
// LOAD QUEUE MONITOR
// =====================================


async function loadQueue(){


    try{


        const {

            data,

            error

        } =
        await supabaseClient
        .from("queue")
        .select("*")
        .order(
            "created_at",
            {
                ascending:true
            }
        )
        .limit(20);





        if(error)
        throw error;





        const table =
        document.getElementById(
            "queueTable"
        );




        if(!table)
        return;





        table.innerHTML="";





        if(!data || data.length===0){


            table.innerHTML =

            `

            <tr>

            <td colspan="5">

            No patients currently in queue

            </td>

            </tr>

            `;


            return;


        }






        data.forEach(patient=>{


            table.innerHTML +=


            `

            <tr>


            <td>

            ${patient.queue_number || "-"}

            </td>



            <td>

            ${patient.patient_name || "-"}

            </td>



            <td>

            ${patient.department || "-"}

            </td>



            <td>

            ${patient.status || "-"}

            </td>



            <td>

            ${patient.waiting_time || "0"} mins

            </td>



            </tr>

            `;



        });





    }
    catch(error){


        console.error(

            "Queue Error:",
            error

        );


    }




   /*
=====================================================
REAL-TIME APPLICATION FEATURES
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/





// =====================================
// SUPABASE REAL-TIME UPDATES
// =====================================


function setupRealtimeUpdates(){


    try{


        // Queue updates


        supabaseClient

        .channel(
            "queue-live"
        )

        .on(

            "postgres_changes",

            {

                event:"*",

                schema:"public",

                table:"queue"

            },

            ()=>{


                loadQueue();


                loadStatistics();


            }

        )

        .subscribe();







        // Announcements updates


        supabaseClient

        .channel(
            "announcement-live"
        )

        .on(

            "postgres_changes",

            {

                event:"*",

                schema:"public",

                table:"announcements"

            },

            ()=>{


                loadAnnouncements();


            }

        )

        .subscribe();








        // Notifications updates


        supabaseClient

        .channel(
            "notification-live"
        )

        .on(

            "postgres_changes",

            {

                event:"INSERT",

                schema:"public",

                table:"notifications"

            },

            (payload)=>{


                showNotification(

                    payload.new.message,

                    "success"

                );



                updateNotificationBadge();


            }

        )

        .subscribe();





    }
    catch(error){


        console.error(

            "Realtime setup error:",

            error

        );


    }


}







// =====================================
// CONTACT FORM
// =====================================


async function submitContactMessage(event){


    event.preventDefault();



    const name =
    document.getElementById(
        "contactName"
    ).value;



    const email =
    document.getElementById(
        "contactEmail"
    ).value;



    const message =
    document.getElementById(
        "contactMessage"
    ).value;





    try{


        const {

            error

        } =
        await supabaseClient
        .from("contact_messages")
        .insert({


            name:name,


            email:email,


            message:message,


            status:"new",


            created_at:
            new Date()



        });






        if(error)
        throw error;






        await createAuditLog(

            "CONTACT_MESSAGE_SENT",

            email

        );






        showNotification(

            "Message sent successfully",

            "success"

        );





        document
        .getElementById(
            "contactForm"
        )
        .reset();





    }
    catch(error){



        handleError(error);



    }


}







// =====================================
// UPDATE NOTIFICATION BADGE
// =====================================


async function updateNotificationBadge(){


    try{


        const {

            count

        } =
        await supabaseClient
        .from("notifications")
        .select(

            "*",

            {

            count:"exact",

            head:true

            }

        )
        .eq(

            "read",

            false

        );





        const badge =
        document.getElementById(
            "notificationBadge"
        );





        if(badge){


            badge.innerHTML =
            count || 0;



            if(count===0){


                badge.style.display =
                "none";


            }
            else{


                badge.style.display =
                "flex";


            }


        }




    }
    catch(error){


        console.error(

            "Notification badge error",

            error

        );


    }


}






// =====================================
// BOOK APPOINTMENT BUTTON
// =====================================


function setupHomeButtons(){



    const bookButton =
    document.getElementById(
        "bookAppointment"
    );



    if(bookButton){


        bookButton.addEventListener(

            "click",

            ()=>{


                document
                .getElementById(
                    "appointment"
                )
                ?.scrollIntoView({

                    behavior:"smooth"

                });


            }

        );


    }







    const visitorButton =
    document.getElementById(
        "registerVisitor"
    );



    if(visitorButton){


        visitorButton.addEventListener(

            "click",

            ()=>{


                document
                .getElementById(
                    "visitorRegistration"
                )
                ?.scrollIntoView({

                    behavior:"smooth"

                });


            }

        );


    }


}







// =====================================
// SMOOTH NAVIGATION
// =====================================


function setupNavigation(){


    document

    .querySelectorAll(
        "nav a"
    )

    .forEach(link=>{


        link.addEventListener(

            "click",

            function(e){


                const target =
                document.querySelector(

                    this.getAttribute(
                        "href"
                    )

                );



                if(target){


                    e.preventDefault();



                    target.scrollIntoView({

                        behavior:"smooth"

                    });


                }


            }

        );


    });


}






// =====================================
// INITIAL APPLICATION SETTINGS
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupHomeButtons();


    setupNavigation();


    updateNotificationBadge();



    const contactForm =
    document.getElementById(
        "contactForm"
    );



    if(contactForm){


        contactForm.addEventListener(

            "submit",

            submitContactMessage

        );


    }



});







// =====================================
// EXPORT FUNCTIONS
// =====================================


window.loadStatistics =
loadStatistics;


window.loadAnnouncements =
loadAnnouncements;


window.loadQueue =
loadQueue;


window.setupRealtimeUpdates =
setupRealtimeUpdates;


window.submitContactMessage =
submitContactMessage;


window.updateNotificationBadge =
updateNotificationBadge;
}
