const RADIXCHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const BinaryWidths = [
  [/bytes?/, 8],
  [/nibbles?/, 4],
  [/words?/, 16],
  [/32-?bits?/i, 32],
  [/64-?bits?/i, 64],
  [/128-?bits?/i, 128],
];
const baseConvert = (val, r1, r2) => {
  const maxlen = RADIXCHARS.length;
  let padsize = 0;
  const r = [r1, r2].map((x) => {
    if (typeof x !== 'string') return x;
    BinaryWidths.forEach((bw) => {
      if (bw[0].test(x)) {
        padsize = bw[1];
        return 2;
      }
    });
    return Number(x);
  });
  if (Math.min(...r) < 2 || Math.max(...r) > maxlen) throw new Error('Radix out of range');
  var source = `${val}`.split('');
  var m = 0;
  var l = 1;
  source.reverse().forEach((d) => {
    let i = RADIXCHARS.indexOf(d);
    if (i < 0) throw new Error('Invalid digit in source');
    m += i * l;
    l *= r[0];
  });
  if (r[1] == 10) return m;
  var result = [];
  while (m > 0) {
    var next_digit = [];
    next_digit.push(RADIXCHARS[m % r[1]]);
    if (padsize) while (next_digit.length < padsize) next_digit.unshift('0');
    m = Math.floor(m / r[1]);
    result.push(next_digit.join(''));
  }
  return result.join('');
};
export default baseConvert;
/* parseint does this but not with bytesizes */
