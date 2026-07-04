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
     BOOKING — نظام حجز جلسات المشورة
     معاينة تعمل بالكامل من المتصفح (بيانات تجريبية للمواعيد
     المحجوزة). جاهز لاحقًا للربط بـ Google Calendar API أو أي
     قاعدة بيانات حقيقية بدلاً من الكائن MOCK_TAKEN بالأسفل.
     ========================================================= */
  var calGrid = document.getElementById('calGrid');
  var calMonthLabel = document.getElementById('calMonthLabel');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var slotGrid = document.getElementById('slotGrid');
  var selectedNote = document.getElementById('selectedNote');
  var bookingForm = document.getElementById('bookingForm');
  var bkErrorMsg = document.getElementById('bkErrorMsg');
  var bkSuccessBox = document.getElementById('bkSuccessBox');
  var bkSummaryText = document.getElementById('bkSummaryText');

  if (calGrid) {
    var DOW = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    var MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    var ALL_SLOTS = ['05:00 م', '06:00 م', '07:00 م', '08:00 م'];

    // مواعيد محجوزة بالفعل (بيانات تجريبية — استبدلها بربط حقيقي لاحقًا)
    var MOCK_TAKEN = {}; // key: 'YYYY-M-D' => array of taken slot strings

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var viewYear = today.getFullYear();
    var viewMonth = today.getMonth();
    var selectedDate = null;
    var selectedSlot = null;

    function dateKey(y, m, d) { return y + '-' + m + '-' + d; }

    function seedMockData() {
      // نولّد بعض المواعيد المحجوزة تلقائيًا للأسبوعين القادمين كمعاينة فقط
      for (var i = 1; i <= 14; i++) {
        var d = new Date(today);
        d.setDate(d.getDate() + i);
        if (d.getDay() === 5 || d.getDay() === 0) { // الجمعة أو الأحد
          var key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
          var takenCount = (i % 3) + 1;
          MOCK_TAKEN[key] = ALL_SLOTS.slice(0, takenCount);
        }
      }
    }
    seedMockData();

    function renderCalendar() {
      calMonthLabel.textContent = MONTHS[viewMonth] + ' ' + viewYear;
      calGrid.innerHTML = '';
      DOW.forEach(function (d) {
        var el = document.createElement('div');
        el.className = 'dow';
        el.textContent = d;
        calGrid.appendChild(el);
      });

      var firstDay = new Date(viewYear, viewMonth, 1).getDay();
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      for (var i = 0; i < firstDay; i++) {
        var muted = document.createElement('div');
        muted.className = 'cal-day muted';
        calGrid.appendChild(muted);
      }

      for (var day = 1; day <= daysInMonth; day++) {
        var cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = day;
        var thisDate = new Date(viewYear, viewMonth, day);
        thisDate.setHours(0, 0, 0, 0);

        if (thisDate < today) {
          cell.classList.add('past');
        } else {
          cell.addEventListener('click', function (d, cellEl) {
            return function () {
              calGrid.querySelectorAll('.cal-day.selected').forEach(function (c) { c.classList.remove('selected'); });
              cellEl.classList.add('selected');
              selectedDate = d;
              selectedSlot = null;
              renderSlots();
              updateSelectedNote();
            };
          }(thisDate, cell));
        }

        if (selectedDate && thisDate.getTime() === selectedDate.getTime()) {
          cell.classList.add('selected');
        }

        calGrid.appendChild(cell);
      }
    }

    function renderSlots() {
      slotGrid.innerHTML = '';
      if (!selectedDate) {
        slotGrid.innerHTML = '<span class="slot-empty">اختر يومًا أولًا لعرض الأوقات المتاحة</span>';
        return;
      }
      var key = dateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      var taken = MOCK_TAKEN[key] || [];

      ALL_SLOTS.forEach(function (slot) {
        var btn = document.createElement('div');
        btn.className = 'slot';
        btn.textContent = slot;
        if (taken.indexOf(slot) !== -1) {
          btn.classList.add('taken');
        } else {
          btn.addEventListener('click', function () {
            slotGrid.querySelectorAll('.slot.selected').forEach(function (s) { s.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedSlot = slot;
            updateSelectedNote();
          });
        }
        slotGrid.appendChild(btn);
      });
    }

    function updateSelectedNote() {
      if (selectedDate && selectedSlot) {
        var dayStr = selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
        selectedNote.innerHTML = 'الموعد المختار: <b>' + dayStr + ' — ' + selectedSlot + '</b>';
      } else if (selectedDate) {
        selectedNote.textContent = 'اختر وقتًا متاحًا من القائمة أعلاه';
      } else {
        selectedNote.textContent = 'لم يتم اختيار موعد بعد';
      }
    }

    calPrev.addEventListener('click', function () {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      renderCalendar();
    });
    calNext.addEventListener('click', function () {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      renderCalendar();
    });

    renderCalendar();
    renderSlots();
    updateSelectedNote();

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      bkErrorMsg.style.display = 'none';

      if (!selectedDate || !selectedSlot) {
        bkErrorMsg.style.display = 'block';
        return;
      }

      var name = document.getElementById('bkName').value.trim();
      var phone = document.getElementById('bkPhone').value.trim();
      var type = document.getElementById('bkType').value;

      // Mark the slot as taken locally so it can't be double-booked in this session
      var key = dateKey(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      if (!MOCK_TAKEN[key]) MOCK_TAKEN[key] = [];
      MOCK_TAKEN[key].push(selectedSlot);

      var dayStr = selectedDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
      bkSummaryText.textContent = name + '، تم حجز جلسة (' + type + ') يوم ' + dayStr + ' الساعة ' + selectedSlot + '. سيتم التواصل معك على ' + phone + ' لتأكيد الموعد.';

      bookingForm.style.display = 'none';
      bkSuccessBox.style.display = 'block';
      showToast('تم تأكيد الحجز بنجاح');

      // NOTE: للربط بقاعدة بيانات حقيقية أو Google Calendar، أرسل هنا
      // طلب fetch إلى الـ API الخاص بك بنفس بيانات الحجز (name, phone, type, note, date, slot).
    });
  }

});
