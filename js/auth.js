// js/auth.js - Authentication Handler (WORKING VERSION)
async function handleLogin(identifier, password) {
    try {
        console.log('Login attempt for:', identifier);
        
        if (!window.supabase) {
            return { success: false, error: 'System not initialized. Refresh page.' };
        }
        
        const isEmail = identifier.includes('@');
        let query = window.supabase.from('users').select('*');
        
        if (isEmail) {
            query = query.eq('email', identifier);
        } else {
            query = query.eq('id_number', identifier);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Query error:', error);
            return { success: false, error: error.message };
        }
        
        if (!data || data.length === 0) {
            return { success: false, error: 'User not found' };
        }
        
        const user = data[0];
        
        if (user.password !== password) {
            return { success: false, error: 'Invalid password' };
        }
        
        if (user.status !== 'active') {
            return { success: false, error: 'Account pending approval' };
        }
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        console.log('Login successful:', user.full_name);
        return { success: true, user };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

async function handleRegistration(userData) {
    try {
        if (!window.supabase) {
            return { success: false, error: 'System not initialized' };
        }
        
        const { data: existing } = await window.supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();
        
        if (existing) {
            return { success: false, error: 'Email already registered' };
        }
        
        const { error } = await window.supabase
            .from('users')
            .insert([{
                ...userData,
                status: 'pending',
                created_at: new Date()
            }]);
        
        if (error) throw error;
        
        return { success: true };
        
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
