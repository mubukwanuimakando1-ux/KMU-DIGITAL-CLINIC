// js/auth.js - Authentication Handler

async function handleLogin(identifier, password) {
    try {
        // Check if supabase is available
        if (!supabase) {
            console.error('Supabase client not available');
            return { success: false, error: 'System not initialized. Please refresh the page.' };
        }
        
        // Check if identifier is email or ID number
        const isEmail = identifier.includes('@');
        
        let query = supabase
            .from('users')
            .select('*');
            
        if (isEmail) {
            query = query.eq('email', identifier);
        } else {
            query = query.eq('id_number', identifier);
        }
        
        const { data: user, error } = await query.single();
        
        if (error) {
            console.error('Database error:', error);
            return { success: false, error: 'User not found. Please check your ID or email.' };
        }
        
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        // Simple password check (in production, use proper hashing)
        if (user.password === password) {
            // Check if user is approved
            if (user.status !== 'active') {
                return { success: false, error: 'Your account is pending approval. Please contact admin.' };
            }
            
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Log activity
            await logActivity(user.id, 'login', 'User logged into the system');
            
            return { success: true, user };
        } else {
            return { success: false, error: 'Invalid password' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'System error: ' + error.message };
    }
}

async function handleRegistration(userData) {
    try {
        // Check if supabase is available
        if (!supabase) {
            return { success: false, error: 'System not initialized. Please refresh the page.' };
        }
        
        // Check if user already exists
        const { data: existing, error: checkError } = await supabase
            .from('users')
            .select('id')
            .or(`email.eq.${userData.email},id_number.eq.${userData.id_number}`)
            .maybeSingle();
            
        if (existing) {
            return { success: false, error: 'User with this email or ID already exists' };
        }
        
        // Create new user (pending approval)
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                ...userData,
                status: 'pending',
                created_at: new Date(),
                requires_approval: true
            }])
            .select()
            .single();
            
        if (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
        
        // Notify admin about new registration
        const { error: notifyError } = await supabase
            .from('notifications')
            .insert([{
                user_id: null,
                title: 'New Registration Pending',
                message: `${userData.full_name} (${userData.id_number}) requires approval`,
                type: 'admin_approval',
                priority: 'high',
                is_global: true,
                target_role: 'admin',
                created_at: new Date()
            }]);
            
        if (notifyError) {
            console.warn('Notification error:', notifyError);
        }
            
        return { success: true, user: newUser };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

async function logActivity(userId, action, details) {
    try {
        if (!supabase) return;
        
        await supabase
            .from('activity_logs')
            .insert([{
                user_id: userId,
                action: action,
                details: details,
                timestamp: new Date()
            }]);
    } catch (error) {
        console.warn('Activity log error:', error);
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}