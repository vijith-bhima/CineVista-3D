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
 * Resolves media URLs:
 * 1. If absolute URL (e.g. Supabase Storage or external CDN), return as-is.
 * 2. If Supabase is configured and it's a trailer, stream from Supabase Storage 'trailers' bucket.
 * 3. Movie posters are bundled as static files in frontend/public/media/posters and frontend/public/posters
 *    served directly at high speed by Vercel CDN.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If Supabase Storage is configured and it's a video trailer, route to Supabase 'trailers' bucket
  if (isSupabaseConfigured() && supabaseUrl) {
    if (url.includes('/trailers/')) {
      const filename = url.split('/trailers/')[1];
      if (filename) {
        return `${supabaseUrl}/storage/v1/object/public/trailers/${encodeURIComponent(filename)}`;
      }
    }
  }

  // For movie posters, use local static asset paths (served natively by Vercel)
  return url;
}
