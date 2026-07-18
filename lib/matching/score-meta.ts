export function scoreMeta(score: number) {
  if (score >= 85) return { label: `${score}% match`, bg: "#E3F5EC", color: "#12896B" };
  if (score >= 70) return { label: `${score}% match`, bg: "#FCF1DC", color: "#9A6316" };
  return { label: `${score}% match`, bg: "#EEF0F3", color: "#565F6B" };
}
