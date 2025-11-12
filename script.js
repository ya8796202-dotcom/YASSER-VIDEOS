// تسجيل الـ Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js")
    .then(() => console.log("✅ Service Worker Registered"))
    .catch(err => console.error("❌ SW registration failed:", err));
}

// زر "تثبيت التطبيق" عبر beforeinstallprompt
let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
  console.log("ℹ️ beforeinstallprompt fired");
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  installBtn.disabled = true;
  try {
    const choice = await deferredPrompt.prompt();
    console.log("User choice:", choice.outcome);
    installBtn.hidden = true;
    deferredPrompt = null;
  } catch (err) {
    console.error("Install prompt error:", err);
    installBtn.disabled = false;
  }
});

window.addEventListener("appinstalled", () => {
  console.log("✅ App installed");
  installBtn.hidden = true;
});

// نصائح عشوائية + حفظ محلي
const tips = [
  "ابدأ بما لديك الآن؛ الدقة تأتي مع التكرار.",
  "هوِّن التعقيد: وظيفة واحدة ممتازة تغلب عشر وظائف متوسطة.",
  "عوّد نفسك على النسخ الأولى السريعة؛ واسمح لنفسك بالتعلم من النشر.",
  "احترم وقتك: اجعل القرارات قصيرة ومُسجلة.",
  "ابنِ مكتبتك الخاصة: الأكواد والقوالب أدوات قوة للمبدع.",
  "صمّم هوية متسقة؛ التكرار يبني الثقة.",
  "اختبر مع جمهور صغير؛ اسمع، ثم حسّن، ثم انشر.",
  "حدد معيار نجاح بسيط تقدر تقيسه يوميًا.",
  "المهام الصغيرة اليومية تصنع إنجازات كبيرة على المدى.",
  "اعرض فكرتك في صفحة واحدة؛ الوضوح مصدر الإقناع."
];

const tipEl = document.getElementById("tip");
document.getElementById("newTip")?.addEventListener("click", () => {
  const t = tips[Math.floor(Math.random() * tips.length)];
  tipEl.textContent = t;
});

document.getElementById("saveTip")?.addEventListener("click", () => {
  const val = tipEl.textContent || "";
  localStorage.setItem("lastTip", val);
});

window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("lastTip");
  if (saved) tipEl.textContent = saved;
});
