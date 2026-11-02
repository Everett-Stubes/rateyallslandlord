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
