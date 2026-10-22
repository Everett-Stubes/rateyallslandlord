/**
 * List of verified student email domains
 */
const VERIFIED_STUDENT_DOMAINS = ['pitt.edu', 'cmu.edu'];

/**
 * Checks if an email belongs to a verified student domain
 * @param email - The email address to check
 * @returns true if the email ends with a verified student domain, false otherwise
 */
export const isStudentEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === normalizedEmail.length - 1) return false;
  const emailDomain = normalizedEmail.slice(atIndex + 1);
  return VERIFIED_STUDENT_DOMAINS.includes(emailDomain);
};

/**
 * Gets the list of verified student domains
 * @returns Array of verified student email domains
 */
export const getVerifiedStudentDomains = (): string[] => {
  return [...VERIFIED_STUDENT_DOMAINS];
};
