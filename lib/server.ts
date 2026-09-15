import {env} from 'cloudflare:workers';
export function settings(){return env as unknown as Record<string,string>}
export async function db(path:string,init:RequestInit={}){
 const e=settings();if(!e.SUPABASE_URL||!e.SUPABASE_ANON_KEY)throw Error('Database not configured');
 return fetch(e.SUPABASE_URL+'/rest/v1/'+path,{...init,headers:{apikey:e.SUPABASE_ANON_KEY,Authorization:'Bearer '+e.SUPABASE_ANON_KEY,'Content-Type':'application/json',...init.headers},signal:AbortSignal.timeout(10000)});
}
