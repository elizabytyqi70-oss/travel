/**
 * TRAVELWISE — Supabase Auth Client
 * 
 * PËRDORIMI:
 * 1. Zëvendëso SUPABASE_URL dhe SUPABASE_ANON_KEY me vlerat nga Supabase Dashboard
 * 2. Shto këtë script në çdo faqe: <script src="assets/js/auth.js"></script>
 * 3. Përdor funksionet signUp(), signIn(), signOut() nga kudo
 */

// ========== KONFIGURIMI ==========
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

// ========== KLIENTI ==========
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== AUTH FUNKSIONET ==========

/** Regjistrim i ri */
async function signUp(email, password, fullName, nationality = 'Shqiptare') {
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                nationality: nationality
            }
        }
    });
    if (error) throw error;
    return data;
}

/** Hyrje */
async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

/** Dilje */
async function signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
}

/** Merr user-in aktual */
async function getCurrentUser() {
    const { data: { user } } = await sb.auth.getUser();
    return user;
}

/** Merr profilin e user-it */
async function getProfile(userId) {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

// ========== CHECKLIST ==========

/** Ruaj listen e kontrollit */
async function saveChecklist(items) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Duhet të jesh i loguar');
    
    const { data, error } = await sb
        .from('saved_checklists')
        .upsert({
            user_id: user.id,
            items_json: items,
            updated_at: new Date()
        }, { onConflict: 'user_id' });
    
    if (error) throw error;
    return data;
}

/** Ngarko listen e kontrollit */
async function loadChecklist() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Duhet të jesh i loguar');
    
    const { data, error } = await sb
        .from('saved_checklists')
        .select('items_json')
        .eq('user_id', user.id)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data?.items_json || {};
}

// ========== TRIPS (Planifikuesi) ==========

/** Ruaj një plan udhëtimi */
async function saveTrip(destination, days, tripType, dailyBudget, totalBudget) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Duhet të jesh i loguar');
    
    const { data, error } = await sb
        .from('saved_trips')
        .insert({
            user_id: user.id,
            destination,
            days,
            trip_type: tripType,
            daily_budget: dailyBudget,
            total_budget: totalBudget
        });
    
    if (error) throw error;
    return data;
}

/** Merr të gjitha planet e ruajtura */
async function getMyTrips() {
    const user = await getCurrentUser();
    if (!user) throw new Error('Duhet të jesh i loguar');
    
    const { data, error } = await sb
        .from('saved_trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}

/** Fshi një plan */
async function deleteTrip(tripId) {
    const { error } = await sb
        .from('saved_trips')
        .delete()
        .eq('id', tripId);
    
    if (error) throw error;
}

// ========== DËGJUES AUTH ==========
sb.auth.onAuthStateChange((event, session) => {
    console.log('Auth state:', event, session?.user?.email);
    if (event === 'SIGNED_IN') {
        window.location.href = 'lista.html';
    }
});
