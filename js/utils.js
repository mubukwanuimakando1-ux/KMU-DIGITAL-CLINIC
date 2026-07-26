/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
UTILITY FUNCTIONS
=====================================================

This file contains reusable functions used by:
- Authentication
- App Dashboard
- Appointments
- Visitors
- Notifications
- AI Assistant

=====================================================
*/



// =====================================
// PAGE LOADER CONTROL
// =====================================


function hideLoader(){


    const loader =
    document.getElementById("loader");


    if(loader){

        loader.style.display="none";

    }

}




function showLoader(){


    const loader =
    document.getElementById("loader");


    if(loader){

        loader.style.display="flex";

    }

}





// =====================================
// DATE AND TIME FUNCTIONS
// =====================================


function getCurrentDate(){


    const date =
    new Date();


    return date
    .toISOString()
    .split("T")[0];


}





function getCurrentDateTime(){


    const date =
    new Date();


    return date.toLocaleString(
        "en-GB",
        {
            timeZone:
            "Africa/Lusaka"
        }
    );


}





function formatDate(date){


    if(!date)
    return "";


    return new Date(date)
    .toLocaleDateString(
        "en-GB"
    );


}





function formatTime(date){


    if(!date)
    return "";


    return new Date(date)
    .toLocaleTimeString(
        "en-GB",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );


}






// =====================================
// UNIQUE ID GENERATOR
// =====================================


function generateID(prefix="KMU"){


    const random =
    Math.floor(
        Math.random()*100000
    );


    return `${prefix}-${Date.now()}-${random}`;


}






// =====================================
// INPUT VALIDATION
// =====================================


function validateEmail(email){


    const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return pattern.test(email);


}





function validatePhone(phone){


    const pattern =
    /^[0-9+\s]{9,15}$/;


    return pattern.test(phone);


}





function validatePassword(password){


    return (

        password.length >= 8 &&

        /[A-Z]/.test(password) &&

        /[a-z]/.test(password) &&

        /[0-9]/.test(password)

    );


}





// =====================================
// PASSWORD VISIBILITY TOGGLE
// =====================================


function togglePassword(inputID){


    const input =
    document.getElementById(inputID);



    if(input.type==="password"){


        input.type="text";


    }
    else{


        input.type="password";


    }


}







// =====================================
// DEVICE INFORMATION
// =====================================


function getDeviceInfo(){


    return {


        browser:
        navigator.userAgent,


        platform:
        navigator.platform,


        language:
        navigator.language,


        screen:
        `${screen.width}x${screen.height}`


    };


}





// =====================================
// LOCATION SERVICE
// =====================================


async function getUserLocation(){


    return new Promise(
        (resolve)=>{


        if(!navigator.geolocation){


            resolve(
                "Location unavailable"
            );


            return;


        }




        navigator.geolocation.getCurrentPosition(

            position=>{


                resolve({

                    latitude:
                    position.coords.latitude,


                    longitude:
                    position.coords.longitude


                });


            },


            ()=>{


                resolve(
                    "Permission denied"
                );


            }


        );


    });


}






// =====================================
// SECURITY AUDIT LOGGING
// =====================================


async function createAuditLog(
    action,
    details=""
){


    try{


        const user =
        await supabaseClient
        .auth
        .getUser();



        const device =
        getDeviceInfo();



        const location =
        await getUserLocation();




        await supabaseClient
        .from("audit_logs")
        .insert({


            user_id:
            user.data.user?.id || null,


            action:
            action,


            details:
            details,


            device:
            JSON.stringify(device),


            location:
            JSON.stringify(location),


            created_at:
            new Date()


        });



    }
    catch(error){


        console.error(
            "Audit Error:",
            error
        );


    }


}






// =====================================
// ERROR HANDLING
// =====================================


function handleError(error){


    console.error(error);


    showNotification(
        "Something went wrong. Please try again.",
        "error"
    );


}






// =====================================
// LOCAL STORAGE HELPERS
// =====================================


function saveLocal(
    key,
    value
){


    localStorage.setItem(
        key,
        JSON.stringify(value)
    );


}




function getLocal(key){


    const data =
    localStorage.getItem(key);


    return data ?
    JSON.parse(data)
    :
    null;


}




function removeLocal(key){


    localStorage.removeItem(key);


}






// =====================================
// EXPORT FUNCTIONS
// =====================================


window.hideLoader =
hideLoader;


window.showLoader =
showLoader;


window.getCurrentDate =
getCurrentDate;


window.getCurrentDateTime =
getCurrentDateTime;


window.formatDate =
formatDate;


window.formatTime =
formatTime;


window.generateID =
generateID;


window.validateEmail =
validateEmail;


window.validatePhone =
validatePhone;


window.validatePassword =
validatePassword;


window.togglePassword =
togglePassword;


window.getDeviceInfo =
getDeviceInfo;


window.getUserLocation =
getUserLocation;


window.createAuditLog =
createAuditLog;


window.handleError =
handleError;


window.saveLocal =
saveLocal;


window.getLocal =
getLocal;


window.removeLocal =
removeLocal;
