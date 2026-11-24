import "server-only";

/**
 * Illustrative case studies shown inside the Partner Portal.
 *
 * Lives on the SERVER so it is never shipped in the public JS bundle — it is
 * only returned by /api/portal after a valid access key has been presented.
 * Replace with real (anonymised) mandates or a database query when ready.
 */
export type PortalCase = {
  icon: "building" | "trending" | "banknote" | "handshake";
  sector: string;
  size: string;
  location: string;
  structure: string;
  status: string;
  blurb: string;
};

export const portalCases: PortalCase[] = [
  {
    icon: "building",
    sector: "Manufacturing · Auto Components",
    size: "₹180 Cr Revenue",
    location: "Pune, Maharashtra",
    structure: "Majority Strategic Sale",
    status: "Verified · Introduced",
    blurb:
      "Tier-1 OEM supplier, 22-year track record, EBITDA margins 18%. Seller seeking full exit to a strategic buyer with scale.",
  },
  {
    icon: "trending",
    sector: "Healthcare · Specialty Hospitals",
    size: "₹95 Cr Revenue",
    location: "Bengaluru, Karnataka",
    structure: "Growth Capital (Minority)",
    status: "Verified · In Diligence",
    blurb:
      "Profitable 3-hospital chain, 280 beds, expanding to tier-2 cities. Raising primary capital for bed-count expansion.",
  },
  {
    icon: "banknote",
    sector: "Specialty Chemicals · Export-Led",
    size: "₹240 Cr Revenue",
    location: "Ankleshwar, Gujarat",
    structure: "Debt Refinance + Sponsor Recap",
    status: "Verified · Mandate Awarded",
    blurb:
      "70% export revenue, long-term offtake agreements. Structuring senior debt + partial liquidity for promoters.",
  },
  {
    icon: "handshake",
    sector: "Industrial Distribution · B2B",
    size: "₹310 Cr Revenue",
    location: "National Footprint",
    structure: "Acquisition by Strategic",
    status: "Verified · Under LOI",
    blurb:
      "Pan-India distributor, 14 warehouses, exclusive regional agreements. Acquirer advancing thesis via proprietary process.",
  },
];
