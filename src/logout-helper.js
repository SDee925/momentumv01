import { supabase } from './lib/supabase.js';
await supabase.auth.signOut();
console.log('Logged out successfully');
