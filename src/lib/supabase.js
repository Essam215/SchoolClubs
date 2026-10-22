/**
 * supabase.js  ─  Ready-to-activate Supabase client stub
 * ─────────────────────────────────────────────────────────────────
 * To go live:
 *   1. npm install @supabase/supabase-js
 *   2. Create .env in project root:
 *        VITE_SUPABASE_URL=https://your-project.supabase.co
 *        VITE_SUPABASE_ANON_KEY=your-anon-key
 *   3. Uncomment the two lines below and remove the stub export.
 * ─────────────────────────────────────────────────────────────────
 */

// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

/**
 * Stub — returns a mock client that warns when called.
 * Remove this entire block once you activate the real client above.
 */
const handler = {
  get(_, prop) {
    return () => {
      console.warn(`[supabase stub] Called .${prop}() — activate the real client in src/lib/supabase.js`);
      return Promise.resolve({ data: null, error: null });
    };
  }
};

export const supabase = new Proxy({}, handler);
