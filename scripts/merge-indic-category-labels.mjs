/**
 * Partial overlays for ta, te, kn, bn: category label + shortLabel only (fields fall back to English from en).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const LABELS = {
  ta: {
    'password-vault': { label: 'கடவுச்சொற்கள்', shortLabel: 'கடவுச்சொற்கள்' },
    'government-ids': { label: 'அரசு அடையாளங்கள்', shortLabel: 'அரசு ஐடி' },
    'bank-accounts': { label: 'வங்கிக் கணக்குகள்', shortLabel: 'வங்கி' },
    'credit-debit-cards': { label: 'கிரெடிட் / டெபிட் கார்டுகள்', shortLabel: 'கார்டுகள்' },
    'institutional-docs': { label: 'நிறுவன ஆவணங்கள்', shortLabel: 'நிறுவனம்' },
    'vehicle-documents': { label: 'வாகன ஆவணங்கள்', shortLabel: 'வாகனங்கள்' },
    'family-profiles': { label: 'குடும்ப உறுப்பினர் சுயவிவரங்கள்', shortLabel: 'சுயவிவரம்' },
    passport: { label: 'கடவுச்சீட்டு', shortLabel: 'கடவுச்சீட்டு' },
    'drivers-license': { label: 'ஓட்டுநர் உரிமம்', shortLabel: 'உரிமம்' },
    insurance: { label: 'காப்பீடு', shortLabel: 'காப்பீடு' },
    visa: { label: 'விசா', shortLabel: 'விசா' },
    'medical-record': { label: 'மருத்துவ பதிவு', shortLabel: 'மருத்துவம்' },
    certificate: { label: 'சான்றிதழ்', shortLabel: 'சான்று' },
    contract: { label: 'ஒப்பந்தம்', shortLabel: 'ஒப்பந்தம்' },
    warranty: { label: 'உத்தரவாதம்', shortLabel: 'உத்தரவாதம்' },
    membership: { label: 'உறுப்பினர்', shortLabel: 'உறுப்பினர்' },
    subscription: { label: 'சந்தா', shortLabel: 'சந்தா' },
    permit: { label: 'அனுமதி', shortLabel: 'அனுமதி' },
    other: { label: 'மற்றவை', shortLabel: 'மற்றவை' },
  },
  te: {
    'password-vault': { label: 'పాస్‌వర్డ్‌లు', shortLabel: 'పాస్‌వర్డ్‌లు' },
    'government-ids': { label: 'ప్రభుత్వ గుర్తింపు', shortLabel: 'గవర్నమెంట్ ఐడి' },
    'bank-accounts': { label: 'బ్యాంక్ ఖాతాలు', shortLabel: 'బ్యాంక్' },
    'credit-debit-cards': { label: 'క్రెడిట్ / డెబిట్ కార్డ్‌లు', shortLabel: 'కార్డ్‌లు' },
    'institutional-docs': { label: 'సంస్థాగత పత్రాలు', shortLabel: 'సంస్థ' },
    'vehicle-documents': { label: 'వాహన పత్రాలు', shortLabel: 'వాహనాలు' },
    'family-profiles': { label: 'కుటుంబ సభ్యుల ప్రొఫైల్‌లు', shortLabel: 'ప్రొఫైల్' },
    passport: { label: 'పాస్‌పోర్ట్', shortLabel: 'పాస్‌పోర్ట్' },
    'drivers-license': { label: 'డ్రైవింగ్ లైసెన్స్', shortLabel: 'లైసెన్స్' },
    insurance: { label: 'ఇన్సూరెన్స్', shortLabel: 'ఇన్సూరెన్స్' },
    visa: { label: 'వీసా', shortLabel: 'వీసా' },
    'medical-record': { label: 'వైద్య రికార్డ్', shortLabel: 'వైద్యం' },
    certificate: { label: 'సర్టిఫికేట్', shortLabel: 'సర్ట్' },
    contract: { label: 'కాంట్రాక్ట్', shortLabel: 'కాంట్రాక్ట్' },
    warranty: { label: 'వారంటీ', shortLabel: 'వారంటీ' },
    membership: { label: 'మెంబర్‌షిప్', shortLabel: 'మెంబర్' },
    subscription: { label: 'సబ్‌స్క్రిప్షన్', shortLabel: 'సబ్స్' },
    permit: { label: 'పర్మిట్', shortLabel: 'పర్మిట్' },
    other: { label: 'ఇతర', shortLabel: 'ఇతర' },
  },
  kn: {
    'password-vault': { label: 'ಪಾಸ್‌ವರ್ಡ್‌ಗಳು', shortLabel: 'ಪಾಸ್‌ವರ್ಡ್' },
    'government-ids': { label: 'ಸರ್ಕಾರಿ ಗುರುತಿನ ದಾಖಲೆಗಳು', shortLabel: 'ಸರ್ಕಾರಿ ಐಡಿ' },
    'bank-accounts': { label: 'ಬ್ಯಾಂಕ್ ಖಾತೆಗಳು', shortLabel: 'ಬ್ಯಾಂಕ್' },
    'credit-debit-cards': { label: 'ಕ್ರೆಡಿಟ್ / ಡೆಬಿಟ್ ಕಾರ್ಡ್‌ಗಳು', shortLabel: 'ಕಾರ್ಡ್‌ಗಳು' },
    'institutional-docs': { label: 'ಸಂಸ್ಥಾತ್ಮಕ ದಾಖಲೆಗಳು', shortLabel: 'ಸಂಸ್ಥೆ' },
    'vehicle-documents': { label: 'ವಾಹನ ದಾಖಲೆಗಳು', shortLabel: 'ವಾಹನಗಳು' },
    'family-profiles': { label: 'ಕುಟುಂಬ ಸದಸ್ಯರ ಪ್ರೊಫೈಲ್‌ಗಳು', shortLabel: 'ಪ್ರೊಫೈಲ್' },
    passport: { label: 'ಪಾಸ್‌ಪೋರ್ಟ್', shortLabel: 'ಪಾಸ್‌ಪೋರ್ಟ್' },
    'drivers-license': { label: 'ಚಾಲನೆ ಪರವಾನಗಿ', shortLabel: 'ಪರವಾನಗಿ' },
    insurance: { label: 'ವಿಮೆ', shortLabel: 'ವಿಮೆ' },
    visa: { label: 'ವೀಸಾ', shortLabel: 'ವೀಸಾ' },
    'medical-record': { label: 'ವೈದ್ಯಕೀಯ ದಾಖಲೆ', shortLabel: 'ವೈದ್ಯಕೀಯ' },
    certificate: { label: 'ಪ್ರಮಾಣಪತ್ರ', shortLabel: 'ಪ್ರಮಾಣ' },
    contract: { label: 'ಒಪ್ಪಂದ', shortLabel: 'ಒಪ್ಪಂದ' },
    warranty: { label: 'ವಾರಂಟಿ', shortLabel: 'ವಾರಂಟಿ' },
    membership: { label: 'ಸದಸ್ಯತ್ವ', shortLabel: 'ಸದಸ್ಯ' },
    subscription: { label: 'ಚಂದಾದಾರಿಕೆ', shortLabel: 'ಚಂದಾ' },
    permit: { label: 'ಪರವಾನಗಿ (ಪರ್ಮಿಟ್)', shortLabel: 'ಪರ್ಮಿಟ್' },
    other: { label: 'ಇತರೆ', shortLabel: 'ಇತರೆ' },
  },
  bn: {
    'password-vault': { label: 'পাসওয়ার্ড', shortLabel: 'পাসওয়ার্ড' },
    'government-ids': { label: 'সরকারি পরিচয়পত্র', shortLabel: 'গভ. আইডি' },
    'bank-accounts': { label: 'ব্যাংক অ্যাকাউন্ট', shortLabel: 'ব্যাংক' },
    'credit-debit-cards': { label: 'ক্রেডিট / ডেবিট কার্ড', shortLabel: 'কার্ড' },
    'institutional-docs': { label: 'প্রাতিষ্ঠানিক নথি', shortLabel: 'প্রতিষ্ঠান' },
    'vehicle-documents': { label: 'যানবাহন নথি', shortLabel: 'যান' },
    'family-profiles': { label: 'পরিবারের সদস্য প্রোফাইল', shortLabel: 'প্রোফাইল' },
    passport: { label: 'পাসপোর্ট', shortLabel: 'পাসপোর্ট' },
    'drivers-license': { label: 'ড্রাইভিং লাইসেন্স', shortLabel: 'লাইসেন্স' },
    insurance: { label: 'বীমা', shortLabel: 'বীমা' },
    visa: { label: 'ভিসা', shortLabel: 'ভিসা' },
    'medical-record': { label: 'চিকিৎসা রেকর্ড', shortLabel: 'চিকিৎসা' },
    certificate: { label: 'সার্টিফিকেট', shortLabel: 'সার্টি.' },
    contract: { label: 'চুক্তি', shortLabel: 'চুক্তি' },
    warranty: { label: 'ওয়ারেন্টি', shortLabel: 'ওয়ারেন্টি' },
    membership: { label: 'সদস্যতা', shortLabel: 'সদস্য' },
    subscription: { label: 'সাবস্ক্রিপশন', shortLabel: 'সাবস্' },
    permit: { label: 'পারমিট', shortLabel: 'পারমিট' },
    other: { label: 'অন্যান্য', shortLabel: 'অন্যান্য' },
  },
};

for (const loc of ['ta', 'te', 'kn', 'bn']) {
  const categories = {};
  for (const [id, v] of Object.entries(LABELS[loc])) {
    categories[id] = { label: v.label, shortLabel: v.shortLabel };
  }
  const out = { categories };
  fs.writeFileSync(path.join(root, 'messages', `${loc}.json`), JSON.stringify(out, null, 2));
  console.log('Wrote messages/', loc + '.json', 'category labels');
}
