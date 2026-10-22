export function gradeColors(grade: string): {
  color: string;
  backgroundColor: string;
} {
  if (grade.startsWith("A"))
    return {
      color: "var(--neutral-500)",
      backgroundColor: "var(--neutral-200)",
    };
  if (grade.startsWith("B"))
    return {
      color: "var(--neutral-500)",
      backgroundColor: "var(--secondary-300)",
    };
  if (grade === "F")
    return {
      color: "var(--neutral-100)",
      backgroundColor: "var(--primary-300)",
    };
  // C or D range
  return {
    color: "var(--neutral-100)",
    backgroundColor: "var(--highlight-300)",
  };
}

export function toLetterGrade(rating: number): string {
  const score = rating * 20;
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}
