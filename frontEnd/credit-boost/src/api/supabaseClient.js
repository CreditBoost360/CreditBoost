import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://db.cvqmoofstsscijgfnprd.supabase.co';
const SUPABASE_KEY = 'IBNPUei2MzU06mZK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;