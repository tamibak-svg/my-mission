import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const envStatus = {
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
};

export const supabase =
  envStatus.hasUrl && envStatus.hasKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;