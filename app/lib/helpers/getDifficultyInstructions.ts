export function getDifficultyInstruction(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "Use very simple vocabulary and sentence structures.";
    case "Intermediate":
      return "Use moderately complex vocabulary and grammar.";
    case "Advanced":
      return "Use natural and idiomatic expressions with some advanced grammar.";
    default:
      return "Use clear and natural expressions.";
  }
}