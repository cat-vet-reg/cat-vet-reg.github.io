import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://gxnhbymgifwnkipdraye.supabase.co';
// const supabaseKey = 'sb_publishable_H94MmUfmigPJpprvVTXJnQ_9Z3waRyI';


const supabaseUrl = 'https://gexgpozvrhurkhrlvaah.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdleGdwb3p2cmh1cmtocmx2YWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzIzMzAsImV4cCI6MjA5MDM0ODMzMH0.HZEakio3JnS0JOO6b934YzjNpuQBu5nmPhxhcyvo_nE';


const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase


