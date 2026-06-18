import { createClient } from '@supabase/supabase-js'

// Projet Supabase dédié "pense-malin". La clé publique est destinée au client
// (sécurité assurée côté serveur par les politiques RLS), donc elle peut vivre
// ici. On peut la surcharger via des variables d'env Vite si besoin.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bxylzhudcfqpblzczspe.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_bUlOHV3fyHsFVcBd_NSrVg_Rc2ZcLSw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
