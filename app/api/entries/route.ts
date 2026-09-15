import {db,settings} from '@/lib/server';

const failure=(error:string,status=400)=>Response.json({error},{status});

export async function GET(){
  try{
    const r=await db('thesis_entries?status=eq.approved&select=id,gg_thesis_url,telegram_username,x_username,submitted_at&order=submitted_at.desc&limit=1000',{headers:{Prefer:'count=exact'}});
    if(!r.ok)throw Error();
    return Response.json({entries:await r.json(),count:Number(r.headers.get('content-range')?.split('/')[1]||0)},{headers:{'Cache-Control':'no-store'}})
  }catch{
    return failure('Entries could not be loaded.',503)
  }
}

export async function POST(request:Request){
  try{
    const e=settings();
    if(!e.SUPABASE_URL||!e.SUPABASE_ANON_KEY)return failure('Submission service is not configured.',503);
    const body=await request.text();
    const upstream=await fetch(e.SUPABASE_URL+'/functions/v1/submit-thesis',{
      method:'POST',
      headers:{
        apikey:e.SUPABASE_ANON_KEY,
        'Content-Type':'application/json',
        Origin:'https://gg-thesis-of-the-week.canvapro-5368.chatgpt.site',
        'X-Forwarded-For':request.headers.get('CF-Connecting-IP')||''
      },
      body,
      signal:AbortSignal.timeout(15000)
    });
    return new Response(await upstream.text(),{
      status:upstream.status,
      headers:{'Content-Type':upstream.headers.get('Content-Type')||'application/json','Cache-Control':'no-store'}
    })
  }catch{
    return failure('Submission service is temporarily unavailable.',503)
  }
}
