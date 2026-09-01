import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kqnnnsbwlshvsbcnjbir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxbm5uc2J3bHNodnNiY25qYmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODE4OTYsImV4cCI6MjEwMzg1Nzg5Nn0.qn3DRJLf0xY4m-0Jikta0mjsDemtFa8GaT9U3DHKBX0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export async function signUp({ email, password, role, fullName, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName, phone }
    }
  });
  return { data, error };
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function getWorkerProfile(userId) {
  const { data, error } = await supabase
    .from('worker_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { data, error };
}

// Maintenance reminders
export async function getMaintenanceReminders(customerId) {
  const { data, error } = await supabase
    .from('maintenance_reminders')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_dismissed', false)
    .lte('next_due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('next_due_date', { ascending: true });
  return { data, error };
}

export async function createMaintenanceReminder(reminder) {
  const { data, error } = await supabase
    .from('maintenance_reminders')
    .insert(reminder);
  return { data, error };
}

export async function dismissReminder(id) {
  return await supabase
    .from('maintenance_reminders')
    .update({ is_dismissed: true })
    .eq('id', id);
}

// Notifications
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  return { data, error };
}

export async function markNotificationRead(id) {
  return await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
}

export async function createNotification(notification) {
  return await supabase.from('notifications').insert(notification);
}
