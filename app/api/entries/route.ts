import {db} from '@/lib/server';
const failure=(error:string,status=400)=>Response.json({error},{status});
export async function GET(){
 try{const r=await db('thesis_entries?status=eq.approved&select=id,gg_thesis_url,telegram_username,x_username,submitted_at&order=submitted_at.desc&limit=1000',{headers:{Prefer:'count=exact'}});if(!r.ok)throw Error();return Response.json({entries:await r.json(),count:Number(r.headers.get('content-range')?.split('/')[1]||0)},{headers:{'Cache-Control':'no-store'}})}catch{return failure('Entries could not be loaded.',503)}
}
