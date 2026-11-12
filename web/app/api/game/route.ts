import { env } from 'cloudflare:workers';
import { checkGuess, hint } from '../../../lib/game';
const json = (data:unknown,status=200,cookie?:string)=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});
export async function GET(req:Request){return handle(req)}
export async function POST(req:Request){return handle(req)}
async function handle(req:Request){
 try {
  const db=env.DB!; const url=new URL(req.url);
  const existing=req.headers.get('cookie')?.match(/(?:^|; )duel=([a-f0-9-]{36})(?:;|$)/)?.[1];
  const token=existing||crypto.randomUUID();
  const cookie=existing?undefined:`duel=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;
  let body:any={};
  if(req.method==='POST'){
   if(req.headers.get('origin')!==url.origin) return json({error:'Please use the game page to play.'},403);
   if(Number(req.headers.get('content-length')||0)>4096)return json({error:'Request too large.'},413);
   const raw=await req.text();if(raw.length>4096)return json({error:'Request too large.'},413);body=JSON.parse(raw);
  }
  let id=String(body.room||url.searchParams.get('room')||'');
  if(body.action==='create'){
   const maximum=[10,100,1000].includes(body.maximum)?body.maximum:100;
   const name=String(body.name||'').trim().slice(0,20);if(!name)return json({error:'Enter your player name.'},400);
   id=crypto.randomUUID(); const n=new Uint32Array(1);const limit=Math.floor(4294967296/maximum)*maximum;do{crypto.getRandomValues(n)}while(n[0]>=limit);
   await db.batch([db.prepare('INSERT INTO rooms (id,secret,maximum,created) VALUES (?,?,?,?)').bind(id,n[0]%maximum+1,maximum,Date.now()),db.prepare('INSERT INTO players (id,room,token,name) VALUES (?,?,?,?)').bind(crypto.randomUUID(),id,token,name)]);
  }
  if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'This challenge link is invalid.'},400);
  const room:any=await db.prepare('SELECT * FROM rooms WHERE id=?').bind(id).first();
  if(!room||Date.now()-room.created>7*86400000)return json({error:'Challenge not found or expired. Create a new one.'},404);
  if(body.action==='join'){
   const name=String(body.name||'').trim().slice(0,20);if(!name)return json({error:'Enter your player name.'},400);
   const count:any=await db.prepare('SELECT count(*) AS total FROM players WHERE room=?').bind(id).first();if(count.total>=50)return json({error:'This challenge is full (50 players).'},400);
   await db.prepare('INSERT OR IGNORE INTO players (id,room,token,name) VALUES (?,?,?,?)').bind(crypto.randomUUID(),id,token,name).run();
  }
  let me:any=await db.prepare('SELECT id,name,guesses,attempts,solved FROM players WHERE room=? AND token=?').bind(id,token).first();
  if(body.action==='guess'){
   if(!me)return json({error:'Join the challenge first.'},403);
   if(!me.solved){
    const guess=checkGuess(body.guess,room.maximum);const guesses=JSON.parse(me.guesses);
    if(guesses.some((g:any)=>g.number===guess))return json({error:'You already tried that number. Try a different one.'},400);
    guesses.push({number:guess,hint:hint(guess,room.secret)});
    const result=await db.prepare('UPDATE players SET guesses=?,attempts=attempts+1,solved=? WHERE id=? AND attempts=? AND solved=0').bind(JSON.stringify(guesses),guess===room.secret?1:0,me.id,me.attempts).run();
    if(!result.meta.changes)return json({error:'Another guess was just received. Refresh and try again.'},409);
    me=await db.prepare('SELECT id,name,guesses,attempts,solved FROM players WHERE id=?').bind(me.id).first();
   }
  }
  const board=await db.prepare('SELECT id,name,attempts,solved FROM players WHERE room=? ORDER BY solved DESC, CASE WHEN solved=1 THEN attempts ELSE 99999 END ASC, name ASC').bind(id).all();
  return json({room:id,maximum:room.maximum,expires:room.created+7*86400000,me:me?{...me,guesses:JSON.parse(me.guesses)}:null,players:board.results},200,cookie);
 }catch(e){return json({error:e instanceof Error && e.message.startsWith('Enter a whole')?e.message:'Could not complete that request. Please try again.'},400)}
}
