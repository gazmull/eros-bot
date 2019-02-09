const myTime = () => {
  return new Date().toLocaleString();
};

/* tslint:disable:no-console */

export const status = (message: string) => {
  const FgGreen = '\x1b[32m%s\x1b[0m';

  return console.info(FgGreen, `${myTime()}: ${message}`);
};

export const evalStatus = (message: string) => {
  const FgMagenta = '\x1b[35m%s\x1b[0m';

  return console.warn(FgMagenta, `${myTime()}: ${message}`);
};

export const error = (err: Error) => {
  const FgRed = '\x1b[31m%s\x1b[0m';

  return console.error(FgRed, `${myTime()}: ${err.stack}`);
};

export const warn = (message: string) => {
  const FgYellow = '\x1b[33m%s\x1b[0m';

  return console.warn(FgYellow, `${myTime()}: ${message}`);
};

/* tslint:enable:no-console */
