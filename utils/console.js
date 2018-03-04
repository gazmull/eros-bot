function myTime() {
  return new Date().toLocaleString();
}

module.exports = {
  status: message => {
    const FgGreen = '\x1b[32m%s\x1b[0m';

    return console.log(FgGreen, `${myTime()}: <STATUS> ${message}`);
  },
  evalStatus: message => {
    const FgMagenta = '\x1b[35m%s\x1b[0m';

    return console.log(FgMagenta, `${myTime()}: <EVAL> ${message}`);
  },
  error: message => {
    const FgRed = '\x1b[31m%s\x1b[0m';

    return console.log(FgRed, `${myTime()}: <ERROR>\n${message}`);
  },
  warn: message => {
    const FgYellow = '\x1b[33m%s\x1b[0m';

    return console.log(FgYellow, `${myTime()}: <INFO>\n${message}`);
  }
};
