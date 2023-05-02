import { variationPlacements } from '@popperjs/core';
import { el, setChildren, mount, setAttr } from 'redom';
import {
  getAllCurrencies,
  getCurrencies,
  currencyBuy,
  getCurrencyFeed,
} from '../api';
import { router } from '../main';

const container = el('div', { class: 'container bill-container' });
const changeBtn = el(
  'button',
  { class: 'btn btn-primary change-btn disabled' },
  'Обменять'
);

const allCurrEl = el('ul', { class: 'curr-list list-reset' });

const drawBalances = (payload) => {
  allCurrEl.innerHTML = '';
  Object.entries(payload).forEach((curr) => {
    // console.log(curr);
    const cel = el('li', { class: 'list__item' }, [
      el('span', { class: 'curr-titles' }, curr[0]),
      el('span', { class: 'dots-span' }),
      el('span', { class: 'curr-amount' }, curr[1].amount),
    ]);
    mount(allCurrEl, cel);
  });
};

export default async function currencyPage(token) {
  const allCurr = await getAllCurrencies(token);

  const allCurrEl1 = el('ul', {
    class: 'dropdown-menu',
    'aria-labelledby': 'fromBtn',
  });
  const allCurrEl2 = el('ul', {
    class: 'dropdown-menu',
    'aria-labelledby': 'toBtn',
  });

  const allCurrWebsocketEl = el('ul', { class: 'list-reset ul-feed' });
  const feedWrapper = el('div', { class: 'feed-wrapper' });
  const rightWrapper = el('div', { class: 'right-wrapper' }, [
    el('h2', { class: 'bills-title' }, 'Изменение курсов в реальном времени'),
  ]);

  allCurr.payload.forEach((curr) => {
    const elc = el('li', [
      el('a', { class: 'dropdown-item dd-from', href: '#' }, curr),
    ]);
    mount(allCurrEl1, elc);

    const elc2 = el('li', [
      el('a', { class: 'dropdown-item dd-to', href: '#' }, curr),
    ]);
    mount(allCurrEl2, elc2);

    // const elc3 = el('li', [el('span', { class: 'webs-li__item' }, curr)]);
    // mount(allCurrWebsocketEl, elc3);
  });

  // Первичный запрос баланса
  const allPersCurr = await getCurrencies(token);
  drawBalances(allPersCurr.payload);

  const row1 = el('div', { class: 'bill-rows' }, [
    el('h2', { class: 'bill-header' }, 'Валютный обмен'),
  ]);

  const row2 = el('div', { class: 'bill-rows exhange-row' }, [
    el('div', { class: 'left-wrapper' }, [
      el('div', { class: 'your-currencies-wrapper' }, [
        el('h2', { class: 'bills-title' }, 'Ваши валюты'),
        allCurrEl,
      ]),
      el('div', { class: 'exchange-currencies-wrapper' }, [
        el('h2', { class: 'bills-title' }, 'Обмен валюты'),
        el('form', { class: 'form d-flex' }, [
          el('div', { class: ['form-exchange__row form-exchange__row-left'] }, [
            el('div', { class: 'form-exchange__input-group w-auto' }, [
              el(
                'label',
                { class: 'form-exchange__descr', for: 'billNumber' },
                'Из'
              ),
              el('div', { class: 'dropdown' }, [
                el(
                  'button',
                  {
                    class: 'btn dropdown-toggle exchange-dropdown',
                    type: 'button',
                    id: 'fromBtn',
                    'data-bs-toggle': 'dropdown',
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false',
                  },
                  'BTC'
                ),
                allCurrEl1,
              ]),
              el(
                'span',
                {
                  class: 'span-curr',
                },
                'в'
              ),
              el('div', { class: 'dropdown' }, [
                el(
                  'button',
                  {
                    class: 'btn dropdown-toggle exchange-dropdown',
                    type: 'button',
                    id: 'toBtn',
                    'data-bs-toggle': 'dropdown',
                    'aria-haspopup': 'true',
                    'aria-expanded': 'false',
                  },
                  'ETH'
                ),
                allCurrEl2,
              ]),
            ]),
            el('div', { class: 'form-exchange__input-group w-auto' }, [
              el('label', { class: 'form-exchange__descr' }, 'Сумма'),
              el('input', {
                class: ['form-control w-auto'],
                id: 'transferAmount',
              }),
            ]),
            el('div', { class: 'errors errors__input' }),
          ]),
          el('div', { class: ['form-exchange__row'] }, [changeBtn]),
        ]),
      ]),
    ]),
    rightWrapper,
  ]);

  const socket = getCurrencyFeed();
  socket.onopen = function (event) {
    // console.log('Open:', event);
    mount(feedWrapper, allCurrWebsocketEl);
    mount(rightWrapper, feedWrapper);
  };
  socket.onmessage = function (event) {
    const { type, from, to, rate, change } = JSON.parse(event.data);
    if (type === 'EXCHANGE_RATE_CHANGE') {
      const upDown = el('span');
      const dotSpan = el('span', { class: 'dots-span' });
      if (change === 1) {
        setAttr(upDown, { className: 'curr-up' });
        setAttr(dotSpan, { className: 'dots-span dots-span_up' });
      } else if (change === -1) {
        setAttr(upDown, { className: 'curr-down' });
        setAttr(dotSpan, { className: 'dots-span dots-span_down' });
      } else {
        setAttr(upDown, { className: 'curr-stable' });
        setAttr(dotSpan, { className: 'dots-span' });
      }

      const nodesCurr = document.querySelectorAll('.list__item-curr');
      const exists = [];
      nodesCurr.forEach((node) => {
        exists.push(node.innerText.split('\n')[0]);
      });
      // console.log(exists);

      const found = exists.find((el2) => {
        const current = `${from}/${to}`;
        return el2 === current;
      });
      // console.log(found);
      if (!found) {
        const updatedEl = el('li', { class: 'list__item list__item-curr' }, [
          el('span', { class: 'curr-titles' }, `${from}/${to}`),
          dotSpan,
          el('span', { class: 'curr-amount' }, rate),
          upDown,
        ]);
        mount(allCurrWebsocketEl, updatedEl);
      }
      if (found) {
        let foundEl;
        nodesCurr.forEach((node) => {
          if (node.innerText.split('\n')[0] === found) {
            foundEl = node;
          }
        });
        const updatedEl = el('li', { class: 'list__item list__item-curr' }, [
          el('span', { class: 'curr-titles' }, `${from}/${to}`),
          dotSpan,
          el('span', { class: 'curr-amount' }, rate),
          upDown,
        ]);
        mount(allCurrWebsocketEl, updatedEl, foundEl, true);
      }
    }
  };
  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`
      );
    } else {
      // например, сервер убил процесс или сеть недоступна
      // обычно в этом случае event.code 1006
      console.log('[close] Соединение прервано');
    }
  };
  socket.onerror = function (error) {
    console.log('[error]');
  };

  // Отрисовка
  setChildren(container, row1, row2);
  window.document.body.append(container);

  // После отрисовки
  const ddfrom = document.querySelectorAll('.dd-from');
  const ddto = document.querySelectorAll('.dd-to');
  const fromBtnEl = document.querySelector('#fromBtn');
  const toBtnEl = document.querySelector('#toBtn');

  ddfrom.forEach((filter) => {
    filter.addEventListener('click', (e) => {
      e.preventDefault();
      fromBtnEl.innerText = e.target.innerText;
    });
  });
  ddto.forEach((filter) => {
    filter.addEventListener('click', (e) => {
      e.preventDefault();
      toBtnEl.innerText = e.target.innerText;
    });
  });

  // Errors
  const errors = {
    amount: '',
  };

  const errorsEl = document.querySelector('.errors');

  const transferAmount = document.querySelector('#transferAmount');
  transferAmount.addEventListener('blur', (e) => {
    if (/^[0-9]{1,7}$/g.test(e.target.value)) {
      delete errors.amount;
      transferAmount.classList.remove('is-invalid');
      transferAmount.classList.add('is-valid');
      errorsEl.innerText = '';
    } else {
      errors.amount = 'Положительное значение, до 1млн.';
      errorsEl.innerText = errors.amount;
      transferAmount.classList.remove('is-valid');
      transferAmount.classList.add('is-invalid');
    }
    // проверка на отсутствие ошибок в форме
    if (Object.keys(errors).length === 0) {
      changeBtn.classList.remove('disabled');
    } else {
      changeBtn.classList.add('disabled');
    }
  });

  changeBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const from = fromBtnEl.textContent;
    const to = toBtnEl.textContent;
    const amount = transferAmount.value;
    const resp = await currencyBuy(from, to, amount, token);
    if (resp.error) {
      errorsEl.innerText = resp.error;
    } else {
      // Перерисовка баланса
      drawBalances(resp.payload);
    }
  });
  // end of func
}
