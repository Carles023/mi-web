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
})();