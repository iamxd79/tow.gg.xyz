import {settings} from '@/lib/server';
export async function GET(){const e=settings();return Response.json({url:e.SUPABASE_URL||'',key:e.SUPABASE_ANON_KEY||'',submitUrl:e.SUPABASE_URL?e.SUPABASE_URL+'/functions/v1/submit-thesis':''},{headers:{'Cache-Control':'no-store'}})}
