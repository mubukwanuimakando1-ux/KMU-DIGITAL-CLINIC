// js/notifications.js - Notification Engine
let notificationSubscription = null;

async function initNotifications(userId) {
    if (notificationSubscription) {
        notificationSubscription.unsubscribe();
    }
    
    notificationSubscription = supabase
        .channel('notifications')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
        }, (payload) => {
            showNotification(payload.new);
        })
        .subscribe();
    
    await loadUnreadCount();
}

async function loadUnreadCount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', currentUser.id)
        .eq('is_read', false);
    
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

async function markNotificationAsRead(notificationId) {
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    
    await loadUnreadCount();
}

function showNotification(notification) {
    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
        new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
        });
    }
    
    // Show in-app toast
    showToast(notification.message, notification.priority === 'high' ? 'warning' : 'success');
    
    // Play sound for high priority
    if (notification.priority === 'high') {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio playback failed'));
    }
}

// Request notification permission
if ('Notification' in window) {
    Notification.requestPermission();
}