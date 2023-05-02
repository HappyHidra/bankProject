import { el, setChildren, mount, setAttr } from 'redom';
import barChart from '../helpers/barChart';
import { getCurrentAccount, transferFunds } from '../api';
import {
  getFormattedMonth,
  formatDate,
  months,
  monthsNumb,
} from '../helpers/formatDate';
import { router } from '../main';

export default async function currentAccountPage(token, { id }) {
  const backBtn = el(
    'button',
    { class: 'btn btn-primary back-btn' },
    'Вернуться назад'
  );

  const sendBtn = el(
    'button',
    { class: 'btn btn-primary back-btn disabled', id: 'sendBtn' },
    'Отправить'
  );

  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/account');
  });

  await getCurrentAccount(token, id).then((resp) => {
    if (resp.error) {
      const errorEl = el(
        'div',
        { class: 'container bill-container' },
        `${resp.error}`
      );
      window.document.body.append(errorEl);
      return;
    }
    // console.log(resp.payload);
    const container = el('div', { class: 'container bill-container' });
    const account = resp.payload;
    const transactions = account.transactions.slice(-10).reverse();

    const transactionsEl = el('div', { class: 'row justify-content-center' });
    transactions.forEach((transaction) => {
      const transactionAmount = el('div', [el('p'), `${transaction.amount} ₽`]);

      if (transaction.from === account.account) {
        setAttr(transactionAmount, {
          class: 'col text-danger',
        });
      } else {
        setAttr(transactionAmount, {
          class: 'col text-success',
        });
      }

      const formattedDate = formatDate(new Date(transaction.date));

      const elem = el('div', { class: 'row' }, [
        el('div', { class: 'col' }, [el('p'), `${transaction.from}`]),
        el('div', { class: 'col' }, [el('p'), `${transaction.to}`]),
        transactionAmount,
        el('div', { class: 'col' }, [el('p'), `${formattedDate}`]),
      ]);
      mount(transactionsEl, elem);
    });

    const savedBillsEl = el('');
    if (localStorage.getItem('bills')) {
      const savedBills = localStorage.getItem('bills').split(' ');
      if (savedBills.length > 0) {
        savedBills.forEach((bill) => {
          mount(
            savedBillsEl,
            el('a', { class: 'dropdown-item', href: '#' }, `${bill}`)
          );
        });
      }
    }

    const row1 = el('div', { class: 'bill-rows' }, [
      el('h2', { class: 'bill-header' }, 'Просмотр счёта'),
      backBtn,
    ]);

    const row2 = el('div', { class: 'bill-rows' }, [
      el('p', { class: 'bill-acc' }, `№ ${account.account}`),
      el('p', { class: 'bill-balance' }, `Баланс ${account.balance} ₽`),
    ]);

    const row3 = el('div', { class: 'bill-rows' }, [
      el('div', { class: 'form-send-wrapper' }, [
        el('form', { class: 'form' }, [
          el('h2', { class: 'bills-title' }, 'Новый перевод'),
          el('div', { class: ['form-row1'] }, [
            el(
              'label',
              { class: 'form-descr', for: 'billNumber' },
              'Номер счёта получателя'
            ),
            el('div', { class: 'input-group w-auto' }, [
              el('input', {
                type: 'text',
                required: 'true',
                class: 'form-control',
                id: 'transferToBill',
              }),
              el('div', { class: 'dropdown' }, [
                el('button', {
                  class: 'btn btn-light dropdown-toggle',
                  type: 'button',
                  id: 'sortBtn',
                  'data-bs-toggle': 'dropdown',
                  'aria-haspopup': 'true',
                  'aria-expanded': 'false',
                }),
                el(
                  'div',
                  {
                    class: 'dropdown-menu',
                    'aria-labelledby': 'sortBtn',
                  },
                  savedBillsEl
                ),
              ]),
            ]),
          ]),
          el('div', { class: ['form-row1'] }, [
            el('label', { class: 'form-descr' }, 'Сумма перевода'),
            el('input', {
              class: ['form-control w-auto'],
              id: 'transferAmount',
            }),
          ]),
          el('div', { class: ['form-row1'] }, [
            sendBtn,
            el('div', { class: 'errors errors__input' }),
          ]),
        ]),
      ]),

      el('div', { class: 'dinamics-wrapper' }, [
        el('h2', { class: 'bills-title' }, 'Динамика баланса'),
        el('canvas', { id: 'barChart' }),
      ]),
    ]);

    const row4 = el('div', { class: 'bill-rows' }, [
      el('div', { class: 'form-history-wrapper' }, [
        el('h2', { class: 'bills-title' }, 'История переводов', []),
        el('div', { class: 'table-row table-header' }, [
          el('div', { class: 'col table-head' }, [el('p'), 'Счёт отправителя']),
          el('div', { class: 'col table-head' }, [el('p'), 'Счёт получателя']),
          el('div', { class: 'col table-head' }, [el('p'), 'Сумма']),
          el('div', { class: 'col table-head' }, [el('p'), 'Дата']),
        ]),
        el('div', { class: ['table-row'] }, [transactionsEl]),
      ]),
    ]);
    setChildren(container, row1, row2, row3, row4);
    window.document.body.append(container);

    // creating BarChart

    const transactionsReversed = [...account.transactions.reverse()];
    const halfYear = Date.now() - 15552000000;
    const currentMonth = getFormattedMonth(new Date(Date.now())).trim();
    const cm =
      currentMonth[0] === '0' ? Number(currentMonth[1]) : Number(currentMonth);
    let currentAccBalance = account.balance;

    const monthlyBalance = {};
    const monthNumb = monthsNumb(cm, 6);
    monthNumb.forEach((month) => {
      if (month === cm) {
        monthlyBalance[`+${month}`] = currentAccBalance;
      } else {
        monthlyBalance[`+${month}`] = 0;
      }
    });
    // console.log('monthlyBalance before: ', monthlyBalance);
    const currentAcc = account.account;

    let currMth = '+';
    const arrOfBalances = [];

    // Дата последней транзакции
    if (transactionsReversed.length > 0) {
      if (
        Number(getFormattedMonth(new Date(transactionsReversed[0].date))) !==
        Number(currentMonth)
      ) {
        arrOfBalances.push(currentAccBalance);
      }

      transactionsReversed.forEach((transaction) => {
        if (halfYear < Date.parse(transaction.date)) {
          if (
            currMth !== `+${getFormattedMonth(new Date(transaction.date)) - 1}`
          ) {
            currMth = `+${getFormattedMonth(new Date(transaction.date)) - 1}`;
            monthlyBalance[currMth] = currentAccBalance;
            arrOfBalances.push(currentAccBalance);
          }
          currMth = `+${getFormattedMonth(new Date(transaction.date)) - 1}`;

          // Negative trans
          if (transaction.from === currentAcc) {
            currentAccBalance += transaction.amount;
          }
          // Positive trans
          else {
            currentAccBalance -= transaction.amount;
          }
        }
      });
    }

    // console.log('After array: ', arrOfBalances);
    const labels = months(currentMonth, 6);
    arrOfBalances.reverse();
    if (arrOfBalances.length < 6) {
      for (let i = arrOfBalances.length; i < 6; ++i) {
        arrOfBalances.unshift(currentAccBalance);
      }
    }

    const maxValue = Math.max(...arrOfBalances);
    const minValue = Math.min(...arrOfBalances);

    // console.log('Final array: ', arrOfBalances);
    const barEl = document.getElementById('barChart');
    const barEx = barChart(
      barEl,
      arrOfBalances,
      cm,
      labels,
      minValue,
      maxValue
    );

    function chartDestroy(chart) {
      chart.destroy();
    }
    // Errors
    const errors = {
      to: '',
      amount: '',
    };

    // input amount
    const transferAmount = document.querySelector('#transferAmount');
    transferAmount.addEventListener('input', (e) => {
      if (/^\d{1,8}$/g.test(e.target.value)) {
        delete errors.amount;
        transferAmount.classList.remove('is-invalid');
        transferAmount.classList.add('is-valid');
      } else {
        errors.amount = 'Цифры, до 6 шт.';
        transferAmount.classList.remove('is-valid');
        transferAmount.classList.add('is-invalid');
      }
      // проверка на отсутствие ошибок в форме
      if (Object.keys(errors).length === 0) {
        sendBtn.classList.remove('disabled');
      } else {
        sendBtn.classList.add('disabled');
      }
    });
    // input bill

    const transferToBill = document.querySelector('#transferToBill');
    transferToBill.addEventListener('blur', (e) => {
      if (/^\d{16,26}$/g.test(e.target.value)) {
        delete errors.to;
        transferToBill.classList.remove('is-invalid');
        transferToBill.classList.add('is-valid');
      } else {
        errors.to = 'Цифры, до 6 шт.';
        transferToBill.classList.remove('is-valid');
        transferToBill.classList.add('is-invalid');
      }
      // проверка на отсутствие ошибок в форме
      if (Object.keys(errors).length === 0) {
        sendBtn.classList.remove('disabled');
      } else {
        sendBtn.classList.add('disabled');
      }
    });
    // select
    const dropdownElementList = document.querySelectorAll('.dropdown-item');
    dropdownElementList.forEach((filter) => {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        transferToBill.value = e.target.innerText;
        transferToBill.focus();
      });
    });
    // send
    const errorsEl = document.querySelector('.errors');

    sendBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await transferFunds(
        account.account,
        transferToBill.value,
        transferAmount.value,
        token
      ).then((res) => {
        if (res.error === '') {
          errorsEl.innerText = '';
          if (localStorage.getItem('bills')) {
            const prevBills = localStorage.getItem('bills').split(' ');
            if (!prevBills.includes(transferToBill.value)) {
              // console.log(prevBills);
              const newBills = `${localStorage.getItem('bills')} ${
                transferToBill.value
              }`;
              localStorage.setItem('bills', newBills);
            }
          } else {
            localStorage.setItem('bills', transferToBill.value);
          }
          transferToBill.value = '';
          transferAmount.value = '';
          transferAmount.classList.remove('is-valid');
          transferToBill.classList.remove('is-valid');
          sendBtn.classList.add('disabled');
          container.innerHTML = '';
          chartDestroy(barEx);
          currentAccountPage(token, { id });
        } else {
          errorsEl.innerText = res.error;
        }
      });
    });

    barEl.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(`/card/${account.account}/history`, {
        title: account.account,
      });
    });

    document
      .querySelector('.form-history-wrapper')
      .addEventListener('click', (e) => {
        e.preventDefault();
        router.navigate(`/card/${account.account}/history`, {
          title: account.account,
        });
      });
  });
}
