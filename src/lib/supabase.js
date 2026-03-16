import { createClient } from '@supabase/supabase-js'

// הגדרת המשתנים - בדיקה של כל האופציות האפשריות
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// בדיקה אם המשתנים הגיעו - אם לא, נדפיס אזהרה ברורה ב-Console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase variables are missing! Check Vercel Environment Variables.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
)
