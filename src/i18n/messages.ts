/**
 * Lightweight i18n dictionary for Serial Exit.
 *
 * Two locales: English (en) and Hindi (hi). Only the high-visibility UI
 * strings (nav, hero, section headings, CTAs, footer) are translated for a
 * meaningful bilingual experience. Long descriptive paragraphs remain in
 * English to preserve precise institutional tone; they can be translated
 * incrementally by editing this file.
 *
 * Access via the `useI18n()` hook in src/i18n/provider.tsx.
 */

export type Locale = "en" | "hi";

export const LOCALES: Locale[] = ["en", "hi"];

export const localeNames: Record<Locale, string> = {
  en: "EN",
  hi: "हि",
};

type Dict = typeof en;

const en = {
  nav: {
    platform: "Platform",
    whatWeDo: "What We Do",
    howItWorks: "How It Works",
    deals: "Deals",
    partners: "Partners",
    cta: "Partner With Us",
    language: "Language",
    portal: "Partner Portal",
  },
  hero: {
    eyebrow: "Verified Off-Market Deal Origination · India",
    line1: "Access deals",
    line2: "before they reach",
    line3: "the market.",
    subtext:
      "Serial Exit connects M&A advisors, investment firms and strategic acquirers with confidential, verified business opportunities, before they become public.",
    ctaPrimary: "For Advisors & Investors",
    ctaSecondary: "For Business Owners",
    strip: ["Verified", "Confidential", "Relationship-Driven", "India-Focused"],
    scroll: "Scroll",
  },
  coreIdea: {
    index: "01",
    eyebrow: "The Core Idea",
    lineOne: "Public markets show you what is already available.",
    lineTwo: "Serial Exit focuses on what may become available next.",
  },
  opportunities: {
    index: "02",
    eyebrow: "What We Originate",
    title: "Opportunities across the full transaction spectrum.",
    intro:
      "Every engagement begins with a single question — what is the business trying to achieve. The answer shapes the opportunity we source, verify and introduce.",
  },
  process: {
    index: "03",
    eyebrow: "How It Works",
    title: "A measured path from opportunity to introduction.",
    intro:
      "Every opportunity moves through the same structured sequence. Nothing is shared with a partner until it clears sourcing, verification and qualification.",
  },
  showcase: {
    index: "04",
    eyebrow: "Verified Opportunities",
    title: "Every opportunity is verified before it is introduced.",
    intro:
      "What reaches a partner is not a listing — it is a qualified, verified opportunity, introduced with the context required to act on it.",
    sheetLabel: "Illustrative Deal Sheet",
    disclaimer:
      "Illustrative example. Actual opportunities are shared only with verified partners.",
  },
  faq: {
    index: "05",
    eyebrow: "Frequently Asked Questions",
    title: "Institutional Origination Clarity",
    intro:
      "Direct answers regarding our bilateral discretion protocols, partner qualification criteria, and off-market mandate execution.",
  },
  ourPartners: {
    index: "06",
    eyebrow: "Our Partners",
    title: "Principal Partners",
    intro:
      "The principals leading Serial Exit's origination network and partner mandate execution across India.",
  },
  ctaBand: {
    eyebrow: "Institutional Origination Access",
    title: "Ready to explore verified off-market deal flow?",
    intro:
      "Whether deploying strategic growth capital or evaluating a confidential succession exit, our principals coordinate private bilateral introductions under complete discretion.",
    ctaPrimary: "For Advisors & Investors",
    ctaSecondary: "For Business Owners",
  },
  contact: {
    index: "07",
    eyebrow: "Contact",
    title: "Let's discuss what's next.",
    intro:
      "All enquiries are handled in strict confidence. Share what you are exploring and we will respond directly.",
    confidentiality: "All enquiries are handled in strict confidence.",
    tabPartner: "I'm a Partner",
    tabPartnerSub: "Advisor / Investor / Acquirer",
    tabOwner: "I'm a Business Owner",
    tabOwnerSub: "Exploring a transaction",
    submit: "Send Enquiry",
    successTitle: "Enquiry received.",
    successBody:
      "Thank you. Our team will respond directly, in confidence, within two business days.",
    successReset: "Send another enquiry",
  },
  footer: {
    descriptor:
      "A verified off-market deal origination platform connecting exceptional businesses with the right financial and strategic partners.",
    platform: "Platform",
    engage: "Engage",
    contact: "Contact",
    legal:
      "Serial Exit is a deal origination and introduction platform. It does not provide investment, legal or tax advice, and is not a broker-dealer. All opportunities are confidential and shared with verified partners only.",
    copyright: "© 2026 Serial Exit",
  },
  portal: {
    eyebrow: "Partner Portal",
    title: "Verified deal flow, on request.",
    intro:
      "Illustrative preview of the opportunity profile shared with verified partners. Access to live opportunities requires a verified partner account.",
    locked: "Locked",
    enterPassword: "Enter partner access key",
    passwordPlaceholder: "Access key",
    unlock: "Unlock",
    wrongKey: "Incorrect access key. Request one from the Serial Exit team.",
    hint: "Access is by invitation only",
    unavailable: "The portal is not open for sign-in right now. Please contact the Serial Exit team.",
    tooMany: "Too many attempts. Please wait a few minutes and try again.",
    checking: "Checking…",
    logout: "Lock portal",
    back: "Close",
    caseStudiesTitle: "Illustrative Case Studies",
    caseStudiesNote:
      "Illustrative only. Structures and figures are representative, not actual transactions.",
  },
};

const hi: Dict = {
  nav: {
    platform: "प्लेटफ़ॉर्म",
    whatWeDo: "हम क्या करते हैं",
    howItWorks: "कैसे काम करता है",
    deals: "डील्स",
    partners: "पार्टनर्स",
    cta: "हमारे साथ जुड़ें",
    language: "भाषा",
    portal: "पार्टनर पोर्टल",
  },
  hero: {
    eyebrow: "सत्यापित ऑफ-मार्केट डील ओरिजिनेशन · भारत",
    line1: "अवसरों तक पहुँचें",
    line2: "बाज़ार में आने से पहले",
    line3: "।",
    subtext:
      "सीरियल एग्ज़िट M&A सलाहकारों, निवेश फर्मों और रणनीतिक अधिग्रहणकर्ताओं को गोपनीय, सत्यापित व्यावसायिक अवसरों से जोड़ता है — उनके सार्वजनिक होने से पहले।",
    ctaPrimary: "सलाहकारों और निवेशकों के लिए",
    ctaSecondary: "व्यवसाय मालिकों के लिए",
    strip: ["सत्यापित", "गोपनीय", "संबंध-आधारित", "भारत-केंद्रित"],
    scroll: "स्क्रॉल",
  },
  coreIdea: {
    index: "01",
    eyebrow: "मूल विचार",
    lineOne: "सार्वजनिक बाज़ार आपको वही दिखाता है जो पहले से उपलब्ध है।",
    lineTwo: "सीरियल एग्ज़िट उस पर ध्यान केंद्रित करता है जो आगे उपलब्ध हो सकता है।",
  },
  opportunities: {
    index: "02",
    eyebrow: "हम क्या तैयार करते हैं",
    title: "पूरे लेन-देन स्पेक्ट्रम में अवसर।",
    intro:
      "हर संलग्नता एक ही प्रश्न से शुरू होती है — व्यवसाय क्या हासिल करना चाहता है। उत्तर ही उस अवसर का आकार तय करता है जिसे हम सोर्स, सत्यापित और पेश करते हैं।",
  },
  process: {
    index: "03",
    eyebrow: "कैसे काम करता है",
    title: "अवसर से परिचय तक का एक सुविचारित मार्ग।",
    intro:
      "हर अवसर एक ही संरचित अनुक्रम से गुज़रता है। सोर्सिंग, सत्यापन और योग्यता की पुष्टि के बिना कुछ भी किसी साझेदार के साथ साझा नहीं किया जाता।",
  },
  showcase: {
    index: "04",
    eyebrow: "सत्यापित अवसर",
    title: "हर अवसर पेश किए जाने से पहले सत्यापित होता है।",
    intro:
      "साझेदार तक जो पहुँचता है वह कोई लिस्टिंग नहीं है — यह एक योग्य, सत्यापित अवसर है, कार्रवाई के लिए आवश्यक संदर्भ के साथ पेश किया गया।",
    sheetLabel: "उदाहरण डील शीट",
    disclaimer:
      "उदाहरण मात्र। वास्तविक अवसर केवल सत्यापित साझेदारों के साथ साझा किए जाते हैं।",
  },
  faq: {
    index: "05",
    eyebrow: "अक्सर पूछे जाने वाले प्रश्न",
    title: "संस्थागत उत्पत्ति स्पष्टता",
    intro:
      "हमारे द्विपक्षीय गोपनीयता प्रोटोकॉल, पार्टनर योग्यता मानदंड और ऑफ-मार्केट मैंडेट निष्पादन के बारे में सीधे उत्तर।",
  },
  ourPartners: {
    index: "06",
    eyebrow: "हमारे पार्टनर्स",
    title: "प्रमुख पार्टनर्स",
    intro:
      "भारत भर में सीरियल एग्ज़िट के ओरिजिनेशन नेटवर्क और पार्टनर मैंडेट निष्पादन का नेतृत्व करने वाले प्रमुख।",
  },
  ctaBand: {
    eyebrow: "संस्थागत ओरिजिनेशन एक्सेस",
    title: "क्या आप सत्यापित ऑफ-मार्केट डील फ्लो तलाशने के लिए तैयार हैं?",
    intro:
      "चाहे रणनीतिक विकास पूंजी तैनात करना हो या गोपनीय उत्तराधिकार निकास का मूल्यांकन करना हो, हमारे प्रमुख पूर्ण विवेक के तहत निजी द्विपक्षीय परिचय का समन्वय करते हैं।",
    ctaPrimary: "सलाहकारों और निवेशकों के लिए",
    ctaSecondary: "व्यवसाय मालिकों के लिए",
  },
  contact: {
    index: "07",
    eyebrow: "संपर्क",
    title: "आइए आगे क्या है उस पर चर्चा करें।",
    intro:
      "सभी पूछताछ पूर्ण गोपनीयता में संभाली जाती है। बताएँ कि आप क्या खोज रहे हैं और हम सीधे जवाब देंगे।",
    confidentiality: "सभी पूछताछ पूर्ण गोपनीयता में संभाली जाती है।",
    tabPartner: "मैं एक साझेदार हूँ",
    tabPartnerSub: "सलाहकार / निवेशक / अधिग्रहणकर्ता",
    tabOwner: "मैं एक व्यवसाय मालिक हूँ",
    tabOwnerSub: "लेन-देन का अन्वेषण",
    submit: "पूछताछ भेजें",
    successTitle: "पूछताछ प्राप्त हुई।",
    successBody:
      "धन्यवाद। हमारी टीम गोपनीयता में, दो कार्य दिवसों के भीतर सीधे जवाब देगी।",
    successReset: "एक और पूछताछ भेजें",
  },
  footer: {
    descriptor:
      "एक सत्यापित ऑफ-मार्केट डील ओरिजिनेशन प्लेटफ़ॉर्म जो उत्कृष्ट व्यवसायों को उपयुक्त वित्तीय और रणनीतिक साझेदारों से जोड़ता है।",
    platform: "प्लेटफ़ॉर्म",
    engage: "जुड़ें",
    contact: "संपर्क",
    legal:
      "सीरियल एग्ज़िट एक डील ओरिजिनेशन और परिचय प्लेटफ़ॉर्म है। यह निवेश, कानूनी या कर सलाह नहीं देता, और ब्रोकर-डीलर नहीं है। सभी अवसर गोपनीय हैं और केवल सत्यापित साझेदारों के साथ साझा किए जाते हैं।",
    copyright: "© 2026 Serial Exit",
  },
  portal: {
    eyebrow: "पार्टनर पोर्टल",
    title: "सत्यापित डील फ्लो, अनुरोध पर।",
    intro:
      "सत्यापित साझेदारों के साथ साझा की जाने वाली अवसर प्रोफ़ाइल का उदाहरण पूर्वावलोकन। लाइव अवसरों तक पहुँच के लिए सत्यापित पार्टनर खाता आवश्यक है।",
    locked: "लॉक्ड",
    enterPassword: "पार्टनर एक्सेस कुंजी दर्ज करें",
    passwordPlaceholder: "एक्सेस कुंजी",
    unlock: "खोलें",
    wrongKey: "गलत एक्सेस कुंजी। सीरियल एग्ज़िट टीम से एक कुंजी का अनुरोध करें।",
    hint: "प्रवेश केवल आमंत्रण द्वारा",
    unavailable: "पोर्टल अभी साइन-इन के लिए उपलब्ध नहीं है। कृपया सीरियल एग्ज़िट टीम से संपर्क करें।",
    tooMany: "बहुत अधिक प्रयास। कृपया कुछ मिनट प्रतीक्षा करें और पुनः प्रयास करें।",
    checking: "जाँच हो रही है…",
    logout: "पोर्टल लॉक करें",
    back: "बंद करें",
    caseStudiesTitle: "उदाहरण केस स्टडीज़",
    caseStudiesNote:
      "केवल उदाहरण। संरचनाएँ और आँकड़े प्रतिनिधि हैं, वास्तविक लेन-देन नहीं।",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, hi };
export type Dictionary = Dict;
