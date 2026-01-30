# إخفاء رسائل TradingView من الكونسول

الويدجت (TradingView Chart) قد يظهر في تبويب **Console** رسائل مثل:

- `GET https://www.tradingview-widget.com/support/support-portal-problems/?language=en 403 (Forbidden)`
- `2026-01-30T...:Fetch:/support/support-portal-problems/?language=en. Status 403`
- `Chart.DataProblemModel:Couldn't load support portal problems`
- `Failed to load resource: 403`
- `SES Removing unpermitted intrinsics` (من إضافة المتصفح)

هذه الرسائل صادرة من ويدجت TradingView (أحياناً من داخل **iframe**) ولا تؤثر على عمل الشارت. الشارت يعمل بشكل طبيعي رغم ذلك.

## إخفاؤها من الكونسول

1. افتح أدوات المطوّر (F12).
2. ادخل تبويب **Console**.
3. في صندوق **Filter** اكتب:

   ```
   -tradingview -403 -DataProblemModel -support-portal -support-portal-problems -SES -lockdown
   ```

   (العلامة `-` تعني "استبعد أي سطر يحتوي على هذا النص")

بهذا تُخفى معظم الرسائل المتعلقة بـ TradingView و‎403 و‎DataProblemModel من قائمة الكونسول.

**ملاحظة:** سطر الـ 403 الأحمر (طلب الشبكة الفاشل) قد يبقى ظاهراً في تبويب Network؛ لا يمكن إخفاؤه من كود الموقع وهو غير مؤثر.
