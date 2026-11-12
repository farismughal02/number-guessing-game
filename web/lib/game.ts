export function checkGuess(value: unknown, maximum: number) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > maximum) throw new Error(`Enter a whole number from 1 to ${maximum}.`);
  return value;
}
export function hint(guess: number, secret: number) { return guess === secret ? 'correct' : guess < secret ? 'low' : 'high'; }
