// Colours, font and radii come from src/tokens.css (CSS variables) so they are defined once.
export default {
  content:['./index.html','./src/**/*.{js,jsx}'],
  theme:{extend:{
    colors:{bg:'var(--bg)',surf:'var(--surf)',f:'var(--f)',ink:'var(--ink)',mut:'var(--mut)',line:'var(--line)',brand:'var(--brand)',b2:'var(--b2)',pur:'var(--pur)',acc:'var(--acc)',ok:'var(--ok)',bad:'var(--bad)'},
    fontFamily:{sans:['Plus Jakarta Sans','system-ui','sans-serif']},
    borderRadius:{card:'20px',input:'12px',shell:'26px'},
    boxShadow:{shell:'0 10px 40px #1B2A5514',soft:'0 6px 20px #1B2A5512'}
  }},plugins:[]}
