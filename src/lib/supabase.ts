import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lakcembsjvbyjsfvxczq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ibcsfyiquase9G1LHtIJYA_oVRGy55s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
