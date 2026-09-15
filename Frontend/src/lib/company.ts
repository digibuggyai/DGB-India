import type { CompanyInfo } from "@/lib/nas/types";

/* DGB India's contact details as they appear in the site footer.
 *
 * The CMS contact fields (Site Settings → contact) win when they're filled in.
 * They are empty today, so without these a document such as the NAS estimate
 * PDF would print blank lines where the address and phone should be. */
export const COMPANY_DEFAULTS: CompanyInfo = {
  name: "DGB India Enterprise",
  address: "207, Second Floor, Mansarovar Building, 90, Nehru Place, New Delhi, Delhi 110019",
  phones: ["+91 9540073737", "+91 9311447394", "+91 8077121592"],
  email: "sales@digibuggy.com",
};

type SettingsLike =
  | {
      siteName?: string | null;
      contact?: { email?: string | null; phone?: string | null; address?: string | null } | null;
    }
  | null
  | undefined;

export function companyInfo(settings: SettingsLike): CompanyInfo {
  const contact = settings?.contact;
  return {
    name: settings?.siteName || COMPANY_DEFAULTS.name,
    address: contact?.address || COMPANY_DEFAULTS.address,
    phones: contact?.phone ? [contact.phone] : COMPANY_DEFAULTS.phones,
    email: contact?.email || COMPANY_DEFAULTS.email,
  };
}
