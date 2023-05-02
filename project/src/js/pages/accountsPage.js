import { el, setChildren } from 'redom';
import { getAccounts, createAccount } from '../api';
import { router } from '../main';

const getFormattedMonth = (mt) => {
  const month = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  return month[mt];
};

const getAccountsList = (arr) =>
  arr.map((account) => {
    const date = account.transactions[0]
      ? new Date(account.transactions[0].date)
      : new Date();
    const [month, day, year] = [
      date.getMonth(),
      date.getDate(),
      date.getFullYear(),
    ];

    const monthFormatted = getFormattedMonth(month);

    const openBtn = el(
      'button',
      { class: 'btn btn-primary bills-btn' },
      'Открыть'
    );

    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(`/card/${account.account}`, {
        title: account.account,
      });
    });

    const card = el('div', { class: 'col-4 card-rows' }, [
      el(
        'div',
        { class: 'card' },
        el('div', { class: 'bills-body' }, [
          el(
            'div',
            { class: 'row m-0' },
            el('div', { class: 'col-8 p-0' }, [
              el('h2', { class: 'card-title bills-title' }, account.account),
              el('div', { class: 'bills-text' }, `${account.balance} ₽`),
              el('div', { class: 'bills-desrc' }, 'Последняя транзакция:', [
                el('div', `${day} ${monthFormatted} ${year}`),
              ]),
            ]),
            el('div', { class: 'col-4 p-0 bills-btn-flex' }, openBtn)
          ),
        ])
      ),
    ]);
    return card;
  });

const createNewBillBtn = el(
  'div',
  { class: 'btn btn-primary createNewBillBtn' },
  '+ Создать новый счёт'
);

createNewBillBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  await createAccount(token).then(() => {
    const oldList = document.querySelector('.your-bills-container');
    oldList.remove();
    accountsPage(token);
  });
});

const dropdownFilter = el('div', { class: 'dropdown bills-dropdown' }, [
  el(
    'button',
    {
      class: 'btn btn-light dropdown-toggle',
      type: 'button',
      id: 'sortMenuButton',
      'data-bs-toggle': 'dropdown',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    },
    'Сортировка'
  ),
  el(
    'div',
    {
      class: 'dropdown-menu',
      'aria-labelledby': 'sortMenuButton',
    },
    [
      el('a', { class: 'dropdown-item', href: '#' }, 'По номеру'),
      el('a', { class: 'dropdown-item', href: '#' }, 'По балансу'),
      el('a', { class: 'dropdown-item', href: '#' }, 'По последней транзакции'),
    ]
  ),
]);

const head = el('div', { class: 'your-bills' }, [
  el('div', { class: 'your-bills-title' }, 'Ваши счета'),
  dropdownFilter,
  createNewBillBtn,
]);

const row = el('div', { class: 'row' });

export default async function accountsPage(token) {
  const container = el('div', { class: 'container your-bills-container' });
  await getAccounts(token).then((resp) => {
    if (resp.error) {
      setChildren(container, el('div', { class: 'error' }, resp.error));
      window.document.body.append(container);
      return;
    }
    const accountsArr = resp.payload;

    setChildren(row, getAccountsList(accountsArr));
    setChildren(container, head, row);
    window.document.body.append(container);

    const dropdownElementList = document.querySelectorAll('.dropdown-item');
    const dropdownToggle = document.querySelector('.dropdown-toggle');

    dropdownElementList.forEach((filter) => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        dropdownToggle.innerText = e.target.innerText;
        const copy = [...resp.payload];
        if (e.target.innerText === 'По номеру') {
          copy.sort((a, b) => a.account - b.account);
          setChildren(row, getAccountsList(copy));
        }

        if (e.target.innerText === 'По балансу') {
          copy.sort((a, b) => a.balance - b.balance);
          setChildren(row, getAccountsList(copy));
        }
        if (e.target.innerText === 'По последней транзакции') {
          copy.sort((a, b) => {
            if (a.transactions.length > 0 && b.transactions.length > 0) {
              return a.transactions[0].date - b.transactions[0].date;
            }
            return a > b;
          });
          setChildren(row, getAccountsList(copy));
        }
        setChildren(container, head, row);
        window.document.body.append(container);
      });
    });
  });
}
