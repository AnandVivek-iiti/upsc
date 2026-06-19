
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function toIST(date = new Date()) {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

// "YYYY-MM-DD" in IST
export function getISTDateString(date = new Date()) {
  return toIST(date).toISOString().split("T")[0];
}
export function getISTDay(date = new Date()) {
  return toIST(date).getUTCDay();
}
