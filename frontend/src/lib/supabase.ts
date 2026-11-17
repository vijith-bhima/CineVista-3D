import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Resolves media URLs (trailers & posters):
 * 1. If absolute URL (e.g. Supabase Storage or CDN), return as-is.
 * 2. If Supabase is configured and it's a trailer, resolve to Supabase Storage bucket 'trailers'.
 * 3. Otherwise fall back to local relative path.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If Supabase Storage is active
  if (isSupabaseConfigured() && supabaseUrl) {
    if (url.includes('/trailers/')) {
      const filename = url.split('/trailers/')[1];
      if (filename) {
        return `${supabaseUrl}/storage/v1/object/public/trailers/${encodeURIComponent(filename)}`;
      }
    }
    if (url.includes('/posters/')) {
      const filename = url.split('/posters/')[1];
      if (filename) {
        return `${supabaseUrl}/storage/v1/object/public/posters/${encodeURIComponent(filename)}`;
      }
    }
  }

  return url;
}
