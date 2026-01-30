# Railway — إصلاح التحذيرات واتصال MongoDB

إذا ظهرت تحذيرات **useNewUrlParser** أو **Duplicate schema index** أو خطأ **ECONNREFUSED localhost:27017**:

## 1) التأكد من الريبو والفرع

- **Settings** → **Source**: يجب أن يكون مربوطاً بنفس الريبو على GitHub (مثلاً `MohamedElbaloty/Gold`).
- الفرع: **main** (أو الفرع اللي فيه آخر التعديلات).

## 2) إعادة البناء من الصفر (بدون كاش)

- **Deployments** → الثلاث نقاط بجانب آخر Deploy → **Redeploy**.
- إذا وُجد خيار **"Clear build cache and redeploy"** أو **"Rebuild"** استخدمه حتى يُبنى المشروع من آخر كود.

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
- أو **"MONGODB_URI not set in production"** → المتغير غير مقروء (راجع الخطوة 3).

إذا استمرت تحذيرات **useNewUrlParser** أو **Duplicate index** فالمشروع ما زال يشغّل نسخة قديمة — تأكد من الخطوة 1 و 2.
