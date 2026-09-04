/* ================================================================
   myKado — Date reminders
   Scanne les UserDate et envoie une notification quand une occasion
   tombe à J-3 ou J-1. Le champ `lastRemindedYear` empêche les doublons
   si le job tourne plusieurs fois par jour.
   ================================================================ */

const UserDate = require('../models/UserDate');
const { notify } = require('./notifications');

const REMINDER_DAYS = [3, 1];   // rappels envoyés à J-3 et J-1

function daysUntil(month, day, today = new Date()) {
  const y = today.getUTCFullYear();
  let target = new Date(Date.UTC(y, month - 1, day));
  if (target < startOfDay(today)) target = new Date(Date.UTC(y + 1, month - 1, day));
  return Math.round((target - startOfDay(today)) / (1000 * 60 * 60 * 24));
}

function startOfDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function checkAndSendReminders(now = new Date()) {
  const currentYear = now.getUTCFullYear();
  const dates = await UserDate.find({}).lean();
  let sent = 0;

  for (const d of dates) {
    const nDays = daysUntil(d.month, d.day, now);
    if (!REMINDER_DAYS.includes(nDays)) continue;

    // Skip si déjà rappelé cette année (le rappel J-3 a mis lastRemindedYear
    // à currentYear ; on veut quand même envoyer J-1 → on stocke la valeur la
    // plus fine : on utilise currentYear * 10 + minDaysSent pour distinguer,
    // mais simpler : on renvoie tant que lastRemindedYear + nDays diffère).
    // Ici on autorise deux envois par année (J-3 puis J-1) : on stocke
    // `${year}-${nDays}` dans lastRemindedYear (number) → codé year*10+nDays.
    const code = currentYear * 10 + nDays;
    if (d.lastRemindedYear === code) continue;

    try {
      await notify.dateReminder(d.userId, {
        name: d.name,
        occasion: d.occasion,
        daysUntil: nDays,
        dateId: d._id,
      });
      await UserDate.updateOne({ _id: d._id }, { lastRemindedYear: code });
      sent++;
    } catch (err) {
      console.error('[dateReminders] send failed', d._id, err.message);
    }
  }

  return sent;
}

/** Lance le job une fois toutes les 6h (soit 4x/jour) — sûr grâce au
 *  déduplication via `lastRemindedYear`. Premier run 30s après le boot. */
function startDailyJob() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const run = async () => {
    try {
      const n = await checkAndSendReminders();
      if (n > 0) console.log(`[dateReminders] ${n} rappel(s) envoyé(s)`);
    } catch (err) {
      console.error('[dateReminders] job failed', err.message);
    }
  };
  setTimeout(run, 30 * 1000);
  setInterval(run, SIX_HOURS);
}

module.exports = { checkAndSendReminders, startDailyJob };
