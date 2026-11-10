export function gradeColors(grade: string): {
  color: string;
  backgroundColor: string;
} {
  if (grade.startsWith("A"))
    return {
      color: "var(--neutral-100)",
      backgroundColor: "var(--grade-a)",
    };
  if (grade.startsWith("B"))
    return {
      color: "var(--neutral-100)",
      backgroundColor: "var(--grade-b)",
    };
  if (grade.startsWith("C"))
    return {
      color: "var(--neutral-500)",
      backgroundColor: "var(--grade-c)",
    };
  if (grade.startsWith("D"))
    return {
      color: "var(--neutral-100)",
      backgroundColor: "var(--grade-d)",
    };
  return {
    color: "var(--neutral-100)",
    backgroundColor: "var(--grade-f)",
  };
}

/**
 * Turns a 1-5 rating (or an average of ratings) into a letter grade:
 * 1 = F, 2 = D, 3 = C, 4 = B, 5 = A. Averages in between get a + or -, so a 3.6 is a B-
 * and a 4.5 is an A-. The best possible grade is an A.
 */
export function toLetterGrade(rating: number): string {
  // Rating 1 is 0 grade points (F) and rating 5 is 4.0 (A), like a GPA. The cutoffs sit halfway
  // between neighboring grades, so a whole-number rating always lands on the plain letter.
  const points = rating - 1;
  if (points >= 3.85) return "A";
  if (points >= 3.5) return "A-";
  if (points >= 3.15) return "B+";
  if (points >= 2.85) return "B";
  if (points >= 2.5) return "B-";
  if (points >= 2.15) return "C+";
  if (points >= 1.85) return "C";
  if (points >= 1.5) return "C-";
  if (points >= 1.15) return "D+";
  if (points >= 0.85) return "D";
  if (points >= 0.5) return "D-";
  return "F";
}
