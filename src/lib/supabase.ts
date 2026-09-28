import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lakcembsjvbyjsfvxczq.supabase.co";
const SUPABASE_KEY = "sb_publishable_ibcsfyiquase9G1LHtIJYA_oVRGy55s";

// Counts cloud requests still in flight, so the auto-refresh (VersionWatcher) never
// reloads the page in the middle of a save. Each request stays "busy" 1s after it ends,
// to cover the short gap between a save's read and its write.
let cloudRequestsInFlight = 0;
export const cloudBusy = () => cloudRequestsInFlight > 0;
const trackedFetch: typeof fetch = async (input, init) => {
  cloudRequestsInFlight++;
  try {
    return await fetch(input, init);
  } finally {
    setTimeout(() => { cloudRequestsInFlight--; }, 1000);
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { global: { fetch: trackedFetch } });
