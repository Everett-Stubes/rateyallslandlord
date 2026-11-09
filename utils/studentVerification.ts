import { siteSettings } from '../siteSettings';

/**
 * List of school email domains, taken from the schools in siteSettings.ts.
 * Subdomains count too: "student.gsu.edu" matches "gsu.edu".
 */
const VERIFIED_STUDENT_DOMAINS = siteSettings.schools.flatMap((school) =>
  school.emailDomains.map((domain) => domain.toLowerCase())
);

const getEmailDomain = (email: string | undefined | null): string | null => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) return null;
  return normalizedEmail.slice(atIndex + 1);
};

const matchesDomain = (emailDomain: string, domain: string) =>
  emailDomain === domain || emailDomain.endsWith(`.${domain}`);

/** Alumni domains under a school's domain (such as alumni.emory.edu). These are never accepted. */
const BLOCKED_DOMAINS = siteSettings.blockedEmailDomains.map((domain) => domain.toLowerCase());

/**
 * Checks if an email belongs to one of the schools in siteSettings.ts.
 * Only these emails can create an account and post.
 */
export const isStudentEmail = (email: string | undefined | null): boolean => {
  const emailDomain = getEmailDomain(email);
  if (!emailDomain) return false;
  if (BLOCKED_DOMAINS.some((d) => matchesDomain(emailDomain, d))) return false;
  return VERIFIED_STUDENT_DOMAINS.some((d) => matchesDomain(emailDomain, d));
};

/** The school an email belongs to, if any. */
export const getSchoolForEmail = (email: string | undefined | null) => {
  const emailDomain = getEmailDomain(email);
  if (!emailDomain || !isStudentEmail(email)) return undefined;
  return siteSettings.schools.find((school) =>
    school.emailDomains.some((d) => matchesDomain(emailDomain, d.toLowerCase()))
  );
};

/**
 * Gets the list of verified student domains
 * @returns Array of verified student email domains
 */
export const getVerifiedStudentDomains = (): string[] => {
  return [...VERIFIED_STUDENT_DOMAINS];
};
