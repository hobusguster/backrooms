<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>THE BACKROOMS — โนคลิป</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#0b0a07;
    --amber:#e8c54a;
    --amber-dim:#8a7527;
    --damp:#6f6a4a;
    --alarm:#c4402a;
    --paper:#cfc9ad;
    --ui: "IBM Plex Sans Thai", "Noto Sans Thai", system-ui, sans-serif;
    --mono: "IBM Plex Mono", ui-monospace, "Courier New", monospace;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow:hidden;background:#000;color:var(--paper);font-family:var(--ui)}
  #wrap{position:fixed;inset:0;background:#000}
  canvas#game{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:none}

  /* ---------- HUD ---------- */
  #hud{position:absolute;inset:0;pointer-events:none;font-family:var(--ui)}
  .corner{position:absolute;padding:14px 16px}
  #hudTop{top:0;left:0;display:flex;gap:18px;align-items:baseline}
  #lvlName{font-size:15px;font-weight:600;color:var(--amber);letter-spacing:.02em;
    text-shadow:0 0 14px rgba(232,197,74,.35)}
  #lvlSub{font-size:12px;color:#8e886d}
  #hudBottom{bottom:0;left:0;width:min(320px,42vw)}
  .meter{margin-top:8px}
  .meter .lbl{display:flex;justify-content:space-between;font-size:11px;color:#9a9377;
    font-family:var(--mono);margin-bottom:3px}
  .bar{height:7px;background:rgba(255,255,255,.07);position:relative;overflow:hidden}
  .bar i{position:absolute;inset:0 auto 0 0;display:block;transition:width .12s linear}
  #sanFill{background:linear-gradient(90deg,#3c6f4a,#7fd08c)}
  #batFill{background:linear-gradient(90deg,#6b5a1c,#e8c54a)}
  #hudRight{top:0;right:0;text-align:right}
  #keys{font-family:var(--mono);font-size:13px;color:var(--amber)}
  #keys span{opacity:.3}
  #keys span.on{opacity:1;text-shadow:0 0 10px rgba(232,197,74,.6)}
  #mapCv{position:absolute;right:14px;bottom:14px;width:150px;height:150px;
    opacity:.55;background:rgba(0,0,0,.45);border:1px solid rgba(232,197,74,.18)}
  #rescueMapCv{margin:22px auto 0;display:block;background:rgba(0,0,0,.5);
    border:1px solid rgba(232,197,74,.28)}
  #chatLog{position:absolute;left:14px;bottom:14px;width:min(320px,48vw);
    display:flex;flex-direction:column;gap:5px;pointer-events:none}
  .chatMsg{background:rgba(0,0,0,.5);padding:6px 10px;font-size:13px;line-height:1.4;
    color:var(--paper);animation:chatFade 7s ease forwards}
  .chatMsg b{color:var(--amber);font-weight:600;margin-right:6px}
  .chatMsg.me b{color:#8ed7e0}
  @keyframes chatFade{0%,75%{opacity:1}100%{opacity:0}}
  #chatInputBox{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);
    width:min(460px,88vw);display:none;z-index:20;pointer-events:auto}
  #chatInputBox.on{display:block}
  #chatInputBox input{width:100%;background:rgba(0,0,0,.72);border:1px solid var(--amber);
    color:var(--paper);font-family:var(--ui);font-size:16px;padding:11px 14px;outline:none}
  #bChat{bottom:calc(126px + env(safe-area-inset-bottom,0px));
    right:calc(114px + env(safe-area-inset-right,0px))}
  #warpFx{position:fixed;inset:0;background:radial-gradient(circle,#e8ffff 0%,#8ee0ea 60%,#2a7a86 100%);opacity:0;pointer-events:none;z-index:30}
  #toast{position:absolute;left:50%;top:62%;transform:translateX(-50%);
    font-size:15px;color:var(--paper);background:rgba(0,0,0,.55);padding:8px 16px;
    opacity:0;transition:opacity .4s;white-space:nowrap}
  #crosshair{position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px 0 0 -1.5px;
    background:rgba(255,255,255,.35);border-radius:50%}
  #prompt{position:absolute;left:50%;top:56%;transform:translateX(-50%);font-size:14px;
    color:var(--amber);opacity:0;transition:opacity .15s}

  /* ---------- Screens ---------- */
  .screen{position:absolute;inset:0;display:none;place-items:safe center;overflow-y:auto;
    background:radial-gradient(ellipse at 50% 40%, #191505 0%, #070603 70%);
    text-align:center;padding:28px;z-index:10}
  .screen.on{display:grid}
  .panel{max-width:620px;width:100%;margin-block:auto}
  h1{font-size:clamp(34px,7vw,64px);font-weight:700;line-height:.95;color:var(--amber);
    letter-spacing:-.02em;text-shadow:0 0 40px rgba(232,197,74,.25)}
  h1 small{display:block;font-family:var(--mono);font-size:12px;font-weight:400;
    letter-spacing:.42em;color:var(--damp);margin-bottom:14px;text-shadow:none}
  .lede{margin:18px auto 0;max-width:46ch;font-size:15px;line-height:1.75;color:#a7a084;font-weight:300}
  .btn{margin-top:26px;pointer-events:auto;display:inline-block;cursor:pointer;
    font-family:var(--ui);font-size:15px;font-weight:600;color:#14120a;background:var(--amber);
    border:0;padding:13px 30px;transition:transform .12s, background .12s}
  .btn:hover{background:#f6d963;transform:translateY(-1px)}
  .btn:focus-visible{outline:3px solid #fff;outline-offset:3px}
  .btn.ghost{background:transparent;color:var(--amber);border:1px solid rgba(232,197,74,.4);margin-left:8px}
  .btn.ghost:hover{background:rgba(232,197,74,.12);color:#f6d963}
  .keys{margin-top:30px;display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
    gap:10px 22px;font-size:13px;color:#8e886d;text-align:left;max-width:460px;margin-inline:auto}
  .keys b{font-family:var(--mono);color:var(--paper);font-weight:600;margin-right:8px}
  .mpBox{margin-top:26px;padding-top:20px;border-top:1px solid rgba(232,197,74,.16);
    max-width:420px;margin-inline:auto;pointer-events:auto}
  .mpTitle{font-size:12px;letter-spacing:.06em;color:#9a9377;margin-bottom:10px}
  .mpRow{margin-bottom:8px}
  .mpRow2{display:flex;gap:8px}
  .mpRow input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(232,197,74,.22);
    color:var(--paper);font-family:var(--ui);font-size:13px;padding:9px 11px;outline:none}
  .mpRow input:focus{border-color:var(--amber)}
  .mpRow input::placeholder{color:#6b664f}
  .mpHint{margin-top:8px;font-size:11px;color:#75705a}
  .modeBox{margin-top:22px;padding-top:18px;border-top:1px solid rgba(232,197,74,.14);
    max-width:360px;margin-inline:auto;pointer-events:auto}
  .modeBox .mpRow2{justify-content:center}
  .modeBox .btn.ghost{flex:1;font-size:12px;padding:9px 10px}
  .modeBox .btn.ghost.active{background:rgba(232,197,74,.18);color:#f6d963;border-color:var(--amber)}
  .gateForm{max-width:340px;margin:22px auto 0;display:flex;flex-direction:column;gap:10px;pointer-events:auto}
  .gateForm input{background:rgba(255,255,255,.05);border:1px solid rgba(232,197,74,.25);
    color:var(--paper);font-family:var(--mono);font-size:14px;letter-spacing:.03em;
    padding:11px 13px;outline:none;text-align:center}
  .gateForm input:focus{border-color:var(--amber)}
  .gateForm input::placeholder{color:#6b664f;font-family:var(--ui)}
  .gateMsg{min-height:18px;font-size:13px;color:var(--alarm)}
  .gateRemember{display:flex;align-items:center;gap:8px;font-size:12px;color:#9a9377;
    justify-content:center;cursor:pointer;user-select:none}
  .gateRemember input{width:auto;padding:0;accent-color:var(--amber)}
  .adminToggleWrap{margin-top:30px;padding-top:18px;border-top:1px solid rgba(232,197,74,.14);pointer-events:auto}
  .adminBox{display:none;max-width:320px;margin:14px auto 0}
  .adminBox.on{display:block}
  .adminResult{margin-top:10px;font-family:var(--mono);font-size:16px;color:var(--amber);
    letter-spacing:.04em;min-height:20px}
  #introCard h2{font-size:clamp(26px,5vw,42px);color:var(--amber);font-weight:700}
  #introCard .no{font-family:var(--mono);font-size:12px;letter-spacing:.4em;color:var(--damp)}
  #introCard p{margin-top:14px;color:#9d9679;font-size:14px;line-height:1.7;font-style:italic;font-weight:300}
  #deadScr h1{color:var(--alarm);text-shadow:0 0 50px rgba(196,64,42,.4)}
  #deadScr .lede{color:#9a7f78}
  #stats{margin-top:20px;font-family:var(--mono);font-size:13px;color:#8e886d;line-height:1.9}

  /* ---------- touch (โหมดมือถือ) ---------- */
  #touch{position:absolute;inset:0;display:none;z-index:5}
  #touch.on{display:block}
  #stick{position:absolute;width:132px;height:132px;border-radius:50%;
    border:1px solid rgba(232,197,74,.28);background:rgba(0,0,0,.32);
    opacity:0;transition:opacity .1s;pointer-events:none}
  #nub{position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;
    border-radius:50%;background:rgba(232,197,74,.32)}
  .tbtn{position:absolute;right:calc(20px + env(safe-area-inset-right,0px));width:76px;height:76px;
    border-radius:50%;border:1px solid rgba(232,197,74,.32);background:rgba(0,0,0,.36);color:var(--amber);
    font-family:var(--ui);font-size:14px;font-weight:600;display:grid;place-items:center;
    -webkit-tap-highlight-color:transparent;user-select:none}
  #bRun{bottom:calc(126px + env(safe-area-inset-bottom,0px))}
  #bLight{bottom:calc(30px + env(safe-area-inset-bottom,0px));right:calc(206px + env(safe-area-inset-right,0px))}
  #bUse{bottom:calc(30px + env(safe-area-inset-bottom,0px));right:calc(114px + env(safe-area-inset-right,0px))}
  #bFire{bottom:calc(30px + env(safe-area-inset-bottom,0px));right:calc(20px + env(safe-area-inset-right,0px))}
  /* บนมือถือ ย้ายมินิแมพขึ้นไปมุมบนแทน กันไม่ให้ทับกลุ่มปุ่มควบคุมที่มุมล่างขวา */
  html.touchMode #mapCv{top:calc(14px + env(safe-area-inset-top,0px));bottom:auto;
    right:calc(14px + env(safe-area-inset-right,0px))}
  @media (prefers-reduced-motion: reduce){ .btn{transition:none} }
  /* กัน Safari/Chrome บนมือถือซูมจออัตโนมัติตอนแตะกรอกข้อความ (ต้องมี font-size >=16px) */
  html.touchMode .gateForm input, html.touchMode .mpRow input, html.touchMode .adminBox input{font-size:16px}
</style>
</head>
<body>
<div id="wrap">
  <canvas id="game"></canvas>

  <div id="warpFx"></div>
  <div id="hud">
    <div class="corner" id="hudTop">
      <div>
        <div id="lvlName">ล็อบบี้</div>
        <div id="lvlSub">ระดับ 0</div>
      </div>
    </div>
    <div class="corner" id="hudRight">
      <div id="keys"></div>
      <div id="mpStatus" style="font-family:var(--mono);font-size:11px;color:#7fbf8f;margin-top:6px"></div>
      <div id="gunStatus" style="font-family:var(--mono);font-size:12px;color:var(--amber);margin-top:6px"></div>
      <div id="suitStatus" style="font-family:var(--mono);font-size:12px;color:#8ed7e0;margin-top:4px"></div>
    </div>
    <div class="corner" id="hudBottom">
      <div class="meter">
        <div class="lbl"><span>สติ</span><span id="sanTxt">100%</span></div>
        <div class="bar"><i id="sanFill" style="width:100%"></i></div>
      </div>
      <div class="meter" id="batMeter">
        <div class="lbl"><span>ไฟฉาย</span><span id="batTxt">100%</span></div>
        <div class="bar"><i id="batFill" style="width:100%"></i></div>
      </div>
    </div>
    <div id="crosshair"></div>
    <div id="prompt"></div>
    <div id="toast"></div>
    <canvas id="mapCv" width="150" height="150"></canvas>
    <div id="chatLog"></div>
  </div>

  <div id="chatInputBox">
    <input id="chatInput" placeholder="พิมพ์ข้อความ... (Enter ส่ง, Esc ยกเลิก)" maxlength="140">
  </div>

  <div id="touch">
    <div id="stick"><div id="nub"></div></div>
    <div class="tbtn" id="bRun">วิ่ง</div>
    <div class="tbtn" id="bLight">ไฟ</div>
    <div class="tbtn" id="bUse">ใช้</div>
    <div class="tbtn" id="bFire">ยิง</div>
    <div class="tbtn" id="bChat" style="font-size:20px">💬</div>
  </div>

  <!-- gate: ต้องกรอกชื่อ+รหัสก่อนถึงจะเข้าเกมได้ -->
  <div class="screen on" id="gateScr"><div class="panel">
    <h1><small>ระบบยืนยันสิทธิ์</small>กรอกรหัสเข้าเกม</h1>
    <p class="lede">กรอกชื่อผู้เล่นและรหัสที่ได้รับจากผู้ขาย ให้ตรงกันเป๊ะ ๆ (ตัวพิมพ์เล็ก-ใหญ่ไม่มีผล)</p>
    <div class="gateForm">
      <input id="gateName" placeholder="ชื่อผู้เล่น">
      <input id="gateCode" placeholder="รหัสเกม เช่น A1B2-C3D4">
      <label class="gateRemember"><input type="checkbox" id="gateRemember" checked> จำเครื่องนี้ไว้ (ครั้งต่อไปไม่ต้องกรอกซ้ำ)</label>
      <button class="btn" id="btnUnlock">ปลดล็อกเกม</button>
      <div id="gateMsg" class="gateMsg"></div>
    </div>
    <div class="adminToggleWrap">
      <button class="btn ghost" id="btnAdminToggle">สำหรับผู้สร้าง</button>
      <div id="adminBox" class="adminBox">
        <div class="mpRow"><input id="adminPass" type="password" placeholder="รหัสผู้สร้าง"></div>
        <div class="mpRow"><input id="adminName" placeholder="ชื่อผู้เล่นที่จะออกรหัสให้"></div>
        <button class="btn ghost" id="btnGenCode">สร้างรหัสให้ผู้เล่นนี้</button>
        <div id="adminResult" class="adminResult"></div>
      </div>
    </div>
  </div></div>

  <!-- title -->
  <div class="screen" id="titleScr"><div class="panel">
    <h1><small>no&nbsp;clip&nbsp;detected</small>เดอะ แบ็คลูมส์</h1>
    <p class="lede">คุณหลุดออกจากความเป็นจริงมาผิดที่ กลิ่นพรมเปียก เสียงหึ่งของหลอดไฟ
      และทางเดินสีเหลืองที่ไม่มีวันจบ หาทางออกของแต่ละชั้นให้เจอ ก่อนที่สติจะหมด
      — และก่อนที่สิ่งอื่นจะหาคุณเจอ</p>
    <button class="btn" id="btnStart">เริ่มไต่ระดับ (คนเดียว)</button>
    <div class="modeBox">
      <div class="mpTitle">โหมดควบคุม</div>
      <div class="mpRow mpRow2">
        <button class="btn ghost" id="btnModeDesktop">💻 คอมพิวเตอร์</button>
        <button class="btn ghost" id="btnModeTouch">📱 มือถือ/แท็บเล็ต</button>
      </div>
      <div id="modeNote" class="mpHint"></div>
    </div>
    <div class="keys">
      <div><b>W A S D</b>เดิน</div>
      <div><b>เมาส์</b>มองรอบตัว</div>
      <div><b>Shift</b>วิ่ง</div>
      <div><b>F</b>เปิด/ปิดไฟฉาย</div>
      <div><b>E</b>หยิบของ / ใช้ประตู</div>
      <div><b>Esc</b>พัก</div>
    </div>
    <div class="mpBox">
      <div class="mpTitle">เล่นด้วยกันหลายคน (ต้องมีเซิร์ฟเวอร์)</div>
      <div class="mpRow"><input id="mpUrl" placeholder="ws://ที่อยู่เซิร์ฟเวอร์:8080"></div>
      <div class="mpRow mpRow2">
        <input id="mpRoom" placeholder="รหัสห้อง เช่น main">
        <input id="mpName" placeholder="ชื่อของคุณ">
      </div>
      <button class="btn ghost" id="btnMpStart">เชื่อมต่อ &amp; เข้าเล่นด้วยกัน</button>
      <div class="mpHint">ต้องรัน server.js ของตัวเองก่อน แล้วใส่ที่อยู่เซิร์ฟเวอร์ตรงนี้</div>
    </div>
    <button class="btn ghost" id="btnForget" style="margin-top:16px;font-size:11px;padding:6px 14px">ล้างข้อมูลที่จำไว้ในเครื่องนี้</button>
  </div></div>

  <!-- level intro -->
  <div class="screen" id="introCard"><div class="panel">
    <div class="no" id="icNo">LEVEL 0</div>
    <h2 id="icName">ล็อบบี้</h2>
    <p id="icDesc"></p>
    <button class="btn" id="btnGo">เข้าไป</button>
  </div></div>

  <!-- pause -->
  <div class="screen" id="pauseScr"><div class="panel">
    <h1><small>หยุดชั่วคราว</small>ยืนนิ่งไว้</h1>
    <p class="lede">ไม่มีอะไรขยับเมื่อคุณไม่ขยับ อย่างน้อยก็ตามทฤษฎี</p>
    <button class="btn" id="btnResume">ไปต่อ</button>
    <button class="btn ghost" id="btnQuit">ออกไปหน้าแรก</button>
  </div></div>

  <!-- dead -->
  <div class="screen" id="deadScr"><div class="panel">
    <h1><small>สัญญาณขาดหาย</small>คุณถูกพบแล้ว</h1>
    <div id="deadKiller" style="font-family:var(--mono);font-size:15px;color:#ff8a7a;letter-spacing:.06em;margin:0 0 10px"></div>
    <p class="lede" id="deadWhy">สติของคุณหมดลงกลางทางเดินที่ไม่มีชื่อ</p>
    <div id="stats"></div>
    <button class="btn" id="btnRetry">ลองชั้นนี้ใหม่</button>
    <button class="btn ghost" id="btnWaitMeg">รอหน่วย M.E.G. มาช่วย</button>
    <button class="btn ghost" id="btnQuit2">หน้าแรก</button>
  </div></div>

  <!-- rescue: รอหน่วย M.E.G. -->
  <div class="screen" id="rescueScr"><div class="panel">
    <h1><small>ขอความช่วยเหลือ</small>ส่งสัญญาณไปแล้ว</h1>
    <p class="lede" id="rescueMsg">หน่วย M.E.G. กำลังเดินทางมาหาคุณ อยู่นิ่ง ๆ ไว้ก่อน...</p>
    <canvas id="rescueMapCv" width="260" height="260"></canvas>
    <p class="lede" id="rescueCountdown" style="margin-top:14px;font-size:13px"></p>
    <button class="btn ghost" id="btnCancelRescue">ยกเลิก กลับไปหน้าตาย</button>
  </div></div>

  <!-- win -->
  <div class="screen" id="winScr"><div class="panel">
    <h1><small>ทางออกจริง</small>คุณออกมาได้</h1>
    <p class="lede">ประตูบานสุดท้ายเปิดออกสู่ลานจอดรถตอนบ่ายสามโมง
      แสงแดดจริง ลมจริง เสียงรถจริง ไม่มีเสียงหึ่ง</p>
    <div id="winStats"></div>
    <button class="btn" id="btnAgain">ลงไปใหม่อีกรอบ</button>
  </div></div>
</div>

<script>
"use strict";
/* ============================================================
   THE BACKROOMS — raycasting engine, ไฟล์เดียวจบ
   ============================================================ */

/* ---------- utils ---------- */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ---------- ระบบรหัสเข้าเกม ----------
   ข้อควรทราบ: นี่คือ "ด่านกันเผลอ" ไม่ใช่การป้องกันระดับความปลอดภัยสูง
   เพราะไฟล์นี้รันในเบราว์เซอร์ล้วน ใครกด Ctrl+U/F12 ดูซอร์สจะเห็นสูตรนี้ได้
   เหมาะกับการขายให้เพื่อนแบบไว้ใจกัน ไม่เหมาะกับป้องกันการละเมิดลิขสิทธิ์จริงจัง */
const LICENSE_SALT="backrooms-v1-2026";     // เปลี่ยนค่านี้เพื่อออกรหัสชุดใหม่ทั้งหมด (รหัสเก่าทั้งหมดจะใช้ไม่ได้อีก)
const ADMIN_PASSWORD="676767";              // รหัสสำหรับผู้สร้าง ใช้ตอนออกรหัสให้ผู้เล่นแต่ละคน
function codeForName(name){
  const input=LICENSE_SALT+"::"+name.trim().toLowerCase();
  let h1=0x811c9dc5,h2=0x9e3779b9;
  for(let i=0;i<input.length;i++){
    const c=input.charCodeAt(i);
    h1=Math.imul(h1^c,16777619);
    h2=Math.imul(h2^c,2246822519);h2=h2^(h2>>>13);
  }
  const big=(BigInt(h1>>>0)<<32n)|BigInt(h2>>>0);
  let code=big.toString(36).toUpperCase().replace(/[^A-Z0-9]/g,"X");
  while(code.length<8)code+="0";
  code=code.slice(-8);
  return code.slice(0,4)+"-"+code.slice(4,8);
}
// จำสถานะปลดล็อกไว้ในเครื่องนี้เท่านั้น (ไม่ได้เชื่อมกับที่ไหน แค่กันไม่ต้องพิมพ์รหัสซ้ำทุกครั้ง)
function lsGet(key){try{return localStorage.getItem(key);}catch(e){return null;}}
function lsSet(key,val){try{localStorage.setItem(key,val);return true;}catch(e){return false;}}
function lsDel(key){try{localStorage.removeItem(key);}catch(e){}}
let rnd=mulberry32(1);
const $=id=>document.getElementById(id);

/* ---------- textures ---------- */
function T(w,h){return{w,h,d:new Uint8ClampedArray(w*h*3)};}
function setPx(t,x,y,r,g,b){const i=(y*t.w+x)*3;t.d[i]=r;t.d[i+1]=g;t.d[i+2]=b;}
function hex(c){return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];}

// fractal-ish value noise on a 64 grid
function noiseField(size,seed,oct){
  const r=mulberry32(seed);const out=new Float32Array(size*size);
  for(let o=0;o<oct;o++){
    const step=Math.max(1,size>>(o+1));const amp=1/(o+1.4);
    const g=[];const gs=Math.ceil(size/step)+1;
    for(let i=0;i<gs*gs;i++)g.push(r());
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const gx=x/step,gy=y/step,x0=Math.floor(gx),y0=Math.floor(gy);
      const fx=gx-x0,fy=gy-y0;
      const a=g[y0*gs+x0],b=g[y0*gs+x0+1],c=g[(y0+1)*gs+x0],d=g[(y0+1)*gs+x0+1];
      const sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
      out[y*size+x]+=amp*lerp(lerp(a,b,sx),lerp(c,d,sx),sy);
    }
  }
  let mx=0;for(let i=0;i<out.length;i++)if(out[i]>mx)mx=out[i];
  for(let i=0;i<out.length;i++)out[i]/=mx;
  return out;
}

/* wall texture builder. style: wallpaper | concrete | tile | pipe | wood | rock | fence | metal */
function makeWall(style,c1,c2,seed){
  const S=64,t=T(S,S),n=noiseField(S,seed,4),[r1,g1,b1]=hex(c1),[r2,g2,b2]=hex(c2);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    let f=0,r,g,b;
    const nz=n[y*S+x];
    switch(style){
      case "wallpaper":{                       // ลายทางแนวตั้ง + คราบชื้นด้านล่าง
        const stripe=(x%8<4)?0:1;
        f=stripe*0.5+nz*0.28;
        const damp=clamp((y-40)/24,0,1)*0.55*(0.5+nz);
        r=lerp(r1,r2,f)*(1-damp*0.45);g=lerp(g1,g2,f)*(1-damp*0.5);b=lerp(b1,b2,f)*(1-damp*0.3);
        if(y%32===31){r*=.6;g*=.6;b*=.6;}      // รอยต่อกระดาษ
        break;}
      case "concrete":{
        f=nz*0.85+((x*7+y*13)%17)/60;
        r=lerp(r1,r2,f);g=lerp(g1,g2,f);b=lerp(b1,b2,f);
        if((x+y*3)%61===0){r*=.72;g*=.72;b*=.72;}
        break;}
      case "tile":{
        const gx=x%16,gy=y%16;const grout=(gx<2||gy<2)?1:0;
        f=nz*0.3;
        r=lerp(r1,r2,f);g=lerp(g1,g2,f);b=lerp(b1,b2,f);
        if(grout){r*=.55;g*=.55;b*=.58;}
        else{const sh=1-(gx+gy)/70;r*=sh;g*=sh;b*=sh;}
        break;}
      case "pipe":{
        const band=Math.abs(Math.sin((x+nz*6)*0.49));
        f=band*0.9;
        r=lerp(r1,r2,f);g=lerp(g1,g2,f);b=lerp(b1,b2,f);
        if(y%21<2){r*=.5;g*=.5;b*=.5;}
        const rust=nz>0.72?(nz-0.72)*3:0;
        r=lerp(r,140,rust);g=lerp(g,70,rust);b=lerp(b,34,rust);
        break;}
      case "wood":{
        const grain=Math.sin(y*0.55+nz*7)*0.5+0.5;
        f=grain*0.7+nz*0.25;
        r=lerp(r1,r2,f);g=lerp(g1,g2,f);b=lerp(b1,b2,f);
        if(x%21===0){r*=.55;g*=.55;b*=.55;}
        break;}
      case "rock":{
        f=nz*nz*1.1;
        r=lerp(r1,r2,f);g=lerp(g1,g2,f);b=lerp(b1,b2,f);
        break;}
      case "fence":{
        const plank=(x%11<9)?1:0;
        f=nz*0.5+(x%11)/22;
        r=lerp(r1,r2,f)*(plank?1:.45);g=lerp(g1,g2,f)*(plank?1:.45);b=lerp(b1,b2,f)*(plank?1:.45);
        break;}
      default:{ // metal
        const rib=(x%12<1||y%24<1)?0.2:1;
        f=nz*0.5;
        r=lerp(r1,r2,f)*rib;g=lerp(g1,g2,f)*rib;b=lerp(b1,b2,f)*rib;
      }
    }
    setPx(t,x,y,r,g,b);
  }
  return t;
}

function makeFloor(style,c1,c2,seed){
  const S=64,t=T(S,S),n=noiseField(S,seed,4),[r1,g1,b1]=hex(c1),[r2,g2,b2]=hex(c2);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const nz=n[y*S+x];let f=nz,r,g,b;
    if(style==="carpet"){f=nz*0.6+((x*3+y*5)%7)/26;}
    else if(style==="tile"){const gx=x%21,gy=y%21;f=nz*0.25;if(gx<2||gy<2)f=-0.4;}
    else if(style==="water"){f=Math.abs(Math.sin(x*0.2+nz*5))*0.6+nz*0.3;}
    else if(style==="grass"){f=nz*0.9;}
    else if(style==="parking"){
      f=nz*0.35;
      const laneY=y%20; // เส้นสีขาวคั่นช่องจอดทุก ๆ 20 พิกเซล
      if(laneY<2)f=1.6;
      const gx=x%32; if(gx<1)f=Math.max(f,0.5); // รอยต่อพื้นคอนกรีต
    }
    r=lerp(r1,r2,clamp(f,0,1));g=lerp(g1,g2,clamp(f,0,1));b=lerp(b1,b2,clamp(f,0,1));
    setPx(t,x,y,r,g,b);
  }
  return t;
}

function makeCeil(c1,c2,seed,panel){
  const S=64,t=T(S,S),n=noiseField(S,seed,3),[r1,g1,b1]=hex(c1),[r2,g2,b2]=hex(c2);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const gx=x%32,gy=y%32;let f=n[y*S+x]*0.4;
    let r=lerp(r1,r2,f),g=lerp(g1,g2,f),b=lerp(b1,b2,f);
    if(gx<2||gy<2){r*=.6;g*=.6;b*=.6;}
    if(panel&&gx>10&&gx<22&&gy>4&&gy<28){r=Math.min(255,r*2.6+70);g=Math.min(255,g*2.6+66);b=Math.min(255,b*2.2+40);}
    setPx(t,x,y,r,g,b);
  }
  return t;
}

/* RGBA sprite */
function S32(w,h){return{w,h,d:new Uint8ClampedArray(w*h*4)};}
// รูป Partygoer ที่ผู้ใช้ให้มา ฝังเป็น PNG 128x128 แล้วโหลดเข้า texture ของสไปรท์ทุกตัวทันทีที่ภาพพร้อม
const PARTY_TEX=[];let PARTY_PIX=null;
(function(){
  const im=new Image();
  im.onload=()=>{
    const c=document.createElement("canvas");c.width=c.height=128;
    const g=c.getContext("2d");g.drawImage(im,0,0);
    PARTY_PIX=g.getImageData(0,0,128,128).data;
    for(const T of PARTY_TEX)T.d.set(PARTY_PIX);
  };
  im.src="data:image/png;base64,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";
})();
function sp(t,x,y,r,g,b,a){const i=(y*t.w+x)*4;t.d[i]=r;t.d[i+1]=g;t.d[i+2]=b;t.d[i+3]=a;}

// ตารางว่าสัตว์ประหลาดชนิดไหนยิงตายได้ (killable) และชนิดไหนยิงไม่เข้า (ต้องหลบเอา)
const ENTITY_INFO={
  hound:{killable:true},
  crawler:{killable:true},
  skinstealer:{killable:true},
  partygoer:{killable:true},
  bacteria:{killable:true},
  smiler:{killable:false},
  shadow:{killable:false},
  faceling:{killable:false}
};
function spriteEntity(kind,seed){
  const S=64,t=S32(S,S),n=noiseField(S,seed,3);
  const px=(x,y,r,g,b,a)=>{if(x<0||y<0||x>=S||y>=S)return;sp(t,x,y,r,g,b,a===undefined?255:a);};

  if(kind==="hound"){
    // ปลาหมึกยักษ์ — หัวทรงโดม ตากลมโตเรืองแสง หนวดแปดเส้นลากพื้น มีปุ่มดูด
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, nz=n[y*S+x];
      let inside=false,tentC=-99,tentI=-1;
      const ex=cx/17, ey=(y-22)/19;
      if(ex*ex+ey*ey<1+nz*0.12)inside=true;
      if(y>=36&&y<62){
        for(let i=0;i<8;i++){
          const bx=-19.6+5.6*i;
          let off=Math.sin(y*0.28+i*1.7)*(2+(y-36)*0.12);
          if(y>52)off+=(y-52)*0.35*(i%2?1:-1); // ปลายหนวดม้วน
          const w=3.3-(y-36)*0.075;
          if(Math.abs(cx-(bx+off))<w+nz*0.5){inside=true;tentC=bx+off;tentI=i;break;}
        }
      }
      if(!inside)continue;
      let sh=0.6+0.4*(1-Math.abs(cx)/22);
      if(y<22)sh*=0.9+0.25*(1-Math.abs(ex+0.35));
      let r=122+nz*40,g=38+nz*20,b=72+nz*30;
      if(((x*7+y*13)%11)<2&&nz>0.45){r*=0.6;g*=0.6;b*=0.65;} // จุดด่างบนผิว
      if(tentI>=0&&y%5===0&&Math.abs(cx-tentC)<1.3){r=232;g=170;b=182;sh=1;} // ปุ่มดูด
      if(y>33&&y<39&&Math.abs(cx)<2.2){r=24;g=14;b=16;sh=1;} // ปาก
      px(x,y,r*sh,g*sh,b*sh,255);
    }
    // ดวงตาเรืองแสง รูม่านตาแนวนอน
    for(const ex0 of [24,40]){
      for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){
        const d=Math.hypot(dx,dy);
        if(d>5.6)continue;
        let r=246,g=222,b=96;
        if(d>4.6){r=70;g=18;b=20;}
        if(Math.abs(dy)<=1&&Math.abs(dx)<=4.2){r=8;g=4;b=4;}
        px(ex0+dx,24+dy,r,g,b,255);
      }
    }
    return t;
  }

  if(kind==="crawler"){
    // มนุษยล้อมคลานเตี้ย แขนขากางกว้างผิดรูป
    for(let y=18;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, ny=(y-18)/46, nz=n[y*S+x];
      let inside;
      if(ny<0.18){const w=6-Math.abs(ny-0.09)*22;inside=Math.abs(cx)<w+nz*2;}
      else if(ny<0.55){const w=8+nz*3;inside=Math.abs(cx)<w;}
      else{inside=Math.abs(cx)>3&&Math.abs(cx)<15+nz*3;}
      if(!inside)continue;
      const sh=0.4+0.5*(1-Math.min(1,Math.abs(cx)/18));
      px(x,y,52*sh,48*sh,42*sh,255);
    }
    px(29,24,200,40,30,255);px(35,24,200,40,30,255);
    return t;
  }

  if(kind==="faceling"){
    // คนไม่มีหน้า — หัวกลมรีเรียบสีซีดไม่มีตา จมูก ปาก ใส่เสื้อและกางเกง แขนยาวห้อยลง
    const segD=(x,y,ax,ay,bx,by)=>{
      const vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy;
      let u=L2?((x-ax)*vx+(y-ay)*vy)/L2:0;u=Math.max(0,Math.min(1,u));
      return {d:Math.hypot(x-(ax+vx*u),y-(ay+vy*u)),u};
    };
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, nz=n[y*S+x];
      let r=0,g=0,b=0,hit=false;
      // ขาและกางเกง
      if(y>=44&&y<63){
        for(const lx of [-4.3,4.3]){
          if(Math.abs(cx-lx)<(y>58?3.2:3.8)+nz*0.3&&!(Math.abs(cx)<0.8&&y>49)){
            hit=true;const sh=0.6+0.4*(1-Math.abs(cx-lx)/4);
            if(y>=60){r=26*sh;g=24*sh;b=24*sh;} // รองเท้า
            else{r=(48+nz*14)*sh;g=(50+nz*14)*sh;b=(58+nz*14)*sh;}
          }
        }
      }
      // ลำตัวและเสื้อ
      if(!hit&&y>=24&&y<46){
        const hw=9.2-(y-24)*0.05+(y<28?-0.5*(28-y):0);
        if(Math.abs(cx)<hw+nz*0.4){
          hit=true;const sh=0.58+0.42*(1-Math.abs(cx)/(hw+2));
          r=(118+nz*22)*sh;g=(124+nz*22)*sh;b=(116+nz*20)*sh;
          if(y<27&&Math.abs(cx)<3){r=206*sh;g=198*sh;b=186*sh;} // คอเสื้อเห็นผิวคอ
          if(y===36||y===37){r*=0.84;g*=0.84;b*=0.84;}
        }
      }
      // แขนยาวห้อย (ท่อนบนแขนเสื้อ ท่อนล่างเป็นผิว)
      if(!hit){
        for(const side of [-1,1]){
          const a=segD(x,y,32+side*10.5,27,32+side*11.5,51);
          if(a.d<2.2+nz*0.3){
            hit=true;const sh=0.65+0.35*(1-a.d/2.6);
            if(a.u<0.42){r=(118+nz*20)*sh;g=(124+nz*20)*sh;b=(116+nz*18)*sh;}
            else{r=(206+nz*24)*sh;g=(198+nz*18)*sh;b=(186+nz*18)*sh;}
          }
        }
      }
      // หัวกลมรีเรียบ ไม่มีหน้า
      const ex=cx/8.6,ey=(y-12)/10.2;
      if(ex*ex+ey*ey<1+nz*0.05){
        hit=true;
        const sh=0.62+0.38*(1-Math.min(1,ex*ex+ey*ey));
        r=(214+nz*18)*sh;g=(206+nz*14)*sh;b=(194+nz*14)*sh;
      }
      if(!hit)continue;
      px(x,y,r,g,b,255);
    }
    return t;
  }

  if(kind==="shadow"){
    // เงาดำผอมสูง ขอบไม่นิ่งเหมือนควันมีรูปร่าง โปร่งแสงเล็กน้อย
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, ny=y/S, nz=n[y*S+x];
      const w=ny<0.2?(6-Math.abs(ny-0.1)*20):(8+Math.sin(ny*9+nz*4)*3);
      if(Math.abs(cx)>w+nz*4.5)continue;
      const sh=0.3+0.35*(1-Math.abs(cx)/(w+4));
      px(x,y,8*sh,7*sh,10*sh,190+nz*50);
    }
    px(28,9,235,235,255,255);px(36,9,235,235,255,255);
    return t;
  }

  if(kind==="partygoer"){
    const T=S32(128,128);PARTY_TEX.push(T);
    if(PARTY_PIX)T.d.set(PARTY_PIX);
    return T;
  }
  if(kind==="partygoer_old"){
    // มนุษย์ใส่หมวกปาร์ตี้ ยิ้มกว้างเห็นฟันเป็นแถว
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, ny=y/S, nz=n[y*S+x];
      let bodyW=8+Math.sin(ny*3.1)*3+(ny>0.22?6*ny:0);
      if(ny<0.22)bodyW=7-Math.abs(ny-0.11)*14;
      if(Math.abs(cx)>=bodyW+nz*3||ny<=0.04)continue;
      const sh=0.5+0.5*(1-Math.abs(cx)/(bodyW+3));
      px(x,y,190*sh,158*sh,140*sh,255); // สีผิว
    }
    // หมวกปาร์ตี้ลายทาง
    for(let y=0;y<9;y++){
      const w=(9-y)*0.9;
      for(let x=32-w;x<32+w;x++){
        const stripe=Math.floor(x)%3===0;
        px(Math.round(x),y,stripe?230:60,stripe?60:40,stripe?70:120,255);
      }
    }
    px(31,8,255,220,120,255);px(32,8,255,220,120,255); // ปุ่มบนหมวก
    // ยิ้มกว้างเห็นฟัน
    for(let x=24;x<40;x++){const y=Math.round(15+Math.sin((x-24)/16*Math.PI)*2);
      px(x,y,20,10,8,255);
      if(x%2===0)px(x,y-1,255,255,245,255); // ฟัน
    }
    px(27,10,20,10,8,255);px(36,10,20,10,8,255);
    return t;
  }

  if(kind==="bacteria"){
    // ก้อนแบคทีเรีย/เมือกไม่มีรูปทรงแน่นอน สีเขียวเรืองซีด
    for(let y=20;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, cy=y-46, nz=n[y*S+x];
      const rad=Math.hypot(cx*0.9,cy*1.15);
      const wob=6*Math.sin(x*0.5+y*0.3+seed*0.01)+nz*8;
      if(rad>16+wob)continue;
      const sh=0.4+0.5*(1-Math.min(1,rad/20));
      px(x,y,(70+nz*40)*sh,(120+nz*50)*sh,(60+nz*30)*sh,190+nz*50);
    }
    // จุดเรืองแสงกระจายอยู่ในก้อน
    for(let i=0;i<10;i++){
      const a=(i/10)*6.283, r=6+((i*37)%9);
      px(32+Math.round(Math.cos(a)*r),46+Math.round(Math.sin(a)*r*0.8),170,255,140,220);
    }
    return t;
  }

  if(kind==="researcher"){
    // หน่วยวิจัยของ M.E.G. — เสื้อกาวน์ขาว แว่นตา บัตรประจำตัว ถือคลิปบอร์ด
    const hairs=[[44,32,26],[22,22,28],[128,84,44],[196,196,202]];
    const hc=hairs[Math.abs(seed|0)%4];
    for(let y=6;y<62;y++)for(let x=0;x<S;x++){
      const cx=x-32, ny=(y-6)/56, nz=n[y*S+x];
      const w=ny<0.2?6-Math.abs(ny-0.1)*26:(ny<0.72?9+Math.sin(ny*3)*1.5+ny*3:6.5);
      if(Math.abs(cx)>w+nz*1.6)continue;
      if(ny>0.78&&Math.abs(cx)<1.2)continue; // ช่องว่างระหว่างขา
      const sh=0.55+0.45*(1-Math.abs(cx)/(w+3));
      let r,g,b;
      if(ny<0.2){
        if(ny<0.075||(Math.abs(cx)>w-1.3&&ny<0.15)){r=hc[0];g=hc[1];b=hc[2];}
        else{r=214;g=176;b=148;}
      }else if(ny<0.72){
        if(Math.abs(cx)<2.2&&ny<0.5){r=70;g=112;b=168;}
        else{r=232;g=234;b=238;}
      }else{r=52;g=54;b=64;}
      sp(t,x,y,r*sh,g*sh,b*sh,255);
    }
    for(let x=27;x<31;x++){sp(t,x,12,28,28,36,255);sp(t,x+7,12,28,28,36,255);}
    for(let x=31;x<34;x++)sp(t,x,12,28,28,36,255);
    for(let y=28;y<32;y++)for(let x=37;x<41;x++)sp(t,x,y,60,170,100,255); // บัตร
    for(let y=34;y<45;y++)for(let x=41;x<46;x++)sp(t,x,y,y===34||x===41?150:232,y===34||x===41?110:228,y===34||x===41?60:210,255); // คลิปบอร์ด
    return t;
  }

  if(kind==="meg"){
    // หน่วยพันธมิตร M.E.G. — ชุดหมีป้องกันสารเคมีสีเหลือง มีแผ่นบังหน้าและแถบสะท้อนแสง
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){
      const cx=x-32, ny=y/S, nz=n[y*S+x];
      let bodyW=8+Math.sin(ny*3.1)*3+(ny>0.22?6*ny:0);
      if(ny<0.24)bodyW=7-Math.abs(ny-0.12)*13; // หัว/หมวกคลุม
      if(Math.abs(cx)>=bodyW+nz*2.2||ny<=0.03)continue;
      const sh=0.55+0.45*(1-Math.abs(cx)/(bodyW+3));
      px(x,y,225*sh,190*sh,40*sh,255);
    }
    for(let y=8;y<17;y++)for(let x=26;x<38;x++)px(x,y,55,60,64,255);       // แผ่นบังหน้า (เฟรม)
    for(let y=10;y<15;y++)for(let x=28;x<36;x++)px(x,y,150,195,205,225);   // กระจกใส
    for(let x=22;x<42;x++)px(x,34,235,235,150,255);                        // แถบสะท้อนแสงลำตัว
    for(let x=22;x<42;x++)px(x,48,235,235,150,255);
    return t;
  }

  // ต่อไปนี้: smiler / skinstealer — โครงมนุษย์ยืนตรงแบบเดิม
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const cx=x-32, ny=y/S;
    let bodyW = 8 + Math.sin(ny*3.1)*3 + (ny>0.22? 6*ny : 0);
    if(ny<0.22) bodyW = 7 - Math.abs(ny-0.11)*14;          // หัว
    const inside = Math.abs(cx) < bodyW + n[y*S+x]*3.2 && ny>0.04;
    if(!inside) continue;
    let r,g,b;
    if(kind==="smiler"){ r=10;g=9;b=9; }
    else if(kind==="skinstealer"){
      const blotch=n[y*S+x]>0.62?1:0;
      r=(92+n[y*S+x]*40)*(blotch?0.65:1);g=62*(blotch?0.55:1);b=56*(blotch?0.55:1);
    }
    else { r=16;g=18;b=22; }
    const sh=0.45+0.55*(1-Math.abs(cx)/(bodyW+3));
    sp(t,x,y,r*sh,g*sh,b*sh,255);
  }
  // ใบหน้า
  if(kind==="smiler"){
    for(let x=24;x<40;x++){const y=Math.round(13+Math.sin((x-24)/15*Math.PI)*3);
      for(let k=0;k<2;k++)sp(t,x,y+k,250,250,240,255);}
    sp(t,27,9,255,255,255,255);sp(t,28,9,255,255,255,255);
    sp(t,36,9,255,255,255,255);sp(t,37,9,255,255,255,255);
    sp(t,27,10,255,255,255,255);sp(t,37,10,255,255,255,255);
  }else{
    sp(t,28,10,230,60,40,255);sp(t,29,10,230,60,40,255);
    sp(t,35,10,230,60,40,255);sp(t,36,10,230,60,40,255);
  }
  return t;
}

function spritePlayer(seed){
  // สไปรท์เพื่อนผู้เล่นในโหมดมัลติเพลเยอร์ — เสื้อกันหนาวสีฟ้า แยกจากสัตว์ประหลาดชัดเจน
  const S=64,t=S32(S,S),n=noiseField(S,seed,3);
  for(let y=6;y<62;y++)for(let x=0;x<S;x++){
    const cx=x-32, ny=(y-6)/56;
    let w = ny<0.2 ? 6-Math.abs(ny-0.1)*30 : 9+Math.sin(ny*3)*2;
    if(Math.abs(cx)>w+n[y*S+x]*2.4)continue;
    const sh=0.5+0.5*(1-Math.abs(cx)/(w+3));
    let r=64*sh,g=118*sh,b=196*sh;
    if(ny<0.2){r=196*sh;g=168*sh;b=140*sh;} // สีผิวหน้า
    sp(t,x,y,r,g,b,255);
  }
  for(let x=27;x<37;x++)sp(t,x,9,255,232,150,255); // ไฟหน้าหมวก
  return t;
}

function spriteItem(kind){
  const S=32,t=S32(S,S);
  const put=(x,y,c,a)=>sp(t,x,y,c[0],c[1],c[2],a===undefined?255:a);
  if(kind==="water"){
    for(let y=8;y<28;y++)for(let x=12;x<20;x++){
      const g=y<11?0.6:1;put(x,y,[238*g,234*g,214*g]);
      if(y>15&&y<25&&x>12&&x<19)put(x,y,[226,205,150]);
    }
    for(let y=5;y<9;y++)for(let x=14;x<18;x++)put(x,y,[200,196,180]);
  }else if(kind==="key"){
    for(let y=12;y<22;y++)for(let x=8;x<24;x++)put(x,y,[58,120,190]);
    for(let y=14;y<17;y++)for(let x=10;x<20;x++)put(x,y,[200,225,250]);
  }else if(kind==="battery"){
    for(let y=8;y<26;y++)for(let x=12;x<20;x++)put(x,y,[212,176,40]);
    for(let y=8;y<13;y++)for(let x=12;x<20;x++)put(x,y,[40,38,32]);
  }else if(kind==="exit"){
    for(let y=2;y<30;y++)for(let x=4;x<28;x++){
      const edge=(x<6||x>25||y<4||y>27);
      put(x,y,edge?[26,64,34]:[52,190,96]);
    }
    for(let y=12;y<20;y++)for(let x=9;x<23;x++)put(x,y,[240,255,242]);
    for(let y=14;y<18;y++)for(let x=11;x<21;x++)put(x,y,[52,190,96]);
  }else if(kind==="gun"){
    // ปืนพกวางเฉียงอยู่กับพื้น มองจากด้านบนเฉียง ๆ
    for(let y=13;y<18;y++)for(let x=3;x<25;x++)put(x,y,[74,76,82]);      // เฟรม/สไลด์
    for(let y=12;y<14;y++)for(let x=6;x<12;x++)put(x,y,[120,122,128]);   // ไฮไลต์บนสไลด์
    for(let y=17;y<27;y++)for(let x=6;x<11;x++)put(x,y,[42,32,24]);      // ด้ามจับไม้
    for(let y=14;y<17;y++)for(let x=22;x<27;x++)put(x,y,[26,26,30]);     // ปากกระบอก
    for(let y=18;y<21;y++)for(let x=11;x<15;x++)put(x,y,[30,30,34]);    // โกร่งไก
  }else if(kind==="megbase_open"){
    // ประตูมิติของฐาน M.E.G. ที่เปิดอยู่ — เรืองแสงฟ้าอมขาว หมุนวน
    for(let y=1;y<31;y++)for(let x=3;x<29;x++){
      const edge=(x<5||x>26||y<3||y>28);
      put(x,y,edge?[40,70,80]:[20,40,50]);
    }
    for(let i=0;i<60;i++){
      const a=(i/60)*6.283, r=11-((i*7)%11);
      put(16+Math.round(Math.cos(a)*r),16+Math.round(Math.sin(a)*r*1.3),
        [140+((i*9)%100),220,230],230);
    }
    for(let y=10;y<22;y++)for(let x=11;x<21;x++)put(x,y,[225,250,255],120);
  }else if(kind==="megbase_closed"){
    // ประตูเหล็กของฐาน M.E.G. ที่ปิดสนิท — ทึบ ไม่มีแสง
    for(let y=1;y<31;y++)for(let x=3;x<29;x++)put(x,y,[52,54,58]);
    for(let y=3;y<29;y++)for(let x=5;x<27;x++)put(x,y,[36,38,42]);
    for(let y=14;y<18;y++)for(let x=8;x<24;x++)put(x,y,[20,20,22]);
    put(24,15,255,80,60);put(24,16,255,80,60); // ไฟแดงล็อก
  }
  return t;
}

// สไปรท์ของตกแต่ง — ไม่มีผลต่อเกมเพลย์ แค่เพิ่มบรรยากาศให้แต่ละเลเวลดูมีชีวิตชีวาขึ้น
function spriteDecor(kind){
  const S=32,t=S32(S,S);
  const put=(x,y,c,a)=>sp(t,x,y,c[0],c[1],c[2],a===undefined?255:a);
  if(kind==="box"){
    for(let y=10;y<28;y++)for(let x=4;x<28;x++)put(x,y,[150,110,64]);
    for(let x=4;x<28;x++)put(x,18,[110,78,42]);
    for(let y=10;y<28;y++)put(16,y,[110,78,42]);
    for(let y=8;y<11;y++)for(let x=4;x<28;x++)put(x,y,[170,128,76]);
  }else if(kind==="chair"){
    for(let y=6;y<18;y++)for(let x=9;x<23;x++)put(x,y,[40,42,46]);
    for(let y=17;y<22;y++)for(let x=7;x<25;x++)put(x,y,[52,54,58]);
    for(let y=22;y<30;y++)for(let x=15;x<17;x++)put(x,y,[30,30,32]);
    for(let x=8;x<24;x++)put(x,29,[20,20,22]);
  }else if(kind==="plant"){
    for(let y=22;y<30;y++)for(let x=10;x<22;x++)put(x,y,[150,84,54]);
    for(let i=0;i<40;i++){
      const a=(i/40)*6.283, r=6+((i*13)%7);
      put(16+Math.round(Math.cos(a)*r),16+Math.round(Math.sin(a)*r*1.1),[42,110,56]);
    }
  }else if(kind==="trash"){
    for(let y=8;y<28;y++)for(let x=8;x<24;x++)put(x,y,[86,90,94]);
    for(let y=6;y<9;y++)for(let x=7;x<25;x++)put(x,y,[60,62,66]);
  }else if(kind==="shelf"){
    for(let y=6;y<9;y++)for(let x=3;x<29;x++)put(x,y,[110,78,46]);
    for(let y=16;y<19;y++)for(let x=3;x<29;x++)put(x,y,[110,78,46]);
    for(let y=26;y<29;y++)for(let x=3;x<29;x++)put(x,y,[110,78,46]);
    for(let y=3;y<6;y++)for(let x=8;x<13;x++)put(x,y,[150,60,50]);
    for(let y=13;y<16;y++)for(let x=18;x<23;x++)put(x,y,[70,110,150]);
  }else if(kind==="car"){
    // รถก้อนเหลี่ยม ๆ จอดอยู่ (มองจากด้านข้างเฉียง)
    for(let y=16;y<26;y++)for(let x=2;x<30;x++)put(x,y,[120,40,36]); // ตัวถังสีแดงคล้ำ
    for(let y=8;y<17;y++)for(let x=8;x<24;x++)put(x,y,[96,30,28]);  // หลังคา/กระจก
    for(let y=10;y<16;y++)for(let x=10;x<22;x++)put(x,y,[60,90,110]); // กระจกหน้า
    for(let y=25;y<29;y++)for(let x=5;x<10;x++)put(x,y,[15,15,16]); // ล้อ
    for(let y=25;y<29;y++)for(let x=22;x<27;x++)put(x,y,[15,15,16]);
    for(let y=18;y<21;y++)for(let x=2;x<30;x++)put(x,y,[200,190,60],140); // แถบไฟสะท้อน
  }else if(kind==="desk"){
    // โต๊ะทำงานไม้ มีลิ้นชักและขาโต๊ะ
    for(let y=10;y<15;y++)for(let x=2;x<30;x++)put(x,y,[132,96,58]);   // หน้าโต๊ะ
    for(let y=15;y<24;y++)for(let x=20;x<28;x++)put(x,y,[100,72,42]); // ตัวลิ้นชัก
    for(let y=17;y<20;y++)for(let x=22;x<26;x++)put(x,y,[70,50,30]);  // ร่องลิ้นชักบน
    for(let y=21;y<24;y++)for(let x=22;x<26;x++)put(x,y,[70,50,30]);  // ร่องลิ้นชักล่าง
    for(let y=15;y<29;y++)for(let x=3;x<6;x++)put(x,y,[86,62,36]);    // ขาโต๊ะซ้าย
  }else if(kind==="cabinet"){
    // ตู้เอกสารเหล็กสีเทา มีลิ้นชักหลายชั้น
    for(let y=4;y<30;y++)for(let x=6;x<26;x++)put(x,y,[108,112,118]);
    for(let y=8;y<12;y++)for(let x=8;x<24;x++)put(x,y,[76,80,86]);
    for(let y=15;y<19;y++)for(let x=8;x<24;x++)put(x,y,[76,80,86]);
    for(let y=22;y<26;y++)for(let x=8;x<24;x++)put(x,y,[76,80,86]);
    for(let y=9;y<11;y++)for(let x=22;x<23;x++)put(x,y,[210,210,215]); // มือจับลิ้นชัก
    for(let y=16;y<18;y++)for(let x=22;x<23;x++)put(x,y,[210,210,215]);
    for(let y=23;y<25;y++)for(let x=22;x<23;x++)put(x,y,[210,210,215]);
  }else if(kind==="window"){
    // กรอบหน้าต่างเก่า ๆ กระจกมัวมองไม่ค่อยเห็นข้างนอก
    for(let y=2;y<30;y++)for(let x=4;x<28;x++)put(x,y,[70,58,44]); // กรอบไม้
    for(let y=5;y<27;y++)for(let x=7;x<25;x++)put(x,y,[130,150,155],200); // บานกระจก
    for(let y=5;y<27;y++)put(16,y,[70,58,44]); // เส้นแบ่งบานกลาง
    for(let x=7;x<25;x++)put(x,16,[70,58,44]);
  }else if(kind==="crate"){
    // ลังไม้เก่า ๆ ซ้อนกัน
    for(let y=6;y<30;y++)for(let x=3;x<29;x++)put(x,y,[118,86,52]);
    for(let x=3;x<29;x++)put(x,17,[80,58,34]);
    for(let y=6;y<30;y++)put(9,y,[80,58,34]);
    for(let y=6;y<30;y++)put(22,y,[80,58,34]);
  }
  return t;
}

/* ---------- levels ---------- */
const LEVELS=[
 {n:"ล็อบบี้", en:"LEVEL 0", size:27, style:"corridor", desc:"กลิ่นพรมเปียกชื้น เสียงหึ่งของหลอดไฟไม่หยุด ยังไม่มีอะไรตามคุณ — ยัง",
  wall:["wallpaper","#e0c96b","#b79b3a"], floor:["carpet","#8a7c3e","#5f5427"], ceil:["#cbb85e","#8f7f34",true],
  fog:[0.10,0.09,0.05], fogD:0.020, amb:0.30, lamps:0.30, ent:0, entKinds:["smiler"], entSpd:0, keys:0, dark:false, drain:1.0,
  decorKinds:["chair","box","plant","window"]},

 {n:"ลานจอดรถ", en:"LEVEL 1", size:31, style:"parking", desc:"เสาปูนเรียงเป็นแถวไม่รู้จบ รถที่จอดอยู่ไม่มีคันไหนมีเจ้าของ เสียงเห่าดังมาจากที่ไหนสักแห่งระหว่างแถวรถ",
  wall:["concrete","#9b968a","#6a675e"], floor:["parking","#6d6a62","#48463f"], ceil:["#7d7a71","#4c4a44",true],
  fog:[0.07,0.07,0.07], fogD:0.026, amb:0.24, lamps:0.20, ent:4, entKinds:["hound","hound","crawler","bacteria"], entSpd:1.55, keys:0, dark:false, drain:1.1,
  decorKinds:["car","car","car","box","crate"], decorCount:[10,16]},

 {n:"ท่อในฝัน", en:"LEVEL 2", size:35, style:"corridor", desc:"เงียบผิดปกติ ไม่มีเสียงหายใจของสิ่งใดเลยในท่อนี้ — บางทีนั่นอาจน่ากลัวกว่าการมีเสียง",
  wall:["pipe","#8d7a55","#4e4330"], floor:["tile","#5b5346","#37322a"], ceil:["#584f40","#332e26",false],
  fog:[0.06,0.05,0.04], fogD:0.040, amb:0.16, lamps:0.14, ent:0, entKinds:["hound","crawler","bacteria"], entSpd:1.7, keys:1, dark:false, drain:1.25,
  decorKinds:["box","trash","crate"]},

 {n:"สถานีไฟฟ้า", en:"LEVEL 3", size:33, style:"rooms", desc:"กระแสไฟวิ่งอยู่ในผนัง ทุกครั้งที่ไฟกระพริบ เงาจะอยู่คนละที่กับเมื่อครู่",
  wall:["metal","#7a8290","#3b4048"], floor:["tile","#4a4f57","#2b2f35"], ceil:["#454b54","#262a30",false],
  fog:[0.05,0.06,0.08], fogD:0.045, amb:0.13, lamps:0.16, ent:3, entKinds:["shadow","faceling","bacteria"], entSpd:1.8, keys:1, dark:true, drain:1.35,
  decorKinds:["trash","box","shelf","cabinet"]},

 {n:"ออฟฟิศร้าง", en:"LEVEL 4", size:35, style:"rooms", desc:"โต๊ะทำงานยังมีแก้วกาแฟอุ่น ๆ ไม่มีใครลุกไปไหนเลย เพราะไม่เคยมีใคร",
  wall:["wallpaper","#cfc7a8","#8f886e"], floor:["carpet","#5d5c50","#3a3a33"], ceil:["#bab3a0","#7b7568",true],
  fog:[0.08,0.08,0.07], fogD:0.030, amb:0.22, lamps:0.22, ent:4, entKinds:["skinstealer","partygoer","partygoer"], entSpd:1.75, keys:2, dark:false, drain:1.3,
  decorKinds:["chair","shelf","plant","box","desk","cabinet","window"]},

 {n:"โรงแรม", en:"LEVEL 5", size:37, style:"rooms", desc:"ประตูห้อง 237 ทุกบาน กลอนล็อกจากข้างใน และมีเสียงปาร์ตี้แผ่วเบาดังออกมาจากห้องที่ไม่มีใครจอง",
  wall:["wallpaper","#8e3630","#4b1d1c"], floor:["carpet","#5a2321","#2e1211"], ceil:["#6d4b33","#3c2a1d",true],
  fog:[0.07,0.03,0.03], fogD:0.034, amb:0.18, lamps:0.20, ent:4, entKinds:["smiler","partygoer","skinstealer"], entSpd:1.85, keys:2, dark:false, drain:1.4,
  decorKinds:["chair","plant","box","window"]},

 {n:"ไฟดับ", en:"LEVEL 6", size:33, style:"corridor", desc:"ไม่มีหลอดไฟสักดวงเหลือแล้ว มีแค่ไฟฉายในมือ และสิ่งที่รอให้ไฟฉายหมด",
  wall:["concrete","#4c4a44","#211f1c"], floor:["tile","#302e2a","#171614"], ceil:["#282623","#131211",false],
  fog:[0.02,0.02,0.02], fogD:0.060, amb:0.04, lamps:0.02, ent:3, entKinds:["shadow","faceling"], entSpd:1.9, keys:1, dark:true, drain:1.5,
  decorKinds:["box","trash"]},

 {n:"กลัวน้ำลึก", en:"LEVEL 7", size:35, style:"cave", desc:"น้ำสูงถึงข้อเท้า เย็นเกินกว่าน้ำจะเย็นได้ และมีอะไรว่ายสวนขาคุณไป",
  wall:["rock","#3e5566","#17242e"], floor:["water","#274453","#0e1c24"], ceil:["#1d2c36","#0b1216",false],
  fog:[0.03,0.06,0.08], fogD:0.052, amb:0.10, lamps:0.10, ent:4, entKinds:["shadow","hound","bacteria"], entSpd:1.9, keys:2, dark:true, drain:1.5,
  decorKinds:["box","trash","crate"]},

 {n:"ถ้ำ", en:"LEVEL 8", size:37, style:"cave", desc:"หินที่นี่อุ่นเหมือนผิวคน ทางแยกจำทางที่คุณเคยเลือกไว้ได้ เงียบเกินไปสำหรับที่ที่ควรมีอะไรอาศัยอยู่",
  wall:["rock","#7a5c42","#33261b"], floor:["carpet","#4a3a2b","#241c14"], ceil:["#3a2d21","#1a140f",false],
  fog:[0.05,0.04,0.03], fogD:0.050, amb:0.11, lamps:0.10, ent:0, entKinds:["hound","crawler","bacteria"], entSpd:2.0, keys:2, dark:true, drain:1.55,
  decorKinds:["box","crate"]},

 {n:"ชานเมือง", en:"LEVEL 9", size:39, style:"sparse", desc:"ท้องฟ้ากลางคืนที่ไม่มีดาว บ้านทุกหลังเหมือนกัน และไฟหน้าบ้านหนึ่งหลังยังเปิดอยู่",
  wall:["fence","#6d6552","#332f27"], floor:["grass","#3c4a2c","#1d2415"], ceil:["#10131a","#05070b",false],
  fog:[0.03,0.04,0.06], fogD:0.038, amb:0.14, lamps:0.14, ent:5, entKinds:["skinstealer","partygoer","smiler","crawler"], entSpd:2.0, keys:2, dark:true, drain:1.5,
  decorKinds:["car","trash","window","crate"]},

 {n:"เลเวล !", en:"LEVEL !", size:31, style:"arena", desc:"ทุกอย่างเป็นสีแดง เสียงไซเรนดังในหัวคุณเอง วิ่งอย่างเดียว ห้ามหยุด",
  wall:["concrete","#a8301f","#3d0f0a"], floor:["tile","#5a1a12","#260907"], ceil:["#43110c","#1a0604",false],
  fog:[0.12,0.02,0.02], fogD:0.030, amb:0.20, lamps:0.10, ent:6, entKinds:["smiler","hound","shadow","crawler","partygoer","bacteria"], entSpd:2.25, keys:1, dark:false, drain:2.0,
  decorKinds:["box"]}
];

/* ---------- canvas / buffer ---------- */
const cvs=$("game"),ctx=cvs.getContext("2d",{alpha:false});
const off=document.createElement("canvas"),octx=off.getContext("2d",{alpha:false});
let RW=0,RH=0,img=null,buf=null,zbuf=null,quality=0.52;
function resize(){
  const dpr=Math.min(devicePixelRatio||1,2);
  cvs.width=Math.floor(innerWidth*dpr);cvs.height=Math.floor(innerHeight*dpr);
  RW=Math.max(200,Math.min(720,Math.floor(cvs.width*quality)));
  RH=Math.max(120,Math.floor(RW*cvs.height/cvs.width));
  off.width=RW;off.height=RH;
  img=octx.createImageData(RW,RH);
  buf=new Uint32Array(img.data.buffer);
  zbuf=new Float32Array(RW);
}
addEventListener("resize",resize);resize();

/* ---------- world state ---------- */
const G={
  state:"title", lvl:0, map:null, W:0,H:0, light:null, seen:null,
  px:1.5,py:1.5,ang:0, vx:0,vy:0, san:100, bat:100, light_on:true,
  keys:0, keysNeed:0, exitX:0,exitY:0, items:[], ents:[],
  time:0, flick:1, hurt:0, steps:0, bob:0, startTime:0, deaths:0, near:0,
  hasGun:false, gunKick:0, gunCooldown:0,
  hasSuit:false, megPity:0, megBase:null, lastAttacker:null,
  inBase:false, baseSave:null, npcs:[], clipT:0, clipHint:false, noclipMsg:""
};
let TEXW,TEXF,TEXC,SPR={},L=LEVELS[0];

/* ---------- maze ---------- */
// เลือกอัลกอริทึมสร้างผังตาม style ของแต่ละเลเวล เพื่อให้แต่ละเลเวลมีโครงสร้างต่างกันจริง
// ไม่ใช่แค่เปลี่ยนสีบนผังเขาวงกตแบบเดียวซ้ำ ๆ
function genMap(W,H,seed,style){
  let m;
  switch(style){
    case "rooms":  m=genRooms(W,H,seed); break;
    case "cave":   m=genCave(W,H,seed); break;
    case "sparse": m=genSparse(W,H,seed); break;
    case "arena":  m=genArena(W,H,seed); break;
    case "parking":m=genParking(W,H,seed); break;
    default:       m=genCorridor(W,H,seed);
  }
  ensureConnected(m,W,H,seed); // การันตีว่าทุกพื้นที่เปิดเดินถึงกันหมด ไม่มีมุมตายที่ออกไม่ได้
  return m;
}

// สไตล์ "corridor": เขาวงกตทางเดินแคบคลาสสิก (recursive backtracker) + เจาะวงวน + ห้องแทรก
function genCorridor(W,H,seed){
  const r=mulberry32(seed);
  const m=[];for(let y=0;y<H;y++)m.push(new Uint8Array(W).fill(1));
  const st=[[1,1]];m[1][1]=0;
  while(st.length){
    const c=st[st.length-1],x=c[0],y=c[1];
    const dirs=[[2,0],[-2,0],[0,2],[0,-2]];
    for(let i=dirs.length-1;i>0;i--){const j=(r()*(i+1))|0;const t=dirs[i];dirs[i]=dirs[j];dirs[j]=t;}
    let moved=false;
    for(const d of dirs){
      const nx=x+d[0],ny=y+d[1];
      if(nx>0&&ny>0&&nx<W-1&&ny<H-1&&m[ny][nx]===1){
        m[ny][nx]=0;m[y+d[1]/2][x+d[0]/2]=0;st.push([nx,ny]);moved=true;break;
      }
    }
    if(!moved)st.pop();
  }
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)
    if(m[y][x]===1&&r()<0.16)m[y][x]=0;
  const rooms=3+((r()*4)|0);
  for(let i=0;i<rooms;i++){
    const rw=3+((r()*4)|0),rh=3+((r()*4)|0);
    const rx=1+((r()*(W-rw-2))|0),ry=1+((r()*(H-rh-2))|0);
    for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++)m[y][x]=0;
  }
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  return m;
}

// สไตล์ "rooms": แบ่งพื้นที่แบบ BSP แล้วเจาะเป็นห้องสี่เหลี่ยม เชื่อมด้วยทางเดินตรง — ให้ฟีลตึกสำนักงาน/สถานี
function genRooms(W,H,seed){
  const r=mulberry32(seed^0x51ed);
  const m=[];for(let y=0;y<H;y++)m.push(new Uint8Array(W).fill(1));
  const leaves=[];
  function split(x0,y0,x1,y1,depth){
    const w=x1-x0,h=y1-y0;
    if(depth>=5||w<=8||h<=8||r()<0.18){leaves.push([x0,y0,x1,y1]);return;}
    let horizontal = h>w*1.25 ? true : (w>h*1.25 ? false : r()<0.5);
    if(horizontal){
      const cut=y0+4+((r()*Math.max(1,h-8))|0);
      split(x0,y0,x1,cut,depth+1); split(x0,cut,x1,y1,depth+1);
    }else{
      const cut=x0+4+((r()*Math.max(1,w-8))|0);
      split(x0,y0,cut,y1,depth+1); split(cut,y0,x1,y1,depth+1);
    }
  }
  split(1,1,W-1,H-1,0);
  const rooms=[];
  for(const lf of leaves){
    const [x0,y0,x1,y1]=lf, aw=x1-x0, ah=y1-y0;
    const rw=Math.max(3,aw-1-((r()*3)|0)), rh=Math.max(3,ah-1-((r()*3)|0));
    const rx=x0+1+((r()*Math.max(1,aw-rw-1))|0), ry=y0+1+((r()*Math.max(1,ah-rh-1))|0);
    for(let y=ry;y<Math.min(H-1,ry+rh);y++)for(let x=rx;x<Math.min(W-1,rx+rw);x++)m[y][x]=0;
    rooms.push([rx+rw/2|0, ry+rh/2|0]);
  }
  for(let i=1;i<rooms.length;i++){
    const [ax,ay]=rooms[i-1], [bx,by]=rooms[i];
    let cx=ax,cy=ay;
    while(cx!==bx){m[cy][cx]=0;if(cy+1<H-1&&r()<0.3)m[cy+1][cx]=0;cx+=cx<bx?1:-1;}
    while(cy!==by){m[cy][cx]=0;if(cx+1<W-1&&r()<0.3)m[cy][cx+1]=0;cy+=cy<by?1:-1;}
  }
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  return m;
}

// สไตล์ "cave": cellular automata ให้ผนังโค้งอินทรีย์แบบถ้ำ/ท้องน้ำ
function genCave(W,H,seed){
  const r=mulberry32(seed^0x2743);
  let m=[];
  for(let y=0;y<H;y++){
    const row=new Uint8Array(W);
    for(let x=0;x<W;x++)row[x]=(x===0||y===0||x===W-1||y===H-1)?1:(r()<0.44?1:0);
    m.push(row);
  }
  const nbCount=(g,x,y)=>{let c=0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;
      if(nx<0||ny<0||nx>=W||ny>=H||g[ny][nx]===1)c++;
    }return c;};
  for(let it=0;it<5;it++){
    const nm=m.map(row=>row.slice());
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const c=nbCount(m,x,y);
      nm[y][x]= c>=5 ? 1 : (c<=2 ? 0 : m[y][x]);
    }
    m=nm;
  }
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  return m;
}

// สไตล์ "sparse": พื้นโล่งกว้าง มีบล็อกกระจายห่าง ๆ (ฟีลบ้านชานเมือง)
function genSparse(W,H,seed){
  const r=mulberry32(seed^0x9f31);
  const m=[];for(let y=0;y<H;y++)m.push(new Uint8Array(W).fill(0));
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  const blocks=8+((r()*6)|0);
  for(let i=0;i<blocks;i++){
    const bw=3+((r()*4)|0), bh=3+((r()*4)|0);
    const bx=2+((r()*Math.max(1,W-bw-4))|0), by=2+((r()*Math.max(1,H-bh-4))|0);
    for(let y=by;y<by+bh;y++)for(let x=bx;x<bx+bw;x++)m[y][x]=1;
  }
  return m;
}

// สไตล์ "arena": สนามโล่งเล็ก มีเสากระจาย เหมาะกับด่านไล่ล่ากดดันสูง
function genArena(W,H,seed){
  const r=mulberry32(seed^0x1c4f);
  const m=[];for(let y=0;y<H;y++)m.push(new Uint8Array(W).fill(0));
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  const pillars=10+((r()*10)|0);
  for(let i=0;i<pillars;i++){
    const s=1+((r()*2)|0);
    const px=2+((r()*Math.max(1,W-s-4))|0), py=2+((r()*Math.max(1,H-s-4))|0);
    for(let y=py;y<py+s;y++)for(let x=px;x<px+s;x++)m[y][x]=1;
  }
  return m;
}

// สไตล์ "parking": ลานจอดรถจริง ๆ — เสาโครงสร้างเรียงเป็นตาราง + รถจอดเรียงเป็นแถวสลับกับเลนขับ
function genParking(W,H,seed){
  const r=mulberry32(seed^0x7a2c);
  const m=[];for(let y=0;y<H;y++)m.push(new Uint8Array(W).fill(0));
  for(let x=0;x<W;x++){m[0][x]=1;m[H-1][x]=1;}
  for(let y=0;y<H;y++){m[y][0]=1;m[y][W-1]=1;}
  // เสาโครงสร้างเป็นตารางห่าง ๆ
  for(let y=3;y<H-3;y+=5)for(let x=3;x<W-3;x+=5)if(r()<0.85)m[y][x]=1;
  // แถวรถจอด: ทุก 4 แถว เว้น 1 แถวไว้เป็นเลนขับผ่าน อีก 2 แถวเป็นช่องจอด
  for(let y=2;y<H-2;y++){
    const rowType=y%4;
    if(rowType===1||rowType===2){
      for(let x=2;x<W-2;x+=2){
        if(r()<0.62){ // "รถ" หนึ่งคัน กว้าง 2 ช่อง
          m[y][x]=1;
          if(x+1<W-2)m[y][x+1]=1;
        }
      }
    }
  }
  return m;
}

// น้ำท่วมจากจุดหนึ่งเพื่อดูว่าเซลล์เปิดใดเดินถึงบ้าง
function floodFrom(m,W,H,sx,sy){
  const seen=new Uint8Array(W*H);
  if(m[sy][sx]===1)return seen;
  const st=[sx+sy*W];seen[sx+sy*W]=1;
  for(let i=0;i<st.length;i++){
    const c=st[i],x=c%W,y=(c/W)|0;
    const nb=[[1,0],[-1,0],[0,1],[0,-1]];
    for(const d of nb){
      const nx=x+d[0],ny=y+d[1];
      if(nx<0||ny<0||nx>=W||ny>=H||m[ny][nx]===1)continue;
      const k=nx+ny*W;if(!seen[k]){seen[k]=1;st.push(k);}
    }
  }
  return seen;
}
// การันตีว่าไม่มีบริเวณเปิดที่แยกโดดถูกปิดตาย — เจาะอุโมงค์ตรงเชื่อมจนทุกพื้นที่ถึงกันหมด
function ensureConnected(m,W,H,seed){
  let sx=-1,sy=-1;
  for(let y=1;y<H-1&&sx<0;y++)for(let x=1;x<W-1;x++)if(m[y][x]===0){sx=x;sy=y;break;}
  if(sx<0)return;
  let guard=0;
  while(guard++<300){
    const seen=floodFrom(m,W,H,sx,sy);
    let tx=-1,ty=-1;
    for(let y=1;y<H-1&&tx<0;y++)for(let x=1;x<W-1;x++)
      if(m[y][x]===0&&!seen[x+y*W]){tx=x;ty=y;break;}
    if(tx<0)break;
    let bx=sx,by=sy,bd=1e18;
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      if(!seen[x+y*W])continue;
      const dd=(x-tx)*(x-tx)+(y-ty)*(y-ty);
      if(dd<bd){bd=dd;bx=x;by=y;}
    }
    let cx=bx,cy=by;
    while(cx!==tx||cy!==ty){
      if(cx<tx)cx++; else if(cx>tx)cx--;
      m[cy][cx]=0;
      if(cy<ty)cy++; else if(cy>ty)cy--;
      m[cy][cx]=0;
    }
    m[ty][tx]=0;
  }
}
function bfs(m,W,H,sx,sy){
  const d=new Int32Array(W*H).fill(-1);const q=[sx+sy*W];d[sx+sy*W]=0;
  for(let i=0;i<q.length;i++){
    const c=q[i],x=c%W,y=(c/W)|0;
    const nb=[[1,0],[-1,0],[0,1],[0,-1]];
    for(const n of nb){const nx=x+n[0],ny=y+n[1];
      if(nx<0||ny<0||nx>=W||ny>=H)continue;
      if(m[ny][nx]===1)continue;
      const k=nx+ny*W;if(d[k]<0){d[k]=d[c]+1;q.push(k);}}
  }
  return d;
}
function buildLight(m,W,H,density,seed){
  const r=mulberry32(seed);const lm=new Float32Array(W*H);
  const lamps=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)
    if(m[y][x]===0&&r()<density)lamps.push([x,y]);
  if(!lamps.length)lamps.push([1,1]);
  for(const lp of lamps){
    const R=5;
    for(let y=Math.max(0,lp[1]-R);y<Math.min(H,lp[1]+R);y++)
      for(let x=Math.max(0,lp[0]-R);x<Math.min(W,lp[0]+R);x++){
        const dd=Math.hypot(x-lp[0],y-lp[1]);
        if(dd<R)lm[x+y*W]=Math.min(1.15,lm[x+y*W]+(1-dd/R)*0.85);
      }
  }
  return lm;
}

/* ---------- level load ---------- */
function loadLevel(i,forcedSeed){
  L=LEVELS[i];G.lvl=i;
  // ถ้ามี forcedSeed (ส่งมาจากเซิร์ฟเวอร์มัลติเพลเยอร์) ใช้ค่านั้นแทน เพื่อให้ทุกคนได้เขาวงกตผังเดียวกัน
  const seed=(forcedSeed!==undefined)?forcedSeed:((i+1)*7919+((Math.random()*10000)|0));
  rnd=mulberry32(seed);
  const S=L.size|1;G.W=S;G.H=S;
  G.map=genMap(S,S,seed,L.style||"corridor");
  G.light=buildLight(G.map,S,S,L.lamps,seed+3);
  G.seen=new Uint8Array(S*S);
  TEXW=makeWall(L.wall[0],L.wall[1],L.wall[2],seed+11);
  TEXF=makeFloor(L.floor[0],L.floor[1],L.floor[2],seed+21);
  TEXC=makeCeil(L.ceil[0],L.ceil[1],seed+31,L.ceil[2]);
  // สร้างสไปรท์สัตว์ประหลาดของทุกชนิดที่เลเวลนี้ใช้ (อาจมีมากกว่า 1 ชนิดต่อเลเวล)
  SPR.entTex={};
  const kindsHere=[...new Set(L.entKinds||["smiler"])];
  kindsHere.forEach((k,idx)=>{SPR.entTex[k]=spriteEntity(k,seed+41+idx*97);});
  SPR.water=spriteItem("water");SPR.key=spriteItem("key");
  SPR.battery=spriteItem("battery");SPR.exit=spriteItem("exit");SPR.gun=spriteItem("gun");

  // จุดเริ่ม
  let sx=1,sy=1;
  outer:for(let y=1;y<S;y++)for(let x=1;x<S;x++)if(G.map[y][x]===0){sx=x;sy=y;break outer;}
  G.px=sx+0.5;G.py=sy+0.5;G.ang=rnd()*6.283;
  const dist=bfs(G.map,S,S,sx,sy);

  // ทางออก = จุดไกลสุด
  let best=-1,bi=0;
  for(let k=0;k<dist.length;k++)if(dist[k]>best){best=dist[k];bi=k;}
  G.exitX=(bi%S)+0.5;G.exitY=((bi/S)|0)+0.5;

  // ไอเทม
  G.inBase=false;G.baseSave=null;G.npcs=[];G.clipT=0;G.clipHint=false;
  G.items=[];G.keys=0;G.keysNeed=L.keys;
  const cells=[];
  for(let k=0;k<dist.length;k++)if(dist[k]>6)cells.push(k);
  const pick=()=>{const k=cells.splice((rnd()*cells.length)|0,1)[0];return[(k%S)+0.5,((k/S)|0)+0.5];};
  for(let k=0;k<L.keys;k++){const p=pick();G.items.push({x:p[0],y:p[1],t:"key",tex:SPR.key,scale:0.55,off:0.25});}
  const waters=3+((rnd()*3)|0);
  for(let k=0;k<waters;k++){const p=pick();G.items.push({x:p[0],y:p[1],t:"water",tex:SPR.water,scale:0.42,off:0.3});}
  if(L.dark){const bats=2+((rnd()*3)|0);
    for(let k=0;k<bats;k++){const p=pick();G.items.push({x:p[0],y:p[1],t:"battery",tex:SPR.battery,scale:0.4,off:0.3});}}
  // ปืน — วางไว้ทุกเลเวล เผื่อพลาดเก็บจากเลเวลก่อนหน้า
  {const p=pick();G.items.push({x:p[0],y:p[1],t:"gun",tex:SPR.gun,scale:0.42,off:0.32});}
  G.items.push({x:G.exitX,y:G.exitY,t:"exit",tex:SPR.exit,scale:1.0,off:0.0});

  // สิ่งมีชีวิต — สุ่มชนิดจากรายการที่กำหนดไว้ของเลเวลนี้ ทำให้แต่ละตัวไม่เหมือนกันหมด
  G.ents=[];
  G.lastAttacker=null;
  const kindList=L.entKinds||["smiler"];
  for(let k=0;k<L.ent;k++){
    let p=pick(),guard=0;
    while(Math.hypot(p[0]-G.px,p[1]-G.py)<8&&cells.length&&guard++<30)p=pick();
    const kind=kindList[(rnd()*kindList.length)|0];
    G.ents.push({x:p[0],y:p[1],tx:p[0],ty:p[1],spd:L.entSpd,mad:0,kind});
  }

  // ของตกแต่ง — แค่บรรยากาศ ไม่ส่งผลต่อเกมเพลย์
  G.decor=[];
  const decorKinds=L.decorKinds||["box"];
  const decorRange=L.decorCount||[5,10];
  const decorCount=decorRange[0]+((rnd()*(decorRange[1]-decorRange[0]+1))|0);
  for(let k=0;k<decorCount&&cells.length;k++){
    const p=pick();
    const kind=decorKinds[(rnd()*decorKinds.length)|0];
    const dscale=0.4+rnd()*0.3;
    G.decor.push({x:p[0],y:p[1],tex:DECOR_SPR[kind],scale:dscale,off:0.5*(1-dscale)});
  }

  // หน่วยพันธมิตร M.E.G. ชุดเหลือง — เดินสำรวจไปมา เห็นเราแล้ววิ่งเข้ามาช่วย
  // มีระบบการันตี (pity): ถ้าหลายเลเวลติดกันไม่เจอเลย เลเวลถัดไปจะสุ่มใหม่จนกว่าจะเจอ
  G.allies=[];
  G.megBase=null;
  if(i>0){
    const spawnAlly=(bias)=>{
      if(!cells.length)return null;
      let candidates=cells.filter(k=>{
        const cx=(k%S)+0.5, cy=((k/S)|0)+0.5;
        return Math.hypot(cx-G.exitX,cy-G.exitY)<10;
      });
      let p;
      if(bias&&candidates.length){
        const k=candidates[(rnd()*candidates.length)|0];
        cells.splice(cells.indexOf(k),1);
        p=[(k%S)+0.5,((k/S)|0)+0.5];
      }else p=pick();
      G.allies.push({x:p[0],y:p[1],tx:p[0],ty:p[1],spd:0.6,aware:0,helped:false});
      return p;
    };
    const roll=rnd();
    let spawned=false;
    if(roll<0.55||G.megPity>=2){ spawnAlly(true); spawned=true; G.megPity=0; }
    else G.megPity++;
    if(spawned&&rnd()<0.15)spawnAlly(false); // นาน ๆ ทีอาจเจอสองหน่วยในเลเวลเดียวกัน

    // ฐานของหน่วย M.E.G. — ประตูมิติใกล้ ๆ จุดที่หน่วยนั้นออกลาดตระเวน บางครั้งเปิด บางครั้งปิด
    if(spawned&&G.allies.length&&cells.length){
      const anchor=G.allies[0];
      let baseCand=cells.filter(k=>{
        const cx=(k%S)+0.5, cy=((k/S)|0)+0.5;
        return Math.hypot(cx-anchor.x,cy-anchor.y)<7;
      });
      let bp;
      if(baseCand.length){
        const k=baseCand[(rnd()*baseCand.length)|0];
        cells.splice(cells.indexOf(k),1);
        bp=[(k%S)+0.5,((k/S)|0)+0.5];
      }else bp=pick();
      const open=rnd()<0.6;
      G.megBase={x:bp[0],y:bp[1],open,looted:false};
      G.items.push({x:bp[0],y:bp[1],t:"megbase",tex:spriteItem(open?"megbase_open":"megbase_closed"),scale:0.85,off:0.075});
    }
  }

  G.bat=L.dark?clamp(G.bat,35,100):100;
  G.light_on=true;
  $("batMeter").style.display=L.dark?"block":"none";
  $("lvlName").textContent=L.n;
  $("lvlSub").textContent=L.en;
  drawKeys();
}
function drawKeys(){
  let s="";for(let i=0;i<G.keysNeed;i++)s+='<span class="'+(i<G.keys?"on":"")+'">⬤</span>';
  $("keys").innerHTML=G.keysNeed?"คีย์การ์ด "+s:"";
}

/* ---------- rendering ---------- */
let mpLabels=[];
function render(){
  const dirX=Math.cos(G.ang),dirY=Math.sin(G.ang);
  const FOV=0.72;
  const plX=-dirY*FOV,plY=dirX*FOV;
  const W=G.W,H=G.H,map=G.map,lm=G.light;
  const fr=L.fog[0]*255,fg=L.fog[1]*255,fb=L.fog[2]*255;
  const fogD=L.fogD, amb=L.amb;
  const flick=G.flick;
  const horizon=(RH>>1)+((G.bob*14)|0);
  const flashPow=(G.light_on&&G.bat>0)?1:0;
  const insane=1-clamp(G.san/100,0,1);

  /* ถมสีหมอกไว้ก่อน กันแถวที่ floorcast เข้าไม่ถึง */
  {
    const c=0xFF000000|((fb|0)<<16)|((fg|0)<<8)|(fr|0);
    const end=Math.min(RH,Math.max(0,horizon+1))*RW;
    for(let i=0;i<end;i++)buf[i]=c;
  }

  /* พื้น + เพดาน (floor casting) */
  const fd=TEXF.d,cd=TEXC.d,FW=TEXF.w,CW=TEXC.w;
  for(let y=horizon+1;y<RH;y++){
    const p=y-horizon;
    const rowDist=(0.5*RH)/p;
    if(rowDist>42)continue;
    const stepX=rowDist*2*plX/RW, stepY=rowDist*2*plY/RW;
    let fx=G.px+rowDist*(dirX-plX), fy=G.py+rowDist*(dirY-plY);
    const fogF=1/(1+rowDist*rowDist*fogD);
    const rowF=horizon*2-y;
    const idxF=y*RW, idxC=(rowF>=0?rowF*RW:-1);
    for(let x=0;x<RW;x++){
      const cx=fx|0, cy=fy|0;
      let lv=amb;
      if(cx>=0&&cy>=0&&cx<W&&cy<H)lv=amb+lm[cx+cy*W]*flick*0.9;
      // ไฟฉาย
      if(flashPow){
        const sd=Math.abs(x-RW/2)/(RW/2);
        lv+=Math.max(0,(1-sd*1.55))*Math.max(0,1-rowDist/11)*0.95;
      }
      lv=lv<0.03?0.03:(lv>1.5?1.5:lv);
      const tf=((((fy*FW)|0)&63)*FW+(((fx*FW)|0)&63))*3;
      let r=fd[tf]*lv,g=fd[tf+1]*lv,b=fd[tf+2]*lv;
      r=r*fogF+fr*(1-fogF);g=g*fogF+fg*(1-fogF);b=b*fogF+fb*(1-fogF);
      buf[idxF+x]=0xFF000000|(b<<16)|(g<<8)|r;
      if(idxC>=0){
        const lc=lv*0.82;
        const tc=((((fy*CW)|0)&63)*CW+(((fx*CW)|0)&63))*3;
        let r2=cd[tc]*lc,g2=cd[tc+1]*lc,b2=cd[tc+2]*lc;
        r2=r2*fogF+fr*(1-fogF);g2=g2*fogF+fg*(1-fogF);b2=b2*fogF+fb*(1-fogF);
        buf[idxC+x]=0xFF000000|(b2<<16)|(g2<<8)|r2;
      }
      fx+=stepX;fy+=stepY;
    }
  }
  /* ผนัง */
  const wd=TEXW.d;
  for(let x=0;x<RW;x++){
    const camX=2*x/RW-1;
    const rdx=dirX+plX*camX, rdy=dirY+plY*camX;
    let mx=G.px|0,my=G.py|0;
    const ddx=rdx===0?1e30:Math.abs(1/rdx), ddy=rdy===0?1e30:Math.abs(1/rdy);
    let sx,sy,sdx,sdy;
    if(rdx<0){sx=-1;sdx=(G.px-mx)*ddx;}else{sx=1;sdx=(mx+1-G.px)*ddx;}
    if(rdy<0){sy=-1;sdy=(G.py-my)*ddy;}else{sy=1;sdy=(my+1-G.py)*ddy;}
    let hit=0,side=0,guard=0;
    while(!hit&&guard++<140){
      if(sdx<sdy){sdx+=ddx;mx+=sx;side=0;}else{sdy+=ddy;my+=sy;side=1;}
      if(mx<0||my<0||mx>=W||my>=H){hit=2;break;}
      if(map[my][mx]===1)hit=1;
    }
    let dist=side===0?(sdx-ddx):(sdy-ddy);
    if(hit===2)dist=60;
    if(dist<0.01)dist=0.01;
    zbuf[x]=dist;
    const lh=(RH/dist)|0;
    let y0=horizon-(lh>>1), y1=horizon+(lh>>1);
    const dy0=y0<0?0:y0, dy1=y1>RH?RH:y1;
    let wallX=side===0?G.py+dist*rdy:G.px+dist*rdx;
    wallX-=wallX|0;
    let tx=(wallX*64)|0;
    if((side===0&&rdx>0)||(side===1&&rdy<0))tx=63-tx;
    const fogF=1/(1+dist*dist*fogD);
    let lv=amb;
    if(mx>=0&&my>=0&&mx<W&&my<H)lv=amb+G.light[mx+my*W]*flick*0.9;
    if(flashPow){
      const sd=Math.abs(x-RW/2)/(RW/2);
      lv+=Math.max(0,(1-sd*1.55))*Math.max(0,1-dist/12)*1.0;
    }
    if(side===1)lv*=0.74;
    lv=lv<0.03?0.03:(lv>1.6?1.6:lv);
    const stepT=64/lh;
    let tpos=(dy0-horizon+(lh>>1))*stepT;
    for(let y=dy0;y<dy1;y++){
      const ty=tpos&63;tpos+=stepT;
      const t=(ty*64+tx)*3;
      let r=wd[t]*lv,g=wd[t+1]*lv,b=wd[t+2]*lv;
      r=r*fogF+fr*(1-fogF);g=g*fogF+fg*(1-fogF);b=b*fogF+fb*(1-fogF);
      buf[y*RW+x]=0xFF000000|(b<<16)|(g<<8)|r;
    }
  }

  /* สไปรท์ */
  const list=[];
  for(const it of G.items)if(!it.dead)list.push(it);
  for(const e of G.ents)list.push({x:e.x,y:e.y,tex:SPR.entTex[e.kind]||SPR.entTex[Object.keys(SPR.entTex)[0]],scale:1.0,off:0,ent:true});
  for(const d of G.decor)list.push(d);
  for(const a of G.allies)list.push({x:a.x,y:a.y,tex:ALLY_SPRITE,scale:1.0,off:0,ally:true});
  for(const n of G.npcs)list.push({x:n.x,y:n.y,tex:n.tex,scale:1.0,off:0,npc:true,name:n.name});
  for(const pid in MP.others){
    const p=MP.others[pid];
    if(p.lvl!==G.lvl)continue; // แสดงเฉพาะเพื่อนที่อยู่เลเวลเดียวกับเรา
    list.push({x:p.x,y:p.y,tex:PLAYER_SPRITE,scale:1.0,off:0,isPlayer:true,name:p.name});
  }
  mpLabels.length=0;
  for(const s of list)s._d=(s.x-G.px)*(s.x-G.px)+(s.y-G.py)*(s.y-G.py);
  list.sort((a,b)=>b._d-a._d);
  const invDet=1/(plX*dirY-dirX*plY);
  for(const s of list){
    const rx=s.x-G.px, ry=s.y-G.py;
    const tX=invDet*(dirY*rx-dirX*ry);
    const tY=invDet*(-plY*rx+plX*ry);
    if(tY<=0.15)continue;
    const scrX=((RW/2)*(1+tX/tY))|0;
    const sh=Math.abs((RH/tY)*s.scale)|0;
    const sw=sh;
    const vMove=(s.off*RH/tY)|0;
    let y0=horizon-(sh>>1)+vMove, y1=y0+sh;
    const dy0=y0<0?0:y0, dy1=y1>RH?RH:y1;
    let x0=scrX-(sw>>1), x1=x0+sw;
    const dx0=x0<0?0:x0, dx1=x1>RW?RW:x1;
    const tex=s.tex, td=tex.d, tw=tex.w, th=tex.h;
    const fogF=1/(1+tY*tY*fogD);
    let lv=amb+0.25;
    const cx2=s.x|0, cy2=s.y|0;
    if(cx2>=0&&cy2>=0&&cx2<W&&cy2<H)lv=amb+G.light[cx2+cy2*W]*flick*0.8+0.12;
    if(flashPow){
      const sd=Math.abs(scrX-RW/2)/(RW/2);
      lv+=Math.max(0,(1-sd*1.5))*Math.max(0,1-tY/12)*1.0;
    }
    if(s.t==="exit")lv=1.4;
    if(s.isPlayer)mpLabels.push({sx:scrX, sy:y0, name:s.name});
    else if(s.npc&&tY<7&&tY<zbuf[clamp(scrX,0,RW-1)])mpLabels.push({sx:scrX, sy:y0, name:s.name});
    lv=clamp(lv,0.05,1.7);
    for(let x=dx0;x<dx1;x++){
      if(tY>=zbuf[x])continue;
      const tx=(((x-x0)*tw/sw)|0);
      if(tx<0||tx>=tw)continue;
      for(let y=dy0;y<dy1;y++){
        const ty=(((y-y0)*th/sh)|0);
        const t=(ty*tw+tx)*4;
        if(td[t+3]<40)continue;
        let r=td[t]*lv,g=td[t+1]*lv,b=td[t+2]*lv;
        r=r*fogF+fr*(1-fogF);g=g*fogF+fg*(1-fogF);b=b*fogF+fb*(1-fogF);
        buf[y*RW+x]=0xFF000000|(b<<16)|(g<<8)|r;
      }
    }
  }

  /* เกรน + สติต่ำ */
  if(insane>0.02||true){
    const gAmt=6+insane*26;
    for(let i=0;i<(RW*RH)>>4;i++){
      const p=(Math.random()*RW*RH)|0;
      const c=buf[p];
      let r=c&255,g=(c>>8)&255,b=(c>>16)&255;
      const d=(Math.random()-0.5)*gAmt;
      r=clamp(r+d,0,255)|0;g=clamp(g+d,0,255)|0;b=clamp(b+d,0,255)|0;
      buf[p]=0xFF000000|(b<<16)|(g<<8)|r;
    }
  }

  octx.putImageData(img,0,0);
  ctx.imageSmoothingEnabled=true;
  ctx.drawImage(off,0,0,RW,RH,0,0,cvs.width,cvs.height);

  /* ป้ายชื่อผู้เล่นในโหมดมัลติเพลเยอร์ */
  if(mpLabels.length){
    const scale=cvs.width/RW;
    ctx.font=Math.max(11,12*scale/2)+"px "+getComputedStyle(document.body).fontFamily;
    ctx.textAlign="center";
    for(const lb of mpLabels){
      const sx=lb.sx*scale, sy=lb.sy*scale-10;
      ctx.fillStyle="rgba(0,0,0,.55)";
      ctx.fillText(lb.name,sx+1,sy+1);
      ctx.fillStyle="#bfe8c8";
      ctx.fillText(lb.name,sx,sy);
    }
    ctx.textAlign="left";
  }

  /* เอฟเฟกต์จอกระตุกตอนกำลังจะ noclip */
  if(G.clipT>0.12){
    const cw=cvs.width,ch=cvs.height,k=G.clipT;
    for(let i=0;i<4+(k*8|0);i++){
      const sy=(Math.random()*ch)|0,sh2=6+((Math.random()*40*k)|0),dxs=((Math.random()-0.5)*90*k)|0;
      ctx.drawImage(cvs,0,sy,cw,Math.min(sh2,ch-sy),dxs,sy,cw,Math.min(sh2,ch-sy));
    }
    ctx.fillStyle="rgba(170,255,255,"+(k*k*0.35).toFixed(3)+")";ctx.fillRect(0,0,cw,ch);
  }

  /* vignette + สีเตือน */
  const w=cvs.width,h=cvs.height;
  const gr=ctx.createRadialGradient(w/2,h/2,h*0.22,w/2,h/2,h*0.78);
  gr.addColorStop(0,"rgba(0,0,0,0)");
  gr.addColorStop(1,"rgba(0,0,0,"+(0.55+insane*0.3).toFixed(2)+")");
  ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);
  if(G.hurt>0){ctx.fillStyle="rgba(150,20,14,"+(G.hurt*0.45).toFixed(3)+")";ctx.fillRect(0,0,w,h);}
  if(G.near>0.01){ctx.fillStyle="rgba(120,10,10,"+(G.near*0.22).toFixed(3)+")";ctx.fillRect(0,0,w,h);}

  drawGunViewmodel(ctx,w,h);
}

/* ---------- ปืนในมือ (viewmodel) ---------- */
function drawGunViewmodel(ctx,w,h){
  if(!G.hasGun)return;
  const bob=G.bob*8;
  const kick=G.gunKick||0;
  const baseX=w*0.72, baseY=h*0.98-kick*h*0.045;
  const scale=w/780; // ขยายให้เห็นปืนชัดเจนกว่าเดิม
  ctx.save();
  ctx.translate(baseX,baseY+bob);
  ctx.scale(scale,scale);
  ctx.rotate(-0.04-kick*0.10);
  ctx.lineJoin="round";
  // ด้ามจับไม้
  ctx.fillStyle="#2b2018";
  ctx.fillRect(-40,40,72,170);
  ctx.strokeStyle="rgba(0,0,0,.55)";ctx.lineWidth=3;
  ctx.strokeRect(-40,40,72,170);
  ctx.fillStyle="rgba(0,0,0,.25)";
  ctx.fillRect(-40,40,10,170);
  // เฟรม/สไลด์โลหะ ไล่เฉดให้ดูมันวาว
  const grad=ctx.createLinearGradient(-190,-40,140,90);
  grad.addColorStop(0,"#575a5f");grad.addColorStop(0.45,"#2c2e32");grad.addColorStop(1,"#66686d");
  ctx.fillStyle=grad;
  ctx.fillRect(-190,-8,320,60);
  ctx.strokeStyle="rgba(0,0,0,.6)";ctx.lineWidth=3;
  ctx.strokeRect(-190,-8,320,60);
  ctx.fillRect(-40,28,120,38);
  // ลำกล้อง
  ctx.fillStyle="#1b1c1f";
  ctx.fillRect(-250,2,90,24);
  ctx.strokeRect(-250,2,90,24);
  ctx.fillStyle="#111214";
  ctx.fillRect(-260,4,14,20);
  // โกร่งไก
  ctx.strokeStyle="#111";ctx.lineWidth=9;
  ctx.beginPath();ctx.arc(5,58,24,0,Math.PI*1.3);ctx.stroke();
  // เส้นไฮไลต์มันวาวด้านบนสไลด์
  ctx.fillStyle="rgba(255,255,255,.16)";
  ctx.fillRect(-180,-4,300,6);
  // จุดเล็งด้านหลัง
  ctx.fillStyle="#1a1a1c";
  ctx.fillRect(115,-14,14,10);
  ctx.restore();

  if(kick>0.04){
    ctx.save();
    ctx.translate(baseX+(-250)*scale,baseY+8*scale+bob);
    const r=95*scale*kick;
    const g2=ctx.createRadialGradient(0,0,0,0,0,r);
    g2.addColorStop(0,"rgba(255,246,210,"+(0.9*kick).toFixed(3)+")");
    g2.addColorStop(0.5,"rgba(255,196,80,"+(0.5*kick).toFixed(3)+")");
    g2.addColorStop(1,"rgba(255,150,40,0)");
    ctx.fillStyle=g2;
    ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();
    ctx.restore();
  }
}

/* ---------- minimap ---------- */
const mcv=$("mapCv"),mtx=mcv.getContext("2d");
function drawMap(){
  const S=G.W,cell=150/S;
  mtx.clearRect(0,0,150,150);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    if(!G.seen[x+y*S])continue;
    mtx.fillStyle=G.map[y][x]===1?"rgba(232,197,74,.22)":"rgba(0,0,0,.55)";
    mtx.fillRect(x*cell,y*cell,cell+0.6,cell+0.6);
  }
  if(!G.inBase&&G.seen[(G.exitX|0)+((G.exitY|0))*S]){
    mtx.fillStyle="#54d07a";mtx.fillRect(G.exitX*cell-2,G.exitY*cell-2,4,4);
  }
  // ฐาน M.E.G. และเส้นทางลาดตระเวนของหน่วย — โชว์เฉพาะพื้นที่ที่เคยสำรวจมาแล้วเท่านั้น
  if(!G.inBase&&G.megBase&&G.seen[(G.megBase.x|0)+((G.megBase.y|0))*S]){
    mtx.fillStyle=G.megBase.open?"#8ee0ea":"#777";
    mtx.beginPath();mtx.arc(G.megBase.x*cell,G.megBase.y*cell,3,0,6.283);mtx.fill();
  }
  for(const a of G.allies){
    if(G.inBase||!G.seen[(a.x|0)+((a.y|0))*S])continue;
    if(G.megBase){
      mtx.strokeStyle="rgba(142,224,234,.35)";mtx.setLineDash([2,3]);mtx.lineWidth=1;
      mtx.beginPath();mtx.moveTo(G.megBase.x*cell,G.megBase.y*cell);mtx.lineTo(a.x*cell,a.y*cell);mtx.stroke();
      mtx.setLineDash([]);
    }
    mtx.fillStyle=a.helped?"rgba(200,200,80,.4)":"#e8c54a";
    mtx.beginPath();mtx.arc(a.x*cell,a.y*cell,2.6,0,6.283);mtx.fill();
  }
  mtx.fillStyle="#fff";
  mtx.beginPath();mtx.arc(G.px*cell,G.py*cell,2.4,0,6.283);mtx.fill();
  mtx.strokeStyle="rgba(255,255,255,.7)";mtx.beginPath();
  mtx.moveTo(G.px*cell,G.py*cell);
  mtx.lineTo((G.px+Math.cos(G.ang)*1.6)*cell,(G.py+Math.sin(G.ang)*1.6)*cell);mtx.stroke();
}

/* ---------- audio ---------- */
let AC=null,hum=null,humG=null,noiseG=null;
function audioInit(){
  if(AC)return;
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  hum=AC.createOscillator();hum.type="sawtooth";hum.frequency.value=58;
  humG=AC.createGain();humG.gain.value=0.02;
  const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=260;
  hum.connect(lp).connect(humG).connect(AC.destination);hum.start();
  const len=AC.sampleRate*2, b=AC.createBuffer(1,len,AC.sampleRate), ch=b.getChannelData(0);
  for(let i=0;i<len;i++)ch[i]=(Math.random()*2-1)*0.5;
  const src=AC.createBufferSource();src.buffer=b;src.loop=true;
  const nf=AC.createBiquadFilter();nf.type="bandpass";nf.frequency.value=480;nf.Q.value=0.6;
  noiseG=AC.createGain();noiseG.gain.value=0.006;
  src.connect(nf).connect(noiseG).connect(AC.destination);src.start();
}
function blip(f,dur,type,vol){
  if(!AC)return;
  const o=AC.createOscillator(),g=AC.createGain();
  o.type=type||"square";o.frequency.value=f;
  g.gain.setValueAtTime(vol||0.05,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001,AC.currentTime+dur);
  o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+dur);
}

/* ---------- multiplayer (ต้องมี server.js รันอยู่แยกต่างหาก) ---------- */
const PLAYER_SPRITE = spritePlayer(4242);
const ALLY_SPRITE = spriteEntity("meg",4001);
const DECOR_SPR = {
  box:spriteDecor("box"), chair:spriteDecor("chair"), plant:spriteDecor("plant"),
  trash:spriteDecor("trash"), shelf:spriteDecor("shelf"), car:spriteDecor("car"),
  desk:spriteDecor("desk"), cabinet:spriteDecor("cabinet"),
  window:spriteDecor("window"), crate:spriteDecor("crate")
};
const MP = {
  ws:null, connected:false, id:null, room:"main", name:"เดินหลง"+((Math.random()*999)|0),
  others:{}, pendingStart:false
};
function mpUpdateStatus(){
  const el=$("mpStatus");
  if(!MP.connected){el.textContent="";return;}
  el.textContent="● ออนไลน์ในห้อง \""+MP.room+"\" ("+(Object.keys(MP.others).length+1)+" คน)";
}
function mpConnect(url,room,name){
  MP.room=room||MP.room; MP.name=name||MP.name;
  let ws;
  try{ ws=new WebSocket(url); }catch(e){ toast("ที่อยู่เซิร์ฟเวอร์ไม่ถูกต้อง"); return; }
  MP.ws=ws;
  ws.onopen=()=>{
    MP.connected=true; mpUpdateStatus();
    ws.send(JSON.stringify({t:"join", room:MP.room, name:MP.name}));
    if(MP.pendingStart){ MP.pendingStart=false; ws.send(JSON.stringify({t:"nextLevel", lvl:0})); }
  };
  ws.onclose=()=>{ MP.connected=false; MP.others={}; mpUpdateStatus(); if(G.state==="play")toast("หลุดจากเซิร์ฟเวอร์มัลติเพลเยอร์"); };
  ws.onerror=()=>{ toast("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ — ตรวจสอบว่ารัน server.js แล้วหรือยัง"); };
  ws.onmessage=(ev)=>{
    let m; try{ m=JSON.parse(ev.data); }catch(e){ return; }
    if(m.t==="welcome"){ MP.id=m.id; }
    else if(m.t==="seed"){ loadLevel(m.lvl, m.seed); showIntro(); }
    else if(m.t==="players"){
      MP.others={};
      for(const p of m.list) if(p.id!==MP.id) MP.others[p.id]=p;
      mpUpdateStatus();
    }
    else if(m.t==="join"){ toast((m.name||"ผู้เล่น")+" เข้าร่วมเกม"); }
    else if(m.t==="leave"){ delete MP.others[m.id]; toast((m.name||"ผู้เล่น")+" ออกจากเกม"); mpUpdateStatus(); }
    else if(m.t==="chat"){ addChatMessage(m.name||"ผู้เล่น", m.text||"", m.id===MP.id); }
  };
}
function mpRequestLevel(lvl){
  if(MP.connected&&MP.ws&&MP.ws.readyState===1)MP.ws.send(JSON.stringify({t:"nextLevel", lvl}));
}
// ---------- แชทออนไลน์ (ใช้ได้เมื่อเชื่อมต่อมัลติเพลเยอร์เท่านั้น) ----------
let chatOpen=false;
function addChatMessage(name,text,isMe){
  const el=document.createElement("div");
  el.className="chatMsg"+(isMe?" me":"");
  const b=document.createElement("b");b.textContent=name+":";
  el.appendChild(b);
  el.appendChild(document.createTextNode(text));
  const log=$("chatLog");
  log.appendChild(el);
  while(log.children.length>6)log.removeChild(log.firstChild);
  setTimeout(()=>{ if(el.parentNode)el.parentNode.removeChild(el); },7200);
}
function openChat(){
  if(!MP.connected){toast("ต้องเชื่อมต่อมัลติเพลเยอร์ก่อนถึงจะแชทได้");return;}
  chatOpen=true;
  document.exitPointerLock&&document.exitPointerLock();
  $("chatInputBox").classList.add("on");
  $("chatInput").value="";
  $("chatInput").focus();
}
function closeChat(){
  chatOpen=false;
  $("chatInputBox").classList.remove("on");
  $("chatInput").blur();
  if(G.state==="play"&&!isTouch)cvs.requestPointerLock&&cvs.requestPointerLock();
}
function sendChat(){
  const text=$("chatInput").value.trim();
  if(text&&MP.connected&&MP.ws&&MP.ws.readyState===1){
    MP.ws.send(JSON.stringify({t:"chat",text}));
  }
  closeChat();
}

let mpSendT=0;
function mpTick(dt){
  if(!MP.connected||!MP.ws||MP.ws.readyState!==1)return;
  mpSendT+=dt;
  if(mpSendT>0.08){
    mpSendT=0;
    MP.ws.send(JSON.stringify({t:"move", x:G.px, y:G.py, ang:G.ang, name:MP.name, lvl:G.inBase?-1:G.lvl, san:G.san}));
  }
}

/* ---------- input ---------- */
const K={};
addEventListener("keydown",e=>{
  if(chatOpen)return; // กำลังพิมพ์แชทอยู่ ไม่ให้คีย์อื่นไปสั่งเดิน/ยิง/ฯลฯ
  K[e.code]=true;
  if(e.code==="KeyF")toggleLight();
  if(e.code==="KeyE")interact();
  if(e.code==="KeyT"&&G.state==="play")openChat();
  if(e.code==="Escape"&&G.state==="play")pause();
  if(["KeyW","KeyA","KeyS","KeyD","Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code))e.preventDefault();
});
addEventListener("keyup",e=>{if(!chatOpen)K[e.code]=false;});
$("chatInput").addEventListener("keydown",e=>{
  e.stopPropagation();
  if(e.key==="Enter")sendChat();
  else if(e.key==="Escape")closeChat();
});
cvs.addEventListener("click",()=>{if(G.state==="play"&&!isTouch)cvs.requestPointerLock&&cvs.requestPointerLock();});
addEventListener("mousemove",e=>{
  if(document.pointerLockElement===cvs&&G.state==="play")G.ang+=e.movementX*0.0026;
});
addEventListener("mousedown",e=>{
  if(e.button!==0)return;
  if(G.state!=="play"||!G.hasGun)return;
  if(!isTouch&&document.pointerLockElement!==cvs)return; // บนคอม ต้องล็อกเมาส์ก่อนถึงยิงได้
  shoot();
});

/* touch */
// ค่าเริ่มต้นเดาจากอุปกรณ์ แต่ผู้เล่นกดสลับเองได้จากหน้าแรก (ปุ่ม "โหมดมือถือ/คอมพิวเตอร์")
let isTouch=("ontouchstart" in window)||navigator.maxTouchPoints>0;
let tMove={x:0,y:0},lookId=null,lookX=0,moveId=null;
const stick=$("stick"),nub=$("nub");

function setTouchMode(on){
  isTouch=on;
  document.documentElement.classList.toggle("touchMode",on);
  $("touch").classList.toggle("on",on);
  $("btnModeDesktop").classList.toggle("active",!on);
  $("btnModeTouch").classList.toggle("active",on);
  $("modeNote").textContent=on?"ควบคุมด้วยจอยสติ๊กและปุ่มบนจอ — แตะที่ไหนก็ได้ฝั่งซ้ายจอให้จอยสติ๊กโผล่ตรงนั้น":
    "ควบคุมด้วยคีย์บอร์ดและเมาส์ตามปกติ";
  moveId=null;lookId=null;tMove={x:0,y:0};nub.style.transform="";
}

// จอยสติ๊กแบบ Roblox — โผล่ขึ้นมาตรงจุดที่นิ้วแตะลงเลย ไม่ได้ตรึงตำแหน่งตายตัว
const touchStart=e=>{
  if(!isTouch)return;
  for(const t of e.changedTouches){
    if(t.clientX<innerWidth*0.5&&t.clientY>innerHeight*0.32){
      moveId=t.identifier;
      const sx=clamp(t.clientX,70,innerWidth-70), sy=clamp(t.clientY,70,innerHeight-70);
      stick.style.left=(sx-66)+"px"; stick.style.bottom="auto"; stick.style.top=(sy-66)+"px";
      stick.style.opacity="1";
    }else{lookId=t.identifier;lookX=t.clientX;}
  }
};
const touchMove=e=>{
  if(!isTouch)return;
  for(const t of e.changedTouches){
    if(t.identifier===moveId){
      const r=stick.getBoundingClientRect();
      let dx=(t.clientX-(r.left+r.width/2))/52, dy=(t.clientY-(r.top+r.height/2))/52;
      const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}
      tMove={x:dx,y:dy};nub.style.transform="translate("+(dx*34)+"px,"+(dy*34)+"px)";
    }else if(t.identifier===lookId){
      G.ang+=(t.clientX-lookX)*0.006;lookX=t.clientX;
    }
  }
  if(isTouch)e.preventDefault();
};
const touchEnd=e=>{
  if(!isTouch)return;
  for(const t of e.changedTouches){
    if(t.identifier===moveId){moveId=null;tMove={x:0,y:0};nub.style.transform="";stick.style.opacity="0";}
    if(t.identifier===lookId)lookId=null;
  }
};
addEventListener("touchstart",touchStart,{passive:false});
addEventListener("touchmove",touchMove,{passive:false});
addEventListener("touchend",touchEnd);addEventListener("touchcancel",touchEnd);
$("bRun").addEventListener("touchstart",e=>{K.ShiftLeft=true;e.stopPropagation();},{passive:false});
$("bRun").addEventListener("touchend",e=>{K.ShiftLeft=false;});
$("bLight").addEventListener("touchstart",e=>{toggleLight();e.stopPropagation();},{passive:false});
$("bUse").addEventListener("touchstart",e=>{interact();e.stopPropagation();},{passive:false});
$("bFire").addEventListener("touchstart",e=>{shoot();e.stopPropagation();},{passive:false});
$("bChat").addEventListener("touchstart",e=>{openChat();e.stopPropagation();},{passive:false});
$("btnModeDesktop").addEventListener("click",()=>setTouchMode(false));
$("btnModeTouch").addEventListener("click",()=>setTouchMode(true));
setTouchMode(isTouch);

function toggleLight(){
  if(G.state!=="play")return;
  G.light_on=!G.light_on;blip(G.light_on?900:420,0.05,"square",0.04);
}

/* ---------- gameplay ---------- */
let toastT=0;
function toast(msg,secs){$("toast").textContent=msg;$("toast").style.opacity="1";toastT=secs||2.4;}

function solid(x,y){
  const mx=x|0,my=y|0;
  if(mx<0||my<0||mx>=G.W||my>=G.H)return true;
  return G.map[my][mx]===1;
}
function tryMove(o,dx,dy,rad){
  const r=rad||0.22;
  if(!solid(o.x+dx+Math.sign(dx)*r,o.y))o.x+=dx;
  if(!solid(o.x,o.y+dy+Math.sign(dy)*r))o.y+=dy;
}
// ผู้เล่นเก็บตำแหน่งเป็น G.px/G.py (ไม่ใช่ .x/.y แบบมอนสเตอร์) เลยต้องมีฟังก์ชันแยก
// ไม่งั้น tryMove(G,...) จะไปสร้าง G.x/G.y เปล่า ๆ ที่ไม่มีใครอ่าน แล้ว G.px/G.py จะไม่ขยับ = เดินไม่ได้
function tryMovePlayer(o,dx,dy,rad){
  const r=rad||0.22;
  if(!solid(o.px+dx+Math.sign(dx)*r,o.py))o.px+=dx;
  if(!solid(o.px,o.py+dy+Math.sign(dy)*r))o.py+=dy;
}

/* ---------- ฐาน M.E.G. (ห้องข้างในประตู) ---------- */
const BASE_L={n:"ฐาน M.E.G.",en:"M.E.G. OUTPOST",size:15,style:"corridor",desc:"",
  wall:["concrete","#c9ced0","#97a0a3"],floor:["tile","#b4bbbd","#868e90"],ceil:["#d3d8da","#a3abad",true],
  fog:[0.05,0.07,0.08],fogD:0.018,amb:0.34,lamps:0,ent:0,entKinds:["smiler"],entSpd:0,keys:0,dark:false,drain:0};
const BASE_ROWS=[
 "111111111111111","100000010000001","100000010000001","100000010000001","100000000000001",
 "111011111101111","100000000000001","100000000000001","100000000000001","100000000000001",
 "100000000000001","100000000000001","100000000000001","100000000000001","111111111111111"];
const NPC_TALK={
  researcher:[
    "ตัวอย่างอัลมอนด์วอเตอร์ชุดนี้ช่วยให้สติทนได้นานขึ้น แต่ไม่ใช่ยารักษา อย่าดื่มเกินจำเป็น",
    "เราบันทึกเลเวลไปแล้วหลายสิบชั้น ยังไม่เคยเจอที่สุดของแบ็กรูมส์เลย",
    "พวกยิ้มไม่ถูกกระสุน แต่กลัวแสงสว่างจ้า ๆ ลองอยู่ใกล้หลอดไฟไว้"],
  meg:[
    "พักที่นี่ได้ตามสบาย ข้างในปลอดภัย สติกับไฟฉายจะค่อย ๆ ฟื้น",
    "ข้างนอกมีหน่วยเราลาดตระเวนอยู่อีก ถ้าเจอก็ไม่ต้องกลัว",
    "ชุดเหลืองนี่ไม่ได้แค่ดูเท่ ผ้ากรองช่วยลดผลกระทบทางจิตใจได้จริง"]
};
let BASE_CACHE=null;
function getBaseAssets(){
  if(BASE_CACHE)return BASE_CACHE;
  const S=15;
  const map=BASE_ROWS.map(r=>Array.from(r,ch=>ch==="1"?1:0));
  const light=new Float32Array(S*S);
  const lamps=[[3.5,2.5],[10.5,2.5],[3.5,9.5],[7.5,8.5],[11.5,9.5],[7.5,12.5]];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    let v=0.5;
    for(const l of lamps)v=Math.max(v,1.05-Math.hypot(x+0.5-l[0],y+0.5-l[1])*0.14);
    light[x+y*S]=v;
  }
  BASE_CACHE={map,light,
    TEXW:makeWall(BASE_L.wall[0],BASE_L.wall[1],BASE_L.wall[2],777),
    TEXF:makeFloor(BASE_L.floor[0],BASE_L.floor[1],BASE_L.floor[2],778),
    TEXC:makeCeil(BASE_L.ceil[0],BASE_L.ceil[1],779,BASE_L.ceil[2]),
    door:spriteItem("megbase_open"),
    res:[spriteEntity("researcher",1),spriteEntity("researcher",2),spriteEntity("researcher",3)]};
  return BASE_CACHE;
}
function warpFx(){
  const f=$("warpFx");
  f.style.transition="none";f.style.opacity="1";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition="opacity 1.1s ease";f.style.opacity="0";}));
  blip(180,0.5,"sine",0.06);setTimeout(()=>blip(520,0.35,"sine",0.05),180);
}
function enterBase(){
  const A=getBaseAssets(), mb=G.megBase;
  G.baseSave={map:G.map,W:G.W,H:G.H,light:G.light,seen:G.seen,items:G.items,ents:G.ents,decor:G.decor,
    allies:G.allies,npcs:G.npcs,px:G.px,py:G.py,ang:G.ang,L,TEXW,TEXF,TEXC,
    exitX:G.exitX,exitY:G.exitY,megBase:mb};
  G.inBase=true;
  G.map=A.map;G.W=15;G.H=15;G.light=A.light;G.seen=new Uint8Array(225).fill(1);
  G.ents=[];G.allies=[];
  const D=(k,x,y,sc)=>({x,y,tex:DECOR_SPR[k],scale:sc,off:0.5*(1-sc)});
  G.decor=[D("desk",2.5,1.5,.6),D("desk",5.5,1.5,.6),D("cabinet",1.4,3.8,.65),D("plant",6.3,4.2,.5),
    D("shelf",9.5,1.4,.7),D("shelf",12.5,1.4,.7),D("crate",13.2,3.9,.5),D("box",8.5,4.0,.45),
    D("desk",3.5,7.2,.6),D("desk",11.5,7.2,.6),D("cabinet",1.5,9.5,.65),D("cabinet",13.4,9.5,.65),
    D("plant",1.5,12.3,.5),D("plant",13.4,12.3,.5),D("crate",4.5,12.5,.5),D("box",10.5,12.4,.45)];
  const sup=D("crate",12.3,2.6,.55);
  G.items=[
    {x:7.5,y:13.5,t:"baseexit",tex:A.door,scale:0.85,off:0.075},
    {x:sup.x,y:sup.y,t:"basesupply",tex:sup.tex,scale:sup.scale,off:sup.off,dead:!!mb.looted}];
  G.npcs=[
    {x:2.5,y:2.6,tex:A.res[0],name:"ดร.อารยา",kind:"researcher",i:0,hint:true},
    {x:5.4,y:2.7,tex:A.res[1],name:"ดร.ธนากร",kind:"researcher",i:1},
    {x:4.8,y:8.3,tex:A.res[2],name:"ดร.วีรวัฒน์",kind:"researcher",i:2},
    {x:9.6,y:3.2,tex:ALLY_SPRITE,name:"สมาชิก M.E.G.",kind:"meg",i:0},
    {x:7.5,y:8.0,tex:ALLY_SPRITE,name:"หัวหน้าหน่วย M.E.G.",kind:"meg",i:1},
    {x:10.6,y:9.2,tex:ALLY_SPRITE,name:"สมาชิก M.E.G.",kind:"meg",i:2}];
  L=BASE_L;TEXW=A.TEXW;TEXF=A.TEXF;TEXC=A.TEXC;
  G.exitX=-10;G.exitY=-10;
  G.px=7.5;G.py=11.7;G.ang=-Math.PI/2;G.vx=0;G.vy=0;
  $("lvlName").textContent=BASE_L.n;$("lvlSub").textContent="จุดพักปลอดภัย";
  warpFx();
  toast("คุณก้าวผ่านประตู... ห้องสีขาวสะอาดเต็มไปด้วยนักวิจัยและหน่วย M.E.G.",4.2);
}
function exitBase(){
  const s=G.baseSave;if(!s)return;
  G.map=s.map;G.W=s.W;G.H=s.H;G.light=s.light;G.seen=s.seen;G.items=s.items;G.ents=s.ents;
  G.decor=s.decor;G.allies=s.allies;G.npcs=s.npcs;
  G.px=s.px;G.py=s.py;G.ang=s.ang;G.exitX=s.exitX;G.exitY=s.exitY;G.megBase=s.megBase;
  L=s.L;TEXW=s.TEXW;TEXF=s.TEXF;TEXC=s.TEXC;
  G.inBase=false;G.baseSave=null;G.vx=0;G.vy=0;
  $("lvlName").textContent=L.n;$("lvlSub").textContent=L.en;
  warpFx();
  toast("กลับสู่แบ็กรูมส์... ระวังตัวด้วย",3);
}
function talkNpc(n){
  const lines=NPC_TALK[n.kind];
  const txt=lines[(n.i+(n.t=(n.t||0)+1)-1)%lines.length];
  toast(n.name+": "+txt,4.6);
  blip(420,0.1,"triangle",0.04);
  const mb=G.baseSave&&G.baseSave.megBase;
  if(n.hint&&mb&&!mb.hinted){
    mb.hinted=true;
    const sv=G.baseSave;
    for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){
      const gx=(sv.exitX|0)+x, gy=(sv.exitY|0)+y;
      if(gx>=0&&gy>=0&&gx<sv.W&&gy<sv.H)sv.seen[gx+gy*sv.W]=1;
    }
    setTimeout(()=>toast(n.name+": ผมถอดรหัสตำแหน่งทางออกของชั้นนี้ให้แล้ว ดูบนแผนที่ได้เลย",4.6),2600);
  }
}
function interact(){
  if(G.state!=="play")return;
  for(const n of G.npcs){
    if(Math.hypot(n.x-G.px,n.y-G.py)<1.5){talkNpc(n);return;}
  }
  for(const it of G.items){
    if(it.dead)continue;
    const d=Math.hypot(it.x-G.px,it.y-G.py);
    if(d>1.1)continue;
    if(it.t==="water"){it.dead=true;G.san=clamp(G.san+28,0,100);toast("ดื่มอัลมอนด์วอเตอร์ — สติกลับมาบ้าง");blip(660,0.12,"sine",0.05);}
    else if(it.t==="key"){it.dead=true;G.keys++;drawKeys();toast("ได้คีย์การ์ด "+G.keys+"/"+G.keysNeed);blip(880,0.14,"triangle",0.05);}
    else if(it.t==="battery"){it.dead=true;G.bat=clamp(G.bat+45,0,100);toast("เปลี่ยนถ่านไฟฉายแล้ว");blip(520,0.1,"square",0.05);}
    else if(it.t==="gun"){
      it.dead=true;
      if(!G.hasGun){G.hasGun=true;toast("เก็บปืนได้แล้ว — คลิกซ้ายเพื่อยิง");}
      else toast("เจอปืนอีกกระบอก (มีติดตัวอยู่แล้ว)");
      blip(200,0.18,"square",0.06);
    }
    else if(it.t==="megbase"){
      if(!G.megBase.open){
        toast("ประตูฐาน M.E.G. ปิดสนิท — เข้าไม่ได้รอบนี้");
        blip(140,0.2,"square",0.04);
      }else enterBase();
    }
    else if(it.t==="baseexit"){exitBase();}
    else if(it.t==="basesupply"){
      const mb=G.baseSave.megBase;
      it.dead=true;mb.looted=true;
      if(!G.hasSuit){
        G.hasSuit=true;
        toast("เจ้าหน้าที่ M.E.G. ยื่นชุดป้องกันให้คุณ สวมแล้ว — สติลดช้าลงจากนี้",4.5);
      }else{
        G.san=100;G.bat=100;
        toast("รับเสบียงสำรองเต็มชุด สติและไฟฉายเต็มแล้ว",3.5);
      }
      blip(300,0.35,"sine",0.06);
    }
    else if(it.t==="exit"){
      if(G.keys<G.keysNeed){toast("ประตูล็อก — ต้องใช้คีย์การ์ด "+G.keysNeed+" ใบ");blip(150,0.25,"sawtooth",0.05);}
      else nextLevel();
    }
    return;
  }
}
// เช็คว่าเส้นตรงจาก (x0,y0) ไป (x1,y1) มีกำแพงขวางอยู่ไหม (กันยิงทะลุกำแพง)
function hasLineOfSight(x0,y0,x1,y1){
  const steps=Math.ceil(Math.hypot(x1-x0,y1-y0)*4)+1;
  for(let s=1;s<steps;s++){
    const t=s/steps;
    if(solid(x0+(x1-x0)*t,y0+(y1-y0)*t))return false;
  }
  return true;
}
function shoot(){
  if(!G.hasGun||G.gunCooldown>0)return;
  G.gunCooldown=0.32;
  G.gunKick=1;
  blip(150,0.05,"square",0.09);
  blip(85,0.18,"sawtooth",0.05);
  // หาสัตว์ประหลาดที่อยู่ในแนวเล็งแคบ ๆ ตรงหน้า ใกล้ที่สุดก่อน
  let bestI=-1,bestD=999;
  for(let i=0;i<G.ents.length;i++){
    const e=G.ents[i];
    const dx=e.x-G.px, dy=e.y-G.py, dist=Math.hypot(dx,dy);
    if(dist>10||dist<0.25)continue;
    let diff=Math.abs(Math.atan2(dy,dx)-G.ang);
    if(diff>Math.PI)diff=2*Math.PI-diff;
    if(diff<0.13 && dist<bestD){bestD=dist;bestI=i;}
  }
  if(bestI<0)return; // ยิงพลาด ไม่โดนอะไร
  const e=G.ents[bestI];
  if(!hasLineOfSight(G.px,G.py,e.x,e.y))return; // มีกำแพงบัง
  const info=ENTITY_INFO[e.kind]||{killable:true};
  if(info.killable){
    G.ents.splice(bestI,1);
    G.san=clamp(G.san+8,0,100);
    toast("ยิงโดน! กำจัดได้แล้ว");
    blip(500,0.2,"sine",0.06);
  }else{
    e.mad=1; // ยิงไม่เข้า แต่ทำให้มันสังเกตเห็นคุณทันที
    toast("กระสุนยิงทะลุ — ตัวนี้ยิงไม่เข้า!");
    blip(1200,0.05,"sine",0.03);
  }
}
// NOCLIP — หลุดผ่านผนังไปเลเวลสุ่ม (ไม่สุ่มไปด่านสุดท้าย กันข้ามจบเกมแบบฟรี ๆ)
function noclip(){
  G.clipT=0;G.clipHint=false;
  const choices=[];
  for(let i=0;i<LEVELS.length-1;i++)if(i!==G.lvl)choices.push(i);
  const next=choices[(Math.random()*choices.length)|0];
  G.san=clamp(G.san-8,0,100);
  warpFx();
  if(MP.connected){mpRequestLevel(next);return;} // เซิร์ฟเวอร์ตอบ seed กลับมาแล้ว loadLevel ใน onmessage
  loadLevel(next);
  showIntro();
  $("icDesc").textContent="— คุณ NOCLIP หลุดผ่านผนังมาแล้ว —  "+L.desc;
}
function nextLevel(){
  blip(300,0.4,"sine",0.06);
  if(G.lvl>=LEVELS.length-1){win();return;}
  G.san=clamp(G.san+18,0,100);
  const next=G.lvl+1;
  if(MP.connected){ mpRequestLevel(next); return; } // เซิร์ฟเวอร์จะตอบ seed กลับมาแล้ว loadLevel เองใน mpConnect.onmessage
  loadLevel(next);
  showIntro();
}
// รวมข้อความบอกสาเหตุการตายตามชนิดของสัตว์ประหลาดที่ทำร้ายเราล่าสุด
const DEATH_LINES={
  hound:"ปลาหมึกยักษ์พันหนวดรอบตัวคุณแล้วรัดจนสิ้นใจ",
  crawler:"มนุษย์คลานตัวนั้นลากคุณลงไปกับพื้นจนไม่ขยับอีก",
  skinstealer:"มันถลกผิวคุณออกไปสวมใส่แทนตัวเอง",
  partygoer:"รอยยิ้มของมันคือสิ่งสุดท้ายที่คุณเห็นก่อนทุกอย่างมืดลง",
  bacteria:"ก้อนเมือกนั้นกลืนคุณเข้าไปทั้งเป็น",
  smiler:"รอยยิ้มขาวจ้องคุณอยู่ตรงหน้า แล้วทุกอย่างก็เงียบไป",
  shadow:"เงาดำนั้นกลืนคุณหายไปในความมืด",
  faceling:"ใบหน้าที่ไม่มีอะไรเลยจ้องคุณจนสติขาดสะบั้น"
};
const KILLER_NAME={
  hound:"ปลาหมึกยักษ์ (Hound)", crawler:"มนุษย์คลาน (Crawler)", skinstealer:"ตัวถลกผิว (Skin-stealer)",
  partygoer:"ผู้ร่วมปาร์ตี้ (Partygoer)", bacteria:"แบคทีเรีย (Bacteria)", smiler:"สไมเลอร์ (Smiler)",
  shadow:"เงาดำ (Shadow)", faceling:"เฟซลิง (Faceling)"
};
function killerLine(){
  if(G.lastAttacker&&KILLER_NAME[G.lastAttacker])return "☠ ตายเพราะ: "+KILLER_NAME[G.lastAttacker];
  return "☠ ตายเพราะ: สติหมดจากแบ็กรูมส์เอง (ไม่มีปีศาจตัวไหนแตะตัวคุณ)";
}
function deathMessage(){
  if(G.near>0.3&&G.lastAttacker&&DEATH_LINES[G.lastAttacker])return DEATH_LINES[G.lastAttacker];
  if(G.near>0.3)return "มันจับคุณได้ในทางเดินที่คุณเคยเดินผ่านมาแล้วสามรอบ";
  return "สติของคุณหมดลงกลางทางเดินที่ไม่มีชื่อ";
}
function die(why){
  G.state="dead";G.deaths++;
  G.deathX=G.px;G.deathY=G.py; // จำตำแหน่งตายไว้ เผื่อเลือกรอ M.E.G. มาช่วย
  document.exitPointerLock&&document.exitPointerLock();
  $("deadWhy").textContent=why;
  $("deadKiller").textContent=killerLine();
  $("stats").innerHTML="ชั้นที่ไปถึง: "+L.en+" — "+L.n+"<br>เวลาในแบ็คลูมส์: "+fmt(G.time);
  show("deadScr");
  blip(90,1.2,"sawtooth",0.08);
}
function win(){
  G.state="win";document.exitPointerLock&&document.exitPointerLock();
  $("winStats").innerHTML="เวลารวม: "+fmt(G.time)+"<br>ตายไป "+G.deaths+" ครั้ง";
  show("winScr");
}
function fmt(s){const m=(s/60)|0,x=(s%60)|0;return m+" นาที "+x+" วินาที";}

/* ---------- รอ M.E.G. มาช่วยชุบชีวิตหลังตาย ---------- */
function startRescue(){
  // จุดเริ่มของหน่วยกู้ภัย: มุมใดมุมหนึ่งของแผนที่ที่ไกลจากจุดตายพอสมควร ให้ดูมีระยะทางต้องเดินทางมาจริง ๆ
  const corners=[[2,2],[G.W-3,2],[2,G.H-3],[G.W-3,G.H-3]];
  corners.sort((a,b)=>Math.hypot(b[0]-G.deathX,b[1]-G.deathY)-Math.hypot(a[0]-G.deathX,a[1]-G.deathY));
  const start=corners[0];
  G.rescue={t:0,duration:14+Math.random()*8,sx:start[0],sy:start[1],tx:G.deathX,ty:G.deathY};
  G.state="rescue";
  show("rescueScr");
  $("rescueMsg").textContent="หน่วย M.E.G. กำลังเดินทางมาหาคุณ อยู่นิ่ง ๆ ไว้ก่อน...";
}
function updateRescue(dt){
  G.rescue.t+=dt;
  const p=clamp(G.rescue.t/G.rescue.duration,0,1);
  const left=Math.max(0,Math.ceil(G.rescue.duration-G.rescue.t));
  $("rescueCountdown").textContent="ระยะทางที่เหลือ: "+Math.round((1-p)*100)+"%  (ประมาณ "+left+" วินาที)";
  drawRescueMap(p);
  if(p>=1)reviveByMeg();
}
function drawRescueMap(p){
  const cv=$("rescueMapCv"),cx2=cv.getContext("2d");
  const S=G.W,cell=260/S;
  cx2.clearRect(0,0,260,260);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    cx2.fillStyle=G.map[y][x]===1?"rgba(232,197,74,.16)":"rgba(255,255,255,.03)";
    cx2.fillRect(x*cell,y*cell,cell+0.5,cell+0.5);
  }
  // เส้นทางประมาณ (เส้นตรงจากจุดเริ่มไปจุดตาย)
  cx2.strokeStyle="rgba(232,197,74,.35)";cx2.setLineDash([4,4]);cx2.lineWidth=2;
  cx2.beginPath();cx2.moveTo(G.rescue.sx*cell,G.rescue.sy*cell);cx2.lineTo(G.rescue.tx*cell,G.rescue.ty*cell);cx2.stroke();
  cx2.setLineDash([]);
  // ตำแหน่งผู้เล่น (จุดตาย) สีขาว
  cx2.fillStyle="#fff";
  cx2.beginPath();cx2.arc(G.rescue.tx*cell,G.rescue.ty*cell,5,0,6.283);cx2.fill();
  // ตำแหน่งหน่วย M.E.G. ไล่มาตามเส้นทาง สีเหลือง กระพริบ
  const rx=lerp(G.rescue.sx,G.rescue.tx,p), ry=lerp(G.rescue.sy,G.rescue.ty,p);
  const pulse=0.6+0.4*Math.sin(G.rescue.t*8);
  cx2.fillStyle="rgba(232,197,74,"+pulse.toFixed(2)+")";
  cx2.beginPath();cx2.arc(rx*cell,ry*cell,6,0,6.283);cx2.fill();
  cx2.strokeStyle="#fff";cx2.lineWidth=1.5;cx2.stroke();
}
function reviveByMeg(){
  G.state="play";
  G.san=55;
  G.hurt=0;G.near=0;
  G.px=G.deathX;G.py=G.deathY;
  // ไล่สัตว์ประหลาดที่อยู่ในเลเวลให้ถอยห่างออกไปชั่วคราว จำลองว่าหน่วยกู้ภัยขับไล่ให้
  for(const e of G.ents){
    e.mad=0;
    let guard=0;
    do{ e.x=1+Math.random()*(G.W-2); e.y=1+Math.random()*(G.H-2); guard++; }
    while(solid(e.x,e.y)&&guard<40);
    e.tx=e.x;e.ty=e.y;
  }
  show(null);
  if(!isTouch)cvs.requestPointerLock&&cvs.requestPointerLock();
  toast("หน่วย M.E.G. มาถึงแล้ว! ชุบชีวิตให้คุณ สติกลับมาบางส่วน (คลิกหน้าจอถ้าเมาส์มองไม่ได้)",5);
  blip(220,0.4,"sine",0.07);
}

function update(dt){
  G.time+=dt;
  if(G.gunCooldown>0)G.gunCooldown-=dt;
  G.gunKick=Math.max(0,G.gunKick-dt*3.2);
  // ไฟกระพริบ
  const f=Math.sin(G.time*13.1)*Math.sin(G.time*3.7)*Math.sin(G.time*29.3);
  G.flick=0.86+0.14*f+(Math.random()<0.006?-0.55:0);
  G.flick=clamp(G.flick,0.25,1.1);

  // เดิน
  let fwd=0,str=0;
  if(K.KeyW||K.ArrowUp)fwd+=1;
  if(K.KeyS||K.ArrowDown)fwd-=1;
  if(K.KeyA)str-=1;
  if(K.KeyD)str+=1;
  if(K.ArrowLeft)G.ang-=2.0*dt;
  if(K.ArrowRight)G.ang+=2.0*dt;
  if(isTouch){fwd-=tMove.y;str+=tMove.x;}
  const run=(K.ShiftLeft||K.ShiftRight)?1.72:1;
  const spd=2.35*run*dt;
  const dx=Math.cos(G.ang),dy=Math.sin(G.ang);
  const mx=(dx*fwd - dy*str)*spd, my=(dy*fwd + dx*str)*spd;
  const moving=Math.abs(fwd)+Math.abs(str)>0.05;
  const ox=G.px,oy=G.py;
  tryMovePlayer(G,mx,my,0.24);
  // NOCLIP: ดันหน้าผนังตรง ๆ ค้างไว้ราว 3.5 วินาที ความจริงจะแตก แล้วหลุดไปเลเวลสุ่ม
  {
    const want=Math.hypot(mx,my),got=Math.hypot(G.px-ox,G.py-oy);
    if(!G.inBase&&moving&&want>0&&got<want*0.12)G.clipT+=dt/3.5;
    else G.clipT=Math.max(0,G.clipT-dt*1.5);
    if(G.clipT>0.28&&!G.clipHint){G.clipHint=true;toast("ผนังตรงหน้าเริ่มสั่น... ดันต่อไปสิ",2.2);}
    if(G.clipT<=0)G.clipHint=false;
    if(G.clipT>0.2&&Math.random()<dt*8)blip(60+G.clipT*400+Math.random()*80,0.08,"sawtooth",0.02+G.clipT*0.03);
    if(G.clipT>=1){noclip();return;}
  }
  G.bob=moving?Math.sin(G.time*(run>1?14:9))*0.5:lerp(G.bob,0,dt*6);
  if(moving){G.steps+=dt*(run>1?3.4:2.1);
    if(G.steps>1){G.steps=0;blip(120+Math.random()*40,0.05,"triangle",0.025);}}

  // เห็นแผนที่
  const cx=G.px|0,cy=G.py|0;
  for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++)
    if(x>=0&&y>=0&&x<G.W&&y<G.H)G.seen[x+y*G.W]=1;

  // ไฟฉาย
  if(G.light_on&&L.dark)G.bat=clamp(G.bat-dt*2.0,0,100);
  if(G.bat<=0)G.light_on=false;

  // สติ
  const lightHere=G.light[cx+cy*G.W]||0;
  let drain=L.drain*(0.42+(1-clamp(lightHere,0,1))*0.8);
  if(G.light_on&&G.bat>0)drain*=0.7;
  if(run>1)drain*=1.25;
  if(G.hasSuit)drain*=0.72; // ชุด M.E.G. ช่วยป้องกันผลกระทบทางจิตใจของแบ็กรูมได้บางส่วน

  // สิ่งมีชีวิต
  G.near=0;
  for(const e of G.ents){
    const d=Math.hypot(e.x-G.px,e.y-G.py);
    const sees=d<9.5;
    if(sees)e.mad=Math.min(1,e.mad+dt*0.9);else e.mad=Math.max(0,e.mad-dt*0.35);
    let tx,ty;
    if(e.mad>0.4){tx=G.px;ty=G.py;}
    else{
      if(Math.hypot(e.tx-e.x,e.ty-e.y)<0.6||Math.random()<dt*0.3){
        e.tx=1+Math.random()*(G.W-2);e.ty=1+Math.random()*(G.H-2);
      }
      tx=e.tx;ty=e.ty;
    }
    const a=Math.atan2(ty-e.y,tx-e.x);
    const s=e.spd*(e.mad>0.4?1:0.5)*dt;
    tryMove(e,Math.cos(a)*s,Math.sin(a)*s,0.3);
    if(d<6){G.near=Math.max(G.near,(6-d)/6*(0.3+e.mad));}
    if(d<0.85){drain+=26;G.hurt=Math.min(1,G.hurt+dt*3);G.lastAttacker=e.kind;
      if(Math.random()<dt*3)blip(70+Math.random()*50,0.2,"sawtooth",0.07);}
    if(d<7&&e.mad>0.5&&Math.random()<dt*0.7)blip(160+Math.random()*90,0.3,"sawtooth",0.03);
  }

  // หน่วยพันธมิตร M.E.G. — เดินสำรวจไปเรื่อย ๆ พอเห็นเราจะวิ่งตรงเข้ามาหาทันที
  for(const a of G.allies){
    if(a.helped)continue;
    const ad0=Math.hypot(a.x-G.px,a.y-G.py);
    const sees=ad0<7&&hasLineOfSight(a.x,a.y,G.px,G.py);
    a.aware=clamp((a.aware||0)+(sees?dt*2.5:-dt*0.6),0,1);
    let targetX,targetY,curSpd;
    if(a.aware>0.35){
      targetX=G.px;targetY=G.py;curSpd=a.spd*3.2; // เห็นเราแล้ว วิ่งเข้ามา
    }else{
      if(Math.hypot(a.tx-a.x,a.ty-a.y)<0.6||Math.random()<dt*0.3){
        a.tx=1+Math.random()*(G.W-2);a.ty=1+Math.random()*(G.H-2);
      }
      targetX=a.tx;targetY=a.ty;curSpd=a.spd;
    }
    const aAng=Math.atan2(targetY-a.y,targetX-a.x);
    tryMove(a,Math.cos(aAng)*curSpd*dt,Math.sin(aAng)*curSpd*dt,0.3);
    const ad=Math.hypot(a.x-G.px,a.y-G.py);
    if(ad<1.3){
      a.helped=true;
      const lines=[
        "อย่าตกใจ ผมเป็นคนของ M.E.G. — นี่ เอาไปใช้เผื่อจำเป็น",
        "รอดมาได้เก่งนะ อยู่ให้ไกลจากพวกยิ้มเข้าไว้ นี่ของสำรอง",
        "หน่วยผมเจอทางออกของชั้นนี้ไปแล้วรอบนึง ระวังตัวด้วยละกัน"
      ];
      toast(lines[(Math.random()*lines.length)|0],4.2);
      G.san=clamp(G.san+25,0,100);
      if(L.dark)G.bat=clamp(G.bat+30,0,100);
      blip(700,0.3,"sine",0.05);
    }
  }
  G.hurt=Math.max(0,G.hurt-dt*1.3);
  G.san=clamp(G.san-drain*dt,0,100);
  if(G.inBase){G.san=clamp(G.san+dt*5,0,100);G.bat=clamp(G.bat+dt*6,0,100);} // พักในฐาน ฟื้นตัวเรื่อย ๆ
  if(G.san<=0){die(deathMessage());return;}

  if(AC){
    const t=clamp(G.near,0,1);
    if(humG)humG.gain.value=0.015+t*0.05;
    if(noiseG)noiseG.gain.value=0.004+t*0.02+(1-G.san/100)*0.01;
  }

  // ป้ายแจ้งเตือน
  let near=null;
  for(const it of G.items){if(it.dead)continue;
    const d=Math.hypot(it.x-G.px,it.y-G.py);if(d<1.1){near=it;break;}}
  const pr=$("prompt");
  let nearNpc=null;
  for(const n of G.npcs){if(Math.hypot(n.x-G.px,n.y-G.py)<1.5){nearNpc=n;break;}}
  if(nearNpc){
    pr.textContent="[E] คุยกับ "+nearNpc.name;pr.style.opacity="1";
  }else if(near){
    const n={water:"อัลมอนด์วอเตอร์",key:"คีย์การ์ด",battery:"ถ่านไฟฉาย",exit:"ประตูทางออก",gun:"ปืน",
      megbase:"ประตูฐาน M.E.G.",baseexit:"ประตูกลับสู่แบ็กรูมส์",basesupply:"ลังเสบียง M.E.G."}[near.t]||"";
    pr.textContent="[E] "+n;pr.style.opacity="1";
  }else pr.style.opacity="0";

  // HUD
  $("sanFill").style.width=G.san+"%";
  $("sanTxt").textContent=Math.round(G.san)+"%";
  $("batFill").style.width=G.bat+"%";
  $("batTxt").textContent=Math.round(G.bat)+"%";
  $("gunStatus").textContent=G.hasGun?"🔫 มีปืน (คลิกซ้ายเพื่อยิง)":"";
  $("suitStatus").textContent=G.hasSuit?"🟡 สวมชุด M.E.G. (สติลดช้าลง)":"";
  if(toastT>0){toastT-=dt;if(toastT<=0)$("toast").style.opacity="0";}
  mpTick(dt);
}

/* ---------- loop ---------- */
let last=performance.now(),mapT=0;
function frame(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(G.state==="play"){update(dt);render();mapT+=dt;if(mapT>0.12){mapT=0;drawMap();}}
  else if(G.state==="rescue"){updateRescue(dt);}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- screens ---------- */
function show(id){
  for(const s of document.querySelectorAll(".screen"))s.classList.remove("on");
  if(id)$(id).classList.add("on");
  $("hud").style.opacity=id?"0":"1";
}
function showIntro(){
  G.state="intro";
  $("icNo").textContent=L.en;$("icName").textContent=L.n;$("icDesc").textContent=L.desc;
  show("introCard");
}
function play(){
  G.state="play";show(null);
  if(!isTouch)cvs.requestPointerLock&&cvs.requestPointerLock();
}
function pause(){G.state="pause";document.exitPointerLock&&document.exitPointerLock();show("pauseScr");}

$("btnStart").onclick=()=>{
  audioInit();if(AC&&AC.state==="suspended")AC.resume();
  G.san=100;G.bat=100;G.time=0;G.deaths=0;G.hasGun=false;
  loadLevel(0);showIntro();
};
$("btnMpStart").onclick=()=>{
  const url=$("mpUrl").value.trim();
  const room=$("mpRoom").value.trim()||"main";
  const name=$("mpName").value.trim()||MP.name;
  if(!url){toast("กรอกที่อยู่เซิร์ฟเวอร์ก่อน เช่น ws://localhost:8080");return;}
  audioInit();if(AC&&AC.state==="suspended")AC.resume();
  G.san=100;G.bat=100;G.time=0;G.deaths=0;G.hasGun=false;
  MP.pendingStart=true;
  mpConnect(url,room,name);
};
$("btnGo").onclick=play;
$("btnResume").onclick=play;
function mpDisconnect(){
  if(MP.ws){MP.ws.close();MP.ws=null;}
  MP.connected=false;MP.others={};mpUpdateStatus();
  if(chatOpen)closeChat();
  $("chatLog").innerHTML="";
}
$("btnQuit").onclick=()=>{mpDisconnect();G.state="title";show("titleScr");};
$("btnQuit2").onclick=()=>{mpDisconnect();G.state="title";show("titleScr");};
$("btnRetry").onclick=()=>{G.san=100;G.bat=100;loadLevel(G.lvl);showIntro();};
$("btnWaitMeg").onclick=()=>{startRescue();};
$("btnCancelRescue").onclick=()=>{G.state="dead";show("deadScr");};
$("btnAgain").onclick=()=>{G.san=100;G.bat=100;G.time=0;G.hasGun=false;loadLevel(0);showIntro();};

$("btnUnlock").onclick=()=>{
  const name=$("gateName").value.trim();
  const code=$("gateCode").value.trim().toUpperCase();
  if(!name){$("gateMsg").textContent="กรอกชื่อผู้เล่นก่อนนะ";return;}
  if(!code){$("gateMsg").textContent="กรอกรหัสที่ได้รับมาด้วย";return;}
  if(codeForName(name)!==code){
    $("gateMsg").textContent="ชื่อหรือรหัสไม่ถูกต้อง ลองเช็คตัวสะกด/รหัสอีกครั้ง";
    return;
  }
  $("gateMsg").textContent="";
  MP.name=name;
  if($("mpName"))$("mpName").value=name;
  if($("gateRemember").checked)lsSet("backroomsLicense",JSON.stringify({name,code}));
  show("titleScr");
};
$("btnForget").onclick=()=>{
  lsDel("backroomsLicense");
  $("gateName").value="";$("gateCode").value="";
  G.state="title";show("gateScr");
  const el=$("toast");el.textContent="ล้างข้อมูลที่จำไว้ในเครื่องนี้แล้ว";el.style.opacity="1";
  setTimeout(()=>{el.style.opacity="0";},2200);
};
$("gateCode").addEventListener("keydown",e=>{if(e.key==="Enter")$("btnUnlock").click();});
$("gateName").addEventListener("keydown",e=>{if(e.key==="Enter")$("gateCode").focus();});

$("btnAdminToggle").onclick=()=>{$("adminBox").classList.toggle("on");};
$("btnGenCode").onclick=()=>{
  if($("adminPass").value!==ADMIN_PASSWORD){
    $("adminResult").textContent="รหัสผู้สร้างไม่ถูกต้อง";
    return;
  }
  const nm=$("adminName").value.trim();
  if(!nm){$("adminResult").textContent="กรอกชื่อผู้เล่นก่อน";return;}
  $("adminResult").textContent=nm+"  →  "+codeForName(nm);
};
$("adminPass").addEventListener("keydown",e=>{if(e.key==="Enter")$("adminName").focus();});
$("adminName").addEventListener("keydown",e=>{if(e.key==="Enter")$("btnGenCode").click();});

document.addEventListener("pointerlockchange",()=>{
  if(!document.pointerLockElement&&G.state==="play"&&!isTouch&&!chatOpen)pause();
});

/* ถ้าเครื่องนี้เคยปลดล็อกไว้แล้ว (จำผ่าน localStorage) ข้ามหน้ากรอกรหัสไปเลย */
(function tryAutoUnlock(){
  const raw=lsGet("backroomsLicense");
  if(!raw)return;
  let saved;
  try{saved=JSON.parse(raw);}catch(e){return;}
  if(saved&&saved.name&&saved.code&&codeForName(saved.name)===saved.code){
    MP.name=saved.name;
    if($("mpName"))$("mpName").value=saved.name;
    G.state="title";
    show("titleScr");
  }
})();
</script>
</body>
</html>
