(() => {
  const languageKey = "jsvidey-language";
  const dict = {
    id: {getStarted:"Mulai Sekarang",howWorks:"Cara Kerja"},
    en: {getStarted:"Get Started",howWorks:"How It Works"}
  };
  const applyLanguage = lang => {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const value = dict[lang]?.[el.dataset.i18n];
      if (value) el.textContent = value;
    });
    try { localStorage.setItem(languageKey,lang); } catch (_) {}
  };
  let lang = "id";
  try { lang = localStorage.getItem(languageKey) || "id"; } catch (_) {}
  applyLanguage(lang);
})();