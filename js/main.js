/* =========================================================
   خدمة الدعم والمشورة — main.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------- Footer year ---------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Navbar: scroll shadow + mobile toggle ---------------- */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Toast helper ---------------- */
  var toastEl = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3200);
  }

  /* =========================================================
     REGISTRATION FORM — صخرة العهد
     (نفس منطق النموذج الأصلي: أطفال ديناميكيين، حالة الزواج،
      التحقق من التكرار عبر SheetDB، والحفظ)
     ========================================================= */
  var childrenSection = document.getElementById('childrenSection');
  var childrenContainer = document.getElementById('childrenContainer');
  var childrenCountInput = document.getElementById('childrenCount');

  function updateChildrenFields() {
    var count = parseInt(childrenCountInput.value) || 0;
    childrenContainer.innerHTML = '';
    if (count > 0) {
      childrenSection.classList.add('visible');
      for (var i = 1; i <= count; i++) {
        var entry = document.createElement('div');
        entry.className = 'child-entry';
        entry.innerHTML =
          '<div class="field">' +
            '<label for="childName_' + i + '">اسم الطفل ' + i + '</label>' +
            '<input type="text" id="childName_' + i + '" placeholder="اسم الطفل">' +
          '</div>' +
          '<div class="field">' +
            '<label for="childAge_' + i + '">عمر الطفل ' + i + '</label>' +
            '<input type="number" id="childAge_' + i + '" min="0" step="1" inputmode="numeric" pattern="[0-9]*" placeholder="بالسنوات">' +
          '</div>';
        childrenContainer.appendChild(entry);
      }
    } else {
      childrenSection.classList.remove('visible');
    }
  }
  childrenCountInput.addEventListener('input', updateChildrenFields);

  var marriedFieldsContainer = document.getElementById('marriedFieldsContainer');
  var yearsMarriedInput = document.getElementById('yearsMarried');
  var statusRadios = document.querySelectorAll('input[name="status"]');
  var previousStatus = document.querySelector('input[name="status"]:checked').value;

  function resetMarriedRelatedData() {
    yearsMarriedInput.value = '';
    childrenCountInput.value = '';
    childrenContainer.innerHTML = '';
    childrenSection.classList.remove('visible');
  }

  function updateStatusFields() {
    var status = document.querySelector('input[name="status"]:checked').value;
    if (status !== previousStatus) {
      resetMarriedRelatedData();
      previousStatus = status;
    }
    if (status === 'مخطوبين') {
      marriedFieldsContainer.style.display = 'none';
      childrenSection.classList.remove('visible');
      yearsMarriedInput.required = false;
      childrenCountInput.required = false;
    } else {
      marriedFieldsContainer.style.display = '';
      yearsMarriedInput.required = true;
      childrenCountInput.required = true;
    }
  }
  statusRadios.forEach(function (radio) { radio.addEventListener('change', updateStatusFields); });
  updateStatusFields();
  updateChildrenFields();

  function cleanNumericInput(e) { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }
  function preventInvalidKeys(e) { if (['-', '+', 'e', 'E', '.', ','].includes(e.key)) e.preventDefault(); }
  document.querySelectorAll('input[type="number"]').forEach(function (input) {
    input.addEventListener('input', cleanNumericInput);
    input.addEventListener('keydown', preventInvalidKeys);
  });

  var form = document.getElementById('regForm');
  var submitBtn = document.getElementById('submitBtn');
  var errorMsg = document.getElementById('errorMsg');
  var successBox = document.getElementById('successBox');
  var duplicateBox = document.getElementById('duplicateBox');
  var SHEETDB_URL = "https://sheetdb.io/api/v1/wnb9qfuidlpbg"; // TODO: ضع رابط SheetDB الخاص بك هنا

  function normalizePhone(phone) { return phone.replace(/\D/g, '').replace(/^0+/, ''); }

  async function isAlreadyRegistered(husbandPhone, wifePhone) {
    var husbandPhoneNormalized = normalizePhone(husbandPhone);
    var wifePhoneNormalized = normalizePhone(wifePhone);
    try {
      var responses = await Promise.all([
        fetch(SHEETDB_URL + '/search?husbandPhone=' + encodeURIComponent(husbandPhoneNormalized)),
        fetch(SHEETDB_URL + '/search?wifePhone=' + encodeURIComponent(wifePhoneNormalized))
      ]);
      var data = await Promise.all(responses.map(function (r) { return r.json(); }));
      var found1 = Array.isArray(data[0]) && data[0].length > 0;
      var found2 = Array.isArray(data[1]) && data[1].length > 0;
      return found1 || found2;
    } catch (e) {
      return false;
    }
  }

  var MAX_CHILDREN_COLUMNS = 8;

  function getChildrenColumns() {
    var count = parseInt(childrenCountInput.value) || 0;
    var columns = {};
    for (var i = 1; i <= MAX_CHILDREN_COLUMNS; i++) {
      var nameInput = document.getElementById('childName_' + i);
      var ageInput = document.getElementById('childAge_' + i);
      var hasData = i <= count && nameInput && ageInput;
      columns['child' + i + 'Name'] = hasData ? nameInput.value.trim() : '';
      columns['child' + i + 'Age'] = hasData ? ageInput.value.trim() : '';
    }
    return columns;
  }

  function getEmptyChildrenColumns() {
    var columns = {};
    for (var i = 1; i <= MAX_CHILDREN_COLUMNS; i++) {
      columns['child' + i + 'Name'] = '';
      columns['child' + i + 'Age'] = '';
    }
    return columns;
  }

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      errorMsg.style.display = 'none';
      duplicateBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'جاري التحقق...';

      var status = document.querySelector('input[name="status"]:checked').value;
      var childrenColumns = status === 'مخطوبين' ? getEmptyChildrenColumns() : getChildrenColumns();

      var entry = {
        status: status,
        husbandName: document.getElementById('husbandName').value.trim(),
        husbandPhone: document.getElementById('husbandPhone').value.trim(),
        husbandBirth: document.getElementById('husbandBirth').value,
        wifeName: document.getElementById('wifeName').value.trim(),
        wifePhone: document.getElementById('wifePhone').value.trim(),
        wifeBirth: document.getElementById('wifeBirth').value,
        yearsMarried: status === 'مخطوبين' ? '' : document.getElementById('yearsMarried').value,
        childrenCount: status === 'مخطوبين' ? '' : document.getElementById('childrenCount').value,
        churchName: document.getElementById('churchName').value.trim(),
        submittedAt: new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo', hour12: true })
      };
      Object.assign(entry, childrenColumns);

      var alreadyRegistered = await isAlreadyRegistered(entry.husbandPhone, entry.wifePhone);
      if (alreadyRegistered) {
        form.style.display = 'none';
        duplicateBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'تأكيد التسجيل في الكورس';
        return;
      }

      submitBtn.textContent = 'جاري الحفظ...';
      try {
        var response = await fetch(SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: entry })
        });
        if (!response.ok) throw new Error('save failed');
        form.style.display = 'none';
        successBox.style.display = 'block';
      } catch (err) {
        console.error('SheetDB error:', err);
        errorMsg.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'تأكيد التسجيل في الكورس';
      }
    });
  }

  /* =========================================================
     خدمة المشورة — استمارة طلب جلسة (فردية / زوجية)
     يُحفظ الطلب في شيت جوجل شيتس منفصل عبر SheetDB، بنفس أسلوب
     استمارة كورس صخرة العهد بالأعلى.
     ========================================================= */
  var COUNSELING_SHEETDB_URL = "https://sheetdb.io/api/v1/zerhaw7s9gwlt";

  var counselTypeRadios = document.querySelectorAll('input[name="counselType"]');
  var individualFields = document.getElementById('individualFields');
  var coupleFields = document.getElementById('coupleFields');
  var counselForm = document.getElementById('counselForm');
  var counselErrorMsg = document.getElementById('counselErrorMsg');
  var counselSuccessBox = document.getElementById('counselSuccessBox');
  var counselSubmitBtn = document.getElementById('counselSubmitBtn');

  if (counselForm) {
    function updateCounselFields() {
      var type = document.querySelector('input[name="counselType"]:checked').value;
      if (type === 'زوجية') {
        individualFields.style.display = 'none';
        coupleFields.style.display = 'block';
      } else {
        individualFields.style.display = 'block';
        coupleFields.style.display = 'none';
      }
    }
    counselTypeRadios.forEach(function (r) { r.addEventListener('change', updateCounselFields); });
    updateCounselFields();

    document.querySelectorAll('#counselForm input[type="number"]').forEach(function (input) {
      input.addEventListener('input', cleanNumericInput);
      input.addEventListener('keydown', preventInvalidKeys);
    });

    counselForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      counselErrorMsg.style.display = 'none';
      counselSubmitBtn.disabled = true;
      counselSubmitBtn.textContent = 'جاري الإرسال...';

      var type = document.querySelector('input[name="counselType"]:checked').value;
      var entry = {
        counselType: type,
        submittedAt: new Date().toLocaleString('en-EG', { timeZone: 'Africa/Cairo', hour12: true })
      };

      if (type === 'زوجية') {
        entry.husbandName = document.getElementById('husName').value.trim();
        entry.husbandAge = document.getElementById('husAge').value.trim();
        entry.husbandPhone = document.getElementById('husPhone').value.trim();
        entry.wifeName = document.getElementById('wifName').value.trim();
        entry.wifeAge = document.getElementById('wifAge').value.trim();
        entry.wifePhone = document.getElementById('wifPhone').value.trim();
        entry.challenges = document.getElementById('coupleChallenges').value.trim();
        entry.name = ''; entry.age = ''; entry.phone = '';
      } else {
        entry.name = document.getElementById('indName').value.trim();
        entry.age = document.getElementById('indAge').value.trim();
        entry.phone = document.getElementById('indPhone').value.trim();
        entry.challenges = document.getElementById('indChallenges').value.trim();
        entry.husbandName = ''; entry.husbandAge = ''; entry.husbandPhone = '';
        entry.wifeName = ''; entry.wifeAge = ''; entry.wifePhone = '';
      }

      // تحقق أساسي: لازم بيانات التواصل الأساسية متملّية
      var missing = type === 'زوجية'
        ? (!entry.husbandName || !entry.husbandPhone || !entry.wifeName || !entry.wifePhone)
        : (!entry.name || !entry.phone);
      if (missing) {
        counselErrorMsg.textContent = 'من فضلك املأ الاسم ورقم التليفون.';
        counselErrorMsg.style.display = 'block';
        counselSubmitBtn.disabled = false;
        counselSubmitBtn.textContent = 'إرسال طلب الجلسة';
        return;
      }

      try {
        var response = await fetch(COUNSELING_SHEETDB_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: entry })
        });
        if (!response.ok) throw new Error('save failed');
        counselForm.style.display = 'none';
        counselSuccessBox.style.display = 'block';
        showToast('تم إرسال طلب الجلسة بنجاح');
      } catch (err) {
        console.error('SheetDB error (counseling):', err);
        counselErrorMsg.textContent = 'حدث خطأ أثناء الحفظ، من فضلك حاول مرة أخرى.';
        counselErrorMsg.style.display = 'block';
        counselSubmitBtn.disabled = false;
        counselSubmitBtn.textContent = 'إرسال طلب الجلسة';
      }
    });
  }

});
