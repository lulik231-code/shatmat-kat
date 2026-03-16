// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  חסרים משתני סביבה של Supabase. ראה README.md')
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
)

export const SUPER_ADMIN_EMAIL = 'lulik231@gmail.com'

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
}
