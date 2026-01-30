# إخفاء رسائل TradingView من الكونسول

الويدجت (TradingView Chart) قد يظهر في تبويب **Console** رسائل مثل:

- `GET ... support-portal-problems/?language=en 403 (Forbidden)`
- `Failed to load resource: 403`
- `Chart.DataProblemModel: Couldn't load support portal problems`
- `SES Removing unpermitted intrinsics` (من إضافة المتصفح)

هذه الرسائل صادرة من داخل **iframe** الويدجت ولا يمكن إخفاؤها من كود الموقع. الشارت يعمل بشكل طبيعي رغم ذلك.

## إخفاؤها من الكونسول

1. افتح أدوات المطوّر (F12).
2. ادخل تبويب **Console**.
3. في صندوق **Filter** اكتب:

   ```
   -tradingview -403 -DataProblemModel -support-portal -SES -lockdown
   ```

   (العلامة `-` تعني "استبعد أي سطر يحتوي على هذا النص")

بهذا تُخفى معظم الرسائل المتعلقة بـ TradingView و‎403 و‎lockdown/SES من قائمة الكونسول.
