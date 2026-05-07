/**
 * Partial overlays for ta, te, kn, ml: category label + shortLabel only (fields fall back to English from en).
 * This script MERGES into existing JSON — it does not overwrite the rest of the i18n payload.
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
  ml: {
    'password-vault': { label: 'പാസ്‌വേഡുകൾ', shortLabel: 'പാസ്‌വേഡ്' },
    'government-ids': { label: 'ഗവൺമെന്റ് ഐഡികൾ', shortLabel: 'സർക്കാർ ഐഡി' },
    'bank-accounts': { label: 'ബാങ്ക് അക്കൗണ്ടുകൾ', shortLabel: 'ബാങ്ക്' },
    'credit-debit-cards': { label: 'ക്രെഡിറ്റ് / ഡെബിറ്റ് കാർഡുകൾ', shortLabel: 'കാർഡുകൾ' },
    'institutional-docs': { label: 'സ്ഥാപന രേഖകൾ', shortLabel: 'സ്ഥാപനം' },
    'vehicle-documents': { label: 'വാഹന രേഖകൾ', shortLabel: 'വാഹനങ്ങൾ' },
    'family-profiles': { label: 'കുടുംബാംഗ പ്രൊഫൈലുകൾ', shortLabel: 'പ്രൊഫൈൽ' },
    passport: { label: 'പാസ്‌പോർട്ട്', shortLabel: 'പാസ്‌പോർട്ട്' },
    'drivers-license': { label: 'ഡ്രൈവിംഗ് ലൈസൻസ്', shortLabel: 'ലൈസൻസ്' },
    insurance: { label: 'ഇൻഷുറൻസ്', shortLabel: 'ഇൻഷുറൻസ്' },
    visa: { label: 'വിസ', shortLabel: 'വിസ' },
    'medical-record': { label: 'വൈദ്യ രേഖ', shortLabel: 'വൈദ്യം' },
    certificate: { label: 'സർട്ടിഫിക്കറ്റ്', shortLabel: 'സർട്ടി.' },
    contract: { label: 'കരാർ', shortLabel: 'കരാർ' },
    warranty: { label: 'വാറന്റി', shortLabel: 'വാറന്റി' },
    membership: { label: 'അംഗത്വം', shortLabel: 'അംഗം' },
    subscription: { label: 'സബ്സ്ക്രിപ്ഷൻ', shortLabel: 'സബ്സ്' },
    permit: { label: 'പെർമിറ്റ്', shortLabel: 'പെർമിറ്റ്' },
    other: { label: 'മറ്റുള്ളവ', shortLabel: 'മറ്റുള്ളവ' },
  },
};

function deepMerge(base, overlay) {
  if (!overlay || typeof overlay !== 'object') return base;
  if (!base || typeof base !== 'object') return overlay;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

for (const loc of ['ta', 'te', 'kn', 'ml']) {
  const categories = {};
  for (const [id, v] of Object.entries(LABELS[loc])) {
    categories[id] = { label: v.label, shortLabel: v.shortLabel };
  }
  const file = path.join(root, 'messages', `${loc}.json`);
  let existing = {};
  if (fs.existsSync(file)) {
    try {
      existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      existing = {};
    }
  }
  const out = deepMerge(existing, { categories });
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log('Merged category labels into messages/' + loc + '.json');
}
