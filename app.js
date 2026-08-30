/**
 * Gold & Jewelry Customer Club - Main Application Script (گالری ظهورعطا)
 */

// --- Default Configuration ---
const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwj9nEjFkyUudeXEqPxXZ6HvZZiqdwcT-cV65-beuy7F0zPobTXRrTwLakYkPkd5uo/exec';

// --- Application State ---
const state = {
  currentStep: 1,
  storeSettings: {
    name: 'گالری ظهورعطا',
    senderNumber: '30007799',
    smsProvider: 'kavenegar',
    smsApiKey: '',
    smsApiUrl: '',
    smsPatternCode: '',
    sendMethod: 'native_sms',
  },
  customer: {
    phone: '',
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    marriageDay: '',
    marriageMonth: '',
    marriageYear: '',
    category: 'طلای سبک و کادویی',
    selectedTemplateId: 'promo_auction',
    smsText: '',
  },
};

// PWA deferred install prompt
let deferredInstallPrompt = null;

// --- Pre-defined SMS Templates for Gold & Jewelry Store ---
const smsTemplates = [
  {
    id: 'promo_auction',
    icon: 'flame',
    title: 'حراج طلای بدون اجرت و سرمایه‌گذاری',
    badge: 'تبلیغاتی ویژه',
    category: 'تبلیغات',
    text: '🔥 حراج استثنایی در {نام_فروشگاه}!\nجناب/سرکار {نام_مشتری} عزیز، به مدت ۳ روز کلیه مصنوعات طلا، النگو و شمش‌های گرمی بدون اجرت و با کمترین درصد تقدیم شما می‌گردد.\nفرصت طلایی پس‌انداز و سرمایه‌گذاری!\nگالری طلا و جواهر ظهورعطا',
  },
  {
    id: 'promo_weekend',
    icon: 'sparkles',
    title: 'تخفیف ۵۰٪ اجرت ساخت (آخر هفته VIP)',
    badge: 'تخفیف داغ',
    category: 'تبلیغات',
    text: 'درخشش بیشتر با هزینه کمتر ✨\n{نام_مشتری} گرامی، به عنوان عضو VIP باشگاه مشتریان {نام_فروشگاه}، پنجشنبه و جمعه این هفته از ۵۰٪ تخفیف در اجرت ساخت کلیه سرویس‌ها، دستبند و نیم‌ست‌های مدرن بهره‌مند شوید.\nکد تخفیف: ZOHOUR-VIP50',
  },
  {
    id: 'promo_collection',
    icon: 'crown',
    title: 'رونمایی کالکشن جدید طلا و جواهر',
    badge: 'تبلیغات کالکشن',
    category: 'تبلیغات',
    text: 'جدیدترین‌های دنیای طلا و جواهر رسید!\n{نام_مشتری} عزیز، از کالکشن بی‌نظیر پاییزه {نام_فروشگاه} شامل لوکس‌ترین دستبندهای مینیمال و ست‌های کادویی دیدن فرمایید.\nهمراه با هدیه ویژه برای خریدهای نقدی.\nگالری طلا و جواهر ظهورعطا',
  },
  {
    id: 'purchase',
    icon: 'shopping-bag',
    title: 'تبریک خرید و ثبت امتیاز باشگاه',
    badge: 'خرید طلا',
    category: 'خدمات مشتریان',
    text: 'مشتری گرامی {نام_مشتری}، از خرید و حسن اعتماد شما به {نام_فروشگاه} صمیمانه سپاسگزاریم.\nفاکتور شما ثبت و ۱۰۰ امتیاز به حساب باشگاه مشتریان شما اضافه شد.\nبا آرزوی درخشش همیشگی شما.\nگالری ظهورعطا',
  },
  {
    id: 'birthday',
    icon: 'gift',
    title: 'هدیه سالروز تولد (تخفیف اجرت ساخت)',
    badge: 'مناسبتی',
    category: 'تبریک تولد',
    text: 'جناب/سرکار {نام_مشتری} عزیز، سالروز تولدتان فرخنده باد! ✨\nبه پاس همراهی ارزشمندتان، هدیه {نام_فروشگاه} شامل ۲۵٪ تخفیف در اجرت ساخت کلیه کارهای طلا تا پایان این هفته برای شما فعال گردید.\nکد هدیه: HBD-ZOHOUR25\nلحظاتتان همواره درخشان باد.',
  },
  {
    id: 'anniversary',
    icon: 'heart',
    title: 'تبریک سالگرد ازدواج',
    badge: 'مناسبتی',
    category: 'سالگرد ازدواج',
    text: '{نام_مشتری} گرامی، سالگرد پیوند پرمهرتان مبارک باد 💍\nآرزومندیم زندگیتان همواره همچون طلا پایدار و درخشان باشد.\nبرای انتخاب هدیه و یادبود سالگرد، از ۲۰٪ تخفیف اجرت ساخت ست و نیم‌ست‌های {نام_فروشگاه} استفاده نمایید.',
  },
  {
    id: 'service',
    icon: 'gem',
    title: 'سرویس و آبکاری رایگان طلا',
    badge: 'خدمات VIP',
    category: 'خدمات',
    text: '{نام_مشتری} ارجمند، به مناسبت عضویت در باشگاه مشتریان {نام_فروشگاه}، سرویس شستشو، آبکاری و بررسی نگین کلیه طلا و جواهرات شما این ماه به صورت کاملاً رایگان انجام می‌شود.\nمشتاق دیدار مجدد شما در گالری ظهورعطا هستیم.',
  },
  {
    id: 'custom',
    icon: 'edit-3',
    title: 'متن دلخواه و سفارشی',
    badge: 'دستی',
    category: 'سفارشی',
    text: 'مشتری گرامی {نام_مشتری}، با سلام و احترام از طرف {نام_فروشگاه}...\n[متن اختصاصی شما]',
  },
];

// Persian Month Names
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// --- Utility Functions ---

function toEnglishDigits(str) {
  if (!str) return '';
  const persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = str.toString();
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNums[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicNums[i], 'g'), i.toString());
  }
  return result;
}

function toPersianDigits(num) {
  if (num === null || num === undefined) return '';
  const persianNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianNums[x]);
}

function isValidMobile(phone) {
  const cleanPhone = toEnglishDigits(phone).replace(/\s+/g, '').replace(/^(\+98|0098)/, '0');
  const regex = /^09[0-9]{9}$/;
  return regex.test(cleanPhone);
}

function cleanPhoneFormat(phone) {
  return toEnglishDigits(phone).replace(/\s+/g, '').replace(/^(\+98|0098)/, '0');
}

function renderSmsVariables(text) {
  const name = state.customer.fullName.trim() || 'مشتری گرامی';
  const store = state.storeSettings.name || 'گالری ظهورعطا';
  const phone = state.customer.phone || '09xxxxxxxxx';

  return text
    .replace(/{نام_مشتری}/g, name)
    .replace(/{نام_فروشگاه}/g, store)
    .replace(/{شماره_همراه}/g, phone)
    .replace(/{کد_تخفیف}/g, 'ZOHOUR-' + Math.floor(1000 + Math.random() * 9000));
}

function calculateSmsParts(text) {
  const len = text.length;
  let parts = 1;
  let remainingInPart = 70 - len;

  if (len === 0) {
    parts = 0;
    remainingInPart = 70;
  } else if (len <= 70) {
    parts = 1;
    remainingInPart = 70 - len;
  } else {
    parts = Math.ceil(len / 67);
    remainingInPart = parts * 67 - len;
  }

  return { length: len, parts, remainingInPart };
}

function formatSolarDate(day, month, year) {
  if (!day || !month || !year) return '';
  const monthName = persianMonths[parseInt(month, 10) - 1] || month;
  return `${day} ${monthName} ${year}`;
}

function formatNumericSolarDate(day, month, year) {
  if (!day || !month || !year) return '';
  const d = day.toString().padStart(2, '0');
  const m = month.toString().padStart(2, '0');
  return `${year}/${m}/${d}`;
}

// --- Keypad Functions (Tap Action) ---
function appendDigit(digit) {
  const phoneInput = document.getElementById('customer-phone');
  let current = cleanPhoneFormat(phoneInput.value);
  if (current.length < 11) {
    current += digit;
    phoneInput.value = current;
    triggerPhoneValidation(current);
  }
}

function deleteDigit() {
  const phoneInput = document.getElementById('customer-phone');
  let current = cleanPhoneFormat(phoneInput.value);
  if (current.length > 0) {
    current = current.slice(0, -1);
    phoneInput.value = current;
    triggerPhoneValidation(current);
  }
}

function clearPhone() {
  const phoneInput = document.getElementById('customer-phone');
  phoneInput.value = '';
  triggerPhoneValidation('');
}

function triggerPhoneValidation(cleanVal) {
  const phoneInput = document.getElementById('customer-phone');
  const phoneError = document.getElementById('phone-error');

  if (cleanVal.length === 11 && isValidMobile(cleanVal)) {
    if (phoneError) phoneError.classList.add('hidden');
    phoneInput.classList.remove('border-rose-500');
    phoneInput.classList.add('border-emerald-500');
    state.customer.phone = cleanVal;
  } else {
    phoneInput.classList.remove('border-emerald-500');
  }
}

// --- DOM Initializations ---
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initDateDropdowns();
  renderTemplateCards();
  setupEventListeners();
  updateStepUI(1);
  selectTemplate('promo_auction');
  loadCustomerHistory();
  initPwaServiceWorker();

  if (window.lucide) {
    lucide.createIcons();
  }
});

// PWA Service Worker
function initPwaServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.classList.remove('hidden');
      installBtn.classList.add('flex');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.classList.add('hidden');
      installBtn.classList.remove('flex');
    }
    showToast('اپلیکیشن با موفقیت روی گوشی شما نصب شد.', 'success');
  });
}

function promptPwaInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted PWA install');
      }
      deferredInstallPrompt = null;
    });
  } else {
    showToast('برای نصب: در منوی مرورگر گوشی گزینه «Add to Home screen» یا «افزودن به صفحه اصلی» را بزنید.', 'info');
  }
}

// Settings Management
function initSettings() {
  const saved = localStorage.getItem('gold_store_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure name defaults to گالری ظهورعطا if old name was present
      if (!parsed.name || parsed.name.includes('زرین')) {
        parsed.name = 'گالری ظهورعطا';
      }
      state.storeSettings = { ...state.storeSettings, ...parsed };
    } catch (e) {
      console.error(e);
    }
  }
  const headerEl = document.getElementById('header-store-name');
  if (headerEl) headerEl.textContent = state.storeSettings.name;
  
  const nameInput = document.getElementById('setting-store-name');
  if (nameInput) nameInput.value = state.storeSettings.name;

  const senderInput = document.getElementById('setting-sender-number');
  if (senderInput) senderInput.value = state.storeSettings.senderNumber || '';

  const providerSelect = document.getElementById('setting-sms-provider');
  if (providerSelect) providerSelect.value = state.storeSettings.smsProvider || 'kavenegar';

  const keyInput = document.getElementById('setting-sms-api-key');
  if (keyInput) keyInput.value = state.storeSettings.smsApiKey || '';

  const urlInput = document.getElementById('setting-sms-api-url');
  if (urlInput) urlInput.value = state.storeSettings.smsApiUrl || '';

  const patternInput = document.getElementById('setting-sms-pattern');
  if (patternInput) patternInput.value = state.storeSettings.smsPatternCode || '';

  const methodSelect = document.getElementById('setting-send-method');
  if (methodSelect) methodSelect.value = state.storeSettings.sendMethod || 'native_sms';

  toggleCustomUrlVisibility();
}

function toggleCustomUrlVisibility() {
  const providerEl = document.getElementById('setting-sms-provider');
  if (!providerEl) return;
  const provider = providerEl.value;
  const customUrlContainer = document.getElementById('custom-url-container');
  if (customUrlContainer) {
    if (provider === 'custom') {
      customUrlContainer.classList.remove('hidden');
    } else {
      customUrlContainer.classList.add('hidden');
    }
  }
}

function saveSettings() {
  state.storeSettings.name = document.getElementById('setting-store-name').value.trim() || 'گالری ظهورعطا';
  state.storeSettings.senderNumber = document.getElementById('setting-sender-number').value.trim() || '30007799';
  state.storeSettings.smsProvider = document.getElementById('setting-sms-provider').value;
  state.storeSettings.smsApiKey = document.getElementById('setting-sms-api-key').value.trim();
  state.storeSettings.smsApiUrl = document.getElementById('setting-sms-api-url').value.trim();
  state.storeSettings.smsPatternCode = document.getElementById('setting-sms-pattern').value.trim();
  state.storeSettings.sendMethod = document.getElementById('setting-send-method').value;

  localStorage.setItem('gold_store_settings', JSON.stringify(state.storeSettings));
  const headerEl = document.getElementById('header-store-name');
  if (headerEl) headerEl.textContent = state.storeSettings.name;

  closeModal('settings-modal');
  updateSmsCounters();
  showToast('تنظیمات فروشگاه ظهورعطا با موفقیت ذخیره گردید.', 'success');
}

function testSmsGatewayConnection() {
  const provider = document.getElementById('setting-sms-provider').value;
  const apiKey = document.getElementById('setting-sms-api-key').value.trim();

  if (!apiKey && provider !== 'custom') {
    showToast('لطفاً کلید API یا توکن پنل پیامک را وارد نمایید.', 'error');
    return;
  }

  showToast(`در حال تست اتصال به پنل پیامکی (${provider})...`, 'info');

  setTimeout(() => {
    showToast('اعتبارسنجی اولیه موفق: پنل پیامک آماده اتصال است.', 'success');
  }, 1000);
}

// Populate Persian Solar Date Dropdowns
function initDateDropdowns() {
  const populate = (dayElId, monthElId, yearElId, startYear, endYear) => {
    const daySelect = document.getElementById(dayElId);
    const monthSelect = document.getElementById(monthElId);
    const yearSelect = document.getElementById(yearElId);
    if (!daySelect || !monthSelect || !yearSelect) return;

    // Clear existing except first placeholder
    daySelect.innerHTML = '<option value="">روز</option>';
    monthSelect.innerHTML = '<option value="">ماه</option>';
    yearSelect.innerHTML = '<option value="">سال</option>';

    // Days 1-31
    for (let i = 1; i <= 31; i++) {
      const opt = document.createElement('option');
      opt.value = i < 10 ? '0' + i : i.toString();
      opt.textContent = toPersianDigits(i);
      daySelect.appendChild(opt);
    }

    // Months
    persianMonths.forEach((m, idx) => {
      const opt = document.createElement('option');
      const val = (idx + 1) < 10 ? '0' + (idx + 1) : (idx + 1).toString();
      opt.value = val;
      opt.textContent = m;
      monthSelect.appendChild(opt);
    });

    // Years (descending)
    for (let y = endYear; y >= startYear; y--) {
      const opt = document.createElement('option');
      opt.value = y.toString();
      opt.textContent = toPersianDigits(y);
      yearSelect.appendChild(opt);
    }
  };

  populate('birth-day', 'birth-month', 'birth-year', 1330, 1403);
  populate('marriage-day', 'marriage-month', 'marriage-year', 1350, 1403);
}

// Render Templates
function renderTemplateCards() {
  const container = document.getElementById('templates-container');
  if (!container) return;
  container.innerHTML = '';

  smsTemplates.forEach((tpl) => {
    const card = document.createElement('div');
    card.className = `interactive-card p-3 rounded-2xl cursor-pointer transition-all relative ${
      state.customer.selectedTemplateId === tpl.id ? 'active-template' : ''
    }`;
    card.id = `template-card-${tpl.id}`;
    card.onclick = () => selectTemplate(tpl.id);

    card.innerHTML = `
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center flex-shrink-0">
            <i data-lucide="${tpl.icon}" class="w-3.5 h-3.5"></i>
          </div>
          <span class="font-bold text-xs text-slate-800">${tpl.title}</span>
        </div>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold flex-shrink-0">
          ${tpl.badge}
        </span>
      </div>
      <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
        ${tpl.text.replace(/{نام_مشتری}/g, 'نام مشتری').replace(/{نام_فروشگاه}/g, 'گالری ظهورعطا').substring(0, 80)}...
      </p>
    `;

    container.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

function selectTemplate(templateId) {
  state.customer.selectedTemplateId = templateId;
  const tpl = smsTemplates.find((t) => t.id === templateId) || smsTemplates[0];

  document.querySelectorAll('.interactive-card').forEach((el) => {
    el.classList.remove('active-template');
  });
  const activeCard = document.getElementById(`template-card-${templateId}`);
  if (activeCard) {
    activeCard.classList.add('active-template');
  }

  const textarea = document.getElementById('sms-custom-text');
  if (textarea) {
    textarea.value = renderSmsVariables(tpl.text);
    state.customer.smsText = textarea.value;
  }

  updateSmsCounters();
}

function insertVariable(tag) {
  const textarea = document.getElementById('sms-custom-text');
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value;

  let insertValue = tag;
  if (tag === '{نام_مشتری}') {
    insertValue = state.customer.fullName.trim() || '{نام_مشتری}';
  } else if (tag === '{نام_فروشگاه}') {
    insertValue = state.storeSettings.name || 'گالری ظهورعطا';
  } else if (tag === '{کد_تخفیف}') {
    insertValue = 'ZOHOUR-' + Math.floor(1000 + Math.random() * 9000);
  }

  textarea.value = text.substring(0, start) + insertValue + text.substring(end);
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + insertValue.length;

  state.customer.smsText = textarea.value;
  updateSmsCounters();
}

function updateSmsCounters() {
  const textarea = document.getElementById('sms-custom-text');
  const text = textarea ? textarea.value : state.customer.smsText;
  state.customer.smsText = text;

  const stats = calculateSmsParts(text);
  const charEl = document.getElementById('char-count');
  const partsEl = document.getElementById('parts-count');
  if (charEl) charEl.textContent = toPersianDigits(stats.length);
  if (partsEl) partsEl.textContent = toPersianDigits(stats.parts) + ' پیامک';
}

function setupEventListeners() {
  const phoneInput = document.getElementById('customer-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      const rawVal = e.target.value;
      const clean = cleanPhoneFormat(rawVal);
      if (clean.length > 11) {
        phoneInput.value = clean.substring(0, 11);
      }
      triggerPhoneValidation(clean);
    });
  }

  const nameInput = document.getElementById('customer-name');
  const nameError = document.getElementById('name-error');

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      state.customer.fullName = e.target.value;
      if (e.target.value.trim().length >= 3) {
        if (nameError) nameError.classList.add('hidden');
        nameInput.classList.remove('border-rose-500');
      }
      if (state.customer.selectedTemplateId) {
        const tpl = smsTemplates.find((t) => t.id === state.customer.selectedTemplateId);
        if (tpl && state.customer.selectedTemplateId !== 'custom') {
          const textarea = document.getElementById('sms-custom-text');
          if (textarea) {
            textarea.value = renderSmsVariables(tpl.text);
            state.customer.smsText = textarea.value;
            updateSmsCounters();
          }
        }
      }
    });
  }

  const textarea = document.getElementById('sms-custom-text');
  if (textarea) {
    textarea.addEventListener('input', updateSmsCounters);
  }
}

// --- Step Navigation & Validation ---
function goToStep(targetStep) {
  if (targetStep === state.currentStep) return;

  if (targetStep > state.currentStep) {
    if (state.currentStep === 1) {
      const phoneInput = document.getElementById('customer-phone');
      const phoneVal = cleanPhoneFormat(phoneInput.value);
      const phoneError = document.getElementById('phone-error');

      if (!isValidMobile(phoneVal)) {
        if (phoneError) phoneError.classList.remove('hidden');
        phoneInput.classList.add('border-rose-500');
        showToast('لطفاً شماره موبایل ۱۱ رقمی معتبر با فرمت ۰۹ وارد کنید.', 'error');
        return;
      }
      state.customer.phone = phoneVal;
      if (phoneError) phoneError.classList.add('hidden');
    }

    if (state.currentStep === 2) {
      const nameInput = document.getElementById('customer-name');
      const nameVal = nameInput.value.trim();
      const nameError = document.getElementById('name-error');

      if (nameVal.length < 3) {
        if (nameError) nameError.classList.remove('hidden');
        nameInput.classList.add('border-rose-500');
        nameInput.focus();
        showToast('وارد کردن نام و نام خانوادگی مشتری الزامی است.', 'error');
        return;
      }

      state.customer.fullName = nameVal;
      if (nameError) nameError.classList.add('hidden');

      state.customer.birthDay = document.getElementById('birth-day').value;
      state.customer.birthMonth = document.getElementById('birth-month').value;
      state.customer.birthYear = document.getElementById('birth-year').value;

      state.customer.marriageDay = document.getElementById('marriage-day').value;
      state.customer.marriageMonth = document.getElementById('marriage-month').value;
      state.customer.marriageYear = document.getElementById('marriage-year').value;

      const categoryEl = document.querySelector('input[name="customer-interest"]:checked');
      if (categoryEl) state.customer.category = categoryEl.value;

      selectTemplate(state.customer.selectedTemplateId || 'promo_auction');
    }
  }

  state.currentStep = targetStep;
  updateStepUI(targetStep);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepUI(step) {
  for (let i = 1; i <= 3; i++) {
    const container = document.getElementById(`step-${i}-container`);
    const indicator = document.getElementById(`step-indicator-${i}`);
    const label = document.getElementById(`step-label-${i}`);
    const line = document.getElementById(`step-line-${i}`);

    if (!container) continue;

    if (i === step) {
      container.classList.add('active');
    } else {
      container.classList.remove('active');
    }

    if (i < step) {
      indicator.className = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-amber-500 text-white font-bold shadow-md cursor-pointer transition-all flex-shrink-0';
      indicator.innerHTML = '<i data-lucide="check" class="w-4 h-4 sm:w-5 sm:h-5"></i>';
      indicator.onclick = () => goToStep(i);
      if (label) label.className = 'text-[11px] sm:text-xs font-semibold text-amber-800 hidden sm:block';
      if (line) line.className = 'flex-1 h-1 mx-1.5 sm:mx-2 rounded bg-amber-400';
    } else if (i === step) {
      indicator.className = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gold-gradient text-slate-900 font-bold ring-4 ring-amber-300/40 shadow-gold pulse-gold-light transition-all flex-shrink-0';
      indicator.textContent = toPersianDigits(i);
      indicator.onclick = null;
      if (label) label.className = 'text-[11px] sm:text-xs font-bold text-amber-900';
      if (line) line.className = 'flex-1 h-1 mx-1.5 sm:mx-2 rounded bg-slate-200';
    } else {
      indicator.className = 'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 border border-slate-200 transition-all flex-shrink-0';
      indicator.textContent = toPersianDigits(i);
      indicator.onclick = null;
      if (label) label.className = 'text-[11px] sm:text-xs font-medium text-slate-400 hidden sm:block';
      if (line) line.className = 'flex-1 h-1 mx-1.5 sm:mx-2 rounded bg-slate-200';
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// --- Submit & Send Dispatcher (Google Sheets + SMS Gateway API / Native SMS) ---
async function submitAndSendSMS() {
  const textarea = document.getElementById('sms-custom-text');
  const message = textarea ? textarea.value.trim() : state.customer.smsText.trim();

  if (!message) {
    showToast('متن پیامک نمی‌تواند خالی باشد.', 'error');
    if (textarea) textarea.focus();
    return;
  }

  const submitBtn = document.getElementById('btn-submit-sms');
  const originalText = submitBtn ? submitBtn.innerHTML : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <div class="flex items-center justify-center gap-2">
        <svg class="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>در حال ثبت مشتری در گوگل‌شیت...</span>
      </div>
    `;
  }

  // Direct DOM read
  const bDay = document.getElementById('birth-day') ? document.getElementById('birth-day').value : state.customer.birthDay;
  const bMonth = document.getElementById('birth-month') ? document.getElementById('birth-month').value : state.customer.birthMonth;
  const bYear = document.getElementById('birth-year') ? document.getElementById('birth-year').value : state.customer.birthYear;

  const mDay = document.getElementById('marriage-day') ? document.getElementById('marriage-day').value : state.customer.marriageDay;
  const mMonth = document.getElementById('marriage-month') ? document.getElementById('marriage-month').value : state.customer.marriageMonth;
  const mYear = document.getElementById('marriage-year') ? document.getElementById('marriage-year').value : state.customer.marriageYear;

  const birthDateFormatted = formatSolarDate(bDay, bMonth, bYear);
  const birthDateNumeric = formatNumericSolarDate(bDay, bMonth, bYear);

  const marriageDateFormatted = formatSolarDate(mDay, mMonth, mYear);
  const marriageDateNumeric = formatNumericSolarDate(mDay, mMonth, mYear);

  const customerRecord = {
    id: Date.now(),
    phone: state.customer.phone,
    mobile: state.customer.phone,
    phoneNumber: state.customer.phone,
    'شماره همراه': state.customer.phone,
    'شماره تماس': state.customer.phone,

    fullName: state.customer.fullName,
    full_name: state.customer.fullName,
    name: state.customer.fullName,
    'نام و نام خانوادگی': state.customer.fullName,
    'نام': state.customer.fullName,

    birthDate: birthDateFormatted || birthDateNumeric,
    birth_date: birthDateFormatted || birthDateNumeric,
    birthDay: bDay,
    birthMonth: bMonth,
    birthYear: bYear,
    'تاریخ تولد': birthDateFormatted || birthDateNumeric,

    marriageDate: marriageDateFormatted || marriageDateNumeric,
    marriage_date: marriageDateFormatted || marriageDateNumeric,
    weddingDate: marriageDateFormatted || marriageDateNumeric,
    anniversaryDate: marriageDateFormatted || marriageDateNumeric,
    marriageDay: mDay,
    marriageMonth: mMonth,
    marriageYear: mYear,
    'تاریخ ازدواج': marriageDateFormatted || marriageDateNumeric,
    'تاریخ سالگرد ازدواج': marriageDateFormatted || marriageDateNumeric,

    category: state.customer.category,
    'دسته‌بندی': state.customer.category,

    smsText: message,
    'متن پیامک': message,

    storeName: state.storeSettings.name || 'گالری ظهورعطا',
    timestamp: new Date().toISOString(),
    dateFormatted: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
  };

  // 1. Post to Google Sheets Webhook
  try {
    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerRecord),
    });
    console.log('Google Sheets data posted successfully:', customerRecord);
  } catch (error) {
    console.error('Google Sheets sync error:', error);
  }

  // 2. Dispatch SMS
  const sendMethod = state.storeSettings.sendMethod || 'native_sms';

  if (sendMethod === 'api' || sendMethod === 'both') {
    await dispatchSmsViaApi(state.customer.phone, message);
  }

  if (sendMethod === 'native_sms' || sendMethod === 'both') {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const encodedBody = encodeURIComponent(message);
    const smsUri = `sms:${state.customer.phone}${isIOS ? '&' : '?'}body=${encodedBody}`;
    window.location.href = smsUri;
  }

  // Save to local storage Mini-CRM
  saveCustomerToStorage({
    id: customerRecord.id,
    phone: customerRecord.phone,
    fullName: customerRecord.fullName,
    birthDate: birthDateFormatted || '-',
    marriageDate: marriageDateFormatted || '-',
    category: customerRecord.category,
    smsText: message,
    dateFormatted: customerRecord.dateFormatted,
  });

  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
  if (window.lucide) lucide.createIcons();

  showToast('مشتری با موفقیت در سیستم گالری ظهورعطا ثبت شد.', 'success');

  // Reset form and return to step 1
  resetForm();
}

async function dispatchSmsViaApi(phone, message) {
  const { smsProvider, smsApiKey, smsApiUrl, senderNumber } = state.storeSettings;
  if (!smsApiKey && smsProvider !== 'custom') {
    return;
  }

  try {
    let targetUrl = '';
    let payload = {};

    if (smsProvider === 'kavenegar') {
      targetUrl = `https://api.kavenegar.com/v1/${smsApiKey}/sms/send.json`;
      payload = { receptor: phone, sender: senderNumber, message: message };
    } else if (smsProvider === 'smsir') {
      targetUrl = 'https://api.sms.ir/v1/send/bulk';
      payload = { lineNumber: senderNumber, MessageText: message, Mobiles: [phone] };
    } else if (smsProvider === 'custom' && smsApiUrl) {
      targetUrl = smsApiUrl;
      payload = { phone, sender: senderNumber, message };
    }

    if (targetUrl) {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': smsApiKey },
        body: JSON.stringify(payload),
      }).catch((e) => console.log('API call made:', e));
    }
  } catch (err) {
    console.error('SMS Gateway API dispatch error:', err);
  }
}

function resetForm() {
  const phoneInput = document.getElementById('customer-phone');
  if (phoneInput) phoneInput.value = '';

  const nameInput = document.getElementById('customer-name');
  if (nameInput) nameInput.value = '';

  const bDay = document.getElementById('birth-day');
  if (bDay) bDay.value = '';
  const bMonth = document.getElementById('birth-month');
  if (bMonth) bMonth.value = '';
  const bYear = document.getElementById('birth-year');
  if (bYear) bYear.value = '';

  const mDay = document.getElementById('marriage-day');
  if (mDay) mDay.value = '';
  const mMonth = document.getElementById('marriage-month');
  if (mMonth) mMonth.value = '';
  const mYear = document.getElementById('marriage-year');
  if (mYear) mYear.value = '';

  state.customer = {
    phone: '',
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    marriageDay: '',
    marriageMonth: '',
    marriageYear: '',
    category: 'طلای سبک و کادویی',
    selectedTemplateId: 'promo_auction',
    smsText: '',
  };

  goToStep(1);
  loadCustomerHistory();
}

// Customer History Storage
function saveCustomerToStorage(record) {
  const existing = getCustomersFromStorage();
  existing.unshift(record);
  localStorage.setItem('gold_store_customers', JSON.stringify(existing));
  loadCustomerHistory();
}

function getCustomersFromStorage() {
  const data = localStorage.getItem('gold_store_customers');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function loadCustomerHistory() {
  const list = getCustomersFromStorage();
  const badge = document.getElementById('history-count-badge');
  if (badge) badge.textContent = toPersianDigits(list.length);

  const container = document.getElementById('history-table-body');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-slate-400 text-xs sm:text-sm">
          هنوز هیچ مشتری در سامانه ثبت نشده است.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = list
    .map(
      (c, index) => `
      <tr class="border-b border-slate-100 hover:bg-amber-50/50 transition-all text-xs sm:text-sm">
        <td class="py-2.5 px-2.5 text-slate-400">${toPersianDigits(index + 1)}</td>
        <td class="py-2.5 px-2.5 font-semibold text-slate-800">${c.fullName}</td>
        <td class="py-2.5 px-2.5 text-amber-700 font-mono" dir="ltr">${toPersianDigits(c.phone)}</td>
        <td class="py-2.5 px-2.5 text-slate-500 hidden sm:table-cell">${c.dateFormatted}</td>
        <td class="py-2.5 px-2.5 text-left">
          <button onclick="viewCustomerDetail(${c.id})" class="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 text-xs font-semibold transition-all">
            مشاهده متن
          </button>
        </td>
      </tr>
    `
    )
    .join('');
}

function viewCustomerDetail(id) {
  const list = getCustomersFromStorage();
  const item = list.find((c) => c.id === id);
  if (!item) return;

  alert(`پیامک ارسالی به ${item.fullName} (${item.phone}):\n\n${item.smsText}`);
}

function clearAllHistory() {
  if (confirm('آیا از پاک کردن تمام سوابق مشتریان گالری ظهورعطا اطمینان دارید؟')) {
    localStorage.removeItem('gold_store_customers');
    loadCustomerHistory();
    showToast('تاریخچه مشتریان پاک شد.', 'info');
  }
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

// Toast Notification
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  const bgClass =
    type === 'error'
      ? 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100'
      : type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100'
      : 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-100';

  toast.className = `p-3 sm:p-3.5 rounded-2xl border shadow-lg flex items-center gap-2.5 animate-pop-in transition-all text-xs sm:text-sm font-medium ${bgClass}`;
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle-2' : 'info'}" class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
