/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
SECURITY MANAGEMENT MODULE
=====================================================

Functions:
- Security monitoring
- Login protection
- Failed login tracking
- Audit logging
- User activity tracking
- Session monitoring
- Access control

=====================================================
*/






// =====================================
// SECURITY INITIALIZATION
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    initializeSecurity();


});







// =====================================
// INITIALIZE SECURITY SYSTEM
// =====================================


async function initializeSecurity(){


    try{


        await monitorSession();


        await checkAccountSecurity();


        console.log(

            "Security module initialized"

        );



    }
    catch(error){


        console.error(

            "Security initialization error",

            error

        );


    }


}







// =====================================
// CREATE AUDIT LOG
// =====================================


async function createAuditLog(

action,

details,

severity="normal"

){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();







        await supabaseClient
        .from("audit_logs")
        .insert({



            user_id:

            user.user?.id || null,



            action:

            action,



            details:

            details,



            severity:

            severity,



            device:

            navigator.userAgent,



            ip_address:

            null,



            created_at:

            new Date()



        });






    }
    catch(error){


        console.error(

            "Audit log error",

            error

        );


    }


}







// =====================================
// SESSION MONITORING
// =====================================


async function monitorSession(){


    try{


        const {

            data

        } =
        await supabaseClient
        .auth
        .getSession();






        if(

            data.session

        ){


            await createAuditLog(

                "SESSION_STARTED",

                "User session active"

            );


        }



    }
    catch(error){


        console.error(

            "Session monitor error",

            error

        );


    }


}







// =====================================
// FAILED LOGIN TRACKING
// =====================================


async function recordFailedLogin(

email

){


    try{


        await supabaseClient
        .from("security_events")
        .insert({



            event_type:

            "FAILED_LOGIN",



            email:

            email,



            device:

            navigator.userAgent,



            created_at:

            new Date()



        });






        await createAuditLog(

            "FAILED_LOGIN_ATTEMPT",

            email,

            "high"

        );





    }
    catch(error){


        console.error(

            "Failed login record error",

            error

        );


    }


}







// =====================================
// SUCCESSFUL LOGIN TRACKING
// =====================================


async function recordSuccessfulLogin(

email

){


    try{


        await createAuditLog(

            "SUCCESSFUL_LOGIN",

            email

        );





        await supabaseClient
        .from("security_events")
        .insert({



            event_type:

            "SUCCESSFUL_LOGIN",



            email:

            email,



            device:

            navigator.userAgent,



            created_at:

            new Date()



        });





    }
    catch(error){


        console.error(

            "Successful login logging error",

            error

        );


    }


}







// =====================================
// CHECK ACCOUNT SECURITY
// =====================================


async function checkAccountSecurity(){


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

            data:events

        } =
        await supabaseClient
        .from("security_events")
        .select("*")
        .eq(

            "email",

            user.user.email

        )
        .eq(

            "event_type",

            "FAILED_LOGIN"

        )
        .order(

            "created_at",

            {

            ascending:false

            }

        )
        .limit(5);






        if(
            events &&
            events.length >= 5
        ){


            showNotification(

                "Multiple failed login attempts detected",

                "error"

            );



        }





    }
    catch(error){


        console.error(

            "Account security check error",

            error

        );


    }


}







// =====================================
// DEVICE INFORMATION
// =====================================


function getDeviceInformation(){


    return {


        browser:

        navigator.appName,



        platform:

        navigator.platform,



        language:

        navigator.language,



        userAgent:

        navigator.userAgent



    };


}







// =====================================
// USER ACTIVITY TRACKING
// =====================================


function trackUserActivity(){


    const events = [

        "click",

        "keypress",

        "scroll",

        "mousemove"


    ];






    events.forEach(

        event=>{


            document.addEventListener(

                event,

                ()=>{


                    sessionStorage.setItem(

                        "last_activity",

                        new Date()

                    );


                }

            );


        }

    );



}







// =====================================
// LOGOUT SECURITY
// =====================================


async function secureLogout(){


    try{


        await createAuditLog(

            "USER_LOGOUT",

            "User logged out"

        );






        await supabaseClient
        .auth
        .signOut();







        window.location.href =
        "index.html";





    }
    catch(error){


        console.error(

            "Logout error",

            error

        );


    }


}
/*
=====================================================
SECURITY ADVANCED MANAGEMENT
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================

Functions:
- Role permissions
- Unauthorized access prevention
- Suspicious activity detection
- Data access monitoring
- Security alerts

=====================================================
*/






// =====================================
// ROLE PERMISSION CHECK
// =====================================


async function checkPermission(

requiredRole

){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();






        if(!user.user){


            return false;


        }







        const {

            data:profile,

            error

        } =
        await supabaseClient
        .from("profiles")
        .select(

            "role"

        )
        .eq(

            "id",

            user.user.id

        )
        .single();







        if(error){

            throw error;

        }






        return profile.role === requiredRole;






    }
    catch(error){


        console.error(

            "Permission check error",

            error

        );



        return false;



    }


}







// =====================================
// PROTECT PAGE ACCESS
// =====================================


async function protectPage(

allowedRoles

){


    try{


        const {

            data:user

        } =
        await supabaseClient
        .auth
        .getUser();






        if(!user.user){



            window.location.href =
            "login.html";



            return;



        }







        const {

            data:profile

        } =
        await supabaseClient
        .from("profiles")
        .select(

            "role"

        )
        .eq(

            "id",

            user.user.id

        )
        .single();






        if(
            !allowedRoles.includes(
                profile.role
            )
        ){


            await createAuditLog(

                "UNAUTHORIZED_ACCESS",

                window.location.pathname,

                "high"

            );





            showNotification(

                "Access denied",

                "error"

            );





            window.location.href =
            "index.html";





            return false;


        }






        return true;



    }
    catch(error){


        console.error(

            "Page protection error",

            error

        );


        return false;


    }


}







// =====================================
// DATA ACCESS MONITORING
// =====================================


async function monitorDataAccess(

tableName,

recordID

){


    try{


        await createAuditLog(

            "DATA_ACCESS",

            `Accessed ${tableName} record ${recordID}`

        );




    }
    catch(error){


        console.error(

            "Data monitoring error",

            error

        );


    }


}







// =====================================
// SUSPICIOUS ACTIVITY DETECTION
// =====================================


async function detectSuspiciousActivity(){


    try{


        const {

            data

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
        .limit(100);






        let suspicious = 0;






        data.forEach(

            log=>{


                if(

                    log.action ===
                    "FAILED_LOGIN_ATTEMPT"

                ){


                    suspicious++;


                }



                if(

                    log.action ===
                    "UNAUTHORIZED_ACCESS"

                ){


                    suspicious++;


                }



            }

        );








        if(
            suspicious >= 10
        ){



            await createSecurityAlert(

                "High suspicious activity detected"

            );



        }





        return suspicious;



    }
    catch(error){


        console.error(

            "Suspicious activity error",

            error

        );



        return 0;


    }


}







// =====================================
// CREATE SECURITY ALERT
// =====================================


async function createSecurityAlert(

message

){


    try{


        await supabaseClient
        .from("security_alerts")
        .insert({



            message:

            message,



            severity:

            "high",



            status:

            "open",



            created_at:

            new Date()



        });







        await createAuditLog(

            "SECURITY_ALERT_CREATED",

            message,

            "high"

        );






    }
    catch(error){


        console.error(

            "Security alert error",

            error

        );


    }


}







// =====================================
// PASSWORD POLICY CHECK
// =====================================


function validatePassword(

password

){


    const rules = {


        length:

        password.length >= 8,



        uppercase:

        /[A-Z]/.test(password),



        lowercase:

        /[a-z]/.test(password),



        number:

        /[0-9]/.test(password),



        special:

        /[^A-Za-z0-9]/.test(password)



    };






    return rules;



}







// =====================================
// CHECK STRONG PASSWORD
// =====================================


function isStrongPassword(

password

){


    const rules =
    validatePassword(
        password
    );





    return Object.values(
        rules
    )
    .every(

        value=>value===true

    );



}







// =====================================
// TRACK USER ACTIVITY START
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    trackUserActivity();



});







// =====================================
// EXPORT SECURITY FUNCTIONS
// =====================================


window.createAuditLog =
createAuditLog;


window.recordFailedLogin =
recordFailedLogin;


window.recordSuccessfulLogin =
recordSuccessfulLogin;


window.checkPermission =
checkPermission;


window.protectPage =
protectPage;


window.monitorDataAccess =
monitorDataAccess;


window.detectSuspiciousActivity =
detectSuspiciousActivity;


window.createSecurityAlert =
createSecurityAlert;


window.validatePassword =
validatePassword;


window.isStrongPassword =
isStrongPassword;


window.secureLogout =
secureLogout;