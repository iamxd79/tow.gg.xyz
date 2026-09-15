import fs from 'node:fs';
const path='dist/server/wrangler.json';
const config=JSON.parse(fs.readFileSync(path,'utf8'));
config.kv_namespaces=[{binding:'ADMIN_SCORES',id:'30cc4730d1c14da2911f72717b8708ff'}];
fs.writeFileSync(path,JSON.stringify(config));
