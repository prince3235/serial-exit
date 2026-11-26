# Owner Action Items & Placeholders (OWNER_TODO)

This document tracks items that require official input, credential provision, or legal review from the platform owners. All items here are marked in code with `TODO(owner): ...` or designated as DRAFT/Illustrative.

---

## 1. Legal Review & Policies
- [ ] **DRAFT Terms of Service (`/terms`)**: Standard template provided for deal origination; requires formal legal counsel review before commercial launch.
- [ ] **DRAFT Privacy Policy (`/privacy`)**: Outlines data handling, IP hashing, and contact retention; requires compliance sign-off under applicable Indian IT & DPDP regulations.

## 2. Partner Credentials & Accreditations (Optional)
- [ ] **Partner 1 (Brijesh Patel)**: Optional education/accreditation credentials (e.g. CSUSB, advisory mandates) if desired in executive card.
- [ ] **Partner 2 (Sunil Sen)**: Optional education/accreditation credentials (e.g. IIM Ahmedabad alumni status) if desired in executive card.

## 3. Real Deal Flow & Dossiers (Optional)
- [ ] **Illustrative Deal Dossiers (`src/content/site.ts`)**: Deal cards use illustrative reference IDs (`SE-0142`, `SE-0284`, etc.). Replace with real anonymized off-market mandates when live deal flow is ready for public promotion.
- [ ] **Enterprise Value Target Range (`src/components/serial-exit/faq.tsx`)**: FAQ mentions typical enterprise values between ₹25 Cr and ₹500 Cr. Confirm or adjust this bracket to match your current origination focus.
- [ ] **Partner Portal Case Studies (`src/content/portal-cases.ts`)**: Sample cases are marked as illustrative examples.

## 4. Production API Keys & Integration Credentials
- [ ] **Domain Verification (`NEXT_PUBLIC_SITE_URL`)**: Set production domain (e.g. `https://serialexit.com`). Canonical tags, OpenGraph URLs, and sitemap derive from this origin.
- [ ] **Google Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`)**: Paste Search Console verification token.
- [ ] **Resend API Key (`RESEND_API_KEY`)**: For production email notifications from verified domain (`CONTACT_FROM_EMAIL`).
- [ ] **WhatsApp Cloud API (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`)**: Meta Business Manager production token and approved message templates (`serial_exit_welcome`, `serial_exit_partner_alert`).
- [ ] **Google Sheets Sync (`GOOGLE_SHEETS_SPREADSHEET_ID`)**: Target spreadsheet ID shared with Google Cloud Service Account for automated lead sync.
- [ ] **Firebase / Firestore Service Account**: Production database credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

## 5. Copy & Factual Claims Audit (Chunk C5, C9 & C10 Pass)

| Location | Original Statement | Updated / Softened Statement | Status | Note for Owner |
| :--- | :--- | :--- | :--- | :--- |
| **Why Serial Exit** | "Zero public listings" | "Confidential by default" | Softened | Defensible process claim |
| **Why Serial Exit** | "Proprietary Origination / transition to public intermediaries" | "Relationship-Led Origination / prior to public market dissemination" | Softened | Defensible relationship claim |
| **Why Serial Exit** | "Pre-Verified Qualification / realistic valuation parameters" | "Verified Before Introduced / governance alignment" | Softened | Defensible process claim |
| **Contact Timeline** | "Review within 24h" | "Direct Principal Review" | Softened | Avoids uncontracted SLA claim |
| **Contact Footer** | "Strict discretion guaranteed." | "Strict discretion by design." | Softened | Removes absolute legal guarantee |
| **FAQ Question 5** | "Review within 24 hours ... introductions arranged within 5 to 7 days" | "Discreet review ... introductions scheduled in close coordination" | Softened | Removes unverified SLA promises |
| **FAQ Question 7** | "100% pre-verified principal qualification" | "relationship-led network where every party is vetted" | Softened | Removes absolute percentage claim |
| **Proof Strip** | "100% Off-Market" | "100% Off-Market (Direct founder & sponsor mandates prior to public dissemination)" | Kept | Structurally true to model |
| **Proof Strip** | "Pan-India Coverage" | "Active origination across core industrial & high-growth economic hubs" | Kept | Structurally true |

---

## 6. Pre-Launch Deployment Checklist
1. [ ] Configure production DNS to Point to Vercel/Hosting Provider.
2. [ ] Add environment variables (`NEXT_PUBLIC_SITE_URL`, `FIREBASE_*`, `RESEND_*`, `WHATSAPP_*`).
3. [ ] Run `npm run build` in CI/CD pipeline.
4. [ ] Verify sitemap `/sitemap.xml` and robots `/robots.txt` respond with 200 OK.
5. [ ] Perform test enquiry submission in `/` to verify notification routing.
