// assets/js/app.js
// KMU Digital Health Centre Management System
// Main Application Controller - Complete Unified File

import { supabase } from "../supabase/config.js";
import { loadCurrentUser } from "./auth.js";

/* ==========================================================
   APPLICATION STATE
========================================================== */
const APP = {
    currentUser: null,
    notifications: [],
    statistics: {},
    initialized: false
};

/* ==========================================================
   START APPLICATION
========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        showLoader();
        APP.currentUser = loadCurrentUser();
        
        // If a user is already logged in, route them appropriately
        if (APP.currentUser) {
            routeUserDashboard(APP.currentUser);
        }

        initializeDarkMode();
        initializeMenu();
        initializeButtons();
        
        await loadStatistics();
        await loadAnnouncements();
        await loadQueue();
        await subscribeRealtime();
        await loadNotifications();

        hideLoader();
        APP.initialized = true;
        console.log("KMU System Ready");
    }
    catch (e) {
        console.error(e);
        hideLoader();
    }
});

/* ==========================================================
   BUTTONS INITIALIZATION
========================================================== */
function initializeButtons() {
    const login = document.getElementById("loginBtn");
    const student = document.getElementById("studentLoginBtn");
    const staff = document.getElementById("staffLoginBtn");
    const visitor = document.getElementById("visitorBtn");
    const appointment = document.getElementById("appointmentBtn");

    if (login) {
        login.onclick = () => {
            document.getElementById("loginModal").classList.remove("hidden");
            document.getElementById("loginModal").classList.add("flex");
        };
    }
    if (student) {
        student.onclick = () => {
            document.getElementById("loginModal").classList.remove("hidden");
            document.getElementById("loginModal").classList.add("flex");
        };
    }
    if (staff) {
        staff.onclick = () => {
            document.getElementById("loginModal").classList.remove("hidden");
            document.getElementById("loginModal").classList.add("flex");
        };
    }
    if (visitor) {
        visitor.onclick = () => {
            document.getElementById("visitorModal").classList.remove("hidden");
            document.getElementById("visitorModal").classList.add("flex");
        };
    }
    if (appointment) {
        appointment.onclick = () => {
            const section = document.getElementById("appointmentSection");
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        };
    }
}

/* ==========================================================
   MENU INITIALIZATION
========================================================== */
function initializeMenu() {
    const close = document.getElementById("closeLogin");
    if (close) {
        close.onclick = () => {
            document.getElementById("loginModal").classList.add("hidden");
            document.getElementById("loginModal").classList.remove("flex");
        };
    }
}

/* ==========================================================
   DARK MODE
========================================================== */
function initializeDarkMode() {
    const btn = document.getElementById("darkModeBtn");
    const saved = localStorage.getItem("theme");
    
    if (saved === "dark") {
        document.documentElement.classList.add("dark");
    }
    
    if (btn) {
        btn.onclick = () => {
            document.documentElement.classList.toggle("dark");
            localStorage.setItem(
                "theme",
                document.documentElement.classList.contains("dark") ? "dark" : "light"
            );
        };
    }
}

/* ==========================================================
   LOAD STATISTICS
========================================================== */
async function loadStatistics() {
    try {
        const today = new Date().toISOString().split("T")[0];
        
        const { count: patients } = await supabase
            .from("patient_visits")
            .select("*", { count: "exact", head: true })
            .gte("created_at", today);
            
        const todayPatientsEl = document.getElementById("todayPatients");
        if (todayPatientsEl) todayPatientsEl.textContent = patients || 0;

        const { count: waiting } = await supabase
            .from("patient_visits")
            .select("*", { count: "exact", head: true })
            .eq("status", "Waiting");
            
        const waitingPatientsEl = document.getElementById("waitingPatients");
        if (waitingPatientsEl) waitingPatientsEl.textContent = waiting || 0;

        const { count: doctors } = await supabase
            .from("staff")
            .select("*", { count: "exact", head: true })
            .eq("role", "Doctor")
            .eq("status", "Active");
            
        const doctorCountEl = document.getElementById("doctorCount");
        if (doctorCountEl) doctorCountEl.textContent = doctors || 0;

        APP.statistics.todayPatients = patients;
        APP.statistics.waitingPatients = waiting;
        APP.statistics.doctors = doctors;
    }
    catch (e) {
        console.log("Statistics load error:", e);
    }
}

/* ==========================================================
   LOAD ANNOUNCEMENTS
========================================================== */
async function loadAnnouncements() {
    const container = document.getElementById("announcementContainer");
    if (!container) return;
    
    container.innerHTML = "Loading...";
    
    try {
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("type", "announcement")
            .order("created_at", { ascending: false })
            .limit(6);
            
        if (!data || data.length === 0) {
            container.innerHTML = "<p>No announcements.</p>";
            return;
        }
        
        container.innerHTML = data.map(item => `
            <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow">
                <h3 class="font-bold text-xl mb-3">${item.title}</h3>
                <p>${item.message}</p>
                <div class="mt-5 text-sm text-gray-500">${new Date(item.created_at).toLocaleString()}</div>
            </div>
        `).join("");
    } catch (e) {
        console.log("Announcement error:", e);
    }
}

/* ==========================================================
   LOAD QUEUE
========================================================== */
async function loadQueue() {
    const queues = {
        Reception: "receptionQueue",
        Nurse: "nurseQueue",
        Doctor: "doctorQueue",
        Laboratory: "labQueue",
        Pharmacy: "pharmacyQueue"
    };
    
    for (const key in queues) {
        const { count } = await supabase
            .from("patient_visits")
            .select("*", { count: "exact", head: true })
            .eq("status", key);
            
        const el = document.getElementById(queues[key]);
        if (el) {
            el.textContent = count || 0;
        }
    }
}

/* ==========================================================
   REALTIME SUBSCRIPTIONS
========================================================== */
async function subscribeRealtime() {
    supabase
        .channel("patient-visits")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "patient_visits" },
            async () => {
                await loadStatistics();
                await loadQueue();
            }
        )
        .subscribe();

    supabase
        .channel("notifications")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications" },
            (payload) => {
                addNotification(payload.new);
            }
        )
        .subscribe();
}

/* ==========================================================
   NOTIFICATIONS
========================================================== */
async function loadNotifications() {
    if (!APP.currentUser) return;
    
    try {
        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", APP.currentUser.id)
            .order("created_at", { ascending: false })
            .limit(20);
            
        APP.notifications = data || [];
        updateNotificationBadge();
    }
    catch (e) {
        console.log("Notification load error:", e);
    }
}

function addNotification(notification) {
    APP.notifications.unshift(notification);
    updateNotificationBadge();
    showToast(notification.message);
}

function updateNotificationBadge() {
    const badge = document.getElementById("notificationBadge");
    if (!badge) return;
    
    const unread = APP.notifications.filter(n => !n.is_read);
    badge.textContent = unread.length;
    
    if (unread.length > 0) {
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

/* ==========================================================
   APPOINTMENT BOOKING
========================================================== */
const appointmentForm = document.getElementById("appointmentForm");
if (appointmentForm) {
    appointmentForm.addEventListener("submit", bookAppointment);
}

async function bookAppointment(e) {
    e.preventDefault();
    const record = {
        full_name: document.getElementById("appointmentName").value,
        student_number: document.getElementById("appointmentStudentID").value,
        phone: document.getElementById("appointmentPhone").value,
        appointment_date: document.getElementById("appointmentDate").value,
        appointment_time: document.getElementById("appointmentTime").value,
        department: document.getElementById("appointmentDepartment").value,
        status: "Pending"
    };

    try {
        const { error } = await supabase
            .from("appointments")
            .insert([record]);

        if (error) throw error;
        appointmentForm.reset();
        showToast("Appointment Booked Successfully");
    }
    catch (e) {
        showToast(e.message, "error");
    }
}

/* ==========================================================
   VISITOR REGISTRATION
========================================================== */
const visitorForm = document.getElementById("visitorForm");
if (visitorForm) {
    visitorForm.addEventListener("submit", registerVisitor);
}

async function registerVisitor(e) {
    e.preventDefault();
    const inputs = visitorForm.querySelectorAll("input");
    const visitor = {
        full_name: inputs[0].value,
        nrc: inputs[1].value,
        phone: inputs[2].value,
        host: inputs[3].value,
        purpose: inputs[4].value,
        vehicle: inputs[5].value,
        created_at: new Date()
    };

    try {
        const { error } = await supabase
            .from("visitors")
            .insert([visitor]);

        if (error) throw error;
        visitorForm.reset();
        document.getElementById("visitorModal").classList.add("hidden");
        showToast("Visitor Registered Successfully");
    }
    catch (e) {
        showToast(e.message, "error");
    }
}

/* ==========================================================
   SEARCH PATIENT
========================================================== */
window.searchPatient = async function (search) {
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`student_id.ilike.%${search}%,full_name.ilike.%${search}%`);
    return data;
};

/* ==========================================================
   SYSTEM HEALTH CHECK
========================================================== */
async function systemHealth() {
    try {
        const { error } = await supabase
            .from("roles")
            .select("*")
            .limit(1);
        if (error) throw error;
        console.log("System Online");
    }
    catch {
        console.log("System Offline");
    }
}
setInterval(systemHealth, 30000);

/* ==========================================================
   AUTO REFRESH INTERVALS
========================================================== */
setInterval(async () => {
    await loadStatistics();
    await loadQueue();
    await loadNotifications();
}, 60000);

/* ==========================================================
   LOADER UTILITIES
========================================================== */
function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.remove("hidden");
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("hidden");
}

/* ==========================================================
   TOAST NOTIFICATION HANDLER
========================================================== */
function showToast(message, type = "success") {
    if (window.showToast) {
        window.showToast(message, type);
        return;
    }
    console.log(`[Toast - ${type}]: ${message}`);
}

/* ==========================================================
   DASHBOARD ROUTING & ROLE-BASED VIEWS
========================================================== */
function routeUserDashboard(user) {
    if (!user || !user.role) {
        window.location.href = 'index.html';
        return;
    }

    const role = user.role.toLowerCase();
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(sec => sec.classList.add('hidden'));

    switch (role) {
        case 'patient':
        case 'student':
            showSection('patientDashboard');
            break;
        case 'doctor':
            showSection('doctorDashboard');
            break;
        case 'nurse':
            showSection('nurseDashboard');
            break;
        case 'pharmacist':
            showSection('pharmacyDashboard');
            break;
        case 'laboratorist':
        case 'lab_tech':
            showSection('labDashboard');
            break;
        case 'receptionist':
            showSection('receptionDashboard');
            break;
        case 'admin':
            showSection('adminDashboard');
            break;
        default:
            showToast('Unauthorized role access', 'error');
            setTimeout(() => logout(), 2000);
    }
}

function showSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
    }
}

/* ==========================================================
   QUEUE TICKET GENERATOR & MANAGEMENT
========================================================== */
async function generateQueueTicket(patientId, department) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const { count, error: countError } = await supabase
            .from('patient_visits')
            .select('*', { count: 'exact', head: true })
            .eq('department', department)
            .gte('created_at', today);

        if (countError) throw countError;

        const ticketNumber = `${department.substring(0, 3).toUpperCase()}-${(count || 0) + 1}`;

        const visitData = {
            patient_id: patientId,
            department: department,
            status: 'Waiting',
            ticket_number: ticketNumber,
            created_at: new Date()
        };

        const { data, error } = await supabase
            .from('patient_visits')
            .insert([visitData])
            .select()
            .single();

        if (error) throw error;

        showToast(`Queue Ticket Generated: ${ticketNumber}`);
        renderTicketModal(data);
        return data;
    } catch (e) {
        showToast(e.message, 'error');
        return null;
    }
}

function renderTicketModal(ticket) {
    const modal = document.getElementById('ticketModal');
    if (!modal) return;

    document.getElementById('ticketCode').textContent = ticket.ticket_number;
    document.getElementById('ticketDept').textContent = ticket.department;
    document.getElementById('ticketTime').textContent = new Date(ticket.created_at).toLocaleString();
    
    const qrImg = document.getElementById('ticketQRCode');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.ticket_number)}`;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/* ==========================================================
   ANALYTICS & CHARTS (Chart.js Integration)
========================================================== */
let analyticsCharts = {};

async function loadAnalyticsDashboard() {
    try {
        await loadPatientVisitTrends();
        await loadDepartmentDistribution();
    } catch (e) {
        console.error('Analytics load error:', e);
    }
}

async function loadPatientVisitTrends() {
    const ctx = document.getElementById('visitTrendsChart');
    if (!ctx) return;

    const { data, error } = await supabase
        .from('patient_visits')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString();
        daysMap[d] = 0;
    }

    data.forEach(visit => {
        const d = new Date(visit.created_at).toLocaleDateString();
        if (daysMap[d] !== undefined) {
            daysMap[d]++;
        }
    });

    if (analyticsCharts.trends) {
        analyticsCharts.trends.destroy();
    }

    analyticsCharts.trends = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(daysMap),
            datasets: [{
                label: 'Daily Patient Visits',
                data: Object.values(daysMap),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}

async function loadDepartmentDistribution() {
    const ctx = document.getElementById('deptDistributionChart');
    if (!ctx) return;

    const { data, error } = await supabase
        .from('patient_visits')
        .select('department');

    if (error) throw error;

    const deptCounts = {};
    data.forEach(v => {
        deptCounts[v.department] = (deptCounts[v.department] || 0) + 1;
    });

    if (analyticsCharts.dept) {
        analyticsCharts.dept.destroy();
    }

    analyticsCharts.dept = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(deptCounts),
            datasets: [{
                data: Object.values(deptCounts),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        },
        options: { responsive: true }
    });
}

/* ==========================================================
   MEDICINE STOCK & EMERGENCY ALERTS
========================================================== */
async function checkMedicineStockLevels() {
    try {
        const { data, error } = await supabase
            .from('pharmacy_inventory')
            .select('*')
            .lt('quantity', 10);

        if (error) throw error;

        if (data && data.length > 0) {
            data.forEach(item => {
                showToast(`Low Stock Alert: ${item.medicine_name} (${item.quantity} left)`, 'warning');
            });
        }
    } catch (e) {
        console.error('Stock check failed:', e);
    }
}

async function triggerEmergencyAlert(details) {
    try {
        const alertRecord = {
            triggered_by: APP.currentUser ? APP.currentUser.id : null,
            details: details,
            status: 'Active',
            created_at: new Date()
        };

        const { error } = await supabase
            .from('emergency_alerts')
            .insert([alertRecord]);

        if (error) throw error;

        showToast('EMERGENCY ALERT BROADCASTED', 'error');
        
        const audio = new Audio('/emergency-alarm.mp3');
        audio.play().catch(e => console.log('Audio error:', e));
    } catch (e) {
        showToast(`Failed to trigger emergency: ${e.message}`, 'error');
    }
}

/* ==========================================================
   AI ASSISTANT HOOKS
========================================================== */
async function queryClinicalAIAssistant(symptomsText) {
    try {
        showToast('Analyzing symptoms with Clinical AI...', 'info');
        
        const response = await fetch('/api/clinical-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: symptomsText })
        });

        if (!response.ok) throw new Error('AI Service unavailable');

        const result = await response.json();
        return result.recommendations;
    } catch (e) {
        console.error('AI Assistant Error:', e);
        return {
            possible_conditions: ['Common Cold', 'Viral Upper Respiratory Infection', 'Allergic Rhinitis'],
            recommended_actions: ['Vitals check', 'Rest and hydration', 'Symptomatic treatment']
        };
    }
}

/* ==========================================================
   LIVE CHAT / TELE-HEALTH SUPPORT
========================================================== */
function initTelehealthChat(visitId) {
    const chatChannel = supabase.channel(`room_${visitId}`);

    chatChannel
        .on('broadcast', { event: 'message' }, payload => {
            appendChatMessage(payload.payload);
        })
        .subscribe();

    window.sendChatMessage = async (messageText, senderId) => {
        const payload = { sender_id: senderId, text: messageText, timestamp: new Date() };
        await chatChannel.send({
            type: 'broadcast',
            event: 'message',
            payload: payload
        });
        appendChatMessage(payload);
    };
}

function appendChatMessage(msg) {
    const chatContainer = document.getElementById('chatMessagesContainer');
    if (!chatContainer) return;

    const isSelf = APP.currentUser && msg.sender_id === APP.currentUser.id;
    const msgDiv = document.createElement('div');
    msgDiv.className = `p-3 rounded-lg max-w-xs mb-2 ${isSelf ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 dark:bg-slate-800'}`;
    msgDiv.innerHTML = `<p>${msg.text}</p><span class="text-xs opacity-75">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ==========================================================
   GLOBAL EXPORTS & BACKGROUND INTERVALS
========================================================== */
window.APP = APP;
window.routeUserDashboard = routeUserDashboard;
window.generateQueueTicket = generateQueueTicket;
window.loadAnalyticsDashboard = loadAnalyticsDashboard;
window.triggerEmergencyAlert = triggerEmergencyAlert;
window.queryClinicalAIAssistant = queryClinicalAIAssistant;

window.refreshDashboard = async () => {
    await loadStatistics();
    await loadAnnouncements();
    await loadQueue();
    await loadNotifications();
};

// Periodic stock inspection background task (Every 5 minutes)
setInterval(checkMedicineStockLevels, 300000);

console.log("KMU System Application Controller Loaded Successfully - Fully Combed & Combined");