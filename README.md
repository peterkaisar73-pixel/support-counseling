# خدمة الدعم والمشورة — الموقع الرسمي

موقع ثابت (Static Site) بـ HTML / CSS / JavaScript فقط، بدون أي أدوات بناء (build tools)، جاهز للرفع مباشرة على GitHub Pages أو Vercel أو أي استضافة ثابتة.

## هيكل الملفات

```
.
├── index.html          الصفحة الرئيسية وكل أقسام الموقع
├── css/
│   └── style.css       كل التصميم (متغيرات الألوان، الخطوط، الأقسام)
├── js/
│   └── main.js         منطق النموذج، الحجز، القائمة، والحركات
└── README.md
```

هذا الهيكل البسيط قابل للتحويل لاحقًا بسهولة إلى React أو Next.js:
كل قسم في `index.html` (Hero, About, Program, Lectures, Course, Booking, Testimonials, Footer) يمكن تحويله مباشرة إلى Component مستقل، ومنطق `main.js` مقسّم بنفس التقسيم.

## قبل الرفع

1. **الشعار (اللوجو)**: الموقع بيقرأ الشعار تلقائيًا من الملف `images/logo.png`. ارفع صورة اللوجو بتاعتك في مجلد `images` وسمّيها بالظبط `logo.png` (نفس الاسم والامتداد)، وهتظهر في الهيدر والفوتر تلقائيًا من غير أي تعديل في الكود.
   - لو صورتك بصيغة jpg بدل png، إما حوّلها لـ png، أو افتح `index.html` وابحث عن `images/logo.png` (مكانين: الهيدر والفوتر) وغيّرها لـ `images/logo.jpg`.

2. **استمارة كورس "صخرة العهد"**: تستخدم [SheetDB](https://sheetdb.io) لحفظ البيانات في Google Sheets. الرابط موجود في `js/main.js` بالمتغير:
   ```js
   var SHEETDB_URL = "https://sheetdb.io/api/v1/wnb9qfuidlpbg";
   ```
   تأكد إنه رابط حسابك الخاص المربوط بشيت كورس صخرة العهد.

3. **استمارة "خدمة المشورة"**: استمارة منفصلة تمامًا (فردية / زوجية) وتُحفظ في شيت آخر مختلف عبر متغير منفصل في `js/main.js`:
   ```js
   var COUNSELING_SHEETDB_URL = "https://sheetdb.io/api/v1/YOUR_COUNSELING_SHEETDB_ID";
   ```
   لازم تستبدل القيمة دي برابط SheetDB حقيقي، خطوات عمله:
   - اعمل Google Sheet جديد (منفصل عن شيت الكورس) بأعمدة: `counselType, name, age, phone, husbandName, husbandAge, husbandPhone, wifeName, wifeAge, wifePhone, challenges, submittedAt`
   - سجّل في sheetdb.io واربطه بالشيت ده، وهياديك رابط API خاص به
   - حط الرابط ده مكان `YOUR_COUNSELING_SHEETDB_ID` في `js/main.js`

4. **واتساب**: رقم الواتساب الحالي `01273923667` مستخدم في أكثر من مكان (الفوتر، رسالة التكرار في استمارة الكورس). حدّثه إذا تغيّر.

## الرفع على GitHub

```bash
cd اسم-المجلد
git init
git add .
git commit -m "الموقع الأولي لخدمة الدعم والمشورة"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### تفعيل GitHub Pages
1. من صفحة الريبو على GitHub: **Settings → Pages**
2. تحت "Build and deployment" اختر **Deploy from a branch**
3. اختر الفرع `main` والمجلد `/ (root)`
4. احفظ، وبعد دقيقة أو اثنتين سيكون الموقع متاحًا على:
   `https://USERNAME.github.io/REPO_NAME/`

## الرفع على Vercel (بديل أسرع)

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل الدخول بحساب GitHub
2. اضغط **New Project** واختر الريبو
3. اتركه بدون أي Build Command (لأنه موقع ثابت بالكامل) واضغط **Deploy**
4. سيعطيك Vercel رابطًا مباشرًا فورًا، ويمكن ربط دومين خاص لاحقًا من **Settings → Domains**

## التطوير محليًا

الموقع لا يحتاج أي تثبيت. لتشغيله محليًا بسيرفر بسيط (بعض المتصفحات تمنع طلبات fetch من ملف مفتوح مباشرة `file://`):

```bash
# باستخدام بايثون
python3 -m http.server 8000
# أو باستخدام Node
npx serve .
```

ثم افتح `http://localhost:8000`.
