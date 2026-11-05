const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ===== عدّل الاتنين دول =====
const OWNER_EMAIL = 'go2025fast@gmail.com'; // إيميل المالك (نفس اللي في القواعد)
const REGION = 'europe-west1';                 // أقرب منطقة لمنطقة Firestore بتاعتك

const ST = { new: 'تم استلام طلبك', preparing: 'طلبك قيد التحضير 👨‍🍳', delivering: 'طلبك في الطريق إليك 🛵', done: 'تم تسليم طلبك ✅', cancelled: 'تم إلغاء الطلب' };

async function send(tokens, title, body, tokDoc) {
  tokens = [...new Set((tokens || []).filter(Boolean))];
  if (!tokens.length) return;
  const r = await admin.messaging().sendEachForMulticast({
    tokens, data: { title, body, url: './' },
    android: { priority: 'high' },
    webpush: { headers: { Urgency: 'high', TTL: '3600' } },
  });
  if (tokDoc) {
    const bad = tokens.filter((t, i) => !r.responses[i].success &&
      /registration-token-not-registered|invalid-argument|invalid-registration/.test((r.responses[i].error && r.responses[i].error.code) || ''));
    if (bad.length) await tokDoc.update({ tokens: admin.firestore.FieldValue.arrayRemove(...bad) }).catch(() => {});
  }
}
async function userTokens(uid) {
  const ref = db.doc('ftokens/' + uid), s = await ref.get();
  return [s.exists ? (s.data().tokens || []) : [], ref];
}
async function ownerTokens() {
  try { const u = await admin.auth().getUserByEmail(OWNER_EMAIL); return await userTokens(u.uid); }
  catch (e) { return [[], null]; }
}

exports.onNewOrder = onDocumentCreated({ document: 'orders/{id}', region: REGION }, async (e) => {
  const o = e.data.data(), [t, ref] = await ownerTokens();
  await send(t, `🔔 طلب جديد #${o.no}`, `${o.n} • ${o.total} ج.م • ${o.type === 'delivery' ? 'توصيل' : 'استلام'}`, ref);
});

exports.onOrderUpdate = onDocumentUpdated({ document: 'orders/{id}', region: REGION }, async (e) => {
  const b = e.data.before.data(), a = e.data.after.data();
  if (b.status !== a.status) {
    if (a.ftok) await send([a.ftok], `طلبك #${a.no}`, ST[a.status] || a.status);
    if (a.drv && (a.status === 'delivering' || a.status === 'done')) {
      const [t, ref] = await ownerTokens();
      await send(t, `🛵 ${a.drv.n}: طلب #${a.no}`, ST[a.status], ref);
    }
  }
  if (a.drv && (!b.drv || b.drv.id !== a.drv.id)) {
    const [t, ref] = await userTokens(a.drv.id);
    await send(t, `🛵 طلب جديد ليك #${a.no}`, `${a.n} • ${a.a || 'الموقع على الخريطة'} • ${a.total} ج.م`, ref);
  }
});
