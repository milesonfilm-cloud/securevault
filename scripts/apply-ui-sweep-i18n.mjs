/**
 * One-off deep-merge of ui-sweep namespaces into messages/*.json
 * Run: node scripts/apply-ui-sweep-i18n.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const messagesDir = join(root, 'messages');

function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  for (const k of Object.keys(source)) {
    const sv = source[k];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      target[k] = deepMerge(target[k] && typeof target[k] === 'object' ? target[k] : {}, sv);
    } else {
      target[k] = sv;
    }
  }
  return target;
}

/** @type {Record<string, Record<string, unknown>>} */
const byLocale = {
  en: {
    documentVault: {
      emergencyBanner:
        '<strong>Emergency mode</strong> — read-only view. Turn off in <link>Emergency settings</link>.',
      folderFilterLabel: 'Folder filter',
      clearFolder: 'Clear folder',
      eyebrowDocuments: 'Documents',
      titleVault: 'Vault',
      headingMeta:
        '<docs>{docCount}</docs> total documents · <members>{memberCount}</members> family members',
      folderMeta:
        'Showing documents in this folder only: <n>{filtered}</n> of <total>{total}</total> total in vault',
      memberFilterLead: 'Showing documents for <name>{name}</name>.',
      showAllMembers: 'Show all members',
      freePlanTitle: 'Free Plan — 1 document per category',
      freePlanBody: 'Upgrade to Pro for unlimited documents in every category.',
      upgrade: 'Upgrade',
      searchPlaceholder: 'Search documents, fields, tags…',
      clearSearchAria: 'Clear search',
      filterAll: 'All',
      noMembersFilterLead: 'No family members yet —',
      addMembersLink: 'add members',
      noMembersFilterTrail: 'to filter by person.',
      clearFilters: 'Clear',
      showingCount: 'Showing {filtered} of {total} documents',
      addDocument: 'Add',
    },
    documents: {
      listEmptyHint:
        'Start adding your documents — IDs, bank accounts, cards, and more — all stored privately on this device.',
      navigateHiddenToast:
        "That document isn’t visible — filters may still be updating. Try again.",
    },
    settingsPanels: {
      vaultOverview: 'Vault Overview',
      vaultOverviewSub: 'Documents stored per category',
      totalDocuments: 'Total Documents',
      familyMembers: 'Family Members',
      tooltipDocs: '{count} documents',
      exportHistory: 'Export History',
      exportHistorySub: 'Last 10 exports from this device',
      noExportsYet: 'No exports yet',
      noExportsHint: 'Your export history will appear here',
      backupFormat: '{format} backup',
      docCountShort: '{count} docs',
      storageTitle: 'Local Storage (IndexedDB)',
      appThisDevice: 'This device',
      biometricTitle: 'Biometric Login',
      biometricSubtitle: 'Fingerprint & Face ID',
      fingerprint: 'Fingerprint',
      faceId: 'Face ID',
      twoFactorHeading: 'Two-factor authentication',
    },
    upgrade: {
      toastActivated: '🎉 Pro activated! Enjoy unlimited access.',
      toastSwitchedFree: 'Switched back to Free plan.',
      activeSubscriptionBadge: 'Active Subscription',
      heroOnPro: "You're on {brand}",
      heroOnProSub: 'All premium features are unlocked. Thank you for supporting the app!',
      upgradeBadge: 'Upgrade to Pro',
      heroUnlock: 'Unlock the full {brand}',
      heroUnlockSub:
        "Everything you need to manage your family's documents — unlimited, secure, and always at hand.",
      planName: 'Strong Vault Pro',
      pricePerYear: '/ year',
      subscriptionNote: 'One-time yearly subscription',
      getProCta: 'Get Pro',
      purchaseNote: 'Purchase securely through Google Play Store',
      proIsActive: 'Pro is Active',
      proActiveSub: 'All features unlocked via Google Play',
      whatsIncluded: "What's included in Pro",
      freeVsPro: 'Free vs Pro',
      tableFeature: 'Feature',
      tableFree: 'Free',
      tablePro: 'Pro',
      getProPlayCta: 'Get Strong Vault Pro on Google Play',
      alreadyPurchased: 'Already purchased?',
      activating: 'Activating…',
      tapActivate: 'Tap here to activate',
      cancelSubscription: 'Cancel subscription / switch to Free',
      compare: {
        docsPerCat: {
          feature: 'Documents per category',
          free: '1',
          pro: 'Unlimited',
        },
        familyProfiles: { feature: 'Family member profiles', free: '✓', pro: '✓' },
        expiryReminders: { feature: 'Expiry reminders', free: 'Basic', pro: 'Smart' },
        gdrive: { feature: 'Google Drive backup', free: '—', pro: '✓' },
        sharing: { feature: 'Secure sharing links', free: '—', pro: '✓' },
        exportVault: { feature: 'Export vault (PDF/JSON)', free: '—', pro: '✓' },
        photos: { feature: 'Photo attachments', free: '—', pro: '✓' },
        aiScan: { feature: 'AI document scan', free: '—', pro: '✓' },
        support: { feature: 'Priority support', free: '—', pro: '✓' },
      },
      features: {
        Infinity: {
          title: 'Unlimited Documents',
          body: 'Store as many documents as you need in every category — no caps.',
        },
        CloudUpload: {
          title: 'Google Drive Backup',
          body: 'Automatically back up your encrypted vault to Google Drive.',
        },
        Share2: {
          title: 'Secure Sharing',
          body: 'Share individual documents via time-limited, encrypted links.',
        },
        Download: {
          title: 'Export Vault',
          body: 'Export your entire vault as an encrypted PDF or JSON bundle.',
        },
        Camera: {
          title: 'Photo Attachments',
          body: 'Attach scanned images and photos directly to any document.',
        },
        Scan: {
          title: 'AI Document Scan',
          body: 'Auto-fill document fields by scanning with your camera using AI.',
        },
        Bell: {
          title: 'Smart Reminders',
          body: 'Get notified before IDs, insurance, and subscriptions expire.',
        },
        HeadphonesIcon: {
          title: 'Priority Support',
          body: 'Reach our team directly for faster help and feature requests.',
        },
      },
    },
    dangerZone: {
      title: 'Danger Zone',
      subtitle: 'Irreversible actions — export a backup first',
      clearDocsTitle: 'Clear All Documents',
      clearDocsBody: 'Remove all documents but keep family member profiles',
      clearDocsButton: 'Clear Docs',
      wipeTitle: 'Wipe Entire Vault',
      wipeBody: 'Delete all data including members, documents, and photos',
      wipeButton: 'Wipe All',
      toastAllCleared: 'All vault data cleared from this device',
      toastClearFailed: 'Failed to clear data',
      toastDocsCleared: 'All documents cleared — member profiles retained',
      toastDocsClearFailed: 'Failed to clear documents',
      confirmClearDocsTitle: 'Clear All Documents',
      confirmClearDocsDescription: 'This action is permanent and cannot be undone.',
      confirmClearDocsButton: 'Clear Documents',
      confirmClearDocsDetail0: 'Deletes every document stored in this vault.',
      confirmClearDocsDetail1: 'Removes all photos attached to those documents from this device.',
      confirmClearDocsDetail2: 'Keeps your family member profiles intact.',
      confirmClearDocsDetail3: 'Keeps your settings, export history, and emergency contact.',
      requiredTypedClear: 'CLEAR',
      confirmWipeTitle: 'Wipe Entire Vault',
      confirmWipeDescription: 'This action is permanent and cannot be undone.',
      confirmWipeButton: 'Wipe Everything',
      confirmWipeDetail0: 'Deletes all family members and their profiles.',
      confirmWipeDetail1: 'Deletes every document and every attached photo.',
      confirmWipeDetail2: 'Clears export history, share links, and emergency contact.',
      confirmWipeDetail3: 'Resets all vault settings and your streak data.',
      confirmWipeDetail4: 'Export a backup first if you might need any of this later.',
      requiredTypedWipe: 'WIPE',
    },
    familyManagement: {
      noMembersTitle: 'No members yet',
    noMembersHint: 'Tap {addLabel} to create your first family profile.',
      removeMemberTitle: 'Remove Family Member',
      removeMemberDescription:
        'Remove {name} and all their documents from the vault? This action cannot be undone.',
      removeMemberConfirm: 'Remove Member',
      emergencyReadOnlyToast: 'Emergency mode — read only.',
      demoProfileToast: 'Sample profile — add your own member to edit.',
      memberUpdatedToast: "{name}'s profile updated",
      memberAddedToast: '{name} added to family vault',
      memberRemovedToast:
        '{name} and {docCount, plural, one {# document} other {# documents}} removed',
    },
    pastelHome: {
      noFieldsRecorded: 'No fields recorded.',
      noDocsForMember: 'No documents yet for this member.',
    },
    memberForm: {
      fullName: 'Full Name',
      relationship: 'Relationship',
      dateOfBirth: 'Date of Birth',
      profileColor: 'Profile Color',
      requiredMark: '*',
    },
    memberCard: {
      profileAdded: 'Profile added',
      lastActivity: 'Last activity',
    },
    photoAttachments: {
      loadingPhotos: 'Loading photos…',
    },
    sharePage: {
      brandStamp: 'Strong Vault',
      viewOnlySubtitle: 'Shared document (view only)',
      openFailed: 'Could not open this shared document.',
    },
    handoverPage: {
      subtitle: 'Emergency handover (read-only)',
      notesLabel: 'Notes:',
    },
    progressPage: {
      addMembersForRings: 'Add family members to see individual rings.',
      complete: 'Complete',
      badges: 'Badges',
      streakCurrent: 'Current',
      streakLongest: 'Longest',
      streakDaysUsed: 'Days used',
    },
    emergencySettingsPage: {
      modeTitle: 'Emergency mode (read-only vault)',
      pdfBundleTitle: 'Emergency PDF bundle',
      handoverTitle: 'Handover link (72h)',
      handoverHint: 'Encrypted snapshot; key in URL fragment.',
    },
    familyWatchCard: {
      vaultWordmark: 'Vault',
    },
  },
};

// --- Localized overlays (merge onto locale files; English pulled from `en` for new namespaces only when same as en) ---

byLocale.hi = {
  documentVault: {
    emergencyBanner:
      '<strong>आपातकालीन मोड</strong> — केवल पढ़ने योग्य दृश्य। <link>आपातकालीन सेटिंग्स</link> में बंद करें।',
    folderFilterLabel: 'फ़ोल्डर फ़िल्टर',
    clearFolder: 'फ़ोल्डर साफ़ करें',
    eyebrowDocuments: 'दस्तावेज़',
    titleVault: 'वॉल्ट',
    headingMeta:
      '<docs>{docCount}</docs> कुल दस्तावेज़ · <members>{memberCount}</members> परिवार के सदस्य',
    folderMeta:
      'इस फ़ोल्डर में केवल दस्तावेज़: <n>{filtered}</n> / वॉल्ट में कुल <total>{total}</total>',
    memberFilterLead: '<name>{name}</name> के दस्तावेज़ दिखा रहे हैं।',
    showAllMembers: 'सभी सदस्य दिखाएँ',
    freePlanTitle: 'फ्री प्लान — प्रति श्रेणी 1 दस्तावेज़',
    freePlanBody: 'हर श्रेणी में असीमित दस्तावेज़ों के लिए Pro में अपग्रेड करें।',
    upgrade: 'अपग्रेड',
    searchPlaceholder: 'दस्तावेज़, फ़ील्ड, टैग खोजें…',
    clearSearchAria: 'खोज साफ़ करें',
    filterAll: 'सभी',
    noMembersFilterLead: 'अभी कोई परिवार सदस्य नहीं —',
    addMembersLink: 'सदस्य जोड़ें',
    noMembersFilterTail: 'व्यक्ति के अनुसार फ़िल्टर करने के लिए।',
    clearFilters: 'साफ़ करें',
    showingCount: '{filtered} में से {total} दस्तावेज़ दिख रहे हैं',
    addDocument: 'जोड़ें',
  },
  documents: {
    listEmptyHint:
      'दस्तावेज़ जोड़ना शुरू करें — ID, बैंक खाते, कार्ड और अधिक — सब कुछ इस डिवाइस पर निजी रूप से संग्रहीत।',
    navigateHiddenToast: 'वह दस्तावेज़ दिखाई नहीं दे रहा — फ़िल्टर अपडेट हो रहे हों। पुनः प्रयास करें।',
  },
  settingsPanels: {
    vaultOverview: 'वॉल्ट अवलोकन',
    vaultOverviewSub: 'श्रेणी के अनुसार संग्रहीत दस्तावेज़',
    totalDocuments: 'कुल दस्तावेज़',
    familyMembers: 'परिवार के सदस्य',
    tooltipDocs: '{count} दस्तावेज़',
    exportHistory: 'निर्यात इतिहास',
    exportHistorySub: 'इस डिवाइस से अंतिम 10 निर्यात',
    noExportsYet: 'अभी कोई निर्यात नहीं',
    noExportsHint: 'आपका निर्यात इतिहास यहाँ दिखेगा',
    backupFormat: '{format} बैकअप',
    docCountShort: '{count} दस्ता.',
    storageTitle: 'स्थानीय संग्रहण (IndexedDB)',
    appThisDevice: 'यह डिवाइस',
    biometricTitle: 'बायोमेट्रिक लॉगिन',
    biometricSubtitle: 'फ़िंगरप्रिंट और फेस आईडी',
    fingerprint: 'फ़िंगरप्रिंट',
    faceId: 'फेस आईडी',
    twoFactorHeading: 'दो-कारक प्रमाणीकरण',
  },
  upgrade: {
    toastActivated: '🎉 Pro सक्रिय! असीमित सुविधाओं का आनंद लें।',
    toastSwitchedFree: 'फ्री प्लान पर वापस।',
    activeSubscriptionBadge: 'सक्रिय सदस्यता',
    heroOnPro: 'आप {brand} पर हैं',
    heroOnProSub: 'सभी प्रीमियम सुविधाएँ अनलॉक हैं। ऐप का समर्थन करने के लिए धन्यवाद!',
    upgradeBadge: 'Pro में अपग्रेड',
    heroUnlock: 'पूर्ण {brand} अनलॉक करें',
    heroUnlockSub:
      'परिवार के दस्तावेज़ों के लिए आपको जो चाहिए — असीमित, सुरक्षित, हमेशा हाथ में।',
    planName: 'Strong Vault Pro',
    pricePerYear: '/ वर्ष',
    subscriptionNote: 'एक वार्षिक सदस्यता',
    getProCta: 'Pro लें',
    purchaseNote: 'Google Play Store से सुरक्षित खरीदारी',
    proIsActive: 'Pro सक्रिय है',
    proActiveSub: 'Google Play के माध्यम से सभी सुविधाएँ अनलॉक',
    whatsIncluded: 'Pro में क्या है',
    freeVsPro: 'फ्री बनाम Pro',
    tableFeature: 'सुविधा',
    tableFree: 'फ्री',
    tablePro: 'Pro',
    getProPlayCta: 'Google Play पर Strong Vault Pro लें',
    alreadyPurchased: 'पहले से खरीदा है?',
    activating: 'सक्रिय हो रहा है…',
    tapActivate: 'सक्रिय करने के लिए यहाँ टैप करें',
    cancelSubscription: 'सदस्यता रद्द / फ्री पर जाएँ',
    compare: {
      docsPerCat: {
        feature: 'प्रति श्रेणी दस्तावेज़',
        free: '1',
        pro: 'असीमित',
      },
      familyProfiles: { feature: 'परिवार सदस्य प्रोफ़ाइल', free: '✓', pro: '✓' },
      expiryReminders: { feature: 'समाप्ति अनुस्मारक', free: 'बेसिक', pro: 'स्मार्ट' },
      gdrive: { feature: 'Google Drive बैकअप', free: '—', pro: '✓' },
      sharing: { feature: 'सुरक्षित शेयर लिंक', free: '—', pro: '✓' },
      exportVault: { feature: 'वॉल्ट निर्यात (PDF/JSON)', free: '—', pro: '✓' },
      photos: { feature: 'फोटो अनुलग्नक', free: '—', pro: '✓' },
      aiScan: { feature: 'AI दस्तावेज़ स्कैन', free: '—', pro: '✓' },
      support: { feature: 'प्राथमिक सहायता', free: '—', pro: '✓' },
    },
    features: {
      Infinity: {
        title: 'असीमित दस्तावेज़',
        body: 'हर श्रेणी में जितने चाहें दस्तावेज़ — कोई सीमा नहीं।',
      },
      CloudUpload: {
        title: 'Google Drive बैकअप',
        body: 'अपने एन्क्रिप्टेड वॉल्ट का स्वतः बैकअप Google Drive पर।',
      },
      Share2: {
        title: 'सुरक्षित साझाकरण',
        body: 'समय-सीमित, एन्क्रिप्टेड लिंक से दस्तावेज़ साझा करें।',
      },
      Download: {
        title: 'वॉल्ट निर्यात',
        body: 'पूरा वॉल्त एन्क्रिप्टेड PDF या JSON के रूप में निर्यात करें।',
      },
      Camera: {
        title: 'फोटो अनुलग्नक',
        body: 'स्कैन की गई छवियाँ और फोटो किसी भी दस्तावेज़ से जोड़ें।',
      },
      Scan: {
        title: 'AI दस्तावेज़ स्कैन',
        body: 'AI के साथ कैमरा स्कैन से फ़ील्ड स्वतः भरें।',
      },
      Bell: {
        title: 'स्मार्ट अनुस्मारक',
        body: 'ID, बीमा और सदस्यता समाप्त होने से पहले सूचना।',
      },
      HeadphonesIcon: {
        title: 'प्राथमिक सहायता',
        body: 'तेज़ सहायता और सुविधा अनुरोधों के लिए सीधे संपर्क।',
      },
    },
  },
  dangerZone: {
    title: 'खतरा क्षेत्र',
    subtitle: 'अपरिवर्तनीय कार्य — पहले बैकअप निर्यात करें',
    clearDocsTitle: 'सभी दस्तावेज़ साफ़ करें',
    clearDocsBody: 'सभी दस्तावेज़ हटाएँ, परिवार प्रोफ़ाइल रखें',
    clearDocsButton: 'दस्तावेज़ साफ़',
    wipeTitle: 'पूरा वॉल्ट मिटाएँ',
    wipeBody: 'सदस्य, दस्तावेज़ और फ़ोटो सहित सभी डेटा हटाएँ',
    wipeButton: 'सब मिटाएँ',
    toastAllCleared: 'इस डिवाइस से सारा वॉल्ट डेटा साफ़',
    toastClearFailed: 'डेटा साफ़ करने में विफल',
    toastDocsCleared: 'सभी दस्तावेज़ साफ़ — सदस्य प्रोफ़ाइल सुरक्षित',
    toastDocsClearFailed: 'दस्तावेज़ साफ़ करने में विफल',
    confirmClearDocsTitle: 'सभी दस्तावेज़ साफ़ करें',
    confirmClearDocsDescription: 'यह स्थायी है और पूर्ववत नहीं किया जा सकता।',
    confirmClearDocsButton: 'दस्तावेज़ साफ़ करें',
    confirmClearDocsDetail0: 'इस वॉल्ट में हर दस्तावेज़ हटाता है।',
    confirmClearDocsDetail1: 'उन दस्तावेज़ों से जुड़े सभी फ़ोटो इस डिवाइस से हटाता है।',
    confirmClearDocsDetail2: 'परिवार सदस्य प्रोफ़ाइल बनाए रखता है।',
    confirmClearDocsDetail3: 'सेटिंग्स, निर्यात इतिहास और आपात संपर्क रखता है।',
    requiredTypedClear: 'CLEAR',
    confirmWipeTitle: 'पूरा वॉल्ट मिटाएँ',
    confirmWipeDescription: 'यह स्थायी है और पूर्ववत नहीं किया जा सकता।',
    confirmWipeButton: 'सब कुछ मिटाएँ',
    confirmWipeDetail0: 'सभी परिवार सदस्य और प्रोफ़ाइल हटाता है।',
    confirmWipeDetail1: 'हर दस्तावेज़ और अनुलग्नक फ़ोटो हटाता है।',
    confirmWipeDetail2: 'निर्यात इतिहास, शेयर लिंक और आपात संपर्क साफ़ करता है।',
    confirmWipeDetail3: 'सभी वॉल्ट सेटिंग्स और स्ट्रीक डेटा रीसेट।',
    confirmWipeDetail4: 'बाद में ज़रूरत हो तो पहले बैकअप निर्यात करें।',
    requiredTypedWipe: 'WIPE',
  },
  familyManagement: {
    noMembersTitle: 'अभी कोई सदस्य नहीं',
    noMembersHint: 'अपनी पहली पारिवारिक प्रोफ़ाइल बनाने के लिए {addLabel} पर टैप करें।',
    removeMemberTitle: 'परिवार सदस्य हटाएँ',
    removeMemberDescription:
      '{name} और उनके सभी दस्तावेज़ वॉल्ट से हटाएँ? यह पूर्ववत नहीं हो सकता।',
    removeMemberConfirm: 'सदस्य हटाएँ',
    emergencyReadOnlyToast: 'आपातकालीन मोड — केवल पढ़ना।',
    demoProfileToast: 'नमूना प्रोफ़ाइल — संपादन के लिए अपना सदस्य जोड़ें।',
    memberUpdatedToast: '{name} की प्रोफ़ाइल अपडेट',
    memberAddedToast: '{name} पारिवारिक वॉल्ट में जोड़ा गया',
    memberRemovedToast:
      '{name} और {docCount, plural, one {# दस्तावेज़} other {# दस्तावेज़}} हटाए गए',
  },
  pastelHome: {
    noFieldsRecorded: 'कोई फ़ील्ड दर्ज नहीं।',
    noDocsForMember: 'इस सदस्य के लिए अभी कोई दस्तावेज़ नहीं।',
  },
  memberForm: {
    fullName: 'पूरा नाम',
    relationship: 'रिश्ता',
    dateOfBirth: 'जन्म तिथि',
    profileColor: 'प्रोफ़ाइल रंग',
    requiredMark: '*',
  },
  memberCard: {
    profileAdded: 'प्रोफ़ाइल जोड़ी गई',
    lastActivity: 'अंतिम गतिविधि',
  },
  photoAttachments: {
    loadingPhotos: 'फ़ोटो लोड हो रहे हैं…',
  },
  sharePage: {
    brandStamp: 'Strong Vault',
    viewOnlySubtitle: 'साझा दस्तावेज़ (केवल देखें)',
    openFailed: 'यह साझा दस्तावेज़ नहीं खोला जा सका।',
  },
  handoverPage: {
    subtitle: 'आपातकालीन हैंडओवर (केवल पढ़ना)',
    notesLabel: 'नोट्स:',
  },
  progressPage: {
    addMembersForRings: 'व्यक्तिगत रिंग देखने के लिए सदस्य जोड़ें।',
    complete: 'पूर्ण',
    badges: 'बैज',
    streakCurrent: 'वर्तमान',
    streakLongest: 'सबसे लंबा',
    streakDaysUsed: 'उपयोग के दिन',
  },
  emergencySettingsPage: {
    modeTitle: 'आपातकालीन मोड (केवल पढ़ने योग्य वॉल्ट)',
    pdfBundleTitle: 'आपातकालीन PDF बंडल',
    handoverTitle: 'हैंडओवर लिंक (72 घंटे)',
    handoverHint: 'एन्क्रिप्टेड स्नैपशॉट; कुंजी URL खंड में।',
  },
  familyWatchCard: {
    vaultWordmark: 'वॉल्ट',
  },
};

// Kannada
byLocale.kn = {
  documentVault: {
    emergencyBanner:
      '<strong>ಅತ್ಯಾಹಾರ ಮೋಡ್</strong> — ಓದ-only ನೋಟ. <link>ಅತ್ಯಾಹಾರ ಸೆಟ್ಟಿಂಗ್‌ಗಳು</link> ನಲ್ಲಿ ಆಫ್ ಮಾಡಿ.',
    folderFilterLabel: 'ಫೋಲ್ಡರ್ ಫಿಲ್ಟರ್',
    clearFolder: 'ಫೋಲ್ಡರ್ ತೆರವು',
    eyebrowDocuments: 'ದಾಖಲೆಗಳು',
    titleVault: 'ತಿಜೋರಿ',
    headingMeta:
      '<docs>{docCount}</docs> ಒಟ್ಟು ದಾಖಲೆಗಳು · <members>{memberCount}</members> ಕುಟುಂಬ ಸದಸ್ಯರು',
    folderMeta:
      'ಈ ಫೋಲ್ಡರ್‌ನಲ್ಲಿ ಮಾತ್ರ: <n>{filtered}</n> / ಒಟ್ಟು <total>{total}</total>',
    memberFilterLead: '<name>{name}</name> ರ ದಾಖಲೆಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
    showAllMembers: 'ಎಲ್ಲಾ ಸದಸ್ಯರು ತೋರಿಸಿ',
    freePlanTitle: 'ಉಚಿತ ಯೋಜನೆ — ಪ್ರತಿ ವರ್ಗಕ್ಕೆ 1 ದಾಖಲೆ',
    freePlanBody: 'ಪ್ರತಿ ವರ್ಗದಲ್ಲಿ ಅನಿಯಮಿತ ದಾಖಲೆಗಳಿಗೆ Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್.',
    upgrade: 'ಅಪ್‌ಗ್ರೇಡ್',
    searchPlaceholder: 'ದಾಖಲೆಗಳು, ಫೀಲ್ಡ್‌ಗಳು, ಟ್ಯಾಗ್‌ಗಳನ್ನು ಹುಡುಕಿ…',
    clearSearchAria: 'ಹುಡುಕಾಟ ತೆರವು',
    filterAll: 'ಎಲ್ಲా',
    noMembersFilterLead: 'ಇನ್ನೂ ಕುಟುಂಬ ಸದಸ್ಯರಿಲ್ಲ —',
    addMembersLink: 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
    noMembersFilterTail: 'ವ್ಯಕ್ತಿಯಂತೆ ಫಿಲ್ಟರ್ ಮಾಡಲು.',
    clearFilters: 'ತೆರವು',
    showingCount: '{total} ರಲ್ಲಿ {filtered} ದಾಖಲೆಗಳು',
    addDocument: 'ಸೇರಿಸಿ',
  },
  documents: {
    listEmptyHint:
      'ದಾಖಲೆಗಳನ್ನು ಸೇರಿಸಲು ಪ್ರಾರಂಭಿಸಿ — ID, ಬ್ಯಾಂಕ್ ಖಾತೆಗಳು, ಕಾರ್ಡ್‌ಗಳು ಇನ್ನಷ್ಟು — ಇದೆ ಸಾಧನದಲ್ಲಿ ಖಾಸಗಿಯಾಗಿ.',
    navigateHiddenToast: 'ಆ ದಾಖಲೆ ಕಾಣುತ್ತಿಲ್ಲ — ಫಿಲ್ಟರ್‌ಗಳು ನವೀಕರಣಗೊಳ್ಳುತ್ತಿರಬಹುದು. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
  },
  settingsPanels: {
    vaultOverview: 'ವಾಲ್ಟ್ ಅವಲೋಕನ',
    vaultOverviewSub: 'ವರ್ಗವಾರು ಸಂಗ್ರಹಿತ ದಾಖಲೆಗಳು',
    totalDocuments: 'ಒಟ್ಟು ದಾಖಲೆಗಳು',
    familyMembers: 'ಕುಟುಂಬ ಸದಸ್ಯರು',
    tooltipDocs: '{count} ದಾಖಲೆಗಳು',
    exportHistory: 'ರಫ್ತು ಇತಿಹಾಸ',
    exportHistorySub: 'ಈ ಸಾಧನದಿಂದ ಕೊನೆಯ 10 ರಫ್ತುಗಳು',
    noExportsYet: 'ಇನ್ನೂ ರಫ್ತು ಇಲ್ಲ',
    noExportsHint: 'ನಿಮ್ಮ ರಫ್ತು ಇತಿಹಾಸ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ',
    backupFormat: '{format} ಬ್ಯಾಕಪ್',
    docCountShort: '{count} ದಾಖ.',
    storageTitle: 'ಸ್ಥಾಮಿಕ ಸಂಗ್ರಹಣೆ (IndexedDB)',
    appThisDevice: 'ಈ ಸಾಧನ',
    biometricTitle: 'ಬಯೋಮೆಟ್ರಿಕ್ ಲಾಗಿನ್',
    biometricSubtitle: 'ಫಿಂಗರ್‌ಪ್ರಿಂಟ್ ಮತ್ತು ಫೇಸ್ ಐಡಿ',
    fingerprint: 'ಫಿಂಗರ್‌ಪ್ರಿಂಟ್',
    faceId: 'ಫೇಸ್ ಐಡಿ',
    twoFactorHeading: 'ಎರಡು-ಹಂತದ ದೃಢೀಕರಣ',
  },
  upgrade: {
    toastActivated: '🎉 Pro ಸಕ್ರಿಯ! ಅನಿಯಮಿತ ಪ್ರವೇಶ.',
    toastSwitchedFree: 'ಉಚಿತ ಯೋಜನೆಗೆ ಮರಳಿದೆ.',
    activeSubscriptionBadge: 'ಸಕ್ರಿಯ ಚಂದಾದಾರಿಕೆ',
    heroOnPro: 'ನೀವು {brand} ನಲ್ಲಿ ಇದ್ದೀರಿ',
    heroOnProSub: 'ಎಲ್ಲಾ ಪ್ರೀಮಿಯಂ ವೈಶಿಷ್ಟ್ಯಗಳು ಅನ್ಲಾಕ್. ಧನ್ಯವಾದಗಳು!',
    upgradeBadge: 'Pro ಗೆ ಅಪ್‌ಗ್ರೇಡ್',
    heroUnlock: 'ಪೂರ್ಣ {brand} ಅನ್ಲಾಕ್',
    heroUnlockSub:
      'ಕುಟುಂಬ ದಾಖಲೆಗಳಿಗೆ ಬೇಕಾದುದೆಲ್ಲ — ಅನಿಯಮಿತ, ಸುರಕ್ಷಿತ, ಯಾವಾಗಲೂ ಹತ್ತಿರ.',
    planName: 'Strong Vault Pro',
    pricePerYear: '/ ವರ್ಷ',
    subscriptionNote: 'ವಾರ್ಷಿಕ ಚಂದಾದಾರಿಕೆ',
    getProCta: 'Pro ಪಡೆಯಿರಿ',
    purchaseNote: 'Google Play ಮೂಲಕ ಸುರಕ್ಷಿತ ಖರೀದಿ',
    proIsActive: 'Pro ಸಕ್ರಿಯ',
    proActiveSub: 'Google Play ಮೂಲಕ ಎಲ್ಲಾ ವೈಶಿಷ್ಟ್ಯಗಳು',
    whatsIncluded: 'Pro ನಲ್ಲಿ ಏನಿದೆ',
    freeVsPro: 'ಉಚಿತ vs Pro',
    tableFeature: 'ವೈಶಿಷ್ಟ್ಯ',
    tableFree: 'ಉಚಿತ',
    tablePro: 'Pro',
    getProPlayCta: 'Google Play ನಲ್ಲಿ Strong Vault Pro',
    alreadyPurchased: 'ಈಗಾಗಲೇ ಖರೀದಿಸಿದ್ದೀರಾ?',
    activating: 'ಸಕ್ರಿಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ…',
    tapActivate: 'ಸಕ್ರಿಯಗೊಳಿಸಲು ಇಲ್ಲಿ ಟ್ಯಾಪ್',
    cancelSubscription: 'ರದ್ದು / ಉಚಿತಕ್ಕೆ',
    compare: {
      docsPerCat: { feature: 'ವರ್ಗಕ್ಕೆ ದಾಖಲೆಗಳು', free: '1', pro: 'ಅನಿಯಮಿತ' },
      familyProfiles: { feature: 'ಕುಟುಂಬ ಪ್ರೊಫೈಲ್‌ಗಳು', free: '✓', pro: '✓' },
      expiryReminders: { feature: 'ಮುಕ್ತಾಯ ಜ್ಞಾಪನೆಗಳು', free: 'ಮೂಲ', pro: 'ಸ್ಮಾರ್ಟ್' },
      gdrive: { feature: 'Google Drive ಬ್ಯಾಕಪ್', free: '—', pro: '✓' },
      sharing: { feature: 'ಸುರಕ್ಷಿತ ಹಂಚಿಕೆ ಲಿಂಕ್‌ಗಳು', free: '—', pro: '✓' },
      exportVault: { feature: 'ವಾಲ್ಟ್ ರಫ್ತು (PDF/JSON)', free: '—', pro: '✓' },
      photos: { feature: 'ಫೋಟೊ ಲಗತ್ತುಗಳು', free: '—', pro: '✓' },
      aiScan: { feature: 'AI ದಾಖಲೆ ಸ್ಕ್ಯಾನ್', free: '—', pro: '✓' },
      support: { feature: 'ಆದ್ಯತೆಯ ಬೆಂಬಲ', free: '—', pro: '✓' },
    },
    features: {
      Infinity: {
        title: 'ಅನಿಯಮಿತ ದಾಖಲೆಗಳು',
        body: 'ಪ್ರತಿ ವರ್ಗದಲ್ಲಿ ಎಷ್ಟು ಬೇಕೋ ಅಷ್ಟು — ಮಿತಿ ಇಲ್ಲ.',
      },
      CloudUpload: {
        title: 'Google Drive ಬ್ಯಾಕಪ್',
        body: 'ನಿಮ್ಮ ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ವಾಲ್ಟ್ ಸ್ವಯಂಚಾಲಿತ ಬ್ಯಾಕಪ್.',
      },
      Share2: {
        title: 'ಸುರಕ್ಷಿತ ಹಂಚಿಕೆ',
        body: 'ಕಾಲಾವಧಿ ಲಿಂಕ್‌ಗಳ ಮೂಲಕ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿ.',
      },
      Download: {
        title: 'ವಾಲ್ಟ್ ರಫ್ತು',
        body: 'ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ PDF ಅಥವಾ JSON ಆಗಿ ರಫ್ತು.',
      },
      Camera: {
        title: 'ಫೋಟೊ ಲಗತ್ತುಗಳು',
        body: 'ಯಾವುದೇ ದಾಖಲೆಗೆ ಫೋಟೊ ಲಗತ್ತಿಸಿ.',
      },
      Scan: {
        title: 'AI ದಾಖಲೆ ಸ್ಕ್ಯಾನ್',
        body: 'ಕ್ಯಾಮೆರಾ + AI ಯೊಂದಿಗೆ ಫೀಲ್ಡ್‌ಗಳನ್ನು ತುಂಬಿ.',
      },
      Bell: {
        title: 'ಸ್ಮಾರ್ಟ್ ಜ್ಞಾಪನೆಗಳು',
        body: 'ID, ವಿಮಾಮುಕ್ತಾಯ, ಚಂದಾ ಮೊದಲಾದವುಗಳ ಮುನ್ನೆಚ್ಚರಿಕೆ.',
      },
      HeadphonesIcon: {
        title: 'ಆದ್ಯತೆಯ ಬೆಂಬಲ',
        body: 'ವೇಗದ ಸಹಾಯ ಮತ್ತು ವಿನಂತಿಗಳು.',
      },
    },
  },
  dangerZone: {
    title: 'ಅಪಾಯ ಪ್ರದೇಶ',
    subtitle: 'ಪರಿವರ್ತಿಸಲಾಗದ ಕ್ರಿಯೆಗಳು — ಮೊದಲು ಬ್ಯಾಕಪ್',
    clearDocsTitle: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ತೆರವು',
    clearDocsBody: 'ದಾಖಲೆಗಳನ್ನು ತೆರವು, ಪ್ರೊಫೈಲ್ ಇಡಿ',
    clearDocsButton: 'ದಾಖಲೆ ತೆರವು',
    wipeTitle: 'ಎಲ್ಲಾ ವಾಲ್ಟ್ ಅಳಿಸಿ',
    wipeBody: 'ಸದಸ್ಯರು, ದಾಖಲೆಗಳು, ಫೋಟೊಗಳು ಒಳಗೊಂಡ ಎಲ್ಲಾ ಡೇಟಾ',
    wipeButton: 'ಎಲ್ಲಾ ಅಳಿಸಿ',
    toastAllCleared: 'ಈ ಸಾಧನದಿಂದ ಎಲ್ಲಾ ವಾಲ್ಟ್ ಡೇಟಾ ತೆರವು',
    toastClearFailed: 'ತೆರವು ವಿಫಲ',
    toastDocsCleared: 'ದಾಖಲೆಗಳು ತೆರವು — ಪ್ರೊಫೈಲ್ ಉಳಿದಿದೆ',
    toastDocsClearFailed: 'ದಾಖಲೆ ತೆರವು ವಿಫಲ',
    confirmClearDocsTitle: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ತೆರವು',
    confirmClearDocsDescription: 'ಶಾಶ್ವತ, ಹಿಂದಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ.',
    confirmClearDocsButton: 'ದಾಖಲೆಗಳನ್ನು ತೆರವು',
    confirmClearDocsDetail0: 'ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ಅಳಿಸುತ್ತದೆ.',
    confirmClearDocsDetail1: 'ಲಗತ್ತು ಫೋಟೊಗಳನ್ನು ಈ ಸಾಧನದಿಂದ ಅಳಿಸುತ್ತದೆ.',
    confirmClearDocsDetail2: 'ಕುಟುಂಬ ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ಉಳಿಸುತ್ತದೆ.',
    confirmClearDocsDetail3: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು, ರಫ್ತು ಇತಿಹಾಸ, ತುರ್ತು ಸಂಪರ್ಕ ಉಳಿಸುತ್ತದೆ.',
    requiredTypedClear: 'CLEAR',
    confirmWipeTitle: 'ಎಲ್ಲಾ ವಾಲ್ಟ್ ಅಳಿಸಿ',
    confirmWipeDescription: 'ಶಾಶ್ವತ, ಹಿಂದಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ.',
    confirmWipeButton: 'ಎಲ್ಲಾ ಅಳಿಸಿ',
    confirmWipeDetail0: 'ಎಲ್ಲಾ ಸದಸ್ಯರು ಮತ್ತು ಪ್ರೊಫೈಲ್ ಅಳಿಸುತ್ತದೆ.',
    confirmWipeDetail1: 'ಪ್ರತಿ ದಾಖಲೆ ಮತ್ತು ಫೋಟೊ ಅಳಿಸುತ್ತದೆ.',
    confirmWipeDetail2: 'ರಫ್ತು, ಶೇರ್ ಲಿಂಕ್‌ಗಳು, ತುರ್ತು ಸಂಪರ್ಕ ತೆರವು.',
    confirmWipeDetail3: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಮತ್ತು ಸ್ಟ್ರೀಕ್ ರೀಸೆಟ್.',
    confirmWipeDetail4: 'ಬೇಕಾದರೆ ಮೊದಲು ಬ್ಯಾಕಪ್.',
    requiredTypedWipe: 'WIPE',
  },
  familyManagement: {
    noMembersTitle: 'ಇನ್ನೂ ಸದಸ್ಯರಿಲ್ಲ',
    noMembersHint: 'ಮೊದಲ ಪ್ರೊಫೈಲ್‌ಗೆ {addLabel} ಟ್ಯಾಪ್ ಮಾಡಿ.',
    removeMemberTitle: 'ಸದಸ್ಯನನ್ನು ತೆಗೆದುಹಾಕಿ',
    removeMemberDescription:
      '{name} ಮತ್ತು ಅವರ ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕುವುದೇ? ಇದು ಹಿಂದಿರುಗಿಸಲಾಗುವುದಿಲ್ಲ.',
    removeMemberConfirm: 'ಸದಸ್ಯ ತೆಗೆ',
    emergencyReadOnlyToast: 'ಅತ್ಯಾಹಾರ ಮೋಡ್ — ಓದು ಮಾತ್ರ.',
    demoProfileToast: 'ನಮೂನೆ ಪ್ರೊಫೈಲ್ — ಸಂಪಾದನೆಗೆ ನಿಮ್ಮ ಸದಸ್ಯ ಸೇರಿಸಿ.',
    memberUpdatedToast: '{name} ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ',
    memberAddedToast: '{name} ಕುಟುಂಬ ವಾಲ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ',
    memberRemovedToast:
      '{name} ಮತ್ತು {docCount, plural, one {# ದಾಖಲೆ} other {# ದಾಖಲೆಗಳು}} ತೆಗೆದುಹಾಕಲಾಗಿದೆ',
  },
  pastelHome: {
    noFieldsRecorded: 'ಯಾವುದೇ ಫೀಲ್ಡ್‌ಗಳಿಲ್ಲ.',
    noDocsForMember: 'ಈ ಸದಸ್ಯರಿಗೆ ಇನ್ನೂ ದಾಖಲೆಗಳಿಲ್ಲ.',
  },
  memberForm: {
    fullName: 'ಪೂರ್ಣ ಹೆಸರು',
    relationship: 'ಬಾಂಧವ್ಯ',
    dateOfBirth: 'ಜನ্ম ದಿನಾಂಕ',
    profileColor: 'ಪ್ರೊಫೈಲ್ ಬಣ್ಣ',
    requiredMark: '*',
  },
  memberCard: {
    profileAdded: 'ಪ್ರೊಫೈಲ್ ಸೇರಿಸಲಾಗಿದೆ',
    lastActivity: 'ಕೊನೆಯ ಚಟುವಟಿಕೆ',
  },
  photoAttachments: {
    loadingPhotos: 'ಫೋಟೊಗಳನ್ನು ಲೋಡ್…',
  },
  sharePage: {
    brandStamp: 'Strong Vault',
    viewOnlySubtitle: 'ಹಂಚಿದ ದಾಖಲೆ (ನೋಡು ಮಾತ್ರ)',
    openFailed: 'ಈ ಹಂಚಿದ ದಾಖಲೆ ತೆರೆಯಲಾಗಲಿಲ್ಲ.',
  },
  handoverPage: {
    subtitle: 'ತುರ್ತು ಹ್ಯಾಂಡ್ಓವರ್ (ಓದು ಮಾತ್ರ)',
    notesLabel: 'ಟಿಪ್ಪಣಿಗಳು:',
  },
  progressPage: {
    addMembersForRings: 'ವ್ಯಕ್ತಿಗತ ಉಂಗುರಗಳಿಗೆ ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ.',
    complete: 'ಪೂರ್ಣ',
    badges: 'ಬೆಡ್ಜ್‌ಗಳು',
    streakCurrent: 'ಪ್ರಸ್ತುತ',
    streakLongest: 'ಅತಿ ಉದ್ದ',
    streakDaysUsed: 'ಬಳಸಿದ ದಿನಗಳು',
  },
  emergencySettingsPage: {
    modeTitle: 'ತುರ್ತು ಮೋಡ್ (ಓದ-only ವಾಲ್ಟ್)',
    pdfBundleTitle: 'ತುರ್ತು PDF ಬಂಡಲ್ ಹ್ಯಾಂಡ್ಓವರ್ ಲಿಂಕ್ (72ಗಂ)',
    handoverTitle: 'ಹ್ಯಾಂಡ್ಓವರ್ ಲಿಂಕ್ (72ಗಂ)',
    handoverHint: 'ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್; ಕೀ URL ತುಣುಕಿನಲ್ಲಿ.',
  },
  familyWatchCard: { vaultWordmark: 'ವಾಲ್ಟ್' },
};

// Fix duplicate handoverTitle in kn emergency - I merged wrong. Read kn emergency block:
// modeTitle, pdfBundleTitle, handoverTitle, handoverHint - fix pdf line

byLocale.kn.emergencySettingsPage = {
  modeTitle: 'ತುರ್ತು ಮೋಡ್ (ಓದ-only ವಾಲ್ಟ್)',
  pdfBundleTitle: 'ತುರ್ತು PDF ಬಂಡಲ್',
  handoverTitle: 'ಹ್ಯಾಂಡ್ಓವರ್ ಲಿಂಕ್ (72ಗಂ)',
  handoverHint: 'ಎನ್‌ಕ್ರಿಪ್ಟೆಡ್ ಸ್ನ್ಯಾಪ್‌ಶಾಟ್; ಕೀ URL ತುಣುಕಿನಲ್ಲಿ.',
};

// Tamil - abbreviated, key parity with en
byLocale.ta = {
  documentVault: {
    emergencyBanner:
      '<strong>அவசர பயன்முறை</strong> — வெறும் படிப்பு. <link>அவசர அமைப்புகள்</link> இல் முடக்கவும்.',
    folderFilterLabel: 'கோப்புறை வடிப்பான்',
    clearFolder: 'கோப்புறையை அழி',
    eyebrowDocuments: 'ஆவணங்கள்',
    titleVault: 'வால்ட்',
    headingMeta:
      '<docs>{docCount}</docs> மொத்த ஆவணங்கள் · <members>{memberCount}</members> குடும்ப உறுப்பினர்கள்',
    folderMeta:
      'இந்த கோப்புறையில் மட்டும்: <n>{filtered}</n> / மொத்த <total>{total}</total>',
    memberFilterLead: '<name>{name}</name> இன் ஆவணங்கள் காட்டப்படுகின்றன.',
    showAllMembers: 'அனைத்து உறுப்பினர்களையும் காட்டு',
    freePlanTitle: 'இலவச திட்டம் — வகைக்கு 1 ஆவணம்',
    freePlanBody: 'எல்லா வகைகளிலும் வரம்பற்றதற்கு Pro.',
    upgrade: 'மேம்படுத்து',
    searchPlaceholder: 'ஆவணங்கள், புலங்கள், குறிச்சொற்கள்…',
    clearSearchAria: 'தேடலை அழி',
    filterAll: 'அனைத்தும்',
    noMembersFilterLead: 'குடும்ப உறுப்பினர்கள் இல்லை —',
    addMembersLink: 'உறுப்பினர்களைச் சேர்',
    noMembersFilterTail: 'நபரால் வடிகட்ட.',
    clearFilters: 'அழி',
    showingCount: '{total} இல் {filtered} ஆவணங்கள்',
    addDocument: 'சேர்',
  },
  documents: {
    listEmptyHint:
      'அடையாளங்கள், வங்கி, கார்டுகள் போன்றவற்றைச் சேர் — இச்சாதனத்தில் தனிப்பட்டமாக.',
    navigateHiddenToast: 'ஆவணம் தெரியவில்லை — வடிப்பான்கள் புதுப்பாடுகின்றன. மீண்டும் முயல்க.',
  },
  settingsPanels: {
    vaultOverview: 'வால்ட் கண்ணோட்டம்',
    vaultOverviewSub: 'வகைவாரியாக சேமிப்பு',
    totalDocuments: 'மொத்த ஆவணங்கள்',
    familyMembers: 'குடும்ப உறுப்பினர்கள்',
    tooltipDocs: '{count} ஆவணங்கள்',
    exportHistory: 'ஏற்றுமதி வரலாறு',
    exportHistorySub: 'சமீபத்திய 10 ஏற்றுமதிகள்',
    noExportsYet: 'ஏற்றுமதி இல்லை',
    noExportsHint: 'வரலாறு இங்கே தோன்றும்',
    backupFormat: '{format} காப்பு',
    docCountShort: '{count} ஆவ.',
    storageTitle: 'உள்ளமை சேமிப்பு (IndexedDB)',
    appThisDevice: 'இச்சாதனம்',
    biometricTitle: 'உயிரியல் உள்நுழைவு',
    biometricSubtitle: 'விரல்முத்திரை மற்றும் முக ID',
    fingerprint: 'விரல்முத்திரை',
    faceId: 'முக ID',
    twoFactorHeading: 'இரு-காரணி அங்கீகாரம்',
  },
  upgrade: {
    toastActivated: '🎉 Pro செயலில்! வரம்பற்ற அம்சங்கள்.',
    toastSwitchedFree: 'இலவச திட்டத்திற்குத் திரும்பியது.',
    activeSubscriptionBadge: 'செயலில் சந்தா',
    heroOnPro: 'நீங்கள் {brand}',
    heroOnProSub: 'அனைத்து பிரீமியம் திறக்கப்பட்டன. நன்றி!',
    upgradeBadge: 'Pro க்கு மேம்படுத்து',
    heroUnlock: 'முழு {brand} திற',
    heroUnlockSub:
      'குடும்ப ஆவணங்களை நிர்வகிக்க — வரம்பற்ற, பாதுகாப்பான.',
    planName: 'Strong Vault Pro',
    pricePerYear: '/ ஆண்டு',
    subscriptionNote: 'ஆண்டு சந்தா',
    getProCta: 'Pro பெறு',
    purchaseNote: 'Google Play வழி கொள்முதல்',
    proIsActive: 'Pro செயலில்',
    proActiveSub: 'Google Play வழி அனைத்தும் திறந்தது',
    whatsIncluded: 'Pro இல் என்ன',
    freeVsPro: 'இலவசம் vs Pro',
    tableFeature: 'அம்சம்',
    tableFree: 'இலவசம்',
    tablePro: 'Pro',
    getProPlayCta: 'Google Play இல் Strong Vault Pro',
    alreadyPurchased: 'ஏற்கனவே வாங்கினீர்களா?',
    activating: 'செயலாக்குகிறது…',
    tapActivate: 'செயலாக்க இங்கே தட்டு',
    cancelSubscription: 'ரத்து / இலவசம்',
    compare: {
      docsPerCat: { feature: 'வகைக்கு ஆவணங்கள்', free: '1', pro: 'வரம்பற்ற' },
      familyProfiles: { feature: 'குடும்ப சுயவிவரங்கள்', free: '✓', pro: '✓' },
      expiryReminders: { feature: 'காலாவதி நினைவூட்டல்கள்', free: 'அடிப்படை', pro: 'சாமார்ட்' },
      gdrive: { feature: 'Google Drive காப்பு', free: '—', pro: '✓' },
      sharing: { feature: 'பாதுகாப்பான இணைப்புகள்', free: '—', pro: '✓' },
      exportVault: { feature: 'வால்ட் ஏற்றுமதி (PDF/JSON)', free: '—', pro: '✓' },
      photos: { feature: 'புகைப்பட இணைப்புகள்', free: '—', pro: '✓' },
      aiScan: { feature: 'AI ஆவண ஸ்கேன்', free: '—', pro: '✓' },
      support: { feature: 'முன்னுரிமை ஆதரவு', free: '—', pro: '✓' },
    },
    features: {
      Infinity: {
        title: 'வரம்பற்ற ஆவணங்கள்',
        body: 'ஒவ்வொரு வகையிலும் வரம்பின்றி.',
      },
      CloudUpload: {
        title: 'Google Drive காப்பு',
        body: 'என்கிரிப்டு வால்ட் தானியங்கி காப்பு.',
      },
      Share2: {
        title: 'பாதுகாப்பான பகிர்வு',
        body: 'கால வரையறுக்கப்பட்ட இணைப்புகள்.',
      },
      Download: {
        title: 'வால்ட் ஏற்றுமதி',
        body: 'PDF அல்லது JSON தொகுப்பு.',
      },
      Camera: { title: 'புகைப்பட இணைப்புகள்', body: 'புகைப்படங்களை இணைக்கவும்.' },
      Scan: { title: 'AI ஸ்கேன்', body: 'கேமராவுடன் புலங்கள் நிரப்பு.' },
      Bell: { title: 'சாமார்ட் நினைவூட்டல்கள்', body: 'காலாவதிக்கு முன் அறிவிப்பு.' },
      HeadphonesIcon: {
        title: 'முன்னுரிமை ஆதரவு',
        body: 'விரைவு உதவி.',
      },
    },
  },
  dangerZone: {
    title: 'ஆபத்து மண்டலம்',
    subtitle: 'திரும்ப முடியாதவை — முதலில் காப்பு',
    clearDocsTitle: 'அனைத்து ஆவணங்களையும் அழி',
    clearDocsBody: 'ஆவணங்கள் அழி; சுயவிவரங்கள் வை',
    clearDocsButton: 'ஆவணங்கள் அழி',
    wipeTitle: 'முழு வால்ட் அழி',
    wipeBody: 'உறுப்பினர்கள், ஆவணங்கள், புகைப்படங்கள் அனைத்தும்',
    wipeButton: 'எல்லாம் அழி',
    toastAllCleared: 'சாதனத்தில் எல்லாம் அழிக்கப்பட்டது',
    toastClearFailed: 'அழிப்பு தோல்வி',
    toastDocsCleared: 'ஆவணங்கள் அழி — சுயவிவரங்கள் நிலைத்தன',
    toastDocsClearFailed: 'ஆவண அழிப்பு தோல்வி',
    confirmClearDocsTitle: 'அனைத்து ஆவணங்களையும் அழி',
    confirmClearDocsDescription: 'இது நிரந்தரமானது.',
    confirmClearDocsButton: 'ஆவணங்கள் அழி',
    confirmClearDocsDetail0: 'எல்லா ஆவணங்களையும் நீக்குகிறது.',
    confirmClearDocsDetail1: 'இணைப்பு புகைப்படங்களை நீக்குகிறது.',
    confirmClearDocsDetail2: 'குடும்ப சுயவிவரங்களை வைத்திருக்கிறது.',
    confirmClearDocsDetail3: 'அமைப்புகள், ஏற்றுமதி, அவசர தொடர்பு வைத்திருக்கிறது.',
    requiredTypedClear: 'CLEAR',
    confirmWipeTitle: 'முழு வால்ட் அழி',
    confirmWipeDescription: 'இது நிரந்தரமானது.',
    confirmWipeButton: 'எல்லாம் அழி',
    confirmWipeDetail0: 'எல்லா உறுப்பினர்களையும் நீக்குகிறது.',
    confirmWipeDetail1: 'எல்லா ஆவணம் மற்றும் புகைப்படம்.',
    confirmWipeDetail2: 'ஏற்றுமதி, பகிர்வு, அவசர தொடர்பு அழி.',
    confirmWipeDetail3: 'அமைப்புகள் மற்றும் streak மீட்டமை.',
    confirmWipeDetail4: 'தேவையெனில் முதலில் காப்பு.',
    requiredTypedWipe: 'WIPE',
  },
  familyManagement: {
    noMembersTitle: 'உறுப்பினர்கள் இல்லை',
    noMembersHint: 'முதல் சுயவிவரத்திற்கு {addLabel} தட்டு.',
    removeMemberTitle: 'குடும்ப உறுப்பினரை நீக்கு',
    removeMemberDescription:
      '{name} மற்றும் அவர்களின் எல்லா ஆவணங்களையும் நீக்கவா? மீள முடியாது.',
    removeMemberConfirm: 'உறுப்பினரை நீக்கு',
    emergencyReadOnlyToast: 'அவசர பயன்முறை — வெறும் படிப்பு.',
    demoProfileToast: 'மாதிரி சுயவிவரம் — உங்கள் உறுப்பினரைச் சேர்.',
    memberUpdatedToast: '{name} சுயவிவரம் புதுப்பிக்கப்பட்டது',
    memberAddedToast: '{name} குடும்ப வால்ட்டில் சேர்க்கப்பட்டார்',
    memberRemovedToast:
      '{name} மற்றும் {docCount, plural, one {# ஆவணம்} other {# ஆவணங்கள்}} நீக்கப்பட்டன',
  },
  pastelHome: {
    noFieldsRecorded: 'புலங்கள் பதிவில்லை.',
    noDocsForMember: 'இந்த உறுப்பினருக்கு ஆவணங்கள் இல்லை.',
  },
  memberForm: {
    fullName: 'முழு பெயர்',
    relationship: 'உறவு',
    dateOfBirth: 'பிறந்த தேதி',
    profileColor: 'சுயவிவர நிறம்',
    requiredMark: '*',
  },
  memberCard: {
    profileAdded: 'சுயவிவரம் சேர்க்கப்பட்டது',
    lastActivity: 'கடைசி செயல்பாடு',
  },
  photoAttachments: {
    loadingPhotos: 'புகைப்படங்கள் ஏற்றுகிறது…',
  },
  sharePage: {
    brandStamp: 'Strong Vault',
    viewOnlySubtitle: 'பகிரப்பட்ட ஆவணம் (வெறும் பார்வை)',
    openFailed: 'இந்த ஆவணத்தைத் திறக்க முடியவில்லை.',
  },
  handoverPage: {
    subtitle: 'அவசர ஒப்படைப்பு (வெறும் படிப்பு)',
    notesLabel: 'குறிப்புகள்:',
  },
  progressPage: {
    addMembersForRings: 'வளையல்களுக்கு உறுப்பினர்களைச் சேர்.',
    complete: 'முழு',
    badges: 'பேட்ஜ்கள்',
    streakCurrent: 'தற்போது',
    streakLongest: 'நீண்ட',
    streakDaysUsed: 'பயன்பாட்டு நாட்கள்',
  },
  emergencySettingsPage: {
    modeTitle: 'அவசர பயன்முறை (வெறும் படிப்பு வால்ட்)',
    pdfBundleTitle: 'அவசர PDF தொகுப்பு',
    handoverTitle: 'ஒப்படைப்பு இணைப்பு (72 மணி)',
    handoverHint: 'மறையீடு ஸ்னாப்ஷாட்; விசை URL துணுக்கில்.',
  },
  familyWatchCard: { vaultWordmark: 'வால்ட்' },
};


for (const loc of ['en', 'hi', 'kn', 'ta']) {
  const outPath = join(messagesDir, `${loc}.json`);
  const data = JSON.parse(readFileSync(outPath, 'utf8'));
  deepMerge(data, byLocale[loc]);
  writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
}
console.log('Merged ui-sweep into en, hi, kn, ta');
