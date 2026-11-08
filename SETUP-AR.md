# دليل التشغيل الكامل (جو سوبر ماركت + Firebase)

## 1) إعدادات المشروع
1. Firebase Console ← Project settings ← Your apps ← الصق `firebaseConfig` داخل `FB_CONFIG` في أول سكريبت في `index.html`.
2. Authentication ← Sign-in method ← فعّل Email/Password، وضيف مستخدم المالك (إيميل + باسورد).
3. Firestore ← Rules ← الصق محتوى `firestore.rules` وغيّر `OWNER_EMAIL@example.com` لإيميل المالك ← Publish.

## 2) الإشعارات (Push)
1. Project settings ← Cloud Messaging ← Web Push certificates ← Generate key pair ← انسخ المفتاح العام والصقه في `FB_VAPID` في `index.html`.
2. غيّر الخطة لـ **Blaze** (مطلوبة لـ Cloud Functions). فعّل Budget alert من Google Cloud Billing لحماية نفسك من أي مصاريف مفاجئة.
3. على جهازك (Node 22 مثبت):
   ```
   npm i -g firebase-tools
   firebase login
   firebase use --add          # اختار مشروعك
   cd functions && npm install && cd ..
   ```
   افتح `functions/index.js` وغيّر `OWNER_EMAIL` و`REGION`، وبعدين:
   ```
   firebase deploy --only functions,firestore:rules
   ```
4. جوه التطبيق: لوحة المالك ← النشر ← **تفعيل إشعارات الطلبات** (مرة على كل جهاز). نفس الزر عند المندوب في شاشته.
5. في الـ APK: عند إعادة البناء من PWABuilder تأكد إن **Notification delegation** مفعّل.

## 3) المناديب
لوحة المالك ← المناديب ← اسم + موبايل + إيميل + كلمة مرور. المندوب يدخل بنفس الإيميل من الشعار (5 ضغطات) ويشوف طلباته فقط.

## 4) النشر
ارفع `index.html` و`sw.js` (ومعاهم الأيقونات والـ manifest) على الاستضافة، وبعد كل تعديل غيّر رقم الكاش في `sw.js`.
