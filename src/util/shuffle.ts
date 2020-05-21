/**
 * Shuffles the array with Fisher-Yates method
 * @param arr The array to shuffle
 */
export default function knuthFisherYatesShuffle (arr: any[]) {
  for (let i = 0; i < arr.length; i++) {
    const j = ~~(Math.random() * (i + 1)); // eslint-disable-line no-bitwise
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
