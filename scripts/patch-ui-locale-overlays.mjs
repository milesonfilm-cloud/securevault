/**
 * Deep-merge UI sweep namespaces into hi/kn/ta/te/ml (does not touch en).
 * Run: node scripts/patch-ui-locale-overlays.mjs
 */
import fs from 'fs';
import path from 'path';

const root = path.join(process.cwd(), 'messages');

function deepMerge(target, source) {
  if (source === null || typeof source !== 'object' || Array.isArray(source)) return source;
  const out = { ...target };
  for (const k of Object.keys(source)) {
    if (
      k in out &&
      out[k] !== null &&
      typeof out[k] === 'object' &&
      !Array.isArray(out[k]) &&
      typeof source[k] === 'object' &&
      !Array.isArray(source[k])
    ) {
      out[k] = deepMerge(out[k], source[k]);
    } else {
      out[k] = source[k];
    }
  }
  return out;
}

const byLocale = {
  hi: {
    settingsPanels: {
      storageMeterSubtitle:
        'डेटा IndexedDB में रहता है — कैश साफ़ होने के बाद भी बचता है',
      storageUsed: '{used} उपयोग में',
      storageAvailable: '{available} उपलब्ध',
      storagePercentUsed: '{percent}% उपयोग में',
      storageDanger:
        'स्टोरेज लगभग भर गया — जगह खाली करने के लिए निर्यात करें और पुराना डेटा हटाएँ',
      storageWarning: 'स्टोरेज 70% से अधिक — जल्द बैकअप निर्यात करने पर विचार करें',
      storageHealthy: 'स्टोरेज ठीक है — सभी दस्तावेज़ IndexedDB में सुरक्षित',
      appInfoBody:
        'आपका वॉल्ट स्थानीय ऐप स्टोरेज में रहता है। फ़ाइल प्रतिलिपि या दूसरे डिवाइस के लिए बैकअप निर्यात करें।',
      biometricUnavailableBody:
        'इस डिवाइस या ब्राउज़र पर बायोमेट्रिक प्रमाणीकरण उपलब्ध नहीं है।',
      biometricEnabled: 'सक्षम',
      biometricDisabled: 'अक्षम',
      biometricHintRegistered:
        'आपकी बायोमेट्रिक क्रेडेंशियल पंजीकृत है। वॉल्ट तेज़ी से अनलॉक करने के लिए उपयोग करें।',
      biometricHintRegister:
        'पासवर्ड टाइप किए बिना वॉल्ट अनलॉक करने के लिए फ़िंगरप्रिंट या Face ID पंजीकृत करें।',
      biometricEnableSuccess: 'बायोमेट्रिक लॉगिन सफलतापूर्वक सक्षम!',
      biometricSetupFailed: 'सेटअप विफल। कृपया पुनः प्रयास करें।',
      biometricDisabledToast: 'बायोमेट्रिक लॉगिन अक्षम।',
      biometricDisableCta: 'बायोमेट्रिक लॉगिन अक्षम करें',
      biometricEnableCta: 'बायोमेट्रिक लॉगिन सक्षम करें',
      biometricSettingUp: 'सेट अप हो रहा है…',
      twoFactorBody:
        'PIN के बाद अतिरिक्त चरण के लिए प्रमाणक ऐप जोड़ें। डिवाइस साझा करने पर अनुशंसित।',
      twoFactorSetup: 'प्रमाणक सेट अप करें',
    },
    memberForm: {
      editTitle: 'परिवार सदस्य संपादित करें',
      addTitle: 'परिवार सदस्य जोड़ें',
      subtitle: 'सदस्य प्रोफ़ाइल दस्तावेज़ों को व्यक्ति के अनुसार व्यवस्थित करने में मदद करती हैं',
      changePhoto: 'फ़ोटो बदलें',
      addPhotoBtn: 'फ़ोटो जोड़ें',
      removePhoto: 'हटाएँ',
      photoHint: 'फ़ोटो आपके वॉल्ट में स्थानीय रूप से संग्रहित और आकार घटाए जाते हैं।',
      fullNameLabel: 'पूरा नाम *',
      namePlaceholder: 'उदा. अर्जुन शर्मा',
      nameRequired: 'पूरा नाम आवश्यक है',
      relationshipLabel: 'रिश्ता *',
      relationshipRequired: 'रिश्ता चुनें',
      dobLabel: 'जन्म तिथि',
      profileColorHint: 'जब कोई फ़ोटो न हो, और दस्तावेज़ बैज के लिए उपयोग',
      saving: 'सहेज रहा है…',
      saveChanges: 'परिवर्तन सहेजें',
      addMember: 'सदस्य जोड़ें',
      photoError: 'फ़ोटो नहीं जोड़ा जा सका',
      relationshipOptions: {
        Self: 'स्वयं',
        Spouse: 'जीवनसाथी',
        Son: 'पुत्र',
        Daughter: 'पुत्री',
        Father: 'पिता',
        Mother: 'माता',
        Brother: 'भाई',
        Sister: 'बहन',
        Grandfather: 'दादा',
        Grandmother: 'दादी',
        Other: 'अन्य',
      },
    },
    memberCard: {
      demoBanner: 'नमूना कार्ड — आपके वॉल्ट में सहेजा नहीं गया',
      editTitle: 'सदस्य संपादित करें',
      deleteTitle: 'सदस्य हटाएँ — उनके सभी दस्तावेज़ भी हट जाएँगे',
      dobLabel: 'जन्म तिथि:',
      ageYears: '{years} वर्ष',
      docCount: '{count, plural, one {# दस्तावेज़} other {# दस्तावेज़}}',
      categoryCount: '{count, plural, one {# श्रेणी} other {# श्रेणियाँ}}',
      categoriesWithDocsAria: 'दस्तावेज़ वाली श्रेणियाँ',
      noDocsYet: 'अभी कोई दस्तावेज़ नहीं',
      viewInVaultCompact: 'वॉल्ट में देखें',
      viewInVaultFull: 'वॉल्ट में दस्तावेज़ देखें',
      demoVaultHint: 'दस्तावेज़ जोड़ने और वॉल्ट खोलने के लिए वास्तविक सदस्य जोड़ें।',
      missingCategory: 'गुम: {label}',
    },
    photoAttachments: {
      maxPhotos: 'प्रति दस्तावेज़ अधिकतम {max} फ़ोटो',
      notImage: '{name} एक चित्र नहीं है',
      exceedsSize: '{name} {mb} MB सीमा से अधिक',
      photosAdded: '{count, plural, one {# फ़ोटो जोड़ा गया} other {# फ़ोटो जोड़े गए}}',
      photoRemoved: 'फ़ोटो हटाया गया',
      photosLabel: 'फ़ोटो',
      photosWithCount: 'फ़ोटो ({current}/{max})',
      adding: 'जोड़ रहा है…',
      addPhoto: 'फ़ोटो जोड़ें',
      attachOptional: 'फ़ोटो संलग्न करें (वैकल्पिक)',
      documentPhotoAlt: 'दस्तावेज़ फ़ोटो',
      viewFullSize: 'पूर्ण आकार देखें',
      removePhotoTitle: 'फ़ोटो हटाएँ',
    },
    sharePage: {
      missingKey:
        'यह लिंक अधूरा है — आपको भेजा गया पूरा URL खोलें (# के बाद वाला हिस्सा सहित)।',
      expiredOrRevoked: 'यह साझा लिंक समाप्त हो गया या रद्द कर दिया गया।',
    },
    handoverPage: {
      brandStamp: 'SecureVault',
      missingKey: 'कृपया # सहित पूरा लिंक खोलें।',
      notFound: 'यह हैंडओवर लिंक समाप्त हो गया या बदल दिया गया।',
      openFailed: 'यह हैंडओवर बंडल नहीं खोला जा सका।',
      footerLine: 'SecureVault द्वारा साझा — केवल दृश्य · उत्पन्न {date}',
    },
    progressPage: {
      eyebrow: 'गेमिफ़िकेशन',
      title: 'प्रगति',
      description:
        'पूर्णता स्कोर प्रति सदस्य महत्वपूर्ण दस्तावेज़ श्रेणियों से आते हैं (वयस्क बनाम बच्चे)। बैज वॉल्ट उपयोग से अनलॉक होते हैं।',
      familyCompleteness: 'परिवार पूर्णता',
      perMember: 'प्रति सदस्य',
      criticalCategories: '{count} महत्वपूर्ण श्रेणियाँ',
      streakStats: 'स्ट्रीक आँकड़े',
    },
    emergencySettingsPage: {
      backLink: 'सेटिंग्स पर वापस',
      pageTitle: 'आपात पहुँच',
      pageDescription:
        'विश्वसनीय संपर्क, एन्क्रिप्टेड निर्यात, और समय-सीमित केवल-पठन हैंडओवर लिंक।',
      modeDescription:
        'वॉल्ट UI में संपादन छिपाता है — जब इस डिवाइस पर केवल देखना चाहें तो उपयोग करें।',
      pdfHint: 'दस्तावेज़ चुनें, वैकल्पिक AES-लिपटा निर्यात।',
    },
    familyWatchCard: {
      vaultStamp: 'VAULT',
      viewDetailsAria: '{name} का विवरण देखें',
      documentsLabel: 'दस्तावेज़',
      memberSince: 'सदस्य {date} से',
      tapOpenVault: 'वॉल्ट खोलने के लिए टैप',
      tapForDetails: 'विवरण के लिए टैप',
      memberDetails: 'सदस्य विवरण',
      tapToFocus: 'फ़ोकस के लिए टैप',
    },
  },
  kn: {
    settingsPanels: {
      storageMeterSubtitle: 'ಡೇಟಾ IndexedDB ನಲ್ಲಿ ಉಳಿಯುತ್ತದೆ — ಕ್ಯಾಶ್ ಕ್ಲಿಯರ್ ಆದ ನಂತರವೂ',
      storageUsed: '{used} ಬಳಸಲಾಗಿದೆ',
      storageAvailable: '{available} ಲಭ್ಯ',
      storagePercentUsed: '{percent}% ಬಳಕೆಯಲ್ಲಿದೆ',
      storageDanger:
        'ಸಂಗ್ರಹಣೆ ಬಹುತೇಕ ತುಂಬಿದೆ — ರಿಕ್ತ ಮಾಡಲು ರಫ್ತು ಮಾಡಿ ಹಳೆಯ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ',
      storageWarning: 'ಸಂಗ್ರಹಣೆ 70% ಕ್ಕಿಂತ ಹೆಚ್ಚು — ಶೀಘ್ರದಲ್ಲಿ ಬ್ಯಾಕಪ್ ಪರಿಗಣಿಸಿ',
      storageHealthy: 'ಸಂಗ್ರಹಣೆ ಆರೋಗ್ಯಕರ — ಎಲ್ಲಾ ದಾಖಲೆಗಳು IndexedDB ನಲ್ಲಿ',
      appInfoBody:
        'ನಿಮ್ಮ ವಾಲ್ಟ್ ಸ್ಥಳೀಯ ಅಪ್ಲಿಕೇಶನ್ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಉಳಿಯುತ್ತದೆ। ಮತ್ತೊಂದು ಸಾಧನಕ್ಕೆ ಫೈಲ್ ನಕಲು ಬೇಕಿದ್ದರೆ ಬ್ಯಾಕಪ್ ರಫ್ತು ಮಾಡಿ।',
      biometricUnavailableBody: 'ಈ ಸಾಧನ ಅಥವಾ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಬಯೋಮೆಟ್ರಿಕ್ ಲಭ್ಯವಿಲ್ಲ।',
      biometricEnabled: 'ಚಾಲು',
      biometricDisabled: 'ನಿಷ್ಕ್ರಿಯ',
      biometricHintRegistered:
        'ನಿಮ್ಮ ಬಯೋಮೆಟ್ರಿಕ್ ನೋಂದಣಿ ಆಗಿದೆ। ವಾಲ್ಟ್ ತ್ವರಿತ ತೆರೆಯಲು ಇದನ್ನು ಬಳಸಿ।',
      biometricHintRegister:
        'ಪಾಸ್ವರ್ಡ್ ಇಲ್ಲದೆ ವಾಲ್ಟ್ ತೆರೆಯಲು ಫಿಂಗರ್‌ಪ್ರಿಂಟ್ ಅಥವಾ Face ID ನೋಂದಣಿ ಮಾಡಿ।',
      biometricEnableSuccess: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿ ಚಾಲು! ',
      biometricSetupFailed: 'ಸೆಟಪ್ ವಿಫಲವಾಯಿತು। ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ।',
      biometricDisabledToast: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್ ನಿಷ್ಕ್ರಿಯಗೊಂಡಿದೆ।',
      biometricDisableCta: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಿ',
      biometricEnableCta: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್ ಸಕ್ರಿಯಗೊಳಿಸಿ',
      biometricSettingUp: 'ಸೆಟಪ್ ಆಗುತ್ತಿದೆ…',
      twoFactorBody:
        'PIN ನ ನಂತರ ಹೆಚ್ಚುವರಿ ಹಂತಕ್ಕೆ ಪ್ರಮಾಣಕ ಅಪ್ಲಿಕೇಶನ್ ಸೇರಿಸಿ। ಸಾಧನ ಹಂಚಿದರೆ ಶಿಫಾರಸು।',
      twoFactorSetup: 'ಪ್ರಮಾಣಕ ಸೆಟಪ್',
    },
    memberForm: {
      editTitle: 'ಕುಟುಂಬ ಸದಸ್ಯರ ಮಾಹಿತಿಯನ್ನು ಸಂಪಾದಿಸಿ',
      addTitle: 'ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
      subtitle: 'ಸದಸ್ಯರ ಪರಿಚಯಗಳು ವ್ಯಕ್ತಿಗೆ ಅನುಗುಣವಾಗಿ ದಾಖಲೆಗಳನ್ನು ವಿಂಗಡಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತವೆ',
      changePhoto: 'ಫೋಟೋ ಬದಲಾಯಿಸಿ',
      addPhotoBtn: 'ಫೋಟೋ ಸೇರಿಸಿ',
      removePhoto: 'ತೆಗೆದುಹಾಕಿ',
      photoHint: 'ಫೋಟೋಗಳು ನಿಮ್ಮ ವಾಲ್ಟ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಇರುತ್ತವೆ ಮತ್ತು ಗಾತ್ರ ಕಡಿಮೆ ಮಾಡಲಾಗುತ್ತದೆ।',
      fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು *',
      namePlaceholder: 'ಉದಾ. ಅರ್ಜುನ್ ಶರ್ಮ',
      nameRequired: 'ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯ',
      relationshipLabel: 'ಬಾಂಧವ್ಯ *',
      relationshipRequired: 'ಬಾಂಧವೇಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      dobLabel: 'ಜನ್ಮ ದಿನಾಂಕ',
      profileColorHint: 'ಫೋಟೋ ಇಲ್ಲದಿದ್ದಾಗ ಮತ್ತು ದಾಖಲೆ ಬ್ಯಾಜ್‌ಗಳಿಗೆ ಬಳಸಲಾಗುತ್ತದೆ',
      saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…',
      saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
      addMember: 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
      photoError: 'ಫೋಟೋ ಸೇರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
      relationshipOptions: {
        Self: 'ಸ್ವಯಂ',
        Spouse: 'ಜೀವನಸಂಗಾತಿ',
        Son: 'ಮಗ',
        Daughter: 'ಮಗಳು',
        Father: 'ತಂದೆ',
        Mother: 'ತಾಯಿ',
        Brother: 'ಸಹೋದರ',
        Sister: 'ಸಹೋದರಿ',
        Grandfather: 'ಅಜ್ಜ',
        Grandmother: 'ಅಜ್ಜಿ',
        Other: 'ಇತರೆ',
      },
    },
    memberCard: {
      demoBanner: 'ಮಾದರಿ ಕಾರ್ಡ್ — ನಿಮ್ಮ ವಾಲ್ಟ್‌ಗೆ ಉಳಿಸಲಾಗಿಲ್ಲ',
      editTitle: 'ಸದಸ್ಯರನ್ನು ಸಂಪಾದಿಸಿ',
      deleteTitle: 'ಸದಸ್ಯನನ್ನು ಅಳಿಸಿ — ಅವರ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕುತ್ತದೆ',
      dobLabel: 'ಜನ್ಮ ದಿನಾಂಕ:',
      ageYears: '{years} ವರ್ಷ',
      docCount: '{count, plural, one {# ದಾಖಲೆ} other {# ದಾಖಲೆಗಳು}}',
      categoryCount: '{count, plural, one {# ವರ್ಗ} other {# ವರ್ಗಗಳು}}',
      categoriesWithDocsAria: 'ದಾಖಲೆಗಳಿರುವ ವರ್ಗಗಳು',
      noDocsYet: 'ಇನ್ನೂ ದಾಖಲೆಗಳಿಲ್ಲ',
      viewInVaultCompact: 'ವಾಲ್ಟ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
      viewInVaultFull: 'ವಾಲ್ಟ್‌ನಲ್ಲಿ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      demoVaultHint: 'ದಾಖಲೆಗಳನ್ನು ಕೊಂಡಿಕೊಳ್ಳಲು ಮತ್ತು ವಾಲ್ಟ್ ತೆರೆಯಲು ನಿಜವಾದ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ।',
      missingCategory: 'ಕಾಣೆಯಿದೆ: {label}',
    },
    photoAttachments: {
      maxPhotos: 'ಪ್ರತಿ ದಾಖಲೆಗೆ ಗರಿಷ್ಠ {max} ಫೋಟೊಗಳು',
      notImage: '{name} ಚಿತ್ರ ಅಲ್ಲ',
      exceedsSize: '{name} {mb} MB ಮಿತಿಯನ್ನು ಮೀರಿದೆ',
      photosAdded: '{count, plural, one {# ಫೋಟೋ ಸೇರಿಸಲಾಗಿದೆ} other {# ಫೋಟೋಗಳು ಸೇರಿಸಲಾಗಿದೆ}}',
      photoRemoved: 'ಫೋಟೋ ತೆಗೆದುಹಾಕಲಾಗಿದೆ',
      photosLabel: 'ಫೋಟೋಗಳು',
      photosWithCount: 'ಫೋಟೋಗಳು ({current}/{max})',
      adding: 'ಸೇರಿಸಲಾಗುತ್ತಿದೆ…',
      addPhoto: 'ಫೋಟೋ ಸೇರಿಸಿ',
      attachOptional: 'ಫೋಟೋಗಳನ್ನು ಲಗತ್ತು ಮಾಡಿ (ಐಚ್ಛಿಕ)',
      documentPhotoAlt: 'ದಾಖಲೆ ಫೋಟೋ',
      viewFullSize: 'ಪೂರ್ಣ ಗಾತ್ರದಲ್ಲಿ ನೋಡಿ',
      removePhotoTitle: 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ',
    },
    sharePage: {
      missingKey: 'ಈ ಲಿಂಕ್ ಅಪೂರ್ಣ — # ನಂತರದ ಭಾಗ ಸೇರಿದಂತೆ ಪೂರ್ಣ URL ತೆರೆಯಿರಿ।',
      expiredOrRevoked: 'ಈ ಹಂಚಿಕೆ ಲಿಂಕ್ ಅವಧಿ ಮುಗಿದಿದೆ ಅಥವಾ ರದ್ದಾಗಿದೆ।',
    },
    handoverPage: {
      brandStamp: 'SecureVault',
      missingKey: '# ಸೇರಿದಂತೆ ಪूರ್ಣ ಲಿಂಕ್ ತೆರೆಯಿರಿ।',
      notFound: 'ಈ ಹ್ಯಾಂಡ್ಓವರ್ ಲಿಂಕ್ ಅವಧಿ ಮುಗಿದಿದೆ ಅಥವಾ ಬದಲಾಯಿಸಲಾಗಿದೆ।',
      openFailed: 'ಈ ಹ್ಯಾಂಡ್ಓವರ್ ಬಂಡಲ್ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ।',
      footerLine: 'SecureVault ನಿಂದ ಹಂಚಿದೆ — ಓದು ಮಾತ್ರ · ರಚಿಸಲಾಗಿದೆ {date}',
    },
    progressPage: {
      eyebrow: 'ಗೇಮಿಫಿಕೇಶನ್',
      title: 'ಪ್ರಗತಿ',
      description:
        'ಸಂಪೂರ್ಣತೆ ಅಂಕಗಳು ಪ್ರತಿ ಸದಸ್ಯನ ನಿರ್ಣಾಯಕ ದಾಖಲೆ ವರ್ಗಗಳ ಆಧಾರದ ಮೇಲೆ (ವಯಸ್ಕರು ಮಕ್ಕಳು). ಬ್ಯಾಡ್ಜ್‌ಗಳು ವಾಲ್ಟ್ ಬಳಕೆಯಿಂದ ಅನ್‌ಲಾಕ್.',
      familyCompleteness: 'ಕುಟುಂಬ ಸಂಪೂರ್ಣತೆ',
      perMember: 'ಪ್ರತಿ ಸದಸ್ಯ',
      criticalCategories: '{count} ನಿರ್ಣಾಯಕ ವರ್ಗಗಳು',
      streakStats: 'ಸ್ಟ್ರೀಕ್ ಅಂಕಿಅಂಶಗಳು',
    },
    emergencySettingsPage: {
      backLink: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
      pageTitle: 'ತುರ್ತು ಪ್ರವೇಶ',
      pageDescription:
        'ನಂಬಬಹುದಾದ ಸಂಪರ್ಕ, ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ರಫ್ತುಗಳು ಮತ್ತು ಸಮಯ ಬದ್ಧ ಓದು-ಮಾತ್ರ ಹ್ಯಾಂಡ್ಓವರ್ ಲಿಂಕ್‌ಗಳು।',
      modeDescription:
        'ವಾಲ್ಟ್ UI ನಲ್ಲಿ ಸಂಪಾದನೆ ಮರೆಮಾಡುತ್ತದೆ — ಈ ಸಾಧನದಲ್ಲಿ ಓದು ಮಾತ್ರ ಬೇಕಾದಾಗ ಬಳಸಿ।',
      pdfHint: 'ದಾಖಲೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಐಚ್ಛಿಕ AES-ಮುಚ್ಚಿದ ರಫ್ತು।',
    },
    familyWatchCard: {
      vaultStamp: 'VAULT',
      viewDetailsAria: '{name} ವಿವರಗಳನ್ನು ನೋಡಿ',
      documentsLabel: 'ದಾಖಲೆಗಳು',
      memberSince: 'ಸದಸ್ಯ {date} ರಿಂದ',
      tapOpenVault: 'ವಾಲ್ಟ್ ತೆರೆಯಲು ಟ್ಯಾಪ್',
      tapForDetails: 'ವಿವರಗಳಿಗೆ ಟ್ಯಾಪ್',
      memberDetails: 'ಸದಸ್ಯ ವಿವರಗಳು',
      tapToFocus: 'ಫೋಕಸ್ ಗೆ ಟ್ಯಾಪ್',
    },
  },
  ta: {
    settingsPanels: {
      storageMeterSubtitle:
        'தரவு IndexedDB இல் நீடிக்கும் — கேச் அழிந்த பின்னரும்',
      storageUsed: '{used} பயனில்',
      storageAvailable: '{available} கிடைக்கும்',
      storagePercentUsed: '{percent}% பயனில்',
      storageDanger:
        'சேமிப்பு நிரம்பப் போகிறது — இடம் காலியாக ஏற்றுமதி செய்து பழைய தரவை அகற்றவும்',
      storageWarning: 'சேமிப்பு 70% க்கு மேல் — விரைவில் காப்பு ஏற்றுமதி செய்யுங்கள்',
      storageHealthy: 'சேமிப்பு நல்லது — எல்லா ஆவணங்களும் IndexedDB இல்',
      appInfoBody:
        'உங்கள் வால்ட் உள்ளக செயலி சேமிப்பில் உள்ளது। வேறு சாதனத்திற்கு நகலெடுக்க காப்பு ஏற்றுமதி செய்யுங்கள்।',
      biometricUnavailableBody:
        'இந்த சாதனம் அல்லது உலாவியில் பயோமெட்ரிக் கிடைக்கவில்லை।',
      biometricEnabled: 'இயக்கப்பட்ட',
      biometricDisabled: 'முடக்கப்பட்ட',
      biometricHintRegistered:
        'பயோமெட்ரிக் பதிவு செய்யப்பட்டது। வால்ட்டை விரைவாக திறக்க பயன்படுத்துங்கள்।',
      biometricHintRegister:
        'கடவுச்சொல் இல்லாமல் வால்ட் திறக்க விரல்முத்திரை அல்லது Face ID பதிவு செய்யுங்கள்।',
      biometricEnableSuccess: 'பயோமெட்ரிக் உள்நுழைவு வெற்றிகரமாக இயக்கப்பட்டது!',
      biometricSetupFailed: 'அமைப்பு தோல்வி। மீண்டும் முயலவும்।',
      biometricDisabledToast: 'பயோமெட்ரிக் உள்நுழைவு முடக்கப்பட்டது।',
      biometricDisableCta: 'பயோமெட்ரிக் உள்நுழைவை முடக்கு',
      biometricEnableCta: 'பயோமெட்ரிக் உள்நுழைவை இயக்கு',
      biometricSettingUp: 'அமைக்கப்படுகிறது…',
      twoFactorBody:
        'PIN க்குப் பின் கூடுதல் படி—அங்கீகார செயலி சேர்। சாதனத்தை பகிர்ந்தால் பரிந்துரை।',
      twoFactorSetup: 'அங்கீகார செயலியை அமை',
    },
    memberForm: {
      editTitle: 'குடும்ப உறுப்பினரைத் திருத்து',
      addTitle: 'குடும்ப உறுப்பினரைச் சேர்',
      subtitle: 'சுயவிவரங்கள் ஆவணங்களை நபராக அடுக்க உதவுகிறது',
      changePhoto: 'புகைப்படத்தை மாற்ற',
      addPhotoBtn: 'புகைப்படத்தைச் சேர்',
      removePhoto: 'அகற்ற',
      photoHint: 'புகைப்படங்கள் உங்கள் வால்ட்டில் உள்ளமையாகவும் அளவு குறைக்கப்படுகின்றன।',
      fullNameLabel: 'முழு பெயர் *',
      namePlaceholder: 'எ.கா. அருண் சர்மா',
      nameRequired: 'முழு பெயர் தேவை',
      relationshipLabel: 'உறவு *',
      relationshipRequired: 'உறவைத் தேர்வு செய்யுங்கள்',
      dobLabel: 'பிறந்த தேதி',
      profileColorHint: 'புகைப்படம் இல்லாதபோதும் ஆவண குறிகளுக்கும்',
      saving: 'சேமிக்கிறது…',
      saveChanges: 'மாற்றங்களைச் சேமி',
      addMember: 'உறுப்பினரைச் சேர்',
      photoError: 'புகைப்படத்தைச் சேர்க்க முடியவில்லை',
      relationshipOptions: {
        Self: 'நானே',
        Spouse: 'துணைவர்',
        Son: 'மகன்',
        Daughter: 'மகள்',
        Father: 'தந்தை',
        Mother: 'தாய்',
        Brother: 'சகோதரர்',
        Sister: 'சகோதரி',
        Grandfather: 'பாட்டன்',
        Grandmother: 'பாட்டி',
        Other: 'மற்றவை',
      },
    },
    memberCard: {
      demoBanner: 'மாதிரி அட்டை — உங்கள் வால்ட்டில் சேமிக்கப்படவில்லை',
      editTitle: 'உறுப்பினரைத் திருத்த',
      deleteTitle: 'உறுப்பினரை நீக்கு — அவர்களின் ஆவணங்கள் நீக்கப்படும்',
      dobLabel: 'பிறந்த தேதி:',
      ageYears: '{years} வயது',
      docCount: '{count, plural, one {# ஆவணம்} other {# ஆவணங்கள்}}',
      categoryCount: '{count, plural, one {# வகை} other {# வகைகள்}}',
      categoriesWithDocsAria: 'ஆவணங்கள் உள்ள வகைகள்',
      noDocsYet: 'இன்னும் ஆவணங்கள் இல்லை',
      viewInVaultCompact: 'வால்ட்டில் பார்',
      viewInVaultFull: 'வால்ட்டில் ஆவணங்களைப் பார்',
      demoVaultHint:
        'ஆவணங்களை இணைத்து வால்ட் திறக்க உண்மையான உறுப்பினர்களைச் சேர்க்கவும்।',
      missingCategory: 'காணவில்லை: {label}',
    },
    photoAttachments: {
      maxPhotos: 'ஆவணத்திற்கு அதிகபட்சம் {max} புகைப்படங்கள்',
      notImage: '{name} படம் அல்ல',
      exceedsSize: '{name} {mb} MB வரம்பை மீறுகிறது',
      photosAdded:
        '{count, plural, one {# புகைப்படம் சேர்க்கப்பட்டது} other {# புகைப்படங்கள் சேர்க்கப்பட்டன}}',
      photoRemoved: 'புகைப்படம் அகற்றப்பட்டது',
      photosLabel: 'புகைப்படங்கள்',
      photosWithCount: 'புகைப்படங்கள் ({current}/{max})',
      adding: 'சேர்க்கிறது…',
      addPhoto: 'புகைப்படத்தைச் சேர்',
      attachOptional: 'புகைப்படங்களை இணை (விரும்பினால்)',
      documentPhotoAlt: 'ஆவணப் புகைப்படம்',
      viewFullSize: 'முழு அளவில் பார்',
      removePhotoTitle: 'புகைப்படத்தை நீக்கு',
    },
    sharePage: {
      missingKey:
        'இணைப்பு முழுமையற்றது — # க்குப் பிந்தைய உட்பொதி உட்பட முழு URL ஐத் திறக்கவும்।',
      expiredOrRevoked: 'இந்த பகிர்வு இணைப்பு காலாவதியானது அல்லது ரத்து செய்யப்பட்டது।',
    },
    handoverPage: {
      brandStamp: 'SecureVault',
      missingKey: '# உட்பொதி உட்பட முழு இணைப்பைத் திறக்கவும்।',
      notFound: 'இந்த ஒப்படைப்பு இணைப்பு காலாவதியானது அல்லது மாற்றப்பட்டது।',
      openFailed: 'இந்த ஒப்படைப்பு தொகுப்பைத் திறக்க முடியவில்லை।',
      footerLine: 'SecureVault மூலம் பகிரப்பட்டது — வெறும் பார்வை · உருவாக்கப்பட்டது {date}',
    },
    progressPage: {
      eyebrow: 'விளையாட்டியல்',
      title: 'முன்னேற்றம்',
      description:
        'முழுமை மதிப்பெண்கள் ஒவ்வொரு உறுப்பினருக்கும் முக்கிய ஆவண வகைகளைச் சார்ந்தவை। பதக்கங்கள் வால்ட் பயன்பாட்டால் திறக்கப்படும்।',
      familyCompleteness: 'குடும்ப முழுமை',
      perMember: 'ஒவ்வொரு உறுப்பினரும்',
      criticalCategories: '{count} முக்கிய வகைகள்',
      streakStats: 'ஸ்ட்ரீக் புள்ளிவிவரங்கள்',
    },
    emergencySettingsPage: {
      backLink: 'அமைப்புகளுக்குத் திரும்ப',
      pageTitle: 'அவசர அணுகல்',
      pageDescription:
        'நம்பகமான தொடர்பு, மறையீட்டு ஏற்றுமதிகள், காலவரையறுக்கப்பட்ட வெறும்-படிப்பு ஒப்படைப்பு இணைப்புகள்।',
      modeDescription:
        'வால்ட் UI இல் திருத்தங்களை மறைக்கிறது — இச்சாதனத்தில் வெறும் பார்வை வேண்டும்போது।',
      pdfHint: 'ஆவணங்களைத் தேர்வுசெய்யுங்கள், விரும்பினால் AES மூடிய ஏற்றுமதி।',
    },
    familyWatchCard: {
      vaultStamp: 'VAULT',
      viewDetailsAria: '{name} விவரங்களைப் பார்',
      documentsLabel: 'ஆவணங்கள்',
      memberSince: 'உறுப்பினர் {date} முதல்',
      tapOpenVault: 'வால்ட் திறக்க தட்டு',
      tapForDetails: 'விவரங்களுக்குத் தட்டு',
      memberDetails: 'உறுப்பினர் விவரங்கள்',
      tapToFocus: 'கவனத்திற்குத் தட்டு',
    },
  },
  te: {
    settingsPanels: {
      storageMeterSubtitle:
        'డేటా IndexedDBలో ఉంటుంది — క్యాష్ క్లియర్ తర్వాత కూడా నిలిచి ఉంటుంది',
      storageUsed: '{used} ఉపయోగంలో',
      storageAvailable: '{available} అందుబాటులో',
      storagePercentUsed: '{percent}% ఉపయోగంలో',
      storageDanger:
        'నిల్వ దాదాపు నిండింది — ఖాళీ చేయడానికి ఎగుమతి చేసి పాత డేటా తొలగించండి',
      storageWarning: 'నిల్వ 70% కంటే ఎక్కువ — త్వరలో బ్యాకప్ ఎగుమతి పరిగణించండి',
      storageHealthy: 'నిల్వ ఆరోగ్యకరం — అన్ని డాక్యుమెంట్లు IndexedDBలో',
      appInfoBody:
        'మీ వాల్ట్ స్థానిక యాప్ నిల్వలో ఉంటుంది। మరొక పరికరానికి కాపీ కావాలంటే బ్యాకప్ ఎగుమతి చేయండి।',
      biometricUnavailableBody:
        'ఈ పరికరం లేదా బ్రౌజర్‌లో బయోమెట్రిక్ అందుబాటులో లేదు।',
      biometricEnabled: 'ఎనేబుల్',
      biometricDisabled: 'డిసేబుల్',
      biometricHintRegistered:
        'మీ బయోమెట్రిక్ నమోదు చేయబడింది। వాల్ట్ త్వరగా అన్‌లాక్ చేయడానికి ఉపయోగించండి।',
      biometricHintRegister:
        'పాస్‌వర్డ్ లేకుండా అన్‌లాక్ చేయడానికి ఫింగర్‌ప్రింట్ లేదా Face ID నమోదు చేయండి।',
      biometricEnableSuccess: 'బయోమెట్రిక్ లాగిన్ విజయవంతంగా ప్రారంభం!',
      biometricSetupFailed: 'సెటప్ విఫలమైంది। మళ్లీ ప్రయత్నించండి।',
      biometricDisabledToast: 'బయోమెట్రిక్ లాగిన్ నిలిపివేయబడింది।',
      biometricDisableCta: 'బయోమెట్రిక్ లాగిన్ నిలిపివేయి',
      biometricEnableCta: 'బయోమెట్రిక్ లాగిన్ ప్రారంభించు',
      biometricSettingUp: 'సెటప్ అవుతోంది…',
      twoFactorBody:
        'PIN తర్వాత అదనపు కోసం డిజిటల్ ధృవీకరణ యాప్ జోడించండి। పరికరం పంచుకుంటే సిఫార్సు।',
      twoFactorSetup: 'ధృవీకరణ యాప్ సెటప్',
    },
    memberForm: {
      editTitle: 'కుటుంబ సభ్యుని సవరించండి',
      addTitle: 'కుటుంబ సభ్యుడిని జోడించండి',
      subtitle: 'సభ్యుల ప్రొఫైల్‌లు వ్యక్తి వారీగా డాక్యుమెంట్లను అమర్చడంలో సహాయపడతాయి',
      changePhoto: 'ఫోటో మార్చు',
      addPhotoBtn: 'ఫోటో జోడించు',
      removePhoto: 'తొలగించు',
      photoHint: 'ఫోటోలు మీ వాల్ట్‌లో స్థానికంగా నిల్వ చేయబడి సైజ్ తగ్గించబడతాయి।',
      fullNameLabel: 'పూర్తి పేరు *',
      namePlaceholder: 'ఉదా. అర్జున్ శర్మ',
      nameRequired: 'పూర్తి పేరు అవసరం',
      relationshipLabel: 'సంబంధం *',
      relationshipRequired: 'సంబంధాన్ని ఎంచుకోండి',
      dobLabel: 'పుట్టిన తేదీ',
      profileColorHint: 'ఫోటో లేనప్పుడు మరియు డాక్యుమెంట్ బ్యాడ్జ్‌లకు ఉపయోగిస్తారు',
      saving: 'సేవ్ అవుతోంది…',
      saveChanges: 'మార్పులు సేవ్ చేయి',
      addMember: 'సభ్యుడిని జోడించు',
      photoError: 'ఫోటో జోడించలేకపోయాము',
      relationshipOptions: {
        Self: 'నేను',
        Spouse: 'జీవన భాగస్వామి',
        Son: 'కుమారుడు',
        Daughter: 'కుమార్తె',
        Father: 'తండ్రి',
        Mother: 'తల్లి',
        Brother: 'సోదరుడు',
        Sister: 'సోదరి',
        Grandfather: 'తాత',
        Grandmother: 'అమ్మమ్మ',
        Other: 'ఇతర',
      },
    },
    memberCard: {
      demoBanner: 'నమూనా కార్డ్ — మీ వాల్ట్‌లో సేవ్ కాలేదు',
      editTitle: 'సభ్యుడిని సవరించు',
      deleteTitle: 'సభ్యుడిని తొలగించు — వారి అన్ని డాక్యుమెంట్లు తొలగించబడతాయి',
      dobLabel: 'పుట్టిన తేదీ:',
      ageYears: '{years} ఏళ్లు',
      docCount: '{count, plural, one {# డాక్యుమెంట్} other {# డాక్యుమెంట్లు}}',
      categoryCount: '{count, plural, one {# వర్గం} other {# వర్గాలు}}',
      categoriesWithDocsAria: 'డాక్యుమెంట్లు ఉన్న వర్గాలు',
      noDocsYet: 'ఇంకా డాక్యుమెంట్లు లేవు',
      viewInVaultCompact: 'వాల్ట్‌లో చూడు',
      viewInVaultFull: 'వాల్ట్‌లో డాక్యుమెంట్లు చూడు',
      demoVaultHint: 'డాక్యుమెంట్లు లింక్ చేసి వాల్‌ట్ తెరవడానికి నిజమైన సభ్యులను జోడించండి।',
      missingCategory: 'తప్పిపోయింది: {label}',
    },
    photoAttachments: {
      maxPhotos: 'ప్రతి డాక్యుమెంట్‌కు గరిష్టం {max} ఫోటోలు',
      notImage: '{name} బొమ్మ కాదు',
      exceedsSize: '{name} {mb} MB పరిధిని మించింది',
      photosAdded:
        '{count, plural, one {# ఫోటో జోడించబడింది} other {# ఫోటోలు జోడించబడ్డాయి}}',
      photoRemoved: 'ఫోటో తొలగించబడింది',
      photosLabel: 'ఫోటోలు',
      photosWithCount: 'ఫోటోలు ({current}/{max})',
      adding: 'జోడిస్తోంది…',
      addPhoto: 'ఫోటో జోడించు',
      attachOptional: 'ఫోటోలు అటాచ్ చేయి (ఐచ్ఛికం)',
      documentPhotoAlt: 'డాక్యుమెంట్ ఫోటో',
      viewFullSize: 'పూర్తి పరిమాణంలో చూడు',
      removePhotoTitle: 'ఫోటో తొలగించు',
    },
    sharePage: {
      missingKey:
        'ఈ లింక్ అసంపూర్ణం — # తర్వాతి భాగంతో సహా పూర్తి URL తెరవండి।',
      expiredOrRevoked: 'ఈ షేర్ లింక్ గడువు ముగిసింది లేదా రద್ದు చేయబడింది।',
    },
    handoverPage: {
      brandStamp: 'SecureVault',
      missingKey: '# భాగంతో సహా పూర్తి లింక్ తెరవండి।',
      notFound: 'ఈ హ్యాండ్ఓవర్ లింక్ గడువు ముగిసింది లేదా మార్చబడింది।',
      openFailed: 'ఈ హ్యాండ్ఓవర్ బండిల్ తెరవలేము।',
      footerLine: 'SecureVault ద్వారా షేర్ — చూపు మాత్రమే · రూపొందించబడింది {date}',
    },
    progressPage: {
      eyebrow: 'గేమిఫికేషన్',
      title: 'పురోగతి',
      description:
        'పూర్తి స్కోర్లు ప్రతి సభ్యుని క్రిటికల్ డాక్యుమెంట్ వర్గాలపై ఆధారపడి ఉంటాయి। బ్యాడ్జ్‌లు వాల్ట్ వాడకంతో అన్‌లాక్ అవుతాయి।',
      familyCompleteness: 'కుటుంబ పూర్తిత్వం',
      perMember: 'ప్రతి సభ్యుడు',
      criticalCategories: '{count} కీలక వర్గాలు',
      streakStats: 'స్ట్రీక్ గణాంకాలు',
    },
    emergencySettingsPage: {
      backLink: 'సెట్టింగ్‌లకు తిరిగి',
      pageTitle: 'అత్యవసర ప్రవేశం',
      pageDescription:
        'నమ్మకమైన కాంటాక్ట్, ఎన్‌క్రిప్టెడ్ ఎగుమతులు, సమయ పరిమిత ఉంచు-చదువు హ్యాండ్ఓవర్ లింక్‌లు।',
      modeDescription:
        'వాల్ట్ UIలో సవరణలు దాచుతుంది — ఈ పరికరంలో ఉంచు-చదువు కావాలన్నప్పుడు ఉపయోగించండి।',
      pdfHint: 'డాక్యుమెంట్లను ఎంచుకోండి, ఐచ్ఛిక AES-మూసిన ఎగుమతి।',
    },
    familyWatchCard: {
      vaultStamp: 'VAULT',
      viewDetailsAria: '{name} వివరాలు చూడండి',
      documentsLabel: 'డాక్యుమెంట్లు',
      memberSince: 'సభ్యుడు {date} నుండి',
      tapOpenVault: 'వాల్ట్ తెరవడానికి టాప్',
      tapForDetails: 'వివరాలకు టాప్',
      memberDetails: 'సభ్య వివరాలు',
      tapToFocus: 'ఫోకస్ కోసం టాప్',
    },
  },
  ml: {
    settingsPanels: {
      storageMeterSubtitle:
        'ഡാറ്റ IndexedDB യിൽ നിലനിൽക്കും — കാഷ് മായ്ക്കാനുള്ളതിനുശേഷവും',
      storageUsed: '{used} ഉപയോഗം',
      storageAvailable: '{available} ലഭ്യം',
      storagePercentUsed: '{percent}% ഉപയോഗം',
      storageDanger:
        'സംഭരണം ഏเก ഭരിച്ചു — ഇടം ഒഴിയ്ക്കാൻ കയറ്റുമതി ചെയ്ത് പഴയ ഡാറ്റ മായ്ക്കുക',
      storageWarning: 'സംഭരണം 70% കവിഞ്ഞു — ഉടൻ ബാക്കപ്പ് പരിഗണിക്കുക',
      storageHealthy: 'സംഭരണം ആരോഗ്യം — എല്ലാ രേഖകളും IndexedDB യിൽ',
      appInfoBody:
        'നിങ്ങളുടെ വോൾട്ട് പ്രാദേശിക ആപ്പ് സംഭരണത്തിലാണ്। മറ്റ് ഉപകരണത്തേക്ക് പകർപ്പ് വേണമെങ്കിൽ ബാക്കപ്പ് കയറ്റുമതി ചെയ്യുക।',
      biometricUnavailableBody:
        'ഈ ഉപകരണത്തിലോ ബ്രൗസറിലോ ബയോമെട്രിക് ലഭ്യമല്ല।',
      biometricEnabled: 'പ്രവർത്തനക്ഷമം',
      biometricDisabled: 'പ്രവർത്തനരഹിതം',
      biometricHintRegistered:
        'ബയോമെട്രിക് രജിസ്റ്റർ ചെയ്തു। വോൾട്ട് വേഗത്തിൽ തുറക്കാൻ ഉപയോഗിക്കുക।',
      biometricHintRegister:
        'പാസ്‌വേഡ് ഒഴിവാക്കി തുറക്കാൻ വിരലടയാളമോ Face ID യോ രജിസ്റ്റർ ചെയ്യുക।',
      biometricEnableSuccess: 'ബയോമെട്രിക് ലോഗിൻ വിജയകരമായി പ്രാപ്തമാക്കി!',
      biometricSetupFailed: 'സജ്ജീകരണം പരാജയപ്പെട്ടു။ വീണ്ടും ശ്രമിക്കുക।',
      biometricDisabledToast: 'ബയോമെട്രിക് ലോഗിൻ പ്രവർത്തനരഹിതമാക്കി।',
      biometricDisableCta: 'ബയോമെട്രിക് ലോഗിൻ പ്രവർത്തനരഹിതമാക്കുക',
      biometricEnableCta: 'ബയോമെട്രিক് ലോഗിൻ പ്രാപ്തമാക്കുക',
      biometricSettingUp: 'സജ്ജമാക്കുന്നു…',
      twoFactorBody:
        'PIN ന് ശേഷം അധിക ചുവട്—പ്രാമाणീകരണ ആപ്പ് ചേർക്കുക। ഉപകരണം പങ്കിടുന്നുവെങ്കിൽ ശുപാർശചെയ്യുന്നു।',
      twoFactorSetup: 'പ്രാമാണിക ആപ്പ് സജ്ജമാക്കുക',
    },
    memberForm: {
      editTitle: 'കുടുംബ അംഗത്തെ തിരുത്തുക',
      addTitle: 'കുടുംബ അംഗത്തെ ചേർക്കുക',
      subtitle: 'പ്രൊഫൈലുകൾ രേഖകൾ വ്യക്തി അനുസരിച്ച് ഗോഷ്ടി ചെയ്യാൻ സഹായിക്കുന്നു',
      changePhoto: 'ഫോട്ടോ മാറ്റുക',
      addPhotoBtn: 'ഫോട്ടോ ചേർക്കുക',
      removePhoto: 'നീക്കംചെയ്യുക',
      photoHint: 'ഫോട്ടോകൾ നിങ്ങളുടെ വോൾട്ടിൽ പ്രാദേശികമായി സൂക്ഷിക്കുകയും വലുപ്പം കുറയ്ക്കുകയും ചെയ്യുന്നു।',
      fullNameLabel: 'പൂർണ്ണ നാമം *',
      namePlaceholder: 'ഉദാ. അര്ജുൻ ശർമ',
      nameRequired: 'പൂർണ്ണ നാമം ആവശ്യമാണ്',
      relationshipLabel: 'ബന്ധം *',
      relationshipRequired: 'ബന്ധം തിരഞ്ഞെടുക്കുക',
      dobLabel: 'ജനന തീയതി',
      profileColorHint: 'ഫോട്ടോ ഇല്ലാത്തപ്പോഴും രേഖാ ബാഡ്ജുകൾക്കും',
      saving: 'സേവ് ചെയ്യുന്നു…',
      saveChanges: 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക',
      addMember: 'അംഗത്തെ ചേർക്കുക',
      photoError: 'ഫോട്ടോ ചേർക്കാനായില്ല',
      relationshipOptions: {
        Self: 'സ്വയം',
        Spouse: 'ജീവിതപങ്കാളി',
        Son: 'മകൻ',
        Daughter: 'മകൾ',
        Father: 'അച്ഛൻ',
        Mother: 'അമ്മ',
        Brother: 'സഹോദരൻ',
        Sister: 'സഹോദരി',
        Grandfather: 'അപ്പൂപ്പൻ',
        Grandmother: 'അമ്മൂമ്മ',
        Other: 'മറ്റുള്ളവ',
      },
    },
    memberCard: {
      demoBanner: 'സാമ്പിൾ കാർഡ് — നിങ്ങളുടെ വോൾട്ടിൽ സേവ് ചെയ്തിട്ടില്ല',
      editTitle: 'അംഗത്തെ തിരുത്തുക',
      deleteTitle: 'അംഗത്തെ നീക്കംചെയ്യുക — അവരുടെ എല്ലാ രേഖകളും നീക്കംചെയ്യും',
      dobLabel: 'ജനന തീയതി:',
      ageYears: '{years} വയസ്സ്',
      docCount: '{count, plural, one {# രേഖ} other {# രേഖകൾ}}',
      categoryCount: '{count, plural, one {# വിഭാഗം} other {# വിഭാഗങ്ങൾ}}',
      categoriesWithDocsAria: 'രേഖകളുള്ള വിഭാഗങ്ങൾ',
      noDocsYet: 'ഇതുവരെ രേഖകളില്ല',
      viewInVaultCompact: 'വോൾട്ടിൽ കാണുക',
      viewInVaultFull: 'വോൾട്ടിൽ രേഖകൾ കാണുക',
      demoVaultHint: 'രേഖകൾ ബന്ധിപ്പിച്ച് വോൾട്ട് തുറക്കാൻ യഥാർത്ഥ അംഗങ്ങളെ ചേർക്കുക।',
      missingCategory: 'കാണുന്നില്ല: {label}',
    },
    photoAttachments: {
      maxPhotos: 'ഓരോ രേഖയ്ക്കും കൂടിയതും {max} ഫോട്ടോ',
      notImage: '{name} ചിത്രമല്ല',
      exceedsSize: '{name} {mb} MB പരിധി കവിയുന്നു',
      photosAdded:
        '{count, plural, one {# ഫോട്ടോ ചേർത്തു} other {# ഫോട്ടോകൾ ചേർത്തു}}',
      photoRemoved: 'ഫോട്ടോ നീക്കംചെയ്തു',
      photosLabel: 'ഫോട്ടോകൾ',
      photosWithCount: 'ഫോട്ടോകൾ ({current}/{max})',
      adding: 'ചേർക്കുന്നു…',
      addPhoto: 'ഫോട്ടോ ചേർക്കുക',
      attachOptional: 'ഫോട്ടോകൾ അറ്റാച്ച് ചെയ്യുക (ഐച്ഛികം)',
      documentPhotoAlt: 'രേഖാ ഫോട്ടോ',
      viewFullSize: 'പൂർണ്ണ വലിപ്പത്തിൽ കാണുക',
      removePhotoTitle: 'ഫോട്ടോ നീക്കംചെയ്യുക',
    },
    sharePage: {
      missingKey:
        'ലിങ്ക് അപൂർണ്ണമാണ് — # ശേഷഭാഗം ഉൾപ്പെടെ മുഴുവൻ URL തുറക്കുക।',
      expiredOrRevoked: 'ഈ പങ്കുവെക്കൽ ലിങ്ക് കാലാവധി കഴിഞ്ഞു അല്ലെങ്കിൽ റദ്ദാക്കി।',
    },
    handoverPage: {
      brandStamp: 'SecureVault',
      missingKey: '# ഉൾപ്പെടെ മുഴുവൻ ലിങ്ക് തുറക്കുക।',
      notFound: 'ഈ ഹാൻഡ്‌ഓവർ ലിങ്ക് കാലാവധി കഴിഞ്ഞു അല്ലെങ്കിൽ മാറ്റിസ്ഥാപിച്ചു।',
      openFailed: 'ഈ ഹാൻഡ്‌ഓവർ ബണ്ടിൽ തുറക്കാനായില്ല।',
      footerLine: 'SecureVault വഴി പങ്കിട്ടത് — വായന മാത്രം · സൃഷ്ടിച്ചത് {date}',
    },
    progressPage: {
      eyebrow: 'ഗെയിമിഫിക്കേഷൻ',
      title: 'പുരോഗതി',
      description:
        'പൂർണ്ണത സ്കോറുകൾ അംഗത്തിന്റെ നിർണായക രേഖാ വിഭാഗങ്ങളെ ആശ്രയിക്കുന്നു। ബാഡ്ജ് വോൾട്ട് ഉപയോഗിച്ച് അൺലോക്ക് ചെയ്യും।',
      familyCompleteness: 'കുടുംബ പൂർണ്ണത',
      perMember: 'ഓരോ അംഗവും',
      criticalCategories: '{count} നിർണായക വിഭാഗങ്ങൾ',
      streakStats: 'സ്ട്രീക് സ്ഥിതിവിവരങ്ങൾ',
    },
    emergencySettingsPage: {
      backLink: 'ക്രമീകരണങ്ങളിലേക്ക് മടങ്ങുക',
      pageTitle: 'എമർജൻസി പ്രവേശനം',
      pageDescription:
        'വിശ്വസനീയ കോൺടാക്റ്റ്, എൻക്രിപ്റ്റ് ചെയ്ത കയറ്റുമതി, സമയ പരിമിത വായന-മാത്രം ഹാൻഡ്‌ഓവർ ലിങ്കുകൾ।',
      modeDescription:
        'വോൾട്ട് UI ലിൽ തിരുത്തലുകൾ മറയ്ക്കുന്നു — ഈ ഉപകരണത്തിൽ വായന മാത്രം വേണമെങ്കിൽ।',
      pdfHint: 'രേഖകൾ തിരഞ്ഞെടുക്കുക, ഐച്ഛിക AES-പൊതിഞ്ഞ കയറ്റുമതി।',
    },
    familyWatchCard: {
      vaultStamp: 'VAULT',
      viewDetailsAria: '{name} വിവരങ്ങൾ കാണുക',
      documentsLabel: 'രേഖകൾ',
      memberSince: 'അംഗം {date} മുതൽ',
      tapOpenVault: 'വോൾട്ട് തുറക്കാൻ ടാപ്പ്',
      tapForDetails: 'വിവരങ്ങൾക്ക് ടാപ്പ്',
      memberDetails: 'അംഗ വിവരങ്ങൾ',
      tapToFocus: 'ഫോക്കസ് ചെയ്യാൻ ടാപ്പ്',
    },
  },
};

for (const loc of Object.keys(byLocale)) {
  const fp = path.join(root, `${loc}.json`);
  const raw = fs.readFileSync(fp, 'utf8');
  const data = JSON.parse(raw);
  const merged = deepMerge(data, byLocale[loc]);
  fs.writeFileSync(fp, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log('Patched', loc);
}
