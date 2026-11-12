import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const sql=new DatabaseSync(':memory:');
sql.exec(readFileSync('drizzle/0000_mighty_blackheart.sql','utf8'));
const db={prepare(query){return {bind(...args){const statement=sql.prepare(query);return {async first(){return statement.get(...args)||null},async all(){return {results:statement.all(...args)}},async run(){return {meta:statement.run(...args)}}}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
const source=readFileSync('lib/game.ts','utf8')+'\n'+readFileSync('app/api/game/route.ts','utf8').replace(/import .*?;\n/g,'');
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const make=new Function('env',compiled.replace(/export /g,'')+';return {GET,POST}');
const route=make({DB:db});
const base='https://game.test';
async function fetch(url,options={}){const request=new Request(url,options);return route[request.method](request)}
async function post(body,cookie=''){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,Cookie:cookie},body:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie}}
const a=await post({action:'create',name:'Test A',maximum:10});assert.equal(a.status,200);assert.equal(a.data.me.attempts,0);assert.ok(!('secret' in a.data));const room=a.data.room;
const b=await post({action:'join',room,name:'Test B'});assert.equal(b.status,200);assert.equal(b.data.players.length,2);
for(const guess of [0,11,1.5,'hello',null]){const r=await post({action:'guess',room,guess},a.cookie);assert.equal(r.status,400)}
const missing=await post({action:'guess',room,guess:5});assert.equal(missing.status,403);
let secret;
for(let n=1;n<=10;n++){const r=await post({action:'guess',room,guess:n},a.cookie);assert.equal(r.status,200);if(r.data.me.solved){secret=n;break}}
const win=await post({action:'guess',room,guess:secret},b.cookie);assert.equal(win.data.me.solved,1);assert.equal(win.data.me.attempts,1);assert.equal(win.data.players[0].attempts,1);
const repeated=await post({action:'guess',room,guess:secret},b.cookie);assert.equal(repeated.data.me.attempts,1);
const saved=await fetch(base+'/api/game?room='+room,{headers:{Cookie:b.cookie}}).then(r=>r.json());assert.equal(saved.me.attempts,1);assert.equal(saved.me.solved,1);assert.equal(saved.me.guesses[0].number,secret);
console.log('PASS: same secret across two players, private secret, input validation, membership, scoring, sorted board, solved lock, and refresh persistence.');
