import { el, setAttr, mount } from 'redom';
import { router } from './main';

export default function getHeader(currentPage) {
  const containerFluid = el('div', { class: 'container-fluid' });

  const exchangesBtn = el(
    'li',
    { class: 'col btn btn-light  menu-btn ' },
    'Банкоматы'
  );
  const billsBtn = el('li', { class: 'col btn btn-light  menu-btn' }, 'Счета');
  const currencyBtn = el(
    'li',
    { class: 'col btn btn-light  menu-btn' },
    'Валюта'
  );

  const logoutBtn = el('li', { class: 'col btn btn-light  menu-btn' }, 'Выйти');

  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/');
  });

  billsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    exchangesBtn.classList.remove('disabled');
    currencyBtn.classList.remove('disabled');
    billsBtn.classList.add('disabled');
    router.navigate('/account');
  });

  currencyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    exchangesBtn.classList.remove('disabled');
    billsBtn.classList.remove('disabled');
    currencyBtn.classList.add('disabled');
    router.navigate('/currency');
  });

  exchangesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    billsBtn.classList.remove('disabled');
    currencyBtn.classList.remove('disabled');
    exchangesBtn.classList.add('disabled');
    router.navigate('/exchanges');
  });

  const header = el('header', { class: 'header' });
  const headerh2 = el('h2', {}, 'Coin.');

  mount(header, headerh2);

  // login page
  // if (currentPage === '/') {
  //   return header;
  // }

  // account page
  if (currentPage === '/account') {
    setAttr(headerh2, {
      className: 'flex',
    });
    setAttr(billsBtn, { className: 'col btn btn-light  menu-btn disabled' });
  }

  // exchangesPage
  if (currentPage === '/exchanges') {
    setAttr(headerh2, {
      className: 'flex',
    });
    setAttr(exchangesBtn, {
      className: 'col btn btn-light  menu-btn disabled',
    });
  }
  // currencyPage
  if (currentPage === '/currency') {
    setAttr(headerh2, {
      className: 'flex',
    });
    setAttr(currencyBtn, { className: 'col btn btn-light  menu-btn disabled' });
  }

  mount(
    header,
    el('ul', { class: 'menu-list' }, [
      exchangesBtn,
      billsBtn,
      currencyBtn,
      logoutBtn,
    ])
  );
  mount(containerFluid, header);
  return containerFluid;
}
