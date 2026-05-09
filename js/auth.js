// js/auth.js - Debug Version

async function handleLogin(identifier, password) {
    try {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Identifier:', identifier);
        console.log('Password entered:', password ? '****' : 'empty');
        
        // Check if supabase is available
        if (!window.supabase) {
            console.error('❌ window.supabase is undefined!');
            return { success: false, error: 'System not initialized. Please refresh.' };
        }
        
        console.log('✅ window.supabase is available');
        
        // Determine if identifier is email or ID number
        const isEmail = identifier.includes('@');
        console.log('Is email:', isEmail);
        
        // Build the query
        let query = window.supabase
            .from('users')
            .select('*');
        
        if (isEmail) {
            console.log('Querying by email:', identifier);
            query = query.eq('email', identifier);
        } else {
            console.log('Querying by id_number:', identifier);
            query = query.eq('id_number', identifier);
        }
        
        // Execute query
        console.log('Executing query...');
        const { data, error, status } = await query;
        
        console.log('Query response - Status:', status);
        console.log('Query response - Error:', error);
        console.log('Query response - Data:', data);
        console.log('Query response - Data length:', data ? data.length : 0);
        
        if (error) {
            console.error('❌ Database error:', error);
            return { success: false, error: 'Database error: ' + error.message };
        }
        
        if (!data || data.length === 0) {
            console.error('❌ No user found with:', identifier);
            return { success: false, error: 'User not found. Please check your email or ID number.' };
        }
        
        const user = data[0];
        console.log('✅ User found:', user.email, user.full_name);
        console.log('Stored password:', user.password);
        console.log('Entered password:', password);
        console.log('Password match:', user.password === password);
        
        // Check password
        if (user.password !== password) {
            console.error('❌ Password mismatch');
            return { success: false, error: 'Invalid password. Please try again.' };
        }
        
        // Check status
        if (user.status !== 'active') {
            console.error('❌ Account not active. Status:', user.status);
            return { success: false, error: 'Your account is pending approval. Status: ' + user.status };
        }
        
        // Store user in localStorage
        const safeUser = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            id_number: user.id_number,
            role: user.role,
            status: user.status
        };
        
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        console.log('✅ Login successful! Redirecting to dashboard...');
        
        return { success: true, user: safeUser };
        
    } catch (error) {
        console.error('❌ Login exception:', error);
        return { success: false, error: error.message };
    }
}

async function handleRegistration(userData) {
    try {
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Email:', userData.email);
        
        if (!window.supabase) {
            return { success: false, error: 'System not initialized' };
        }
        
        // Check if user exists
        const { data: existing } = await window.supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();
            
        if (existing) {
            return { success: false, error: 'User with this email already exists' };
        }
        
        // Create new user
        const { data: newUser, error } = await window.supabase
            .from('users')
            .insert([{
                email: userData.email,
                full_name: userData.full_name,
                id_number: userData.id_number,
                phone: userData.phone || null,
                role: userData.role,
                program: userData.program || null,
                year_of_study: userData.year_of_study || null,
                hostel_room: userData.hostel_room || null,
                clinic_card: userData.clinic_card || null,
                password: userData.password,
                status: 'pending',
                created_at: new Date()
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        console.log('✅ Registration successful');
        return { success: true, user: newUser };
        
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}
