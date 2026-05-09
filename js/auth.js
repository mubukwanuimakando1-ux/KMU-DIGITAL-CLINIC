// js/auth.js - Complete Authentication

async function handleLogin(identifier, password) {
    try {
        console.log('Login attempt:', identifier);
        
        if (!window.supabase) {
            return { success: false, error: 'System initializing. Refresh page.' };
        }
        
        const isEmail = identifier.includes('@');
        let query = window.supabase.from('users').select('*');
        
        if (isEmail) {
            query = query.eq('email', identifier);
        } else {
            query = query.eq('staff_id', identifier);
        }
        
        const { data, error } = await query;
        
        if (error || !data || data.length === 0) {
            return { success: false, error: 'User not found. Contact admin.' };
        }
        
        const user = data[0];
        
        if (user.password !== password) {
            return { success: false, error: 'Invalid password' };
        }
        
        if (user.status !== 'active') {
            return { success: false, error: 'Account inactive. Contact admin.' };
        }
        
        await logActivity(user.id, 'Login', 'User logged in successfully');
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function resetPassword(identifier, securityAnswer, newPassword) {
    try {
        if (!window.supabase) {
            return { success: false, message: 'System error. Try again.' };
        }
        
        const isEmail = identifier.includes('@');
        let query = window.supabase.from('users').select('*');
        
        if (isEmail) {
            query = query.eq('email', identifier);
        } else {
            query = query.eq('staff_id', identifier);
        }
        
        const { data, error } = await query;
        
        if (error || !data || data.length === 0) {
            return { success: false, message: 'User not found' };
        }
        
        const user = data[0];
        
        if (user.security_answer !== securityAnswer) {
            return { success: false, message: 'Security answer incorrect' };
        }
        
        await window.supabase.from('users').update({ password: newPassword }).eq('id', user.id);
        await logActivity(user.id, 'Password Reset', 'User reset their password');
        
        return { success: true, message: 'Password reset successful!' };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function logActivity(userId, action, details) {
    try {
        await window.supabase.from('activity_logs').insert([{
            user_id: userId,
            action: action,
            details: details,
            timestamp: new Date()
        }]);
    } catch (e) {
        console.log('Log error:', e);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
