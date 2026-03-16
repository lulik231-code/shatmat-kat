import { createClient } from '@supabase/supabase-client'

// הבאת המשתנים מכל סוגי הסביבות האפשריים
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('❌ שגיאה: משתני Supabase לא נטענו כראוי! בדקי את ההגדרות ב-Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
