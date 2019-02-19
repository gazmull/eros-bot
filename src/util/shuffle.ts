export default function knuthFisherYatesShuffle (arr: any[]) {
  for (let i = 0; i < arr.length; i++) {
    const j = ~~(Math.random() * (i + 1)); // tslint:disable-line:no-bitwise
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
