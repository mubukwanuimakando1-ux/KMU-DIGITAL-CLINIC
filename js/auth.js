/*
=====================================================
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
AUTHENTICATION MODULE
=====================================================

Functions:
- User Registration
- Login
- Logout
- Session Management
- Password Reset
- Role Management
- Security Monitoring

Backend:
Supabase Authentication

=====================================================
*/





// =====================================
// CURRENT USER SESSION
// =====================================


let currentUser = null;

let currentProfile = null;






// =====================================
// CHECK EXISTING SESSION
// =====================================


async function checkSession(){


    try{


        const {

            data,

            error

        } = await supabaseClient
        .auth
        .getSession();




        if(error){

            throw error;

        }




        if(data.session){


            currentUser =
            data.session.user;



            await loadUserProfile(
                currentUser.id
            );


        }




    }
    catch(error){


        console.error(
            "Session Error:",
            error
        );


    }


}







// =====================================
// LOAD USER PROFILE
// =====================================


async function loadUserProfile(
    userID
){


    try{


        const {

            data,

            error

        } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq(
            "id",
            userID
        )
        .single();




        if(error){

            throw error;

        }




        currentProfile =
        data;



        window.currentProfile =
        data;



        return data;



    }
    catch(error){


        console.error(
            "Profile Loading Error:",
            error
        );


    }


}







// =====================================
// USER REGISTRATION
// =====================================


async function registerUser(event){


    event.preventDefault();



    const name =
    document.getElementById(
        "signupName"
    ).value;



    const email =
    document.getElementById(
        "signupEmail"
    ).value;



    const phone =
    document.getElementById(
        "signupPhone"
    ).value;



    const role =
    document.getElementById(
        "signupRole"
    ).value;



    const password =
    document.getElementById(
        "signupPassword"
    ).value;





    if(!validateEmail(email)){


        showNotification(
            "Invalid email address",
            "error"
        );


        return;


    }





    if(!validatePassword(password)){


        showNotification(

        "Password must contain at least 8 characters, uppercase, lowercase and number",

        "error"

        );


        return;


    }





    try{


        showLoader();



        const {

            data,

            error

        } = await supabaseClient
        .auth
        .signUp({

            email:

            email,


            password:

            password,


            options:{


                data:{


                    full_name:

                    name,


                    role:

                    role,


                    phone:

                    phone


                }


            }


        });





        if(error){

            throw error;

        }





        await createAuditLog(

            "ACCOUNT_CREATED",

            `New account created for ${email}`

        );





        showNotification(

            "Account created successfully. Check email verification.",

            "success"

        );




        document
        .getElementById(
            "signupForm"
        )
        .reset();



    }
    catch(error){


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
// LOGIN USER
// =====================================


async function loginUser(event){


    event.preventDefault();




    const email =
    document.getElementById(
        "loginEmail"
    ).value;




    const password =
    document.getElementById(
        "loginPassword"
    ).value;





    try{


        showLoader();



        const {

            data,

            error

        } = await supabaseClient
        .auth
        .signInWithPassword({

            email:

            email,


            password:

            password


        });






        if(error){


            await createAuditLog(

                "FAILED_LOGIN",

                email

            );



            throw error;


        }





        currentUser =
        data.user;



        await loadUserProfile(
            currentUser.id
        );





        await createAuditLog(

            "SUCCESSFUL_LOGIN",

            email

        );





        showNotification(

            "Login successful",

            "success"

        );




        closeAllModals();



        setTimeout(()=>{


            window.location.href =
            "dashboard.html";


        },1000);





    }
    catch(error){



        showNotification(

            "Invalid email or password",

            "error"

        );



    }
    finally{


        hideLoader();


    }


}






// =====================================
// LOGOUT
// =====================================


async function logoutUser(){


    try{


        await createAuditLog(

            "USER_LOGOUT",

            currentUser?.email

        );




        await supabaseClient
        .auth
        .signOut();




        currentUser=null;

        currentProfile=null;



        window.location.href =
        "index.html";



    }
    catch(error){


        console.error(error);


    }


}






// =====================================
// PASSWORD RESET
// =====================================


async function resetPassword(event){


    event.preventDefault();



    const email =
    document.getElementById(
        "forgotEmail"
    ).value;




    try{


        const {

            error

        } = await supabaseClient
        .auth
        .resetPasswordForEmail(

            email,

            {

            redirectTo:

            window.location.origin

            }

        );





        if(error){

            throw error;

        }




        showNotification(

            "Password reset link sent",

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
// ROLE PERMISSION CHECK
// =====================================


function hasRole(role){


    if(!currentProfile)

    return false;



    return currentProfile.role === role;


}





function requireRole(role){


    if(!hasRole(role)){


        showNotification(

            "Access denied",

            "error"

        );


        setTimeout(()=>{


            window.location.href =
            "index.html";


        },2000);



        return false;


    }


    return true;


}






// =====================================
// CLOSE ALL MODALS
// =====================================


function closeAllModals(){


    document
    .querySelectorAll(".modal")
    .forEach(

        modal=>{

            modal.style.display="none";

        }

    );


}






// =====================================
// EXPORT FUNCTIONS
// =====================================


window.checkSession =
checkSession;


window.registerUser =
registerUser;


window.loginUser =
loginUser;


window.logoutUser =
logoutUser;


window.resetPassword =
resetPassword;


window.hasRole =
hasRole;


window.requireRole =
requireRole;


window.closeAllModals =
closeAllModals;

/*
=====================================================
AUTHENTICATION UI CONTROLS
KMU DIGITAL HEALTH CENTRE MANAGEMENT SYSTEM
=====================================================
*/



// =====================================
// LOGIN MODAL CONTROL
// =====================================


function openLoginModal(){


    const modal =
    document.getElementById(
        "loginModal"
    );


    if(modal){

        modal.style.display="flex";

    }


}





function closeLoginModal(){


    const modal =
    document.getElementById(
        "loginModal"
    );


    if(modal){

        modal.style.display="none";

    }


}





// =====================================
// SIGNUP MODAL CONTROL
// =====================================


function openSignupModal(){


    closeLoginModal();



    const modal =
    document.getElementById(
        "signupModal"
    );


    if(modal){

        modal.style.display="flex";

    }


}





function closeSignupModal(){


    const modal =
    document.getElementById(
        "signupModal"
    );


    if(modal){

        modal.style.display="none";

    }


}







// =====================================
// FORGOT PASSWORD MODAL
// =====================================


function openForgotModal(){


    closeLoginModal();



    const modal =
    document.getElementById(
        "forgotModal"
    );


    if(modal){

        modal.style.display="flex";

    }


}





function closeForgotModal(){


    const modal =
    document.getElementById(
        "forgotModal"
    );


    if(modal){

        modal.style.display="none";

    }


}







// =====================================
// PASSWORD VISIBILITY
// =====================================


function setupPasswordToggle(){


    const icon =
    document.getElementById(
        "showPassword"
    );


    const password =
    document.getElementById(
        "loginPassword"
    );



    if(icon && password){


        icon.addEventListener(

            "click",

            ()=>{


                if(
                    password.type === "password"
                ){


                    password.type="text";


                    icon.classList.remove(
                        "fa-eye"
                    );


                    icon.classList.add(
                        "fa-eye-slash"
                    );


                }
                else{


                    password.type="password";


                    icon.classList.remove(
                        "fa-eye-slash"
                    );


                    icon.classList.add(
                        "fa-eye"
                    );


                }


            }

        );


    }


}







// =====================================
// FAILED LOGIN MONITORING
// =====================================


let loginAttempts = 0;


function monitorLoginAttempts(){


    loginAttempts++;



    if(
        loginAttempts >=
        KMU_CONFIG.maxLoginAttempts
    ){


        showNotification(

        "Too many failed attempts. Please wait before trying again.",

        "error"

        );



        document
        .getElementById(
            "loginButton"
        )
        ?.setAttribute(
            "disabled",
            true
        );



        setTimeout(()=>{


            loginAttempts=0;



            document
            .getElementById(
                "loginButton"
            )
            ?.removeAttribute(
                "disabled"
            );



        },60000);



    }


}







// =====================================
// SESSION LISTENER
// =====================================


function setupSessionListener(){


    supabaseClient
    .auth
    .onAuthStateChange(

        async(
            event,
            session
        )=>{


            if(session){


                currentUser =
                session.user;



                await loadUserProfile(
                    session.user.id
                );



            }
            else{


                currentUser=null;


                currentProfile=null;


            }


        }


    );


}







// =====================================
// UPDATE USER INFORMATION
// =====================================


function updateUserInterface(){


    const loginButton =
    document.getElementById(
        "loginButton"
    );



    if(
        loginButton &&
        currentProfile
    ){


        loginButton.innerHTML =

        `

        ${currentProfile.full_name}

        `;



        loginButton.onclick =
        ()=>{


            window.location.href =
            "dashboard.html";


        };



    }


}







// =====================================
// CLOSE MODAL WHEN CLICK OUTSIDE
// =====================================


window.addEventListener(

"click",

(event)=>{


    const modals =
    document.querySelectorAll(
        ".modal"
    );



    modals.forEach(

        modal=>{


            if(
                event.target === modal
            ){


                modal.style.display =
                "none";


            }


        }

    );


}

);







// =====================================
// INITIALIZE AUTH SYSTEM
// =====================================


document.addEventListener(

"DOMContentLoaded",

async()=>{


    await checkSession();



    setupSessionListener();



    setupPasswordToggle();



    updateUserInterface();



    const loginForm =
    document.getElementById(
        "loginForm"
    );



    const signupForm =
    document.getElementById(
        "signupForm"
    );



    const forgotForm =
    document.getElementById(
        "forgotForm"
    );




    if(loginForm){


        loginForm.addEventListener(

            "submit",

            loginUser

        );


    }




    if(signupForm){


        signupForm.addEventListener(

            "submit",

            registerUser

        );


    }





    if(forgotForm){


        forgotForm.addEventListener(

            "submit",

            resetPassword

        );


    }






    document
    .getElementById(
        "loginButton"
    )
    ?.addEventListener(

        "click",

        openLoginModal

    );






    document
    .getElementById(
        "openSignup"
    )
    ?.addEventListener(

        "click",

        openSignupModal

    );






    document
    .getElementById(
        "forgotPassword"
    )
    ?.addEventListener(

        "click",

        openForgotModal

    );






    document
    .getElementById(
        "closeLogin"
    )
    ?.addEventListener(

        "click",

        closeLoginModal

    );






    document
    .getElementById(
        "closeSignup"
    )
    ?.addEventListener(

        "click",

        closeSignupModal

    );






    document
    .getElementById(
        "closeForgot"
    )
    ?.addEventListener(

        "click",

        closeForgotModal

    );



    hideLoader();



});






// =====================================
// EXPORT
// =====================================


window.openLoginModal =
openLoginModal;


window.openSignupModal =
openSignupModal;


window.openForgotModal =
openForgotModal;


window.logoutUser =
logoutUser;



