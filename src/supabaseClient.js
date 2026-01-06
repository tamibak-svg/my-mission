import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const envStatus = {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
};

export const supabase =
  envStatus.hasUrl && envStatus.hasKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;