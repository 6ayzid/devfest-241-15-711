export type Language = 'en' | 'bn';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // App header
    app_title: 'Tender Document Package Builder',
    app_subtitle: 'Combine, verify, and order official bid documents',
    tender_id_label: 'Tender ID',
    deadline_label: 'Submission Deadline',
    bidder_label: 'Bidder',
    procuring_entity_label: 'Procuring Entity',

    // Workflow Steps
    step_1: '1. Requirements',
    step_2: '2. Upload PDFs',
    step_3: '3. Match & Expiry',
    step_4: '4. Verification',
    step_5: '5. Download',

    // Hero Readiness Card
    hero_ready_title: 'Package Ready for Assembly',
    hero_ready_desc: 'All {ready} documents verified. No blocking issues detected.',
    hero_blocked_title: '{blocking} Blocking Issue(s)',
    hero_blocked_desc: '{ready} of {total} documents ready. Fix blockers below to generate.',
    btn_generate_package: 'Generate Package',
    btn_generating: 'Generating PDF...',
    btn_download_package: 'Download {tenderId}_Package.pdf',
    btn_export_csv: 'Export CSV Checklist',
    btn_auto_match: 'Smart Auto-Match',
    btn_reset_demo: 'Reset Demo Data',
    btn_load_sample_json: 'Load Sample Requirements',

    // Statuses
    status_missing: 'Missing',
    status_expiry_needed: 'Expiry Date Needed',
    status_expired: 'Expired',
    status_not_provided: 'Not Provided',
    status_ok: 'OK',

    // Status Descriptions
    status_desc_missing: 'Mandatory document has no matched file. Blocks generation.',
    status_desc_expiry_needed: 'File matched, but expiry date is required. Blocks generation.',
    status_desc_expired: 'Document expiry date is before submission deadline. Blocks generation.',
    status_desc_not_provided: 'Optional document not provided. Does not block package.',
    status_desc_ok: 'Document valid and ready.',

    // Blocking List
    blockers_heading: 'Blocking Issues to Resolve:',
    blocker_item_missing: '{doc}: No file matched (Required)',
    blocker_item_expiry_needed: '{doc}: Expiry date must be entered',
    blocker_item_expired: '{doc}: Expired on {date} (Deadline: {deadline})',
    blocker_item_damaged: '{doc}: Matched file is corrupt or unreadable',

    // Upload section
    upload_title: 'Uploaded Document Pool',
    upload_dropzone_text: 'Drag & drop PDF files here, or click to browse',
    upload_limits_hint: 'Only PDF files. Max 30 files, up to 50 MB total.',
    upload_files_count: '{count} file(s) uploaded ({size})',
    badge_duplicate: 'Duplicate File',
    badge_damaged: 'Damaged / Unreadable',
    duplicate_explanation: 'Identical content to "{name}". Duplicate copies cannot be matched to different slots.',
    btn_remove_file: 'Remove',
    pages_count: '{count} page(s)',

    // Matching section
    checklist_title: 'Document Checklist & Slot Matching',
    col_order: 'Order',
    col_document: 'Document',
    col_matched_file: 'Matched PDF File',
    col_expiry: 'Expiry Date',
    col_status: 'Status',
    col_action: 'Action',
    select_file_placeholder: '-- Select uploaded file --',
    btn_unmatch: 'Unmatch',
    mandatory_badge: 'Mandatory',
    optional_badge: 'Optional',
    expiry_required_badge: 'Has Expiry',

    // Options
    option_include_index: 'Include Table of Contents / Index page',
    option_include_index_desc: 'Inserts page 2 showing document starting page numbers',

    // Alerts and errors
    error_not_a_pdf: '"{name}" is not a valid PDF file. Only genuine PDF files are accepted.',
    error_file_empty: '"{name}" is empty (0 bytes).',
    error_exceeds_size: 'Total uploaded size exceeds 50 MB limit.',
    error_exceeds_count: 'Maximum 30 files limit reached.',
    error_corrupt: '"{name}" is damaged or password-protected and cannot be read.',
    error_invalid_json: 'Failed to parse requirements.json: invalid format.',
    error_cannot_match_duplicate: 'Cannot match: another duplicate copy is already matched.',

    // Delta chip messages
    delta_initialized: 'Loaded {total} tender requirements ({blocking} blockers).',
    delta_status_transition: '{doc}: Status changed from {from} to {to}',
    delta_expiry_updated: '{doc}: Expiry date updated.',
    delta_blocker_resolved: '{doc}: Blocker resolved ({remaining} remaining).',
    delta_file_matched: '{doc}: Matched with file.',
    delta_file_unmatched: '{doc}: File unmatched ({remaining} blockers).',
    delta_auto_matched: 'Auto-matched files. Resolved {resolved} blocker(s).',
    delta_files_uploaded: 'Uploaded "{name}".',
    delta_file_removed: 'Removed file "{name}".',
    delta_package_fully_ready: 'All blockers resolved! Package is ready to generate.',
    delta_blocking_changed: 'Blocking issues count updated to {count}.',
    delta_unchanged: 'Status updated.',

    // Theme and Language
    lang_en: 'English',
    lang_bn: 'বাংলা',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',

    // Mobile Dock
    dock_upload: 'Upload',
    dock_documents: 'Documents',
    dock_generate: 'Generate',
  },
  bn: {
    // App header
    app_title: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
    app_subtitle: 'অফিসিয়াল দরপত্র নথি একত্রিত, যাচাই ও ক্রমানুসারে সাজান',
    tender_id_label: 'টেন্ডার আইডি',
    deadline_label: 'জমা দেওয়ার শেষ তারিখ',
    bidder_label: 'দরদাতা প্রতিষ্ঠান',
    procuring_entity_label: 'সংগ্রহকারী কর্তৃপক্ষ',

    // Workflow Steps
    step_1: '১. রিকোয়ারমেন্টস',
    step_2: '২. পিডিএফ আপলোড',
    step_3: '৩. ম্যাচিং ও মেয়াদ',
    step_4: '৪. স্ট্যাটাস যাচাই',
    step_5: '৫. ডাউনলোড',

    // Hero Readiness Card
    hero_ready_title: 'প্যাকেজ তৈরির জন্য সম্পূর্ণ প্রস্তুত',
    hero_ready_desc: 'সকল {ready}টি ডকুমেন্ট যাচাইকৃত। কোনো বাধাদানকারী সমস্যা নেই।',
    hero_blocked_title: '{blocking}টি সমস্যা সমাধান প্রয়োজন',
    hero_blocked_desc: '{total}টির মধ্যে {ready}টি ডকুমেন্ট প্রস্তুত। প্যাকেজ তৈরিতে নিচের সমস্যাগুলো ঠিক করুন।',
    btn_generate_package: 'প্যাকেজ তৈরি করুন',
    btn_generating: 'পিডিএফ তৈরি হচ্ছে...',
    btn_download_package: '{tenderId}_Package.pdf ডাউনলোড করুন',
    btn_export_csv: 'চেকলিস্ট CSV এক্সপোর্ট',
    btn_auto_match: 'স্মার্ট অটো-ম্যাচ',
    btn_reset_demo: 'ডেমো ডেটা রিসেট',
    btn_load_sample_json: 'নমুনা রিকোয়ারমেন্টস লোড করুন',

    // Statuses
    status_missing: 'অনুপস্থিত',
    status_expiry_needed: 'মেয়াদ তারিখ প্রয়োজন',
    status_expired: 'মেয়াদোত্তীর্ণ',
    status_not_provided: 'দেওয়া হয়নি',
    status_ok: 'সঠিক',

    // Status Descriptions
    status_desc_missing: 'বাধ্যতামূলক নথিতে কোনো ফাইল সংযুক্ত নেই। প্যাকেজ আটকে আছে।',
    status_desc_expiry_needed: 'ফাইল সংযুক্ত হলেও মেয়াদের তারিখ প্রবেশ করানো হয়নি।',
    status_desc_expired: 'নথির মেয়াদের তারিখ জমা দেওয়ার শেষ তারিখের পূর্বের।',
    status_desc_not_provided: 'ঐচ্ছিক নথি সংযুক্ত করা হয়নি। প্যাকেজে বাধা সৃষ্টি করে না।',
    status_desc_ok: 'নথিটি সম্পূর্ণ বৈধ এবং প্রস্তুত।',

    // Blocking List
    blockers_heading: 'সমাধানযোগ্য বাধাসমূহ:',
    blocker_item_missing: '{doc}: কোনো ফাইল যুক্ত করা হয়নি (বাধ্যতামূলক)',
    blocker_item_expiry_needed: '{doc}: মেয়াদের তারিখ প্রদান করতে হবে',
    blocker_item_expired: '{doc}: {date} তারিখে মেয়াদ শেষ (শেষ সময়: {deadline})',
    blocker_item_damaged: '{doc}: যুক্ত ফাইলটি ক্ষতিগ্রস্ত বা পাঠযোগ্য নয়',

    // Upload section
    upload_title: 'আপলোডকৃত ডকুমেন্টের তালিকা',
    upload_dropzone_text: 'পিডিএফ ফাইল টেনে এখানে আনুন, অথবা ব্রাউজ করুন',
    upload_limits_hint: 'শুধুমাত্র পিডিএফ ফাইল। সর্বোচ্চ ৩০টি ফাইল ও ৫০ মেগাবাইট।',
    upload_files_count: '{count}টি ফাইল আপলোড করা হয়েছে ({size})',
    badge_duplicate: 'অনুরূপ ডুপ্লিকেট ফাইল',
    badge_damaged: 'ক্ষতিগ্রস্ত / পাঠঅযোগ্য',
    duplicate_explanation: '"{name}" ফাইলের সাথে হুবহু এক। একাধিক ভিন্ন নথিতে একই ফাইল মেলানো যাবে না।',
    btn_remove_file: 'মুছে ফেলুন',
    pages_count: '{count} পৃষ্ঠা',

    // Matching section
    checklist_title: 'ডকুমেন্ট চেকলিস্ট ও ম্যাচিং',
    col_order: 'ক্রম',
    col_document: 'ডকুমেন্ট',
    col_matched_file: 'সংযুক্ত পিডিএফ ফাইল',
    col_expiry: 'মেয়াদ শেষ',
    col_status: 'স্ট্যাটাস',
    col_action: 'পদক্ষেপ',
    select_file_placeholder: '-- ফাইল নির্বাচন করুন --',
    btn_unmatch: 'বাতিল',
    mandatory_badge: 'বাধ্যতামূলক',
    optional_badge: 'ঐচ্ছিক',
    expiry_required_badge: 'মেয়াদ যাচাইযোগ্য',

    // Options
    option_include_index: 'সূচিপত্র / ইনডেক্স পৃষ্ঠা অন্তর্ভুক্ত করুন',
    option_include_index_desc: '২ নম্বর পৃষ্ঠায় প্রতিটি নথির শুরুর পৃষ্ঠা নম্বর যুক্ত করে',

    // Alerts and errors
    error_not_a_pdf: '"{name}" একটি বৈধ পিডিএফ ফাইল নয়। শুধুমাত্র আসল পিডিএফ ফাইল গ্রহণযোগ্য।',
    error_file_empty: '"{name}" শূন্য বাইট খালি ফাইল।',
    error_exceeds_size: 'মোট ফাইলের আকার ৫০ মেগাবাইটের সীমা অতিক্রম করেছে।',
    error_exceeds_count: 'সর্বোচ্চ ৩০টি ফাইলের সীমা পূর্ণ হয়েছে।',
    error_corrupt: '"{name}" ক্ষতিগ্রস্ত অথবা পাসওয়ার্ড যুক্ত, খোলা যাচ্ছে না।',
    error_invalid_json: 'requirements.json লোড ব্যর্থ হয়েছে: সঠিক ফরম্যাট নয়।',
    error_cannot_match_duplicate: 'ম্যাচ করা সম্ভব নয়: এই ফাইলের আরেকটি ডুপ্লিকেট কপি ইতিমধ্যেই ব্যবহৃত।',

    // Delta chip messages
    delta_initialized: '{total}টি টেন্ডার রিকোয়ারমেন্টস লোড হয়েছে ({blocking}টি সমস্যা)।',
    delta_status_transition: '{doc}: স্ট্যাটাস {from} থেকে {to} হয়েছে।',
    delta_expiry_updated: '{doc}: মেয়াদের তারিখ আপডেট হয়েছে।',
    delta_blocker_resolved: '{doc}: সমস্যা সমাধান হয়েছে (বাকি {remaining}টি)।',
    delta_file_matched: '{doc}: ফাইল সংযুক্ত করা হয়েছে।',
    delta_file_unmatched: '{doc}: ফাইল বিচ্ছিন্ন করা হয়েছে ({remaining}টি সমস্যা বাকি)।',
    delta_auto_matched: 'অটো-ম্যাচ সম্পন্ন হয়েছে। {resolved}টি সমস্যা সমাধান হয়েছে।',
    delta_files_uploaded: '"{name}" আপলোড হয়েছে।',
    delta_file_removed: '"{name}" ফাইলটি সরানো হয়েছে।',
    delta_package_fully_ready: 'সকল সমস্যা সমাধান হয়েছে! প্যাকেজ তৈরির জন্য প্রস্তুত।',
    delta_blocking_changed: 'সমস্যার সংখ্যা পরিবর্তিত হয়ে {count} হয়েছে।',
    delta_unchanged: 'স্ট্যাটাস আপডেট হয়েছে।',

    // Theme and Language
    lang_en: 'English',
    lang_bn: 'বাংলা',
    theme_light: 'লাইট',
    theme_dark: 'ডার্ক',
    theme_system: 'সিস্টেম',

    // Mobile Dock
    dock_upload: 'আপলোড',
    dock_documents: 'ডকুমেন্ট',
    dock_generate: 'প্যাকেজ তৈরি',
  },
};

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  let str = translations[lang][key] || translations['en'][key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      const formattedVal = typeof v === 'number' ? formatNumber(v, lang) : String(v);
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), formattedVal);
    }
  }
  return str;
}

export function formatNumber(n: number, lang: Language): string {
  return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US').format(n);
}

export function formatFileSize(bytes: number, lang: Language): string {
  if (bytes < 1024) return `${formatNumber(bytes, lang)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatNumber(Math.round(kb), lang)} KB`;
  const mb = (kb / 1024).toFixed(1);
  return `${mb} MB`;
}
