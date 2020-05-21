/**
 * Returns formatted date time from milliseconds.
 * @param ms Time in milliseconds
 */
export default function prettifyMs (ms: number) {
  let base = Math.floor(ms / 1000);
  let seconds: number | string = base % 60;
  base = Math.floor(base / 60);
  let minutes: number | string = base % 60;
  base = Math.floor(base / 60);
  let hours: number | string = base % 24;
  let days: number | string = Math.floor(base / 24);

  seconds = `${'0'.repeat(2 - seconds.toString().length)}${seconds}`;
  minutes = `${'0'.repeat(2 - minutes.toString().length)}${minutes}`;
  hours = `${'0'.repeat(2 - hours.toString().length)}${hours}`;
  days = `${'0'.repeat(Math.max(0, 2 - days.toString().length))}${days}`;

  return `${days === '00' ? '' : `${days}d `}${hours}:${minutes}:${seconds}`;
}
