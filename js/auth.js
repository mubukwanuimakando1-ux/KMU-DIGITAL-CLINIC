// assets/js/auth.js
// KMU Digital Health Centre Management System
// Complete Authentication Module (Supabase)

import { supabase } from "../supabase/config.js";

/* ==========================================================
   AUTHENTICATION
========================================================== */

const LOGIN_FORM = document.getElementById("loginForm");

if (LOGIN_FORM) {
    LOGIN_FORM.addEventListener("submit", loginUser);
}

/* ==========================================================
   LOGIN
========================================================== */

async function loginUser(e) {

    e.preventDefault();

    const identifier = document.getElementById("identifier").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!identifier || !password) {
        showToast("Please complete all fields.", "error");
        return;
    }

    showLoader();

    try {

        let email = identifier;

        // Student ID or Staff Number login
        if (!identifier.includes("@")) {

            const { data: profile } = await supabase
                .from("profiles")
                .select("email")
                .or(`student_id.eq.${identifier},staff_number.eq.${identifier}`)
                .single();

            if (!profile) {
                hideLoader();
                showToast("User not found.", "error");
                return;
            }

            email = profile.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({

            email,
            password

        });

        if (error) {

            hideLoader();
            showToast(error.message, "error");
            return;

        }

        const user = data.user;

        const { data: profile } = await supabase

            .from("profiles")

            .select("*")

            .eq("id", user.id)

            .single();

        if (!profile) {

            hideLoader();

            showToast("Profile not found.", "error");

            return;

        }

        localStorage.setItem("currentUser", JSON.stringify(profile));

        await logActivity(

            user.id,

            "LOGIN",

            "User Logged In"

        );

        redirectUser(profile.role);

    }

    catch (err) {

        console.error(err);

        showToast(err.message, "error");

    }

    hideLoader();

}

/* ==========================================================
   REDIRECT USER
========================================================== */

function redirectUser(role) {

    switch (role) {

        case "Admin":

            location.href = "admin/dashboard.html";

            break;

        case "Receptionist":

            location.href = "reception/dashboard.html";

            break;

        case "Doctor":

            location.href = "doctor/dashboard.html";

            break;

        case "Nurse":

            location.href = "nurse/dashboard.html";

            break;

        case "Pharmacist":

            location.href = "pharmacy/dashboard.html";

            break;

        case "Laboratory":

            location.href = "laboratory/dashboard.html";

            break;

        case "Counsellor":

            location.href = "counselling/dashboard.html";

            break;

        case "Student":

            location.href = "student/dashboard.html";

            break;

        case "Visitor":

            location.href = "visitor/dashboard.html";

            break;

        default:

            location.href = "dashboard.html";

    }

}

/* ==========================================================
   SESSION
========================================================== */

async function checkSession() {

    const {

        data: { session }

    } = await supabase.auth.getSession();

    if (!session) {

        location.href = "../index.html";

    }

}

checkSession();

/* ==========================================================
   LOGOUT
========================================================== */

window.logout = async function () {

    const currentUser = JSON.parse(

        localStorage.getItem("currentUser")

    );

    if (currentUser) {

        await logActivity(

            currentUser.id,

            "LOGOUT",

            "User Logged Out"

        );

    }

    await supabase.auth.signOut();

    localStorage.clear();

    location.href = "../index.html";

};

/* ==========================================================
   FORGOT PASSWORD
========================================================== */

window.resetPassword = async function (email) {

    const { error } = await supabase.auth.resetPasswordForEmail(email, {

        redirectTo:

            window.location.origin + "/reset-password.html"

    });

    if (error) {

        showToast(error.message, "error");

        return;

    }

    showToast("Password reset email sent.");

};

/* ==========================================================
   CHANGE PASSWORD
========================================================== */

window.changePassword = async function (

    newPassword

) {

    const { error } = await supabase.auth.updateUser({

        password: newPassword

    });

    if (error) {

        showToast(error.message, "error");

        return;

    }

    showToast("Password Updated.");

};

/* ==========================================================
   LOAD PROFILE
========================================================== */

window.loadCurrentUser = function () {

    return JSON.parse(

        localStorage.getItem("currentUser")

    );

};

/* ==========================================================
   AUDIT LOG
========================================================== */

async function logActivity(

    user,

    action,

    details

) {

    await supabase

        .from("audit_logs")

        .insert([

            {

                user_id: user,

                action,

                details,

                created_at: new Date()

            }

        ]);

}

/* ==========================================================
   ROLE GUARD
========================================================== */

window.requireRole = function (roles) {

    const currentUser = loadCurrentUser();

    if (!currentUser) {

        location.href = "../index.html";

        return;

    }

    if (!roles.includes(currentUser.role)) {

        alert("Access Denied");

        location.href = "../index.html";

    }

};

/* ==========================================================
   LOADER
========================================================== */

function showLoader() {

    const loader = document.getElementById("loader");

    if (loader)

        loader.classList.remove("hidden");

}

function hideLoader() {

    const loader = document.getElementById("loader");

    if (loader)

        loader.classList.add("hidden");

}

/* ==========================================================
   TOAST
========================================================== */

function showToast(message, type = "success") {

    if (window.showToast) {

        window.showToast(message, type);

    } else {

        alert(message);

    }

}

/* ==========================================================
   AUTO SESSION REFRESH
========================================================== */

setInterval(async () => {

    await supabase.auth.refreshSession();

}, 300000);

/* ==========================================================
   REMEMBER ME
========================================================== */

const remember = document.getElementById("rememberMe");

if (remember) {

    remember.addEventListener("change", () => {

        localStorage.setItem(

            "remember",

            remember.checked

        );

    });

}

/* ==========================================================
   PASSWORD VISIBILITY
========================================================== */

const togglePassword = document.getElementById("togglePassword");

if (togglePassword) {

    togglePassword.onclick = () => {

        const input = document.getElementById("password");

        input.type =

            input.type === "password"

                ? "text"

                : "password";

    };

}

/* ==========================================================
   EXPORTS
========================================================== */

export {

    loginUser,

    logout,

    resetPassword,

    loadCurrentUser,

    requireRole

};
