/**
 * Merge consentBanner, scanModal, shareModal, renewalsPage into hi/kn/ta/te/ml.
 * Run after patch-ui-locale-overlays.mjs if needed, or standalone.
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

const wave2 = {
  hi: {
    consentBanner: {
      ariaLabel: 'गोपनीयता वरीयताएँ',
      title: 'गोपनीयता और डेटा वरीयताएँ',
      body: 'SecureVault आपके सभी दस्तावेज़ों को <device>आपके डिवाइस पर एन्क्रिप्टेड</device> रूप में संग्रहीत करता है। AI दस्तावेज़ स्कैन के दौरान OCR टेक्स्ट प्रसंस्करण हेतु Anthropic को भेजा जाता है। एनालिटिक्स हमें ऐप सुधारने में मदद करता है। आप सेटिंग्स में कभी भी बदल सकते हैं।',
      essential: 'आवश्यक — स्थानीय एन्क्रिप्टेड संग्रहण, प्रमाणीकरण, ऑफ़लाइन (आवश्यक)',
      aiProcessing:
        'AI प्रसंस्करण — दस्तावेज़ फ़ील्ड निकालने हेतु OCR टेक्स्ट Anthropic Claude को भेजा जाता है। कोई दस्तावेज़ छवि आपके डिवाइस से बाहर नहीं जाती।',
      analytics:
        'एनालिटिक्स — ऐप सुधार के लिए Google Analytics के माध्यम से अनाम उपयोग आँकड़े।',
      savePreferences: 'वरीयताएँ सहेजें',
      acceptAll: 'सभी स्वीकार करें',
      essentialOnly: 'केवल आवश्यक',
      hideDetails: 'विवरण छिपाएँ',
      managePreferences: 'वरीयताएँ प्रबंधित करें',
    },
    scanModal: {
      title: 'AI से दस्तावेज़ स्कैन',
      subtitle:
        'OCR आपके डिवाइस पर चलता है; निकाला गया टेक्स्ट फ़ील्ड मैपिंग के लिए AI को भेजा जाता है। सहेजने से पहले जाँच करें।',
      categoryLabel: 'दस्तावेज़ श्रेणी',
      categoryHint:
        'आधार, PAN, पासपोर्ट, लाइसेंस, RC, बीमा, बैंक दस्तावेज़ इत्सादी इन्हीं श्रेणियों का उपयोग करते हैं।',
      cameraCapture: 'कैमरा / कैप्चर',
      gallery: 'गैलरी',
      liveCamera: 'लाइव कैमरा (वैकल्पिक)',
      startWebcam: 'वेबकैम शुरू करें',
      useFrame: 'फ़्रेम उपयोग करें',
      stop: 'रोकें',
      statusReading: 'डिवाइस पर दस्तावेज़ पढ़ा जा रहा है…',
      statusExtracting: 'AI से फ़ील्ड निकाले जा रहे हैं…',
      extractedPreview: 'निकाला गया पूर्वावलोकन',
      colField: 'फ़ील्ड',
      colValue: 'मान',
      colConf: 'विश्वास',
      previewHint:
        'मान दस्तावेज़ जोड़ने फ़ॉर्म में पीले “AI filled” बैज के साथ खुलते हैं। सहेजने से पहले संपादित करें।',
      cancel: 'रद्द करें',
      applyToForm: 'फ़ॉर्म में लागू करें',
      titleScanSuffix: '(स्कैन)',
      notesAppend: 'AI कैमरा स्कैन से आयात — सभी फ़ील्ड सत्यापित करें।',
      errNoText: 'कोई टेक्स्ट नहीं पहचाना गया। स्पष्ट फ़ोटो या बेहतर रोशनी आज़माएँ।',
    },
    shareModal: {
      title: 'दस्तावेज़ साझा करें',
      unknownCategory: 'अज्ञात श्रेणी — साझा नहीं कर सकते।',
      expires: 'समाप्ति',
      expiry24h: '24 घंटे',
      expiry7d: '7 दिन',
      expiry30d: '30 दिन',
      fieldsToInclude: 'शामिल करने के लिए फ़ील्ड',
      sensitiveBadge: 'संवेदनशील',
      hint: 'समय-सीमित लिंक बनता है; डेटा एन्क्रिप्टेड है और कुंजी केवल URL खंड में है (सर्वर पर नहीं)। प्राप्तकर्ता संवेदनशील मान डिफ़ॉल्ट रूप से मास्क देखते हैं।',
      cancel: 'रद्द करें',
      createCopy: 'लिंक बनाएँ और कॉपी करें',
      creating: 'बन रहा है…',
      toastNeedField: 'साझा करने के लिए कम से कम एक फ़ील्ड चुनें',
      toastCopied: 'साझा लिंक कॉपी — कुंजी केवल लिंक में है; निजी रखें',
      toastFailed: 'साझा लिंक नहीं बना सके',
    },
    renewalsPage: {
      eyebrow: 'योजना',
      title: 'नवीनीकरण',
      description:
        'अगले {days} दिनों में दस्तावेज़ समाप्ति तिथियाँ, तात्कालिकता के अनुसार — केवल जानकारी हेतु।',
    },
  },
  kn: {
    consentBanner: {
      ariaLabel: 'ಗೌಪ್ಯತೆ ಆದ್ಯತೆಗಳು',
      title: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ ಆದ್ಯತೆಗಳು',
      body: 'SecureVault ನಿಮ್ಮ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು <device>ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಗೂಢಲಿಪೀಕೃತ</device>ವಾಗಿ ಸಂಗ್ರಹಿಸುತ್ತದೆ। AI ದಾಖಲೆ ಸ್ಕ್ಯಾನ್ ಬಳಸುವಾಗ OCR ಪಠ್ಯವನ್ನು Anthropic ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ। ಅನಾಲಿಟಿಕ್ಸ್ ಅಪ್ಲಿಕೇಶನ್ ಸುಧಾರಣೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ। ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಯಾವಾಗಲೂ ಬದಲಾಯಿಸಿ।',
      essential: 'ಅಗತ್ಯ — ಸ್ಥಳೀಯ ಗೂಢಲಿಪಿ ಸಂಗ್ರಹಣೆ, ದೃಢೀಕರಣ, ಆಫ್‌ಲೈನ್ (ಅಗತ್ಯ)',
      aiProcessing:
        'AI ಪ್ರಕ್ರಿಯೆ — ದಾಖಲೆ ಕ್ಷೇತ್ರಗಳಿಗೆ OCR ಪಠ್ಯ Anthropic Claude ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ। ಚಿತ್ರಗಳು ಸಾಧನ ಬಿಟ್ಟು ಹೊರಹೋಗುವುದಿಲ್ಲ।',
      analytics: 'ಅನಾಲಿಟಿಕ್ಸ್ — Google Analytics ಮೂಲಕ ಅನಾಮಧೇಯ ಅಂಕಿಅಂಶಗಳು।',
      savePreferences: 'ಆದ್ಯತೆಗಳನ್ನು ಉಳಿಸಿ',
      acceptAll: 'ಎಲ್ಲಾ ಸ್ವೀಕರಿಸಿ',
      essentialOnly: 'ಅಗತ್ಯ ಮಾತ್ರ',
      hideDetails: 'ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ',
      managePreferences: 'ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    },
    scanModal: {
      title: 'AI ಯೊಂದಿಗೆ ದಾಖಲೆ ಸ್ಕ್ಯಾನ್',
      subtitle:
        'OCR ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ; ಪಠ್ಯವನ್ನು AI ಗೆ ಕ್ಷೇತ್ರ ಮ್ಯಾಪಿಂಗ್‌ಗೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ। ಉಳಿಸುವುದಕ್ಕೆ ಮೊದಲು ಪರೀಕ್ಷಿಸಿ।',
      categoryLabel: 'ದಾಖಲೆ ವರ್ಗ',
      categoryHint:
        'ಆಧಾರ್, PAN, ಪಾಸ್ಪೋರ್ಟ್, ಪರವಾನಗಿ, RC, ವಿಮಾ, ಬ್ಯಾಂಕ್ ದಾಖಲೆಗಳು ಈ ವರ್ಗಗಳನ್ನು ಬಳಸುತ್ತವೆ।',
      cameraCapture: 'ಕ್ಯಾಮೆರಾ / ಕ್ಯಾಪ್ಚರ್',
      gallery: 'ಗ್ಯಾಲರಿ',
      liveCamera: 'ಲೈವ್ ಕ್ಯಾಮೆರಾ (ಐಚ್ಛಿಕ)',
      startWebcam: 'ವೆಬ್‌ಕ್ಯಾಮ್ ಪ್ರಾರಂಭಿಸಿ',
      useFrame: 'ಫ್ರೇಮ್ ಬಳಸಿ',
      stop: 'ನಿಲ್ಲಿಸಿ',
      statusReading: 'ಸಾಧನದಲ್ಲಿ ದಾಖಲೆ ಓದಲಾಗುತ್ತಿದೆ…',
      statusExtracting: 'AI ಯಿಂದ ಕ್ಷೇತ್ರಗಳನ್ನು ತೆಗೆಯಲಾಗುತ್ತಿದೆ…',
      extractedPreview: 'ತೆಗೆದದ್ದರ ಮುನ್ನೋಟ',
      colField: 'ಕ್ಷೇತ್ರ',
      colValue: 'ಮೌಲ್ಯ',
      colConf: 'ನಂಬಿಕೆ',
      previewHint:
        'ಮೌಲ್ಯಗಳು “AI filled” ಬ್ಯಾಡ್ಜ್‌ಗಳೊಂದಿಗೆ ಫಾರ್ಮ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ। ಉಳಿಸುವುದಕ್ಕೆ ಮೊದಲು ಸಂಪಾದಿಸಿ।',
      cancel: 'ರದ್ದುಮಾಡಿ',
      applyToForm: 'ಫಾರ್ಮ್‌ಗೆ ಲಾಗು ಮಾಡಿ',
      titleScanSuffix: '(ಸ್ಕ್ಯಾನ್)',
      notesAppend: 'AI ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನ್‌ನಿಂದ ಆಮದು — ಎಲ್ಲಾ ಕ್ಷೇತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ।',
      errNoText: 'ಪಠ್ಯ ಗುರುತಿಸಲಾಗಲಿಲ್ಲ। ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಥವಾ ಉತ್ತಮ ಬೆಳಕು ಪ್ರಯತ್ನಿಸಿ।',
    },
    shareModal: {
      title: 'ದಾಖಲೆ ಹಂಚಿಕೊಳ್ಳಿ',
      unknownCategory: 'ಅಪರಿಚಿತ ವರ್ಗ — ಹಂಚಿಕೊಳ್ಳಲಾಗದು।',
      expires: 'ಮುಕ್ತಾಯ',
      expiry24h: '24 ಗಂಟೆ',
      expiry7d: '7 ದಿನ',
      expiry30d: '30 ದಿನ',
      fieldsToInclude: 'ಸೇರಿಸಬೇಕಾದ ಕ್ಷೇತ್ರಗಳು',
      sensitiveBadge: 'ಸೂಕ್ಷ್ಮ',
      hint: 'ಸಮಯ-ಬದ್ಧ ಲಿಂಕ್; ಡೇಟಾ ಗೂಢಲಿಪೀಕೃತ, ಕೀ URL ಭಾಗದಲ್ಲಿ ಮಾತ್ರ।',
      cancel: 'ರದ್ದುಮಾಡಿ',
      createCopy: 'ಲಿಂಕ್ ರಚಿಸಿ ಮತ್ತು ನಕಲಿಸಿ',
      creating: 'ರಚಿಸಲಾಗುತ್ತಿದೆ…',
      toastNeedField: 'ಹಂಚಲು ಕನಿಷ್ಠ ಒಂದು ಕ್ಷೇತ್ರ ಆರಿಸಿ',
      toastCopied: 'ಹಂಚಿಕೆ ಲಿಂಕ್ ನಕಲು — ಕೀ ಲಿಂಕ್‌ನಲ್ಲೇ ಖಾಸಗಿ ಇಡಿ',
      toastFailed: 'ಹಂಚಿಕೆ ಲಿಂಕ್ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    },
    renewalsPage: {
      eyebrow: 'ಯೋಜನೆ',
      title: 'ನವೀಕರಣಗಳು',
      description:
        'ಮುಂದಿನ {days} ದಿನಗಳ ದಸ್ತಾವೇಜು ಮುಕ್ತಾಯ ದಿನಾಂಕಗಳು, ತುರ್ತು ಪ್ರಕಾರದ ಗುಂಪು — ಮಾಹಿತಿ ಮಾತ್ರ.',
    },
  },
  ta: {
    consentBanner: {
      ariaLabel: 'தனியுரிமை விருப்பங்கள்',
      title: 'தனியுரிமை மற்றும் தரவு விருப்பங்கள்',
      body: 'SecureVault உங்கள் எல்லா ஆவணங்களையும் <device>உங்கள் சாதனத்தில் மறையீடு</device> செய்யப்பட்டு சேமிக்கிறது। AI ஸ்கேன் பயன்பாட்டின்போது OCR உரை Anthropic க்கு அனுப்பப்படுகிறது। Analytics செயலியை மேம்படுத்த உதவுகிறது। அமைப்புகளில் எப்போதும் மாற்றலாம்।',
      essential: 'அத்தியாவசிய — உள்ளமை மறையீட்டு சேமிப்பு, அங்கீகாரம், இணைப்பில்லா (கட்டாய)',
      aiProcessing:
        'AI செயலாக்கம் — புலங்களுக்கு OCR உரை Anthropic Claude க்கு அனுப்பப்படுகிறது। படங்கள் சாதனை விட்டுச் செல்லாது।',
      analytics: 'பகுப்பாய்வு — Google Analytics வழி அடையாளமற்ற புள்ளிவிவரங்கள்।',
      savePreferences: 'விருப்பங்களை சேமி',
      acceptAll: 'எல்லாம் ஏற்க',
      essentialOnly: 'அத்தியாவசியம் மட்டும்',
      hideDetails: 'விவரங்களை மறை',
      managePreferences: 'விருப்பங்களை நிர்வகி',
    },
    scanModal: {
      title: 'AI உடன் ஆவண ஸ்கேன்',
      subtitle:
        'OCR சாதனத்தில்; எடுக்கப்பட்ட உரை புல மேப்பிங்கிற்கு AI க்கு அனுப்பப்படுகிறது। சேமிப்புக்கு முன் சரிபார்க்கவும்।',
      categoryLabel: 'ஆவண வகை',
      categoryHint:
        'ஆதார், PAN, பாஸ்போர்ட், உரிமம், RC, காப்பீடு, வங்கி ஆவணங்கள் இவ்வகைகளைப் பயன்படுத்துகின்றன।',
      cameraCapture: 'கேமரா / பிடிப்பு',
      gallery: 'கேலரி',
      liveCamera: 'நேரடி கேமரா (விருப்ப)',
      startWebcam: 'வெப்கேம் தொடங்கு',
      useFrame: 'பிரேம் பயன்படுத்து',
      stop: 'நிறுத்து',
      statusReading: 'சாதனத்தில் ஆவணம் வாசிக்கப்படுகிறது…',
      statusExtracting: 'AI மூலம் புலங்கள் எடுக்கப்படுகின்றன…',
      extractedPreview: 'எடுக்கப்பட்ட முன்னோட்டம்',
      colField: 'புலம்',
      colValue: 'மதிப்பு',
      colConf: 'நம்பிக்கை',
      previewHint:
        'மதிப்புகள் “AI filled” பேட்ஜுடன் படிவத்தில் திறக்கின்றன। சேமிக்க முன் திருத்தவும்।',
      cancel: 'ரத்து',
      applyToForm: 'படிவத்தில் பயன்படுத்து',
      titleScanSuffix: '(ஸ்கேன்)',
      notesAppend: 'AI கேமரா ஸ்கேன் இறக்குமதி — அனைத்து புலங்களையும் சரிபார்க்கவும்।',
      errNoText: 'உரை கண்டறியப்படவில்லை। தெளிவான புகைப்படம் அல்லது நல்ல ஒளி முயற்சிக்கவும்।',
    },
    shareModal: {
      title: 'ஆவணத்தை பகிர்',
      unknownCategory: 'தெரியாத வகை — பகிர முடியாது।',
      expires: 'காலாவதி',
      expiry24h: '24 மணி',
      expiry7d: '7 நாட்கள்',
      expiry30d: '30 நாட்கள்',
      fieldsToInclude: 'சேர்க்கப்படும் புலங்கள்',
      sensitiveBadge: 'உணர்திறன்',
      hint: 'கால வரையறுக்கப்பட்ட இணைப்பு; தரவு மறையீடு, விசை URL உள்வெட்டில் மட்டும்।',
      cancel: 'ரத்து',
      createCopy: 'இணைப்பை உருவாக்கி நகலெடு',
      creating: 'உருவாக்குகிறது…',
      toastNeedField: 'பகிர குறைந்தது ஒரு புலம் தேர்ந்தெடுக்கவும்',
      toastCopied: 'இணைப்பு நகல் — விசை இணைப்பிலேயே; தனியாக வைத்திருங்கள்',
      toastFailed: 'இணைப்பை உருவாக்க முடியவில்லை',
    },
    renewalsPage: {
      eyebrow: 'திட்டமிடல்',
      title: 'புதுப்பிப்புகள்',
      description:
        'அடுத்த {days} நாட்களில் ஆவண காலாவதி தேதிகள், அவசரத்தின் படி — தகவல் மட்டும்.',
    },
  },
  te: {
    consentBanner: {
      ariaLabel: 'గోప్యతా అభిమతాలు',
      title: 'గోప్యత మరియు డేటా అభిమతాలు',
      body: 'SecureVault మీ అన్ని డాక్యుమెంట్లను <device>మీ పరికరంలో ఎన్‌క్రిప్ట్</device> చేసి నిల్వ చేస్తుంది। AI స్కాన్‌లో OCR వచనం Anthropic కు పంపబడుతుంది। సెట్టింగ్‌లలో ఎప్పుడైనా మార్చండి।',
      essential: 'అవసరం — స్థానిక ఎన్‌క్రిప్టెడ్ నిల్వ, ప్రామాణీకరణ, ఆఫ్‌లైన్ (తప్పనిసరి)',
      aiProcessing:
        'AI ప్రాసెసింగ్ — ఫీల్డ్‌ల కోసం OCR వచనం Anthropic Claude కు పంపబడుతుంది। చిత్రాలు పరికరం వదిలి వెళ్లవు।',
      analytics: 'Analytics — Google Analytics ద్వారా అనామక గణాంకాలు।',
      savePreferences: 'అభిమతాలను సేవ్ చేయి',
      acceptAll: 'అన్నీ అంగీకరించు',
      essentialOnly: 'అవసరం మాత్రమే',
      hideDetails: 'వివరాలు దాచు',
      managePreferences: 'అభిమతాలను నిర్వహించు',
    },
    scanModal: {
      title: 'AI తో డాక్యుమెంట్ స్కాన్',
      subtitle:
        'OCR మీ పరికరంలో; తీసిన వచనం ఫీల్డ్ మ్యాపింగ్ కోసం AI కు పంపబడుతుంది। సేవ్ ముందు సమీక్షించండి।',
      categoryLabel: 'డాక్యుమెంట్ వర్గం',
      categoryHint:
        'ఆధార్, PAN, పాస్‌పోర్ట్, లైసెన్స్, RC, ఇన్సూరెన్స్, బ్యాంక్ డాక్స్ ఈ వర్గాలను వాడతాయి।',
      cameraCapture: 'కెమెరా / క్యాప్చర్',
      gallery: 'గ్యాలరీ',
      liveCamera: 'లైవ్ కెమెరా (ఐచ్ఛికం)',
      startWebcam: 'వెబ్‌క్యామ్ ప్రారంభించు',
      useFrame: 'ఫ్రేమ్ వాడు',
      stop: 'ఆపు',
      statusReading: 'పరికరంలో డాక్యుమెంట్ చదవబడుతోంది…',
      statusExtracting: 'AI తో ఫీల్డ్‌లు తీయబడతాయి…',
      extractedPreview: 'తీసిన ముందరి చూపు',
      colField: 'ఫీల్డ్',
      colValue: 'విలువ',
      colConf: 'నమ్మకం',
      previewHint: 'విలువలు “AI filled” బ్యాడ్జ్‌లతో ఫారమ్‌లో తెరుచుతాయి।',
      cancel: 'రద్దు',
      applyToForm: 'ఫారమ్‌కు వర్తించు',
      titleScanSuffix: '(స్కాన్)',
      notesAppend: 'AI కెమెరా స్కాన్ నుండి దిగుమతి — అన్ని ఫీల్డ్‌లను ధృవీకరించండి।',
      errNoText: 'వచనం గుర్తించబడలేదు। స్పష్టమైన ఫోటో లేదా మెరుగైన వెలుగు ప్రయత్నించండి।',
    },
    shareModal: {
      title: 'డాక్యుమెంట్ షేర్ చేయి',
      unknownCategory: 'తెలియని వర్గం — షేర్ చేయలేం।',
      expires: 'గడువు',
      expiry24h: '24 గంటలు',
      expiry7d: '7 రోజులు',
      expiry30d: '30 రోజులు',
      fieldsToInclude: 'చేర్చవలసిన ఫీల్డ్‌లు',
      sensitiveBadge: 'సంవేదనశీలం',
      hint: 'సమయ పరిమిత లింక్; డేటా ఎన్‌క్రిప్టెడ్, కీ URL భాగంలో మాత్రమే।',
      cancel: 'రద్దు',
      createCopy: 'లింక్ సృష్టించి కాపీ చేయి',
      creating: 'సృష్టిస్తోంది…',
      toastNeedField: 'షేర్ చేయడానికి కనీసం ఒక ఫీల్డ్ ఎంచుకోండి',
      toastCopied: 'షేర్ లింక్ కాపీ — కీ లింక్‌లోనే; ప్రైవేట్ ఉంచండి',
      toastFailed: 'షేర్ లింక్ సృష్టించలేకపోయాము',
    },
    renewalsPage: {
      eyebrow: 'ప్లానింగ్',
      title: 'పునరుద్ధరణలు',
      description:
        'తదుపరి {days} రోజులలో గడువు తేదీలు, అత్యవసరాల ప్రకారం — సమాచారం మాత్రమే.',
    },
  },
  ml: {
    consentBanner: {
      ariaLabel: 'സ്വകാര്യ മുൻഗണനകൾ',
      title: 'സ്വകാര്യതയും ഡാറ്റ മുൻഗണനകളും',
      body: 'SecureVault നിങ്ങളുടെ എല്ലാ രേഖകളും <device>നിങ്ങളുടെ ഉപകരണത്തിൽ എൻക്രിപ്റ്റ്</device> ചെയ്ത് സൂക്ഷിക്കുന്നു। AI സ്കാനിൽ OCR വാചകം Anthropic ലേക്ക് അയയ്ക്കുന്നു। ക്രമീകരണങ്ങളിൽ എപ്പോഴും മാറ്റാം।',
      essential: 'അത്യാവശ്യം — പ്രാദേശിക എൻക്രിപ്റ്റ് സംഭരണം, പ്രാമാണീകരണം, ഓഫ്‌ലൈൻ (നിർബന്ധം)',
      aiProcessing:
        'AI പ്രക്രിയ — ഫീൽഡുകൾക്ക് OCR വാചകം Anthropic Claude ലേക്ക് അയയ്ക്കുന്നു। ചിത്രങ്ങൾ ഉപകരണം വിട്ടു പോകില്ല।',
      analytics: 'Analytics — Google Analytics വഴി അജ്ഞാത അസ്ഥിതിവിവരങ്ങൾ।',
      savePreferences: 'മുൻഗണനകൾ സേവ് ചെയ്യുക',
      acceptAll: 'എല്ലാം സ്വീകരിക്കുക',
      essentialOnly: 'അത്യാവശ്യം മാത്രം',
      hideDetails: 'വിശദാംശങ്ങൾ മറയ്ക്കുക',
      managePreferences: 'മുൻഗണനകൾ നിയന്ത്രിക്കുക',
    },
    scanModal: {
      title: 'AI യുക്തമായി രേഖ സ്കാൻ',
      subtitle:
        'OCR ഉപകരണത്തിൽ; വാചകം ഫീൽഡ് മാപ്പിംഗിന് AI ക്ക് അയയ്ക്കുന്നു। സേവ് മുമ്പ് പരിശോധിക്കുക।',
      categoryLabel: 'രേഖാ വിഭാഗം',
      categoryHint:
        'ആധാർ, PAN, പാസ്‌പോർട്ട്, ലൈസൻസ്, RC, ഇൻഷുറൻസ്, ബാങ്ക് രേഖകൾ ഈ വിഭാഗങ്ങൾ ഉപയോഗിക്കുന്നു।',
      cameraCapture: 'ക്യാമറ / ക്യാപ്ചർ',
      gallery: 'ഗാലറി',
      liveCamera: 'ലൈവ് ക്യാമറ (ഐച്ഛികം)',
      startWebcam: 'വെബ്‌ക്യാം ആരംഭിക്കുക',
      useFrame: 'ഫ്രെയിം ഉപയോഗിക്കുക',
      stop: 'നിർത്തുക',
      statusReading: 'ഉപകരണത്തിൽ രേഖ വായിക്കുന്നു…',
      statusExtracting: 'AI മുഖേന ഫീൽഡുകൾ എടുക്കുന്നു…',
      extractedPreview: 'എടുത്ത മുൻകാഴ്ച',
      colField: 'ഫീൽഡ്',
      colValue: 'മൂല്യം',
      colConf: 'വിശ്വാസം',
      previewHint: 'മൂല്യങ്ങൾ “AI filled” ബാഡ്ജുകളോടെ ഫോമിൽ തുറക്കുന്നു।',
      cancel: 'റദ്ദാക്കുക',
      applyToForm: 'ഫോമിൽ പ്രയോഗിക്കുക',
      titleScanSuffix: '(സ്‌ക്കാൻ)',
      notesAppend: 'AI ക്യാമറ സ്കാൻ ഇറക്കുമതി — എല്ലാ ഫീൽഡുകളും സ്ഥിരീകരിക്കുക।',
      errNoText: 'വാചകം തിരിച്ചറിഞ്ഞില്ല। വ്യക്തമായ ഫോട്ടോ അല്ലെങ്കിൽ നല്ല വെളിച്ചം ശ്രമിക്കുക।',
    },
    shareModal: {
      title: 'രേഖ പങ്കിടുക',
      unknownCategory: 'അജ്ഞാത വിഭാഗം — പങ്കിടാനാവില്ല।',
      expires: 'കാലാവധി',
      expiry24h: '24 മണിക്കൂർ',
      expiry7d: '7 ദിവസം',
      expiry30d: '30 ദിവസം',
      fieldsToInclude: 'ചേർക്കേണ്ട ഫീൽഡുകൾ',
      sensitiveBadge: 'സംവേദനശീലം',
      hint: 'കാലപരിധിയുള്ള ലിങ്ക്; ഡാറ്റ എൻക്രിപ്റ്റ്, കീ URL ഭാഗത്തിൽ മാത്രം।',
      cancel: 'റദ്ദാക്കുക',
      createCopy: 'ലിങ്ക് സൃഷ്ടിച്ച് പകർപ്പ്',
      creating: 'സൃഷ്ടിക്കുന്നു…',
      toastNeedField: 'പങ്കിടാൻ കുറഞ്ഞത് ഒരു ഫീൽഡ് തിരഞ്ഞെടുക്കുക',
      toastCopied: 'പങ്കിടൽ ലിങ്ക് പകർപ്പ് — കീ ലിങ്കിൽ മാത്രം',
      toastFailed: 'പങ്കിടൽ ലിങ്ക് സൃഷ്ടിക്കാൻ കഴിഞ്ഞില്ല',
    },
    renewalsPage: {
      eyebrow: 'പ്ലാനിംഗ്',
      title: 'പുതുക്കലുകൾ',
      description:
        'അടുത്ത {days} ദിവസങ്ങളിലെ കാലാവധി തീയതികൾ, അടുത്ത തീവ്രത പ്രകാരം — വിവരം മാത്രം.',
    },
  },
};

for (const loc of Object.keys(wave2)) {
  const fp = path.join(root, `${loc}.json`);
  const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const merged = deepMerge(data, wave2[loc]);
  fs.writeFileSync(fp, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
  console.log('wave2', loc);
}
