import { createClient } from '@supabase/supabase-js'

// שימוש בפורמט המדויק ש-Vite דורש
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// זה ידפיס לך ב-Console אם המשתנים ריקים - תוכלי לראות את זה ב-F12
if (!supabaseUrl) console.error("Missing VITE_SUPABASE_URL");
if (!supabaseAnonKey) console.error("Missing VITE_SUPABASE_ANON_KEY");

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)
