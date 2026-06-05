import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://aswnbukhfeqrpdbeeull.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzd25idWtoZmVxcnBkYmVldWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1ODYxNDgsImV4cCI6MjA5NjE2MjE0OH0.-PbGJC5FQZFtY4q0iJCuUOxoXI8-MQnNjNNZ3np98SU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)