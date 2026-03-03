require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const birthdayTemplate = {
  name: 'birthday',
  label: 'Birthday Wish',
  description: 'An animated birthday card with music, WhatsApp style message, confetti and more.',
  thumbnail: '/thumbnails/birthday.png',
  defaultStyle: {
    primaryColor: '#ff69b4',
    accentColor: '#ffb347',
    fontFamily: 'Work Sans',
    fontSize: 'medium',
    theme: 'light',
  },
  defaultData: {
    greeting: 'Hiya',
    name: 'Lydia',
    greetingText: 'I really like your name btw!',
    musicSrc: '',
    albumArt: '',
    trackTitle: 'Notre chanson',
    trackArtist: 'Artiste',
    musicHint: "C'est mieux avec de la musique 🎶",
    text1: "It's your birthday!!! :D",
    waAvatar: 'L',
    waName: 'Lydia',
    textInChatBox: 'Happy birthday to you!! Yeee! Many many happy blah...',
    text2: "That's what I was going to do.",
    text3: 'But then I stopped.',
    text4: 'I realised, I wanted to do something',
    text4Adjective: 'special',
    text5Entry: 'Because,',
    text5Content: 'You are Special',
    smiley: ':)',
    bigTextPart1: 'S',
    bigTextPart2: 'O',
    imagePath: '',
    photo1: '',
    photo2: '',
    wishHeading: 'Happy Birthday!',
    wishText: 'May all your dreams come true! ;)',
    wish1: 'Que cette nouvelle année de ta vie soit remplie de joie, de lumière et de toutes ces petites choses qui font sourire.',
    wish2: 'Tu mérites tout le bonheur du monde.',
    wish3: 'Joyeux anniversaire du fond du cœur. 🎂✨',
    outroText: 'Okay, now come back and tell me if you liked it.',
    replayText: 'Or click, if you want to watch it again.',
    outroSmiley: ':)',
  },
  fields: [
    // ── Intro ──
    { key: 'greeting',      label: 'Greeting',         type: 'text',     placeholder: 'Hey', section: 'Intro', required: false },
    { key: 'name',          label: 'Recipient Name',   type: 'text',     placeholder: 'Lydia', section: 'Intro', required: true },
    { key: 'greetingText',  label: 'Personal Note',    type: 'text',     placeholder: 'I really like your name btw!', section: 'Intro' },

    // ── Music ──
    { key: 'musicSrc',    label: 'Music File URL',   type: 'url',      placeholder: 'https://... .mp3', section: 'Music' },
    { key: 'albumArt',    label: 'Album Cover URL',  type: 'url',      placeholder: 'https://... .jpg', section: 'Music' },
    { key: 'trackTitle',  label: 'Track Title',      type: 'text',     placeholder: 'Notre chanson', section: 'Music' },
    { key: 'trackArtist', label: 'Artist',           type: 'text',     placeholder: 'Artiste', section: 'Music' },
    { key: 'musicHint',   label: 'Music Hint Text',  type: 'text',     placeholder: "C'est mieux avec de la musique 🎶", section: 'Music' },

    // ── Story ──
    { key: 'text1',         label: 'Birthday Announcement', type: 'text', placeholder: "It's your birthday!!! :D", section: 'Story', required: true },
    { key: 'text2',         label: 'Story Line 1',     type: 'text',     placeholder: "That's what I was going to do.", section: 'Story' },
    { key: 'text3',         label: 'Story Line 2',     type: 'text',     placeholder: 'But then I stopped.', section: 'Story' },
    { key: 'text4',         label: 'Story Line 3',     type: 'text',     placeholder: 'I realised, I wanted to do something', section: 'Story' },
    { key: 'text4Adjective',label: 'Highlighted Word', type: 'text',     placeholder: 'special', section: 'Story' },
    { key: 'text5Entry',    label: 'Transition Word',  type: 'text',     placeholder: 'Because,', section: 'Story' },
    { key: 'text5Content',  label: 'Big Statement',    type: 'text',     placeholder: 'You are Special', section: 'Story' },

    // ── WhatsApp Message ──
    { key: 'waName',        label: 'Contact Name',     type: 'text',     placeholder: 'Lydia', section: 'Message' },
    { key: 'textInChatBox', label: 'Message Text',     type: 'textarea', placeholder: 'Happy birthday to you!!', section: 'Message', required: true },

    // ── Celebration ──
    { key: 'imagePath',     label: 'Main Photo',       type: 'url',      placeholder: 'https://... .jpg', section: 'Celebration' },
    { key: 'photo1',        label: 'Side Photo Left',  type: 'url',      placeholder: 'https://... .jpg', section: 'Celebration' },
    { key: 'photo2',        label: 'Side Photo Right', type: 'url',      placeholder: 'https://... .jpg', section: 'Celebration' },
    { key: 'wishHeading',   label: 'Wish Heading',     type: 'text',     placeholder: 'Happy Birthday!', section: 'Celebration', required: true },
    { key: 'wishText',      label: 'Wish Subtitle',    type: 'text',     placeholder: 'May all your dreams come true!', section: 'Celebration' },

    // ── Personal Wishes ──
    { key: 'wish1', label: 'Wish Paragraph 1', type: 'textarea', placeholder: 'Your first wish...', section: 'Wishes' },
    { key: 'wish2', label: 'Wish Paragraph 2', type: 'textarea', placeholder: 'Your second wish...', section: 'Wishes' },
    { key: 'wish3', label: 'Wish Paragraph 3', type: 'textarea', placeholder: 'Your third wish...', section: 'Wishes' },

    // ── Outro ──
    { key: 'outroText',   label: 'Outro Text',   type: 'text', placeholder: 'Okay, now come back and tell me if you liked it.', section: 'Outro' },
    { key: 'replayText',  label: 'Replay Text',  type: 'text', placeholder: 'Or click, if you want to watch it again.', section: 'Outro' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const t = await Template.findOneAndUpdate(
    { name: 'birthday' },
    birthdayTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded template:', t.name);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });