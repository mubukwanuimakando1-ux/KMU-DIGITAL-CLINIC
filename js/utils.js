// js/utils.js - Utility Functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : type === 'error' ? 'fa-exclamation-circle text-red-500' : 'fa-info-circle text-yellow-500'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-ZM', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-ZM', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateTime(date) {
    return `${formatDate(date)} at ${formatTime(date)}`;
}

function generateQRCode(data) {
    // QR Code generation using an API or library
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
}

function downloadPDF(content, filename) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function validateEmail(email) {
    return /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/.test(email);
}

function validateZambiaPhone(phone) {
    return /^09[567]\d{7}$/.test(phone);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}