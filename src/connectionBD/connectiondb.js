const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

function createSupabaseClient() {
  const supabaseUrl = 'https://jsbjhyjalghwtdgbuxlu.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY;
  return createClient(supabaseUrl, supabaseKey);
}

module.exports = createSupabaseClient;
