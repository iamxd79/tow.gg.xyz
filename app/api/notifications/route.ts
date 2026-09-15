import {settings,notifyPending} from '@/lib/server';
export async function POST(request:Request){const secret=settings().NOTIFICATION_JOB_SECRET;if(!secret||request.headers.get('Authorization')!=='Bearer '+secret)return new Response(null,{status:403});await notifyPending();return Response.json({ok:true})}
