import {env} from 'cloudflare:workers';
export function settings(){return env as unknown as Record<string,string>}
export async function db(path:string,init:RequestInit={}){
 const e=settings();if(!e.SUPABASE_URL||!(e.SUPABASE_SERVICE_ROLE_KEY||e.SUPABASE_ANON_KEY))throw Error('Database not configured');
 return fetch(e.SUPABASE_URL+'/rest/v1/'+path,{...init,headers:{apikey:e.SUPABASE_SERVICE_ROLE_KEY||e.SUPABASE_ANON_KEY,Authorization:'Bearer '+(e.SUPABASE_SERVICE_ROLE_KEY||e.SUPABASE_ANON_KEY),'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(10000)});
}
export async function notifyPending(){
 const e=settings();if(!e.RESEND_API_KEY||!e.EMAIL_FROM)return;
 const r=await db('rpc/claim_thesis_notifications',{method:'POST',body:'{}'});if(!r.ok)throw Error('Notification queue unavailable');
 const jobs=await r.json() as {entry_id:string;payload:{gg_thesis_url:string;telegram_username:string;x_username:string;submitted_at:string}}[];
 for(const job of jobs){const p=job.payload;try{const sent=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+e.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'thesis/'+job.entry_id},body:JSON.stringify({from:e.EMAIL_FROM,to:['sarutobi@gg.xyz','jonathan@gg.xyz'],subject:'New Thesis of the Week Entry 💎',text:'New Thesis of the Week submission\n\nGG Thesis: '+p.gg_thesis_url+'\nTelegram: @'+p.telegram_username+'\nX: @'+p.x_username+'\nSubmitted: '+new Date(p.submitted_at).toLocaleString('en-US',{timeZone:'UTC',year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})+' UTC\n\nView Thesis: '+p.gg_thesis_url}),signal:AbortSignal.timeout(10000)});if(sent.ok)await db('thesis_notifications?entry_id=eq.'+job.entry_id,{method:'PATCH',body:JSON.stringify({sent_at:new Date().toISOString()})});}catch{console.error('Notification delivery deferred');}}
}

