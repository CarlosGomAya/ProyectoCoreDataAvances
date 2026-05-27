// NO TOCAR POR FAVOOOOORRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
// SIN ESTO NO EXISTE RUTA CON SUPABASE


const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ylrqhxappjzwefzblglr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscnFoeGFwcGp6d2VmemJsZ2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODU0MzksImV4cCI6MjA5MjQ2MTQzOX0.XK7cc6AmTZ9S1qx0FFUfq9hVqu6vXt2KCGkY2V2FMyE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;