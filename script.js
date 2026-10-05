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
  const cv = $("#fons");
  if (cv) {
    const ctx = cv.getContext("2d");
    const redueix = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let mides = { w: 0, h: 0 }, estrelles = [], raf;
    const TINTS = ["#ffffff", "#cfe8ff", "#ffd9ec", "#d7ff3e", "#2fe8ff"]; // blanc + tints de la paleta
    const clar = () => rel.dataset.theme === "light";

    const crear = () => {
      const n = Math.max(60, Math.min(260, Math.round(mides.w * mides.h / 9000)));
      estrelles = Array.from({ length: n }, () => ({
        x: Math.random() * mides.w, y: Math.random() * mides.h,
        r: Math.random() * 1.4 + 0.3,
        base: Math.random() * 0.5 + 0.25,
        amp: Math.random() * 0.35 + 0.1,
        vel: Math.random() * 0.0016 + 0.0004,
        fase: Math.random() * Math.PI * 2,
        vy: -(Math.random() * 0.06 + 0.01),
        vx: (Math.random() - 0.5) * 0.02,
        tint: Math.random() < 0.18 ? TINTS[1 + ((Math.random() * 4) | 0)] : "#ffffff"
      }));
    };
    const mida = () => {
      mides.w = cv.clientWidth; mides.h = cv.clientHeight;
      cv.width = Math.floor(mides.w * dpr); cv.height = Math.floor(mides.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      crear();
    };
    const pintar = (t) => {
      ctx.clearRect(0, 0, mides.w, mides.h);
      const c = clar();
      for (const s of estrelles) {
        s.x += s.vx; s.y += s.vy;
        if (s.y < -2) { s.y = mides.h + 2; s.x = Math.random() * mides.w; }
        if (s.x < -2) s.x = mides.w + 2; else if (s.x > mides.w + 2) s.x = -2;
        let a = s.base + Math.sin(t * s.vel + s.fase) * s.amp;
        a = Math.max(0, Math.min(1, a));
        ctx.globalAlpha = c ? a * 0.5 : a;
        ctx.fillStyle = c ? "#3a4a63" : s.tint;   // clar → blavós fosc; fosc → blanc/tint
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(pintar);
    };

    addEventListener("resize", mida, { passive: true });
    mida();
    if (redueix) {                                   // sense animació: pinta una vegada
      const c = clar();
      for (const s of estrelles) {
        ctx.globalAlpha = s.base; ctx.fillStyle = c ? "#3a4a63" : s.tint;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else {
      raf = requestAnimationFrame(pintar);
    }
    document.addEventListener("visibilitychange", () => {
      if (redueix) return;
      if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(pintar);
    });
  }
})();