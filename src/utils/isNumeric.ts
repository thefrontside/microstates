export default function isNumeric(value: any): boolean {
  return !isNaN(value - parseFloat(value));
}
