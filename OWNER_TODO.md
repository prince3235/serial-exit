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
- [ ] **Partner Portal Case Studies (`src/content/portal-cases.ts`)**: Sample cases are marked as illustrative examples.

## 4. Production API Keys & Integration Credentials
- [ ] **Resend API Key (`RESEND_API_KEY`)**: For production email notifications from verified domain (`CONTACT_FROM_EMAIL`).
- [ ] **WhatsApp Cloud API (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`)**: Meta Business Manager production token and approved message templates (`serial_exit_welcome`, `serial_exit_partner_alert`).
- [ ] **Google Sheets Sync (`GOOGLE_SHEETS_SPREADSHEET_ID`)**: Target spreadsheet ID shared with Google Cloud Service Account for automated lead sync.
- [ ] **Firebase / Firestore Service Account**: Production database credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
