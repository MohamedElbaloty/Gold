# Railway — خدمة واحدة (فرونت + باك) من GitHub

## كيف تكون فرونت وباك في خدمة واحدة؟

الريبو فيه **Dockerfile** واحد في الجذر. لما تربط الريبو من GitHub على Railway:

1. **New Project** → **Deploy from GitHub repo** → اختر ريبو Gold.
2. Railway يعمل **خدمة واحدة (Service)** من الريبو.
3. الـ **Dockerfile** يبني الفرونت (React build) ثم يشغّل الباك إند (Node).
4. الباك إند يقدّم:
   - **API** على `/api/*`
   - **الواجهة (الفرونت)** على `/` وكل المسارات (نفس الرابط).

يعني: **ريبو واحد من GitHub = خدمة واحدة = رابط واحد** فيه الواجهة والـ API مع بعض. مفيش حاجة تانية تعملها من ناحية "سيرفسين منفصلين".

### المتغيرات المطلوبة في Railway (Variables)

| المتغير | مطلوب؟ | ملاحظة |
|--------|--------|--------|
| **MONGODB_URI** | نعم | رابط MongoDB (Atlas أو غيره). |
| **JWT_SECRET** | نعم | سري عشوائي طويل (لتسجيل الدخول والتسجيل). |
| **NODE_ENV** | لا | Railway يضبطه غالباً = production. |
| **CORS_ORIGIN** | لا | ممكن تتركه `*` أو تضبطه لاحقاً. |
| **PORT** | لا | Railway يضبطه تلقائياً. |

بعد ما تضيف **MONGODB_URI** و **JWT_SECRET** وتعمل **Deploy** (أو Redeploy)، الخدمة الواحدة تشتغل وتروح على الرابط اللي Railway يعطيك.

---

## إصلاح التحذيرات واتصال MongoDB

إذا ظهرت تحذيرات **useNewUrlParser** أو **Duplicate schema index** أو خطأ اتصال MongoDB:

## 1) التأكد من الريبو والفرع

- **Settings** → **Source**: يجب أن يكون مربوطاً بنفس الريبو على GitHub (مثلاً `MohamedElbaloty/Gold`).
- الفرع: **main** (أو الفرع اللي فيه آخر التعديلات).
- افتح الريبو على GitHub وتأكد أن `backend/server.js` **لا** يحتوي على `useNewUrlParser` داخل `mongoose.connect()` — إذا وجدته فالريبو قديم.

## 2) إعادة البناء من الصفر (بدون كاش)

- في **Variables** أضف متغيراً مؤقتاً: الاسم **`NO_CACHE`** والقيمة **`1`** (يجبر Docker على بناء نظيف).
- **Deployments** → الثلاث نقاط بجانب آخر Deploy → **Redeploy**.
- إذا وُجد خيار **"Clear build cache and redeploy"** أو **"Rebuild"** استخدمه.
- بعد نجاح التشغيل يمكنك حذف `NO_CACHE` إن أردت.

## 3) متغير MONGODB_URI

- **Variables** لنفس الـ Service اللي يشغّل الباك اند.
- اسم المتغير بالضبط: **`MONGODB_URI`** (حروف كبيرة، بدون مسافات).
- القيمة مثل (مع **?** بعد اسم الداتابيز):

  ```
  mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/gold-trading?retryWrites=true&w=majority&appName=Cluster0
  ```

- لا تضع القيمة بين علامتي تنصيص في واجهة Railway.
- بعد تغيير أي Variable اعمل **Redeploy**.

## 4) التأكد من تشغيل آخر كود

بعد الـ Redeploy في اللوق يجب أن ترى إما:

- **"MongoDB connected"** → الاتصال يعمل.
- أو **"MONGODB_URI is required"** → المتغير غير مضبوط (راجع الخطوة 3).

إذا استمرت تحذيرات **useNewUrlParser** أو **Duplicate index** فالمشروع ما زال يشغّل نسخة قديمة — تأكد من الخطوة 1 و 2.

---

## تعبيئة المتجر على الموقع المباشر (Seed على الإنتاج)

المنتجات اللي بتظهر على **https://gold-production-57be.up.railway.app/** جاية من قاعدة البيانات اللي مربوطة بالـ **MONGODB_URI** في Railway. لو الموقع بيقول "لا يوجد منتجات" فمعناها قاعدة الإنتاج فاضية.

### الطريقة 1: تشغيل الـ seed محلياً ضد قاعدة الإنتاج

1. من **Railway** → مشروعك → **Variables** انسخ قيمة **MONGODB_URI** (نفس اللي الخدمة بتستخدمه).
2. من **جذر المشروع** على جهازك شغّل الأمر مع نفس الرابط (استبدل `YOUR_RAILWAY_MONGODB_URI` بالرابط الفعلي):

   **Windows (PowerShell):**
   ```powershell
   $env:MONGODB_URI="YOUR_RAILWAY_MONGODB_URI"; npm run seed:store
   ```

   **Windows (CMD):**
   ```cmd
   set MONGODB_URI=YOUR_RAILWAY_MONGODB_URI && npm run seed:store
   ```

   **Linux / macOS:**
   ```bash
   MONGODB_URI="YOUR_RAILWAY_MONGODB_URI" npm run seed:store
   ```

3. لما تشوف "Seed complete." معناها المنتجات اتحطت في قاعدة الإنتاج.
4. حدّث صفحة الموقع **https://gold-production-57be.up.railway.app/** — المفروض المنتجات تظهر.

### الطريقة 2: One-off من Railway (إن متوفر)

لو عندك **Railway CLI** وربطت المشروع:

```bash
railway run npm run seed:store
```

هيشتغل في بيئة Railway ونفس **MONGODB_URI**، والنتيجة نفس تعبيئة الإنتاج.
