// Tier-1 verification: does the email belong to a recognised college domain?
// Matches .ac.in (Indian universities), .edu, .edu.in.
const COLLEGE_DOMAIN_RE = /@([a-z0-9-]+\.)*(ac\.in|edu|edu\.in)$/i;

export function isCollegeEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return COLLEGE_DOMAIN_RE.test(email.trim());
}

export function collegeDomainOf(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf("@");
  if (at < 0) return null;
  return email.slice(at + 1).toLowerCase();
}
