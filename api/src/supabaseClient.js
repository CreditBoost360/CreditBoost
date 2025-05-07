import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables or use defaults
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://db.cvqmoofstsscijgfnprd.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'IBNPUei2MzU06mZK';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Export the client
export default supabase;