import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const hi = JSON.parse(fs.readFileSync(path.join(root, 'messages', 'hi.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'messages', 'en.json'), 'utf8'));

/** English phrase → Hindi (common vault UI). Untranslated strings stay English. */
const L = {
  Passwords: 'पासवर्ड',
  'Government IDs': 'सरकारी पहचान पत्र',
  'Gov IDs': 'सरकारी आईडी',
  'Bank Accounts': 'बैंक खाते',
  Bank: 'बैंक',
  'Credit / Debit Cards': 'क्रेडिट / डेबिट कार्ड',
  Cards: 'कार्ड',
  'Institutional Documents': 'संस्थागत दस्तावेज़',
  Institutional: 'संस्थागत',
  'Vehicle Documents': 'वाहन दस्तावेज़',
  Vehicles: 'वाहन',
  'Family Member Profiles': 'परिवार सदस्य प्रोफ़ाइल',
  Profiles: 'प्रोफ़ाइल',
  Passport: 'पासपोर्ट',
  'Driver\u2019s License': 'ड्राइविंग लाइसेंस',
  License: 'लाइसेंस',
  Insurance: 'बीमा',
  Visa: 'वीज़ा',
  'Medical Record': 'चिकित्सा रिकॉर्ड',
  Medical: 'चिकित्सा',
  Certificate: 'प्रमाणपत्र',
  Cert: 'प्रमाण',
  Contract: 'अनुबंध',
  Warranty: 'वारंटी',
  Membership: 'सदस्यता',
  Member: 'सदस्य',
  Subscription: 'सदस्यता',
  Subs: 'सब्स',
  Permit: 'परमिट',
  Other: 'अन्य',
  'Website / App': 'वेबसाइट / ऐप',
  'Login URL': 'लॉगिन URL',
  'User ID / Email': 'यूज़र आईडी / ईमेल',
  Password: 'पासवर्ड',
  '2FA / Recovery notes': '2FA / रिकवरी नोट्स',
  'Document Type': 'दस्तावेज़ प्रकार',
  'ID / Document Number': 'आईडी / दस्तावेज़ संख्या',
  'Date of Issue': 'जारी करने की तिथि',
  'Expiry Date': 'समाप्ति तिथि',
  'Issuing Authority': 'जारी करने वाला प्राधिकरण',
  'Address on Document': 'दस्तावेज़ पर पता',
  'Bank Name': 'बैंक का नाम',
  'Account Number': 'खाता संख्या',
  'IFSC / SWIFT Code': 'IFSC / SWIFT कोड',
  'Account Type': 'खाता प्रकार',
  Branch: 'शाखा',
  Nominee: 'नामांकित',
  'Net Banking User ID': 'नेट बैंकिंग यूज़र आईडी',
  'Card Name / Type': 'कार्ड नाम / प्रकार',
  'Last 4 Digits': 'अंतिम 4 अंक',
  'Card Network': 'कार्ड नेटवर्क',
  'Expiry (MM/YYYY)': 'समाप्ति (MM/YYYY)',
  'Credit Limit': 'क्रेडिट सीमा',
  'Billing Cycle Date': 'बिलिंग चक्र तिथि',
  'Customer Care Number': 'ग्राहक सेवा नंबर',
  'Institution / Company': 'संस्थान / कंपनी',
  'Policy / Reference Number': 'पॉलिसी / संदर्भ संख्या',
  'Start / Issue Date': 'प्रारंभ / जारी तिथि',
  'End / Maturity Date': 'समाप्ति / परिपक्वता तिथि',
  'Amount / Sum': 'राशि / योग',
  'Contact / Agent Number': 'संपर्क / एजेंट नंबर',
  'Vehicle Name / Model': 'वाहन नाम / मॉडल',
  'Registration Number': 'पंजीकरण संख्या',
  'Engine Number': 'इंजन संख्या',
  'Chassis Number': 'चेसिस संख्या',
  'Fuel Type': 'ईंधन प्रकार',
  'Insurance Expiry': 'बीमा समाप्ति',
  'PUC / Emission Expiry': 'PUC / उत्सर्जन समाप्ति',
  'Full Name': 'पूरा नाम',
  Relationship: 'रिश्ता',
  'Date of Birth': 'जन्म तिथि',
  'Blood Group': 'रक्त समूह',
  'Emergency Contact': 'आपातकालीन संपर्क',
  'Medical Conditions / Allergies': 'चिकित्सा स्थिति / एलर्जी',
  'Passport Number': 'पासपोर्ट संख्या',
  'Place of Issue': 'जारी करने का स्थान',
  'File Number': 'फ़ाइल संख्या',
  'License Number': 'लाइसेंस संख्या',
  'Vehicle Class': 'वाहन वर्ग',
  Provider: 'प्रदाता',
  'Policy Number': 'पॉलिसी संख्या',
  Type: 'प्रकार',
  'Start Date': 'प्रारंभ तिथि',
  'End Date / Expiry': 'समाप्ति तिथि',
  'Agent / Support Contact': 'एजेंट / सहायता संपर्क',
  Country: 'देश',
  'Visa Type': 'वीज़ा प्रकार',
  'Visa Number': 'वीज़ा संख्या',
  'Issue Date': 'जारी तिथि',
  'Hospital / Clinic': 'अस्पताल / क्लिनिक',
  Doctor: 'डॉक्टर',
  'Record ID': 'रिकॉर्ड आईडी',
  Date: 'तिथि',
  Notes: 'नोट्स',
  'Certificate Name': 'प्रमाणपत्र नाम',
  Issuer: 'जारीकर्ता',
  'Certificate ID': 'प्रमाणपत्र आईडी',
  'Party / Vendor': 'पक्ष / विक्रेता',
  'Contract ID': 'अनुबंध आईडी',
  Product: 'उत्पाद',
  Brand: 'ब्रांड',
  'Serial Number': 'सीरियल नंबर',
  'Purchase Date': 'खरीद तिथि',
  'Warranty Expiry': 'वारंटी समाप्ति',
  Organization: 'संगठन',
  'Member ID': 'सदस्य आईडी',
  Service: 'सेवा',
  Plan: 'योजना',
  'Billing Cycle': 'बिलिंग चक्र',
  'Renewal Date': 'नवीनीकरण तिथि',
  'Account Email': 'खाता ईमेल',
  'Permit Type': 'परमिट प्रकार',
  'Permit Number': 'परमिट संख्या',
  Authority: 'प्राधिकरण',
  'Reference / ID': 'संदर्भ / आईडी',
};

function tr(s) {
  return L[s] ?? s;
}

const cat = {};
for (const [id, v] of Object.entries(en.categories)) {
  cat[id] = {
    label: tr(v.label),
    shortLabel: tr(v.shortLabel),
    fields: {},
  };
  for (const [fk, fv] of Object.entries(v.fields)) {
    cat[id].fields[fk] = tr(fv);
  }
}
hi.categories = cat;
fs.writeFileSync(path.join(root, 'messages', 'hi.json'), JSON.stringify(hi, null, 2));
console.log('Merged Hindi categories into messages/hi.json');
