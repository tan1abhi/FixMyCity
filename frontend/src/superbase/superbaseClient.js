import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vfaghgomlcxtlplmkelw.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYWdoZ29tbGN4dGxwbG1rZWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4NjczMTYsImV4cCI6MjA1NDQ0MzMxNn0.6Q5tu2aeXcIXhbPWIR20OE6QBkaknlauxBsKCuXno5Y";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
