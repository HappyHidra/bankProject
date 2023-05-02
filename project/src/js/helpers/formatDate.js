function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

export function formatDate(date) {
  return `${[
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/')} ${[].join(':')}`;
}

export function getFormattedMonth(date) {
  return `${[padTo2Digits(date.getMonth() + 1)].join('/')} ${[].join(':')}`;
}

const MONTHS = [
  // 'Январь',
  // 'Февраль',
  // 'Март',
  // 'Апрель',
  // 'Май',
  // 'Июнь',
  // 'Июль',
  // 'Август',
  // 'Сентябрь',
  // 'Октябрь',
  // 'Ноябрь',
  // 'Декабрь',
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export function months(count, amount) {
  const cfg = count;
  const m = cfg[0] === '0' ? Number(cfg[1]) : Number(cfg);
  const res = [];

  const hashmap = {
    0: 12,
    '-1': 11,
    '-2': 10,
    '-3': 9,
    '-4': 8,
    '-5': 7,
    '-6': 6,
    '-7': 5,
    '-8': 4,
  };

  for (let q = m; q > m - amount; --q) {
    if (q <= 0) {
      res.push(MONTHS[hashmap[q - 1]]);
    } else {
      res.push(MONTHS[q - 1]);
    }
  }

  return res.reverse();
}

export function monthsNumb(currM, amount) {
  const res = [];

  const hashmap = {
    0: 12,
    '-1': 11,
    '-2': 10,
    '-3': 9,
    '-4': 8,
    '-5': 7,
    '-6': 6,
    '-7': 5,
    '-8': 4,
  };

  for (let q = currM; q > currM - amount; --q) {
    if (q <= 0) {
      res.push(hashmap[q]);
    } else {
      res.push(q);
    }
  }

  return res.reverse();
}
