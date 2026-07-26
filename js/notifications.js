/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
NOTIFICATION MANAGEMENT MODULE
=====================================================

Functions:
- Load notifications
- Display notification panel
- Mark notifications as read
- Delete notifications
- Real-time notification alerts
- User notification history

=====================================================
*/






// =====================================
// NOTIFICATION INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupNotificationButton();


    loadNotifications();


    setupNotificationRealtime();


});







// =====================================
// OPEN NOTIFICATION PANEL
// =====================================


function setupNotificationButton(){


    const button =
    document.getElementById(
        "notificationButton"
    );



    const panel =
    document.getElementById(
        "notificationPanel"
    );



    const closeButton =
    document.getElementById(
        "closeNotifications"
    );





    if(button){


        button.addEventListener(

            "click",

            ()=>{


                panel.classList.toggle(
                    "active"
                );


                loadNotifications();


            }

        );


    }





    if(closeButton){


        closeButton.addEventListener(

            "click",

            ()=>{


                panel.classList.remove(
                    "active"
                );


            }

        );


    }


}







// =====================================
// LOAD USER NOTIFICATIONS
// =====================================


async function loadNotifications(){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();





        let query =
        supabaseClient
        .from("notifications")
        .select("*")
        .order(

            "created_at",

            {

            ascending:false

            }

        )
        .limit(20);





        if(user.user){


            query =
            query.eq(

                "user_id",

                user.user.id

            );


        }







        const {

            data,

            error

        } =
        await query;






        if(error){

            throw error;

        }





        displayNotifications(
            data
        );





    }
    catch(error){


        console.error(

            "Notification loading error",

            error

        );


    }


}







// =====================================
// DISPLAY NOTIFICATIONS
// =====================================


function displayNotifications(
notifications
){


    const container =
    document.getElementById(
        "notificationList"
    );





    if(!container)
    return;





    container.innerHTML="";







    if(
        !notifications ||
        notifications.length===0
    ){


        container.innerHTML =


        `

        <p>
        No notifications available
        </p>

        `;


        return;


    }






    notifications.forEach(

        notification=>{


            container.innerHTML +=


            `

            <div 
            class="notification-item"
            onclick="markNotificationRead('${notification.id}')">


            <h4>

            ${notification.title || "Notification"}

            </h4>


            <p>

            ${notification.message}

            </p>


            <small>

            ${formatDate(notification.created_at)}

            </small>



            </div>

            `;



        }

    );



}







// =====================================
// MARK NOTIFICATION AS READ
// =====================================


async function markNotificationRead(

notificationID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("notifications")
        .update({


            read:

            true



        })
        .eq(

            "id",

            notificationID

        );






        if(error){

            throw error;

        }






        updateNotificationBadge();


        loadNotifications();





    }
    catch(error){


        console.error(

            "Mark notification error",

            error

        );


    }


}







// =====================================
// MARK ALL NOTIFICATIONS READ
// =====================================


async function markAllNotificationsRead(){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();





        if(!user.user)
        return;







        const {

            error

        } =
        await supabaseClient
        .from("notifications")
        .update({


            read:

            true



        })
        .eq(

            "user_id",

            user.user.id

        );







        if(error){

            throw error;

        }






        updateNotificationBadge();


        loadNotifications();





    }
    catch(error){


        handleError(error);


    }


}








// =====================================
// DELETE NOTIFICATION
// =====================================


async function deleteNotification(

notificationID

){


    try{


        const {

            error

        } =
        await supabaseClient
        .from("notifications")
        .delete()
        .eq(

            "id",

            notificationID

        );







        if(error){

            throw error;

        }






        loadNotifications();


        updateNotificationBadge();





    }
    catch(error){


        handleError(error);


    }


}

/*
=====================================================
NOTIFICATION ADVANCED FEATURES
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Real-time notifications
- Browser alerts
- Notification sound
- Notification statistics
- Automatic refresh

=====================================================
*/






// =====================================
// REAL-TIME NOTIFICATION LISTENER
// =====================================


function setupNotificationRealtime(){


    try{


        supabaseClient

        .channel(

            "notifications-realtime"

        )

        .on(

            "postgres_changes",

            {


                event:"INSERT",


                schema:"public",


                table:"notifications"



            },


            payload=>{


                const notification =
                payload.new;



                displayNewNotificationAlert(
                    notification
                );



                updateNotificationBadge();



                loadNotifications();



            }


        )

        .subscribe();




    }
    catch(error){


        console.error(

            "Notification realtime error",

            error

        );


    }


}







// =====================================
// DISPLAY LIVE ALERT
// =====================================


function displayNewNotificationAlert(

notification

){



    showNotification(

        notification.message,

        "success"

    );



    playNotificationSound();



    if(
        Notification.permission ===
        "granted"
    ){


        new Notification(

            notification.title ||

            "KMU Health Centre",

            {


                body:

                notification.message



            }

        );


    }


}







// =====================================
// REQUEST BROWSER NOTIFICATION ACCESS
// =====================================


async function requestNotificationPermission(){


    if(
        "Notification" in window
    ){


        const permission =
        await Notification.requestPermission();



        return permission;


    }


    return null;


}







// =====================================
// NOTIFICATION SOUND
// =====================================


function playNotificationSound(){


    try{


        const audio =
        new Audio(

        "assets/audio/notification.mp3"

        );


        audio.play();



    }
    catch(error){


        console.log(

            "Sound unavailable"

        );


    }


}







// =====================================
// GET NOTIFICATION STATISTICS
// =====================================


async function getNotificationStatistics(){


    try{


        const {

            count:total

        } =
        await supabaseClient
        .from("notifications")
        .select(

            "*",

            {

                count:"exact",

                head:true

            }

        );






        const {

            count:unread

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







        return {


            total:

            total || 0,



            unread:

            unread || 0



        };





    }
    catch(error){


        console.error(

            "Notification statistics error",

            error

        );


    }


}







// =====================================
// CLEAR OLD NOTIFICATIONS
// =====================================


async function clearOldNotifications(){


    try{


        const oldDate =
        new Date();



        oldDate.setDate(

            oldDate.getDate()-30

        );






        const {

            error

        } =
        await supabaseClient
        .from("notifications")
        .delete()
        .lt(

            "created_at",

            oldDate.toISOString()

        );







        if(error){

            throw error;

        }






        showNotification(

            "Old notifications removed",

            "success"

        );



    }
    catch(error){


        console.error(

            "Clear notification error",

            error

        );


    }


}







// =====================================
// AUTO REFRESH NOTIFICATIONS
// =====================================


function startNotificationRefresh(){


    setInterval(

        ()=>{


            loadNotifications();


            updateNotificationBadge();


        },

        60000

    );


}







// =====================================
// INITIALIZE NOTIFICATIONS
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    requestNotificationPermission();



    startNotificationRefresh();



});








// =====================================
// EXPORT FUNCTIONS
// =====================================


window.loadNotifications =
loadNotifications;


window.markNotificationRead =
markNotificationRead;


window.markAllNotificationsRead =
markAllNotificationsRead;


window.deleteNotification =
deleteNotification;


window.setupNotificationRealtime =
setupNotificationRealtime;


window.requestNotificationPermission =
requestNotificationPermission;


window.getNotificationStatistics =
getNotificationStatistics;


window.clearOldNotifications =
clearOldNotifications;

