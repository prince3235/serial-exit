/**
 * Central content file for Serial Exit.
 * All long-form copy lives here so designers/copywriters can revise without
 * touching component code. Keep tone institutional, understated, confident.
 * No hype words, no emojis, no invented statistics.
 */

export const site = {
  name: "Serial Exit",
  founded: "2026",
  tagline: "Verified Off-Market Opportunities. Trusted Partners. Better Transactions.",
  positioning: "Public markets show you what is already available. Serial Exit focuses on what may become available next.",
  contact: {
    email: "partners@serialexit.com", // PLACEHOLDER — replace with real address
    phone: "+91 00000 00000",          // PLACEHOLDER — replace with real number
    location: "India",
    linkedin: "https://www.linkedin.com/company/serialexit", // PLACEHOLDER
  },
} as const;

export const nav = {
  links: [
    { label: "Platform", href: "#core-idea" },
    { label: "How It Works", href: "#process" },
    { label: "Opportunities", href: "#showcase" },
  ],
  cta: { label: "Partner With Us", href: "#contact" },
} as const;

export const hero = {
  eyebrow: "Verified Off-Market Deal Origination · India",
  // H1 — "before" emphasized in italic serif + amber
  headlineLines: ["Access deals", "before they reach", "the market."],
  emphasizeWord: "before",
  subtext:
    "Serial Exit connects M&A advisors, investment firms and strategic acquirers with confidential, verified business opportunities, before they become public.",
  ctas: {
    primary: { label: "Partner With Us", href: "#contact" },
    secondary: { label: "How It Works", href: "#process" },
  },
  stripLabels: ["Verified", "Confidential", "Relationship-Driven", "India-Focused"],
} as const;

export const coreIdea = {
  index: "01",
  eyebrow: "The Core Idea",
  lineOne: "Public markets show you what is already available.",
  lineTwo: "Serial Exit focuses on what may become available next.",
  imageAlt:
    "Field of black stone cubes with a single cube glowing amber — one verified opportunity among many.",
} as const;

export const opportunities = {
  index: "02",
  eyebrow: "What We Originate",
  title: "Opportunities across the full transaction spectrum.",
  intro:
    "Every engagement begins with a single question — what is the business trying to achieve. The answer shapes the opportunity we source, verify and introduce.",
  items: [
    {
      n: "01",
      title: "Business Sales",
      desc: "Confidentially connect owners of established, profitable businesses with the right acquirers, on terms that protect legacy and value.",
    },
    {
      n: "02",
      title: "Acquisitions",
      desc: "Source verified targets aligned to a buyer's industry, size and strategic thesis — before those businesses are publicly listed.",
    },
    {
      n: "03",
      title: "Growth Capital",
      desc: "Introduce founders raising primary or secondary capital to investors whose mandate, check size and timeline genuinely fit.",
    },
    {
      n: "04",
      title: "Debt Financing",
      desc: "Match businesses with senior debt, mezzanine or structured credit providers suited to their cash-flow profile and stage.",
    },
    {
      n: "05",
      title: "Strategic Partnerships",
      desc: "Arrange commercial, technology or joint-venture structures where outright acquisition is not the intended outcome.",
    },
  ],
} as const;

export const process = {
  index: "03",
  eyebrow: "How It Works",
  title: "A measured path from opportunity to introduction.",
  intro:
    "Every opportunity moves through the same structured sequence. Nothing is shared with a partner until it clears sourcing, verification and qualification.",
  steps: [
    {
      n: "01",
      key: "Source",
      title: "Source",
      desc: "Identify potential opportunities before they are publicly listed, through a confidential, relationship-led network.",
    },
    {
      n: "02",
      key: "Verify",
      title: "Verify",
      desc: "Confirm business information and seller intent — that the opportunity is real, current and serious.",
    },
    {
      n: "03",
      key: "Qualify",
      title: "Qualify",
      desc: "Assess fit, readiness and transaction requirements against mandate, timing and realism of expectations.",
    },
    {
      n: "04",
      key: "Match",
      title: "Match",
      desc: "Align industry, deal size and strategic objectives to identify the most appropriate partner for the opportunity.",
    },
    {
      n: "05",
      key: "Introduce",
      title: "Introduce",
      desc: "Connect the opportunity with a single, suitable corporate finance partner under a confidential framework.",
    },
  ],
} as const;

export const showcase = {
  index: "04",
  eyebrow: "Verified Opportunities",
  title: "Every opportunity is verified before it is introduced.",
  intro:
    "What reaches a partner is not a listing — it is a qualified, verified opportunity, introduced with the context required to act on it.",
  disclaimer:
    "Illustrative example. Actual opportunities are shared only with verified partners.",
  cards: [
    {
      sector: "Manufacturing",
      size: "₹100–500 Cr",
      location: "Western India",
      transaction: "Strategic Sale",
      status: "Verified",
    },
    {
      sector: "Healthcare Services",
      size: "₹50–150 Cr",
      location: "South India",
      transaction: "Growth Capital",
      status: "Verified",
    },
    {
      sector: "Industrial Distribution",
      size: "₹200–750 Cr",
      location: "North India",
      transaction: "Acquisition",
      status: "Verified",
    },
    {
      sector: "Specialty Chemicals",
      size: "₹150–400 Cr",
      location: "Western India",
      transaction: "Debt Funding",
      status: "Verified",
    },
  ],
} as const;

/**
 * Our Partners — two principal business partners.
 * PLACEHOLDER DATA: Replace all bracketed placeholders with client-provided details.
 */
export const ourPartners = {
  index: "06",
  eyebrow: "Our Partners",
  title: "Principal Partners",
  intro: "",
  people: [
    {
      id: "partner-1",
      name: "[Partner 1 Name]",
      designation: "[Partner 1 Designation]",
      firm: "",
      bio: "[Short description placeholder — awaiting client-provided bio.]",
      photo: "" as string,
      initials: "01",
    },
    {
      id: "partner-2",
      name: "[Partner 2 Name]",
      designation: "[Partner 2 Designation]",
      firm: "",
      bio: "[Short description placeholder — awaiting client-provided bio.]",
      photo: "" as string,
      initials: "02",
    },
  ],
} satisfies {
  index: string;
  eyebrow: string;
  title: string;
  intro: string;
  people: Array<{
    id: string;
    name: string;
    designation: string;
    firm: string;
    bio: string;
    photo: string;
    initials: string;
  }>;
};

export const contact = {
  index: "05",
  eyebrow: "Contact",
  title: "Let's discuss what's next.",
  intro:
    "All enquiries are handled in strict confidence. Share what you are exploring and we will respond directly.",
  confidentiality: "All enquiries are handled in strict confidence.",
  tabs: [
    {
      key: "partner",
      label: "I'm a Partner",
      sub: "Advisor / Investor / Acquirer",
      roleOptions: [
        "M&A Advisory Firm",
        "Investment Bank",
        "Private Equity Firm",
        "Venture Capital Firm",
        "Search Fund",
        "Family Office",
        "Strategic Acquirer",
      ],
    },
    {
      key: "owner",
      label: "I'm a Business Owner",
      sub: "Exploring a transaction",
      roleOptions: [
        "Business Sale",
        "Acquisition",
        "Growth Capital",
        "Debt Financing",
        "Strategic Partnership",
      ],
    },
  ],
  fields: {
    name: "Full name",
    company: "Company",
    email: "Work email",
    phone: "Phone (optional)",
    role: "Role / Type",
    message: "Message",
    messagePartnerPlaceholder:
      "Briefly describe your mandate, sector focus or the type of opportunity you are seeking.",
    messageOwnerPlaceholder:
      "Briefly describe your business and the transaction you are exploring.",
  },
  submit: "Send Enquiry",
  success: {
    title: "Enquiry received.",
    body: "Thank you. Our team will respond directly, in confidence, within two business days.",
    reset: "Send another enquiry",
  },
} as const;

export const footer = {
  descriptor:
    "A verified off-market deal origination platform connecting exceptional businesses with the right financial and strategic partners.",
  navColumns: [
    {
      heading: "Platform",
      links: [
        { label: "Core Idea", href: "#core-idea" },
        { label: "Opportunities", href: "#opportunities" },
        { label: "Process", href: "#process" },
      ],
    },
    {
      heading: "Engage",
      links: [
        { label: "Partner With Us", href: "#contact" },
        { label: "Verified Opportunities", href: "#showcase" },
        { label: "Our Partners", href: "#our-partners" },
      ],
    },
  ],
  legal:
    "Serial Exit is a deal origination and introduction platform. It does not provide investment, legal or tax advice, and is not a broker-dealer. All opportunities are confidential and shared with verified partners only.",
  copyright: `© ${new Date().getFullYear()} Serial Exit`,
} as const;
