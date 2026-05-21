 'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqqqlhtgnixztiwmyrim.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcXFsaHRnbml4enRpd215cmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDk4MjcsImV4cCI6MjA5Mzk4NTgyN30.KOPicKEQmhnV1-QCVtbUSOQqwcLlWMjkFd0eqZc-Cb4' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)