export function normalizeInput(value:unknown,postPattern:string){
 if(!value||typeof value!=='object')throw Error('Enter all three required fields.');
 const v=value as Record<string,unknown>;
 if(typeof v.gg_thesis_url!=='string'||v.gg_thesis_url.length>500)throw Error('Enter a valid gg.xyz thesis post URL.');
 let u:URL;try{u=new URL(v.gg_thesis_url.trim())}catch{throw Error('Enter a valid gg.xyz thesis post URL.')}
 if(!['http:','https:'].includes(u.protocol)||!['gg.xyz','www.gg.xyz'].includes(u.hostname)||u.username||u.password||u.port||/%|\\/.test(u.pathname))throw Error('Enter a valid gg.xyz thesis post URL.');
 const path=u.pathname.replace(/\/+$/,'');
 if(!new RegExp(postPattern).test(path))throw Error('Enter a valid gg.xyz thesis post URL.');
 const user=(key:string,re:RegExp,label:string)=>{if(typeof v[key]!=='string')throw Error('Enter all three required fields.');const s=(v[key] as string).replace(/\s/g,'').replace(/^@/,'').toLowerCase();if(!re.test(s))throw Error('Enter a valid '+label+' username.');return s};
 return {gg_thesis_url:'https://gg.xyz'+path,telegram_username:user('telegram_username',/^[a-z][a-z0-9_]{4,31}$/i,'Telegram'),x_username:user('x_username',/^[a-z0-9_]{1,15}$/i,'X')};
}
