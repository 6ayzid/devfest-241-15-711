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
    hero_blocked_count_one: '{blocking} blocking issue',
    hero_blocked_count: '{blocking} blocking issues',
    hero_ready_of_total: '{ready} of {total} ready',
    hero_fix_hint: 'Fix these to continue.',
    hero_more_issues: '+{count} more',
    hero_less_issues: 'Show less',
    btn_generate_package: 'Generate Package',
    btn_generating: 'Generating PDF...',
    btn_download_package: 'Download {tenderId}_Package.pdf',
    btn_export_csv: 'Export CSV',
    btn_auto_match: 'Smart Auto-Match',
    btn_reset_demo: 'Reset',
    btn_load_sample_json: 'Load sample',
    btn_upload: 'Upload',

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

    // Optional AI: settings
    ai_settings_btn: 'AI settings',
    ai_settings_title: 'AI document reading',
    ai_settings_intro: 'Optional. Use your own Gemini API key to read PDFs and suggest matches and expiry dates. Everything else works without it.',
    ai_key_label: 'Gemini API key',
    ai_key_placeholder: 'Paste your own key',
    ai_key_note: 'Kept in memory only. Never saved on this device and sent only to Google.',
    ai_remember_tab: 'Remember in this tab only (forgotten when the tab closes)',
    ai_consent_label: "The selected PDFs will be sent to Google's Gemini API to be read.",
    ai_consent_needed: 'Tick the consent box before any PDF is sent.',
    ai_test_btn: 'Test connection',
    ai_testing: 'Testing...',
    ai_forget_key: 'Forget key',
    ai_close: 'Close',
    ai_model_label: 'Model',
    ai_model_auto: 'Auto-picked: {model}',
    ai_model_none: 'Not chosen yet. Test the connection to auto-pick one.',
    ai_model_override_label: 'Model override (optional)',
    ai_model_override_placeholder: 'Model id from your account',
    ai_model_invalid: 'Use only letters, digits, dot, dash and underscore.',
    ai_status_ok: 'Connected. Using {model}.',
    ai_err_blocked: "Request blocked: the browser could not reach Google's API. Check your connection, ad-blocker or firewall.",
    ai_err_invalid_key: 'Google rejected this API key. Check it and try again.',
    ai_err_forbidden: 'Access denied (403). This key may not have Gemini API access.',
    ai_err_rate_limited: 'Rate limit reached (429). Wait a moment and try again.',
    ai_err_server: "Google's server had a problem ({status}). Try again later.",
    ai_err_http: 'Request failed ({status}).',
    ai_err_bad_response: 'Unexpected response from Google.',
    ai_err_no_flash_model: 'No "flash" model with generateContent was found for this key. Type a model id in the override field.',
    ai_err_invalid_model: 'Model not found. Check the model override.',
    ai_err_content_blocked: 'Google declined to process this document.',
    ai_err_aborted: 'Cancelled.',

    // Optional AI: document reader & suggestions
    btn_read_with_ai: 'Read with AI',
    btn_read_file_ai: 'Read with AI',
    ai_reading_all: 'Reading with AI...',
    ai_reading_file: 'Reading...',
    ai_skipped_size: 'Exceeds 15MB AI limit',
    ai_error_badge: 'AI Error',
    ai_badge: 'AI',
    btn_undo: 'Undo',
    btn_apply_suggestion: 'Apply Suggestion',
    ai_suggests: 'AI suggests: "{file}" ({conf})',
    ai_pending_review_count: '{count} AI suggestion(s) pending review',
    btn_mark_all_reviewed: 'Mark all reviewed',
    ai_match_success: 'AI matched "{file}" to {req}',

    // Theme and Language
    lang_en: 'English',
    lang_bn: 'বাংলা',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',

    // Mobile Dock
    dock_upload: 'Upload',
    dock_load: 'Load',
    dock_csv: 'CSV',
    dock_reset: 'Reset',
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
    hero_blocked_count_one: '{blocking}টি সমস্যা',
    hero_blocked_count: '{blocking}টি সমস্যা',
    hero_ready_of_total: '{total}টির মধ্যে {ready}টি প্রস্তুত',
    hero_fix_hint: 'এগোতে এগুলো ঠিক করুন।',
    hero_more_issues: 'আরও {count}টি',
    hero_less_issues: 'কম দেখান',
    btn_generate_package: 'প্যাকেজ তৈরি করুন',
    btn_generating: 'পিডিএফ তৈরি হচ্ছে...',
    btn_download_package: '{tenderId}_Package.pdf ডাউনলোড করুন',
    btn_export_csv: 'CSV এক্সপোর্ট',
    btn_auto_match: 'স্মার্ট অটো-ম্যাচ',
    btn_reset_demo: 'রিসেট',
    btn_load_sample_json: 'নমুনা লোড',
    btn_upload: 'আপলোড',

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

    // Optional AI: settings
    ai_settings_btn: 'এআই সেটিংস',
    ai_settings_title: 'এআই দিয়ে ডকুমেন্ট পড়া',
    ai_settings_intro: 'ঐচ্ছিক। নিজের Gemini API কী দিয়ে পিডিএফ পড়িয়ে ম্যাচ ও মেয়াদের তারিখের পরামর্শ নিন। এটি ছাড়াও বাকি সব কাজ করে।',
    ai_key_label: 'Gemini API কী',
    ai_key_placeholder: 'নিজের কী পেস্ট করুন',
    ai_key_note: 'শুধু মেমোরিতে থাকে। এই ডিভাইসে সংরক্ষিত হয় না, শুধু Google-এ পাঠানো হয়।',
    ai_remember_tab: 'শুধু এই ট্যাবে মনে রাখুন (ট্যাব বন্ধ করলে মুছে যাবে)',
    ai_consent_label: 'নির্বাচিত পিডিএফগুলো পড়ার জন্য Google-এর Gemini API-তে পাঠানো হবে।',
    ai_consent_needed: 'কোনো পিডিএফ পাঠানোর আগে সম্মতির ঘরে টিক দিন।',
    ai_test_btn: 'সংযোগ পরীক্ষা',
    ai_testing: 'পরীক্ষা চলছে...',
    ai_forget_key: 'কী মুছুন',
    ai_close: 'বন্ধ করুন',
    ai_model_label: 'মডেল',
    ai_model_auto: 'স্বয়ংক্রিয়ভাবে বাছাই: {model}',
    ai_model_none: 'এখনো বাছাই হয়নি। স্বয়ংক্রিয় বাছাইয়ের জন্য সংযোগ পরীক্ষা করুন।',
    ai_model_override_label: 'নিজে মডেল দিন (ঐচ্ছিক)',
    ai_model_override_placeholder: 'আপনার অ্যাকাউন্টের মডেল আইডি',
    ai_model_invalid: 'শুধু ইংরেজি অক্ষর, সংখ্যা, ডট, ড্যাশ ও আন্ডারস্কোর ব্যবহার করুন।',
    ai_status_ok: 'সংযোগ সফল। {model} ব্যবহার হচ্ছে।',
    ai_err_blocked: 'অনুরোধ আটকে গেছে: ব্রাউজার Google-এর API-তে পৌঁছাতে পারেনি। ইন্টারনেট, অ্যাড-ব্লকার বা ফায়ারওয়াল দেখুন।',
    ai_err_invalid_key: 'Google এই API কী গ্রহণ করেনি। কী যাচাই করে আবার চেষ্টা করুন।',
    ai_err_forbidden: 'প্রবেশাধিকার নেই (৪০৩)। এই কী-তে হয়তো Gemini API চালু নেই।',
    ai_err_rate_limited: 'অনুরোধের সীমা পূর্ণ (৪২৯)। একটু অপেক্ষা করে আবার চেষ্টা করুন।',
    ai_err_server: 'Google-এর সার্ভারে সমস্যা ({status})। পরে আবার চেষ্টা করুন।',
    ai_err_http: 'অনুরোধ ব্যর্থ হয়েছে ({status})।',
    ai_err_bad_response: 'Google থেকে অপ্রত্যাশিত উত্তর এসেছে।',
    ai_err_no_flash_model: 'এই কী-তে generateContent সমর্থিত কোনো "flash" মডেল পাওয়া যায়নি। ওভাররাইড ঘরে মডেল আইডি লিখুন।',
    ai_err_invalid_model: 'মডেল পাওয়া যায়নি। ওভাররাইড ঘরের মডেল আইডি দেখুন।',
    ai_err_content_blocked: 'Google এই ডকুমেন্টটি প্রসেস করতে অস্বীকার করেছে।',
    ai_err_aborted: 'বাতিল করা হয়েছে।',

    // Optional AI: document reader & suggestions
    btn_read_with_ai: 'এআই দিয়ে পড়ুন',
    btn_read_file_ai: 'এআই দিয়ে পড়ুন',
    ai_reading_all: 'এআই পড়ছে...',
    ai_reading_file: 'পড়া হচ্ছে...',
    ai_skipped_size: '১৫ এমবির বেশি (স্কিপ)',
    ai_error_badge: 'এআই ত্রুটি',
    ai_badge: 'AI',
    btn_undo: 'পূর্বাবস্থায় (Undo)',
    btn_apply_suggestion: 'পরামর্শ প্রয়োগ করুন',
    ai_suggests: 'এআই পরামর্শ: "{file}" ({conf})',
    ai_pending_review_count: '{count}টি এআই পরামর্শ পর্যালোচনার অপেক্ষায়',
    btn_mark_all_reviewed: 'সবগুলো পর্যালোচনা চিহ্নিত করুন',
    ai_match_success: 'এআই "{file}" নথিটিকে {req}-এ যুক্ত করেছে',

    // Theme and Language
    lang_en: 'English',
    lang_bn: 'বাংলা',
    theme_light: 'লাইট',
    theme_dark: 'ডার্ক',
    theme_system: 'সিস্টেম',

    // Mobile Dock
    dock_upload: 'আপলোড',
    dock_load: 'লোড',
    dock_csv: 'CSV',
    dock_reset: 'রিসেট',
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
