/* ============================================================
   myKado · Wall app — shared data
   ============================================================ */

/* Card tones the contributor can pick — keyed to the design system */
const TONES = [
  { id:'rose',   bg:'#FFEDF1', ink:'var(--mk-rose)',   dot:'#F35C7A' },
  { id:'lilac',  bg:'#F1EAFB', ink:'var(--mk-mur)',    dot:'#8A63D2' },
  { id:'mint',   bg:'#E3F5EE', ink:'var(--mk-mint)',   dot:'#3FA98A' },
  { id:'butter', bg:'#FCF1DA', ink:'#B8842A',          dot:'#E5A93B' },
  { id:'peach',  bg:'#FFEDE3', ink:'#D9713F',          dot:'#FF9F7A' },
  { id:'sky',    bg:'#E6F0FB', ink:'#3E77C2',          dot:'#5B95E0' },
];
const TONE = (id) => TONES.find(t => t.id === id) || TONES[0];

/* photo placeholder gradients */
const PHOTOS = [
  'linear-gradient(135deg,#FFD0DE,#C7AEEC)',
  'linear-gradient(135deg,#C9EEDF,#8FD3C0)',
  'linear-gradient(135deg,#FBE1B8,#F3B27A)',
  'linear-gradient(135deg,#C7DAF5,#9BB8ED)',
];

/* seed wishes on the wall. media: {type:'gif',code,char} | {type:'photo',g} | {type:'audio',dur} */
const SEED = [
  { name:'Maman',         tone:'rose',   tx:'Mon trésor, joyeux anniversaire. Tu es ma plus belle fierté ❤️', media:{ type:'gif', code:'2764_fe0f', char:'❤️' } },
  { name:'Kévin',         tone:'mint',   tx:'Bon anniv frérot ! On fête ça ce week-end 🥳', media:null },
  { name:'Fatou Diallo',  tone:'lilac',  tx:'25 ans déjà ! Que du bonheur pour toi.', media:{ type:'photo', g:0 } },
  { name:'Équipe Orange', tone:'butter', tx:'Merci pour ton énergie au quotidien 🧡', media:{ type:'gif', code:'1f973', char:'🥳' } },
  { name:'Awa',           tone:'peach',  tx:'Que cette année soit à la hauteur de ton sourire ✨', media:null },
  { name:'Tonton Désiré', tone:'mint',   tx:'Santé, longue vie et réussite, ma fille !', media:{ type:'audio', dur:"0:12" } },
  { name:'Chloé & Marc',  tone:'rose',   tx:'Joyeux anniversaire ma belle 🥂', media:{ type:'photo', g:1 } },
  { name:'Ibrahim',       tone:'sky',    tx:'Force, foi et bonheur pour cette nouvelle année 💪', media:null },
  { name:'Mariam',        tone:'lilac',  tx:'On t’aime fort, profite de ta journée 💜', media:{ type:'gif', code:'1f490', char:'💐' } },
  { name:'Grand-mère',    tone:'peach',  tx:'Que Dieu te garde, mon enfant 🙏', media:null },
  { name:'Sofia',         tone:'mint',   tx:'Encore plus belle chaque année ! 😍', media:{ type:'gif', code:'1f60d', char:'😍' } },
  { name:'Le bureau 3e',  tone:'butter', tx:'Vivement le gâteau de lundi 🎂', media:{ type:'photo', g:2 } },
];

/* GIF bank — categorised Noto animated emoji (fun stickers) */
const GIF_BANK = {
  'Anniversaire': [
    ['1f382','🎂'],['1f389','🎉'],['1f388','🎈'],['1f381','🎁'],['1f973','🥳'],['1f37e','🍾'],['1f386','🎆'],['1f38a','🎊'],
  ],
  'Amour': [
    ['2764_fe0f','❤️'],['1f60d','😍'],['1f490','💐'],['1f48b','💋'],['1f339','🌹'],['1f496','💖'],['1f970','🥰'],['1f495','💕'],
  ],
  'Bravo': [
    ['1f44f','👏'],['1f64c','🙌'],['1f942','🥂'],['1f3c6','🏆'],['1f31f','🌟'],['1f4aa','💪'],['1f525','🔥'],['1f947','🥇'],
  ],
  'Fête': [
    ['1f57a','🕺'],['1f483','💃'],['1f3b5','🎵'],['1f37b','🍻'],['1f942','🥂'],['1f389','🎉'],['1f938','🤸'],['1f3b8','🎸'],
  ],
  'Drôle': [
    ['1f602','😂'],['1f923','🤣'],['1f60e','😎'],['1f929','🤩'],['1f61c','😜'],['1f60a','😊'],['1f917','🤗'],['1f47b','👻'],
  ],
};

/* Event themes drive the recipient reveal cascade */
const EVENTS = {
  anniv: {
    label:'Anniversaire', name:'Sarah', age:'25 ans',
    title:'Joyeux anniversaire', who:'Sarah',
    hero:['1f382','🎂'],
    cascade:[['1f388','🎈'],['1f389','🎉'],['1f38a','🎊'],['1f381','🎁'],['2728','✨']],
    cheer:['1f973','🥳'],
  },
};
const EVT = EVENTS.anniv;

/* cagnotte state (FCFA) */
const CAGNOTTE = { name:'Un vélo électrique', collected:62000, goal:120000, count:18, emoji:['1f6b2','🚲'] };

/* FCFA formatting */
const fcfa = (n) => n.toLocaleString('fr-FR').replace(/\u202f/g,' ') + ' FCFA';
const initials = (n) => n.split(/[ &]/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

Object.assign(window, { TONES, TONE, PHOTOS, SEED, GIF_BANK, EVENTS, EVT, CAGNOTTE, fcfa, initials });
