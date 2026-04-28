const router = require('express').Router();
const Publication = require('../models/Publication');

// GET /collect/:publicationId — show submission form
router.get('/:publicationId', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.publicationId).lean();
    if (!pub) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#fafafa">
          <h1 style="color:#ff69b4">Oops 🙈</h1>
          <p>Ce lien de collecte n'existe pas ou a expiré.</p>
        </body></html>
      `);
    }

    const recipientName = pub.data?.name || pub.title || 'quelqu\'un de spécial';
    const groupName = pub.data?.groupName || 'Le groupe';
    const isPro = pub.templateName === 'collective-pro';

    const primaryColor = pub.style?.primaryColor || (isPro ? '#1e3a5f' : '#ff69b4');
    const accentColor  = pub.style?.accentColor  || (isPro ? '#c9a84c' : '#ffb347');
    const font = isPro ? "'Lora', serif" : "'Nunito', sans-serif";
    const googleFont = isPro
      ? 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=Inter:wght@300;400;500&display=swap'
      : 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap';

    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laisse un message pour ${recipientName} 💌</title>
  <link href="${googleFont}" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      font-family: ${font};
      background: linear-gradient(135deg, ${primaryColor}18 0%, ${accentColor}18 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff; border-radius: 24px;
      padding: 40px 36px; max-width: 480px; width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .card-header { text-align: center; margin-bottom: 32px; }
    .card-header .emoji { font-size: 3rem; display: block; margin-bottom: 12px; }
    .card-header h1 {
      font-size: 1.5rem; font-weight: 600;
      color: ${primaryColor}; margin-bottom: 6px;
    }
    .card-header p { font-size: 0.9rem; color: #888; font-weight: 300; }
    .card-header strong { color: ${primaryColor}; }

    .field { margin-bottom: 18px; }
    .field label {
      display: block; font-size: 0.78rem; font-weight: 600;
      color: #555; text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 6px;
    }
    .field input, .field textarea {
      width: 100%; border: 1.5px solid #e5e5e5;
      border-radius: 10px; padding: 11px 14px;
      font-family: inherit; font-size: 0.92rem; color: #222;
      transition: border-color 0.2s; background: #fafafa;
      resize: none;
    }
    .field input:focus, .field textarea:focus {
      border-color: ${primaryColor}; outline: none; background: #fff;
    }
    .field textarea { min-height: 110px; line-height: 1.6; }

    /* Photo upload */
    .photo-upload { position: relative; cursor: pointer; }
    .photo-upload input[type=file] { display: none; }
    .photo-preview {
      border: 2px dashed #e0e0e0; border-radius: 10px;
      height: 90px; display: flex; align-items: center; justify-content: center;
      gap: 10px; color: #aaa; font-size: 0.85rem;
      transition: border-color 0.2s, background 0.2s;
      cursor: pointer; position: relative; overflow: hidden;
    }
    .photo-preview:hover { border-color: ${primaryColor}; background: ${primaryColor}08; color: ${primaryColor}; }
    .photo-preview.has-image { border-style: solid; border-color: ${primaryColor}; padding: 4px; }
    .photo-preview.has-image img { width: 100%; height: 100%; object-fit: cover; border-radius: 7px; }
    .photo-preview .upload-icon { font-size: 1.4rem; }

    /* Upload loading state */
    .photo-preview.uploading {
      border-color: ${primaryColor};
      background: ${primaryColor}08;
      cursor: not-allowed;
      pointer-events: none;
    }
    .upload-loader {
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: ${primaryColor};
      font-size: 0.8rem;
      font-weight: 600;
    }
    .uploading .upload-loader { display: flex; }
    .uploading .upload-default { display: none; }
    .spinner {
      width: 28px; height: 28px;
      border: 3px solid ${primaryColor}30;
      border-top-color: ${primaryColor};
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Upload done badge */
    .upload-done-badge {
      display: none;
      position: absolute; top: 6px; right: 8px;
      background: #22c55e; color: #fff;
      font-size: 0.65rem; font-weight: 700;
      padding: 2px 7px; border-radius: 99px;
      letter-spacing: 0.04em;
    }
    .photo-preview.upload-ok .upload-done-badge { display: block; }

    .submit-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
      color: #fff; border: none; border-radius: 50px;
      font-family: inherit; font-size: 1rem; font-weight: 600;
      cursor: pointer; margin-top: 8px;
      box-shadow: 0 6px 20px ${primaryColor}40;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px ${primaryColor}50; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    .success {
      display: none; text-align: center; padding: 20px 0;
    }
    .success .s-emoji { font-size: 3.5rem; display: block; margin-bottom: 16px; }
    .success h2 { font-size: 1.4rem; color: ${primaryColor}; margin-bottom: 8px; }
    .success p { color: #888; font-weight: 300; font-size: 0.9rem; }

    .char-count { font-size: 0.7rem; color: #bbb; text-align: right; margin-top: 4px; }
    .required { color: ${primaryColor}; }
  </style>
</head>
<body>
<div class="card">
  <div id="form-section">
    <div class="card-header">
      <span class="emoji">${isPro ? '🎖️' : '🎉'}</span>
      <h1>Un message pour <strong>${recipientName}</strong></h1>
      <p>${groupName} prépare quelque chose de spécial — laisse ton message !</p>
    </div>

    <div class="field">
      <label>Ton prénom <span class="required">*</span></label>
      <input type="text" id="firstName" placeholder="${isPro ? 'Prénom Nom' : 'Prénom'}" maxlength="50">
    </div>

    <div class="field">
      <label>Ton rôle ${isPro ? '<span class="required">*</span>' : '(optionnel)'}</label>
      <input type="text" id="role" placeholder="${isPro ? 'ex: Chef de projet, DRH, Collègue…' : 'ex: Meilleur ami, Cousin, BFF…'}" maxlength="60">
    </div>

    <div class="field">
      <label>Ton message <span class="required">*</span></label>
      <textarea id="message" placeholder="Écris quelque chose de sincère et de chaleureux…" maxlength="400" oninput="updateCount(this)"></textarea>
      <div class="char-count"><span id="msg-count">0</span>/400</div>
    </div>

    <div class="field">
      <label>Ta photo (optionnel)</label>
      <div class="photo-preview" id="photo-preview" onclick="document.getElementById('photo-input').click()">
        <!-- Default state -->
        <div class="upload-default" style="display:flex;align-items:center;gap:10px">
          <span class="upload-icon">📷</span>
          <span>Clique pour ajouter une photo</span>
        </div>
        <!-- Loading state -->
        <div class="upload-loader">
          <div class="spinner"></div>
          <span>Upload en cours…</span>
        </div>
        <!-- Done badge -->
        <span class="upload-done-badge">✓ Uploadée</span>
      </div>
      <input type="file" id="photo-input" accept="image/*" onchange="handlePhoto(this)">
    </div>

    <div id="error-msg" style="color:#e74c3c;font-size:0.82rem;margin-bottom:10px;display:none"></div>
    <button class="submit-btn" id="submit-btn" onclick="submitWish()">
      ${isPro ? 'Envoyer mon message 📩' : 'Envoyer mes vœux 💌'}
    </button>
  </div>

  <div class="success" id="success-section">
    <span class="s-emoji">${isPro ? '✅' : '🎊'}</span>
    <h2>Message envoyé !</h2>
    <p>Merci <strong id="success-name"></strong> — ton message sera affiché lors de la surprise.<br>Garde le secret ! 🤫</p>
  </div>
</div>

<script>
const PUB_ID = '${req.params.publicationId}';
let uploadedPhotoUrl = '';
let isUploading = false;

function updateCount(el) {
  document.getElementById('msg-count').textContent = el.value.length;
}

async function handlePhoto(input) {
  const file = input.files[0];
  if (!file) return;

  const preview = document.getElementById('photo-preview');
  const submitBtn = document.getElementById('submit-btn');

  // --- Show loading state ---
  isUploading = true;
  preview.classList.remove('has-image', 'upload-ok');
  preview.classList.add('uploading');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Photo en cours d\'upload…';

  // Upload
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    uploadedPhotoUrl = data.url || '';

    // --- Upload success: show thumbnail + green badge ---
    preview.classList.remove('uploading');
    preview.classList.add('has-image', 'upload-ok');
    // Replace the loader content with the image thumbnail
    preview.querySelector('.upload-loader').style.display = 'none';
    const thumb = document.createElement('img');
    thumb.src = uploadedPhotoUrl || URL.createObjectURL(file);
    thumb.alt = 'preview';
    thumb.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:7px';
    preview.insertBefore(thumb, preview.firstChild);

  } catch (e) {
    console.error('Upload failed', e);
    // --- Upload failed: reset to default ---
    preview.classList.remove('uploading', 'has-image', 'upload-ok');
    preview.querySelector('.upload-loader').style.display = '';
    preview.querySelector('.upload-default').style.display = 'flex';
    // Show inline error
    const errEl = document.getElementById('error-msg');
    errEl.textContent = 'Échec de l\'upload photo. Réessaie.';
    errEl.style.display = 'block';
  } finally {
    // --- Always re-enable submit ---
    isUploading = false;
    submitBtn.disabled = false;
    submitBtn.textContent = '${isPro ? 'Envoyer mon message 📩' : 'Envoyer mes vœux 💌'}';
  }
}

async function submitWish() {
  const firstName = document.getElementById('firstName').value.trim();
  const role = document.getElementById('role').value.trim();
  const message = document.getElementById('message').value.trim();
  const errEl = document.getElementById('error-msg');

  errEl.style.display = 'none';

  // Block if upload is still running
  if (isUploading) {
    errEl.textContent = 'La photo est encore en cours d\'upload, patiente un instant…';
    errEl.style.display = 'block';
    return;
  }

  if (!firstName) { errEl.textContent = 'Ton prénom est requis.'; errEl.style.display='block'; return; }
  if (!message)   { errEl.textContent = 'Le message ne peut pas être vide.'; errEl.style.display='block'; return; }
  ${isPro ? `if (!role) { errEl.textContent = 'Ton rôle est requis.'; errEl.style.display='block'; return; }` : ''}

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours…';

  try {
    const res = await fetch('/api/wishes/' + PUB_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, role, message, photoUrl: uploadedPhotoUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur serveur');

    document.getElementById('form-section').style.display = 'none';
    document.getElementById('success-name').textContent = firstName;
    document.getElementById('success-section').style.display = 'block';
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = '${isPro ? 'Envoyer mon message 📩' : 'Envoyer mes vœux 💌'}';
  }
}
</script>
</body>
</html>`);
  } catch (e) {
    res.status(500).send('<h1>Erreur</h1><pre>' + e.message + '</pre>');
  }
});

module.exports = router;