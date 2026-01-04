import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxnhbymgifwnkipdraye.supabase.co';
const supabaseKey = 'sb_publishable_H94MmUfmigPJpprvVTXJnQ_9Z3waRyI';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase