import { createClient } from '@supabase/supabase-js';

// Your Project URL
const supabaseUrl = 'https://lhzwlqurhjwwoywnphac.supabase.co';

// Your Anon/Public Key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoendscXVyaGp3d295d25waGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDgxNjAsImV4cCI6MjA5MjM4NDE2MH0.GtNbTDebmlvi7zwNO632Pd2-IUKKzFr6JleyLY0bN2Y';

export const supabase = createClient(supabaseUrl, supabaseKey);