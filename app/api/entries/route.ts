import {db,settings,notifyPending} from '@/lib/server';
import {normalizeInput} from '@/lib/validation';

const failure=(error:string,status=400)=>Response.json({error},{status});
export async function GET(){
 try{const r=await db('thesis_entries?status=eq.approved&select=id,gg_thesis_url,telegram_username,x_username,submitted_at&order=submitted_at.desc&limit=1000',{headers:{Prefer:'count=exact'}});if(!r.ok)throw Error();return Response.json({entries:await r.json(),count:Number(r.headers.get('content-range')?.split('/')[1]||0)},{headers:{'Cache-Control':'no-store'}})}catch{return failure('Entries could not be loaded.',503)}
}
export async function POST(request:Request){
 const e=settings();
 if(!e.SUPABASE_SERVICE_ROLE_KEY||!e.GG_POST_PATH_PATTERN||!e.RESEND_API_KEY||!e.EMAIL_FROM||!e.RATE_LIMIT_SALT)return failure('Submissions are temporarily unavailable. Please try again later.',503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return failure('Invalid request.',403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return failure('Invalid request.',415);
 try{
 const reader=request.body?.getReader();if(!reader)return failure('Invalid request.');
 let chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return failure('Invalid request.',413)}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 let body;try{body=JSON.parse(new TextDecoder().decode(bytes))}catch{return failure('Invalid request.')}
 if(body.website)return failure('Invalid request.');
 const ip=request.headers.get('cf-connecting-ip')||'local';
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(e.RATE_LIMIT_SALT+ip)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const rate=await db('rpc/check_thesis_rate',{method:'POST',body:JSON.stringify({p_key:hash})});
 if(!rate.ok)throw Error();if(!await rate.json())return failure('Too many attempts. Please try again in 10 minutes.',429);
 let input;try{input=normalizeInput(body,e.GG_POST_PATH_PATTERN)}catch(err){return failure((err as Error).message)}
 const r=await db('rpc/submit_thesis',{method:'POST',body:JSON.stringify({p_url:input.gg_thesis_url,p_telegram:input.telegram_username,p_x:input.x_username})});
 if(!r.ok){const err=await r.json() as {code:string};if(err.code==='23505')return failure('This thesis has already been submitted.',409);throw Error()}
 const entry=await r.json();await notifyPending().catch(()=>console.error('Notification queue deferred'));
 return Response.json({entry},{status:201});
 }catch{return failure('Something went wrong. Please try again.',500)}
}

