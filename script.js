/* =========================================================
   WEB PERSONAL · Carles Tudela Garcia — interacció mínima
   ========================================================= */
(() => {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Tema fosc / clar */
  const rel = document.documentElement, btnTema = $("#btnTema"), metaTema = $("#metaTema");
  const pintaTema = () => {
    const clar = rel.dataset.theme === "light";
    if (btnTema){ $(".btn-tema__txt", btnTema).textContent = clar ? "Fosc" : "Clar";
      btnTema.setAttribute("aria-label","Canviar a mode " + (clar ? "fosc" : "clar")); }
    if (metaTema) metaTema.content = clar ? "#f4f4f1" : "#0a0a0b";
  };
  if (btnTema) btnTema.addEventListener("click", () => {
    const nou = rel.dataset.theme === "light" ? "dark" : "light";
    rel.dataset.theme = nou; localStorage.setItem("tema", nou); pintaTema();
  });
  pintaTema();

  const any = $("#any"); if (any) any.textContent = new Date().getFullYear();

  /* Menú mòbil */
  const btnMenu = $("#btnMenu"), nav = $("#nav");
  if (btnMenu && nav){
    btnMenu.addEventListener("click", () => {
      const o = nav.classList.toggle("oberta"); btnMenu.setAttribute("aria-expanded", o);
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("oberta"); btnMenu.setAttribute("aria-expanded","false");
    }));
  }

  /* Barra de progrés */
  const barra = $("#progresBarra"); let fent = false;
  const pinta = () => { const d = document.documentElement; const t = d.scrollHeight - d.clientHeight;
    barra.style.width = (t>0?(d.scrollTop/t)*100:0)+"%"; fent=false; };
  addEventListener("scroll", () => { if(!fent){fent=true;requestAnimationFrame(pinta);} }, {passive:true});
  pinta();

  /* Enllaç actiu */
  const enllacos = $$(".nav a[href^='#']");
  const seccions = enllacos.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const obsNav = new IntersectionObserver(ents => ents.forEach(e => e.isIntersecting &&
    enllacos.forEach(a => a.setAttribute("aria-current", a.getAttribute("href") === "#"+e.target.id))),
    {rootMargin:"-45% 0px -50% 0px"});
  seccions.forEach(s => obsNav.observe(s));

  /* Aparició al fer scroll */
  const rev = new IntersectionObserver((ents,obs)=>ents.forEach((e,i)=>{ if(!e.isIntersecting)return;
    setTimeout(()=>e.target.classList.add("visible"), i*80); obs.unobserve(e.target);
  }),{threshold:0.15});
  $$(".reveal").forEach(el => rev.observe(el));

  /* Barres d'estadístiques */
  $$(".bares i[data-barra]").forEach(b => new IntersectionObserver((ents,obs)=>ents.forEach(e=>{
    if(!e.isIntersecting)return; b.style.width=b.dataset.barra+"%"; obs.unobserve(b);
  }),{threshold:0.4}).observe(b));

  /* Copiar correu — amb fallback per a file:// i navegadors antics */
  const btnCopiar = $("#copiar"), mail = $("#mail");
  if (btnCopiar && mail) {
    const copiar = async (text) => {
      /* 1) API moderna (només en HTTPS o localhost) */
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
      }
      /* 2) Fallback: textarea ocult + execCommand (funciona en file://) */
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch (e) { return false; }
    };

    btnCopiar.addEventListener("click", async () => {
      const ok = await copiar(mail.textContent.trim());
      btnCopiar.textContent = ok ? "Copiat" : "Copia manual";
      setTimeout(() => (btnCopiar.textContent = "Copiar"), 1600);
    });
  }
     /* 8. Fons de partícules d'estrelles */
  (function fonsEstrelles(){
    const cv = document.getElementById("fons");
    if(!cv) return;
    const ctx = cv.getContext("2d");
    if(!ctx) return;
    const redueix = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio||1, 2);
    const TINTS = ["#ffffff","#cfe8ff","#ffd9ec","#d7ff3e","#2fe8ff"];
    const rel = document.documentElement;
    const clar = () => rel.dataset.theme === "light";
    let mides={w:0,h:0}, estrelles=[], raf, scrollY=0;

    const crear = () => {
      const n = Math.max(60, Math.min(260, Math.round(mides.w*mides.h/9000)));
      estrelles = Array.from({length:n},()=>({
        x:Math.random()*mides.w, y:Math.random()*mides.h,
        r:Math.random()*1.4+0.3, base:Math.random()*0.5+0.25,
        amp:Math.random()*0.35+0.1, vel:Math.random()*0.0016+0.0004,
        fase:Math.random()*Math.PI*2, vy:-(Math.random()*0.06+0.01),
        vx:(Math.random()-0.5)*0.02, depth:0.08+Math.random()*0.22,
        tint: Math.random()<0.18 ? TINTS[1+((Math.random()*4)|0)] : "#ffffff"
      }));
    };
    const mida = () => {
      mides.w = innerWidth; mides.h = innerHeight;
      cv.width  = Math.floor(mides.w*dpr);
      cv.height = Math.floor(mides.h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      crear();
    };
    const pos = s => redueix ? s.y : (((s.y - scrollY*s.depth) % mides.h)+mides.h)%mides.h;

    const pintar = t => {
      ctx.clearRect(0,0,mides.w,mides.h);
      const c = clar();
      for(const s of estrelles){
        s.x+=s.vx; s.y+=s.vy;
        if(s.y<-2){s.y=mides.h+2;s.x=Math.random()*mides.w;}
        if(s.x<-2)s.x=mides.w+2; else if(s.x>mides.w+2)s.x=-2;
        const yy = pos(s);
        let a=s.base+Math.sin(t*s.vel+s.fase)*s.amp; a=Math.max(0,Math.min(1,a));
        ctx.globalAlpha = c? a*0.5 : a;
        ctx.fillStyle   = c? "#3a4a63" : s.tint;
        ctx.beginPath(); ctx.arc(s.x,yy,s.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
      raf=requestAnimationFrame(pintar);
    };

    mida();
    addEventListener("resize", mida, {passive:true});
    addEventListener("scroll", ()=>{ scrollY=window.scrollY||0; }, {passive:true});

    if(redueix){
      const c=clar();
      for(const s of estrelles){
        ctx.globalAlpha=s.base; ctx.fillStyle=c?"#3a4a63":s.tint;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=1;
    } else {
      raf=requestAnimationFrame(pintar);
    }
    document.addEventListener("visibilitychange", ()=>{
      if(redueix) return;
      if(document.hidden) cancelAnimationFrame(raf); else raf=requestAnimationFrame(pintar);
    });
  })();
  /* =========================================================
   EL TEMPS — Nominatim (buscador) + Open-Meteo (clima)
   Sense API key. Funciona en file:// i https.
   ========================================================= */
(() => {
  "use strict";
  const seccio   = document.getElementById("temps");
  if(!seccio) return;
  const input    = seccio.querySelector("#municipi");
  const llista   = seccio.querySelector("#suggeriments");
  const targeta  = seccio.querySelector("#temps-targeta");
  let timer, controller;

  const CODIS = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"⛈️",71:"🌨️",73:"🌨️",75:"❄️",77:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",85:"🌨️",86:"❄️",95:"⛈️",96:"⛈️",99:"⛈️"};
  const TEXT  = {0:"Cel clar",1:"Majorment clar",2:"Parcialment ennuvolat",3:"Ennuvolat",45:"Boira",48:"Boira gebrada",51:"Drizzle feble",53:"Drizzle",55:"Drizzle dens",61:"Pluja feble",63:"Pluja",65:"Pluja forta",71:"Neu feble",73:"Neu",75:"Neu forta",80:"Chubascos",81:"Chubascos",82:"Chubascos forts",95:"Tempesta",96:"Tempesta amb granís",99:"Tempesta forta"};
  const fmt = n => (Math.round(n*10)/10).toString();

    async function clima(lat, lon, nom){
    targeta.classList.remove("vis");
    targeta.innerHTML = '<p class="temps-carregant">Carregant el temps…</p>';
    try{
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
      const d = await (await fetch(url)).json();
      pinta(d, nom);
    }catch(e){
      targeta.innerHTML = '<p class="temps-error">No s\'ha pogut carregar el temps. Torna-ho a provar.</p>';
    }
  }

  function pinta(d, nom){
    const cur = d.current, icona = CODIS[cur.weather_code]||"🌡️", text = TEXT[cur.weather_code]||"";
    let dies = "";
    (d.daily.time||[]).forEach((dia,i)=>{
      const nomDia = new Date(dia).toLocaleDateString("ca-ES",{weekday:"short"});
      dies += `<li><span>${nomDia}</span>${CODIS[d.daily.weather_code[i]]||"🌡️"}<b>${fmt(d.daily.temperature_2m_max[i])}°</b><em>${fmt(d.daily.temperature_2m_min[i])}°</em></li>`;
    });
    targeta.innerHTML = `
      <p class="temps-lloc">${nom || "Ubicació"}</p>
      <div class="temps-cap">
        <div class="temps-actual"><span class="temps-icona">${icona}</span>
          <div><strong class="temps-temp">${fmt(cur.temperature_2m)}°</strong><p>${text}</p></div>
        </div>
        <dl class="temps-dades">
          <div><dt>Sensació</dt><dd>${fmt(cur.apparent_temperature)}°</dd></div>
          <div><dt>Humitat</dt><dd>${cur.relative_humidity_2m}%</dd></div>
          <div><dt>Vent</dt><dd>${fmt(cur.wind_speed_10m)} km/h</dd></div>
        </dl>
      </div>
      <ul class="temps-setmana">${dies}</ul>
      <p class="temps-font">Dades: Open-Meteo · Cerca: OpenStreetMap</p>`;
    requestAnimationFrame(()=>targeta.classList.add("vis"));
  }
  

  function cercar(q){
    clearTimeout(timer);
    if(q.trim().length < 2){ llista.hidden = true; llista.innerHTML = ""; return; }
    timer = setTimeout(async ()=>{
      llista.hidden = false; llista.innerHTML = '<li class="temps-load">Cercant…</li>';
      try{
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=ca&countrycodes=es&limit=8&addressdetails=1&q=${encodeURIComponent(q)}`;
        if(controller) controller.abort();
        controller = new AbortController();
        const dades = await (await fetch(url,{signal:controller.signal})).json();
        const filtres = dades.filter(x=>(x.category==="boundary"&&x.type==="administrative")||x.category==="place");
        const llistat = (filtres.length?filtres:dades).slice(0,8);
        if(!llistat.length){ llista.innerHTML='<li class="temps-load">Cap resultat</li>'; return; }
        llista.innerHTML = llistat.map(x=>{
          const a = x.address||{};
          const nom = a.municipality||a.city||a.town||a.village||a.county||x.display_name.split(",")[0];
          const prov = a.state||"";
          return `<li role="option" data-lat="${x.lat}" data-lon="${x.lon}"><span class="temps-nom">${nom}</span>${prov?`<span class="temps-prov">${prov}</span>`:""}</li>`;
        }).join("");
                      llista.querySelectorAll("li[data-lat]").forEach(li=>li.addEventListener("click",()=>{
          const nom = li.querySelector(".temps-nom").textContent;
          const lat = li.dataset.lat, lon = li.dataset.lon;
          input.value = nom;
          llista.hidden = true;
          localStorage.setItem("temps", JSON.stringify({lat, lon, nom}));
          clima(lat, lon, nom);
        }));
      }catch(e){ llista.innerHTML='<li class="temps-load">Error cercant</li>'; }
    },450);
  }

  input.addEventListener("input", e=>cercar(e.target.value));
  input.addEventListener("keydown", e=>{ if(e.key==="Enter"){ const p=llista.querySelector("li[data-lat]"); if(p) p.click(); }});
  document.addEventListener("click", e=>{ if(!seccio.contains(e.target)) llista.hidden=true; });

  // Municipi per defecte (Rafelguaraf). Canvia aquestes coordenades si vols un altre.
  let ult = null;
  try{ ult = JSON.parse(localStorage.getItem("temps")); }catch(e){}
  if(ult && ult.lat){
    input.value = ult.nom || "";
    clima(ult.lat, ult.lon, ult.nom);
  } else {
  clima(39.47391, -0.37966, "València");

  }

})();
})();