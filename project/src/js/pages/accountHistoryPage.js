import { el, setChildren, mount, setAttr } from 'redom';
import { getCurrentAccount } from '../api';
import {
  getFormattedMonth,
  formatDate,
  months,
  monthsNumb,
} from '../helpers/formatDate';
import historyBarChart from '../helpers/historyBarChart';
import transactionsChart from '../helpers/transactionsChart';
import { router } from '../main';

export default async function accountHistoryPage(token, { id }) {
  const container = el('div', { class: 'container bill-container' });

  const backBtn = el(
    'button',
    { class: 'btn btn-primary back-btn' },
    'Вернуться назад'
  );

  backBtn.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate(`/card/${id}`, {
      title: id,
    });
  });

  const loader = el('div', { class: 'spinner-border', role: 'status' }, [
    el('span', { class: 'sr-only' }, 'Loading...'),
  ]);
  let loading = true;
  if (loading) {
    setChildren(container, loader);
    window.document.body.append(container);
  }

  await getCurrentAccount(token, id).then((resp) => {
    // console.log(resp.payload);
    loading = false;
    if (resp.error) {
      const errorEl = el(
        'div',
        { class: 'container bill-container' },
        `${resp.error}`
      );
      window.document.body.append(errorEl);
      return;
    }

    const account = resp.payload;
    let pagin = false;

    const pagination = el('nav', { class: 'pagination-container' }, [
      el(
        'button',
        {
          class: 'pagination-button',
          id: 'prev-button',
          'aria-label': 'Previous page',
          title: 'Previous page',
        },
        '<'
      ),
      el('div', { id: 'pagination-numbers' }),
      el(
        'button',
        {
          class: 'pagination-button',
          id: 'next-button',
          'aria-label': 'Next page',
          title: 'Next page',
        },
        '>'
      ),
    ]);

    if (account.transactions.length > 25) {
      pagin = true;
    }

    const transactions = account.transactions.reverse();
    // const transactions = account.transactions.slice(-25).reverse();
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

      const elem = el('div', { class: 'row paginatedList' }, [
        el('div', { class: 'col' }, [el('p'), `${transaction.from}`]),
        el('div', { class: 'col' }, [el('p'), `${transaction.to}`]),
        transactionAmount,
        el('div', { class: 'col' }, [el('p'), `${formattedDate}`]),
      ]);
      mount(transactionsEl, elem);
    });

    const row1 = el('div', { class: 'bill-rows' }, [
      el('h2', { class: 'bill-header' }, 'История баланса'),
      backBtn,
    ]);

    const row2 = el('div', { class: 'bill-rows' }, [
      el('p', { class: 'bill-acc' }, `№ ${account.account}`),
      el('p', { class: 'bill-balance' }, `Баланс ${account.balance} ₽`),
    ]);

    const row3 = el('div', { class: 'bill-rows history-rows' }, [
      el(
        'div',
        { class: 'dinamics-wrapper dinamics-wrapper_large flex-grow-1' },
        [
          el('h2', { class: 'bills-title' }, 'Динамика баланса'),
          el('canvas', { id: 'barChart' }),
        ]
      ),
    ]);

    const row4 = el('div', { class: 'bill-rows history-rows' }, [
      el(
        'div',
        { class: 'dinamics-wrapper dinamics-wrapper_large flex-grow-1' },
        [
          el(
            'h2',
            { class: 'bills-title' },
            'Соотношение входящих исходящих транзакций'
          ),
          el('canvas', { id: 'transactionsChart' }),
        ]
      ),
    ]);

    const row5 = el('div', { class: 'bill-rows transaction-rows' }, [
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

    if (pagin) {
      mount(row5, pagination);
    }
    setChildren(container, row1, row2, row3, row4, row5);

    window.document.body.append(container);

    // creating History BarChart

    const transactionsReversed = [...account.transactions];
    const yearAgo = Date.now() - 31104000000;
    const currentMonth = getFormattedMonth(new Date(Date.now())).trim();
    const cm =
      currentMonth[0] === '0' ? Number(currentMonth[1]) : Number(currentMonth);
    let currentAccBalance = account.balance;

    const monthlyBalance = {};
    const posTrans = {};
    const negTrans = {};

    const monthNumb = monthsNumb(cm, 12);
    monthNumb.forEach((month) => {
      if (month === cm) {
        monthlyBalance[`+${month}`] = currentAccBalance;
      } else {
        monthlyBalance[`+${month}`] = 0;
      }
      posTrans[`+${month}`] = [];
      negTrans[`+${month}`] = [];
    });

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
        if (yearAgo < Date.parse(transaction.date)) {
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
            negTrans[currMth].push(transaction.amount);
          }
          // Positive trans
          else {
            currentAccBalance -= transaction.amount;
            posTrans[currMth].push(transaction.amount);
          }
        }
      });
    }
    // console.log('After array: ', arrOfBalances);
    const labels = months(currentMonth, 12);
    arrOfBalances.reverse();
    if (arrOfBalances.length < 12) {
      for (let i = arrOfBalances.length; i < 12; ++i) {
        arrOfBalances.unshift(currentAccBalance);
      }
    }
    // console.log('After monthlyBalance: ', monthlyBalance);

    const maxValue = Math.max(...arrOfBalances);
    const minValue = Math.min(...arrOfBalances);

    // console.log('Final array: ', arrOfBalances);
    const barEl = document.getElementById('barChart');
    historyBarChart(barEl, arrOfBalances, cm, labels, minValue, maxValue);

    // Transactions BarChart

    const posOb = {};
    const negOb = {};

    // console.log('Pos array: ', posTrans);
    // console.log('Neg array: ', negTrans);

    Object.entries(posTrans).forEach((mb) => {
      const sumWithInitial = mb[1].reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue),
        0
      );
      posOb[mb[0]] = sumWithInitial;
    });

    Object.entries(negTrans).forEach((mb) => {
      const sumWithInitial = mb[1].reduce(
        (accumulator, currentValue) => accumulator + Number(currentValue),
        0
      );
      negOb[mb[0]] = sumWithInitial;
    });

    // console.log('Pos ob: ', posOb);
    // console.log('Neg ob: ', negOb);

    const negF = [];
    const posF = [];

    for (let i = 0; i < 12; ++i) {
      const k = `+${i + 1}`;
      if (posOb[k] !== 0 && negOb[k] !== 0) {
        const percents =
          (Math.round(negOb[k]) * 100) /
          (Math.round(posOb[k]) + Math.round(negOb[k]));
        negF.push(percents);
        const secPercents =
          percents - 100 < 0 ? 100 - percents : percents - 100;
        posF.push(secPercents);
      } else if (posOb[k] === 0 && negOb[k] === 0) {
        if (posF.includes(/[1-9]/g)) {
          negF.push(0);
          posF.push(0);
        } else {
          posF.unshift(0);
          negF.unshift(0);
        }
      } else if (posOb[k] !== 0) {
        posF.push(100);
        negF.push(0);
      } else if (negOb[k] !== 0) {
        negF.push(100);
        posF.push(0);
      }
    }

    // console.log('posF', posF);
    // console.log('negF', negF);

    const maxOfPositive = Math.max(...posF);
    const maxOfNegative = Math.max(...negF);

    const minOfMax =
      maxOfPositive < maxOfNegative ? maxOfPositive : maxOfNegative;

    const transactionsElem = document.getElementById('transactionsChart');
    transactionsChart(
      transactionsElem,
      posF,
      negF,
      labels,
      minValue,
      maxValue,
      minOfMax
    );

    // Pagination
    if (pagin) {
      const paginationNumbers = document.getElementById('pagination-numbers');
      const listItems = document.querySelectorAll('.paginatedList');
      const nextButton = document.getElementById('next-button');
      const prevButton = document.getElementById('prev-button');

      const paginationLimit = 25;
      const pageCount = Math.ceil(listItems.length / paginationLimit);
      let currentPage = 1;

      const disableButton = (button) => {
        button.classList.add('disabled');
        button.setAttribute('disabled', true);
      };

      const enableButton = (button) => {
        button.classList.remove('disabled');
        button.removeAttribute('disabled');
      };

      const handlePageButtonsStatus = () => {
        if (currentPage === 1) {
          disableButton(prevButton);
        } else {
          enableButton(prevButton);
        }

        if (pageCount === currentPage) {
          disableButton(nextButton);
        } else {
          enableButton(nextButton);
        }
      };

      const handleActivePageNumber = () => {
        document.querySelectorAll('.pagination-number').forEach((button) => {
          button.classList.remove('active');
          const pageIndex = Number(button.getAttribute('page-index'));
          if (pageIndex === currentPage) {
            button.classList.add('active');
          }
        });
      };

      const setCurrentPage = (pageNum) => {
        currentPage = pageNum;

        handleActivePageNumber();
        handlePageButtonsStatus();

        const prevRange = (pageNum - 1) * paginationLimit;
        const currRange = pageNum * paginationLimit;

        listItems.forEach((item, index) => {
          item.classList.add('hidden');
          if (index >= prevRange && index < currRange) {
            item.classList.remove('hidden');
          }
        });
      };

      const setListener = () => {
        document.querySelectorAll('.pagination-number').forEach((button) => {
          const pageIndex = Number(button.getAttribute('page-index'));

          if (pageIndex) {
            button.addEventListener('click', () => {
              setCurrentPage(pageIndex);
            });
          }
        });
      };

      const appendPageNumber = (index) => {
        const pageNumber = document.createElement('button');
        pageNumber.className = 'pagination-number';
        pageNumber.innerHTML = index;
        pageNumber.setAttribute('page-index', index);
        pageNumber.setAttribute('aria-label', `Page ${index}`);
        paginationNumbers.appendChild(pageNumber);
      };

      const getPaginationNumbers = (start, end) => {
        paginationNumbers.innerHTML = '';
        for (let i = start; i <= end; i++) {
          appendPageNumber(i);
        }
        setListener();
      };

      getPaginationNumbers(1, 5);
      setCurrentPage(1);

      prevButton.addEventListener('click', () => {
        setCurrentPage(currentPage - 1);
        getPaginationNumbers(currentPage, currentPage + 5);
      });

      nextButton.addEventListener('click', () => {
        setCurrentPage(currentPage + 1);
        getPaginationNumbers(currentPage, currentPage + 5);
      });
    }
  });
}
