import {settings} from '@/lib/server';

export async function GET(){
  const e=settings();
  return Response.json({
    url:e.SUPABASE_URL||'',
    key:e.SUPABASE_ANON_KEY||'',
    submitUrl:'/api/entries'
  },{headers:{'Cache-Control':'no-store'}})
}
