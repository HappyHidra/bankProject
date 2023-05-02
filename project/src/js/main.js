import 'babel-polyfill';
import '../scss/styles.scss';
import { setChildren, mount } from 'redom';
import Navigo from 'navigo';
import { Dropdown } from 'bootstrap';
import loginPage from './pages/loginPage';
import accountsPage from './pages/accountsPage';
import getHeader from './header';
import currentAccountPage from './pages/currentAccountPage';
import accountHistoryPage from './pages/accountHistoryPage';
import currencyPage from './pages/currencyPage';
import exchangesPage from './pages/exchangesPage';

export const router = new Navigo('/');

router.on('/', async () => {
  setChildren(document.body, getHeader('/'));
  await loginPage();
});

router.on('/account', async () => {
  const token = localStorage.getItem('token');
  setChildren(document.body, getHeader('/account'));
  await accountsPage(token);
});

router.on('/card/:id', async ({ data }) => {
  const token = localStorage.getItem('token');
  setChildren(document.body, getHeader('/account'));
  await currentAccountPage(token, data);
});

router.on('/card/:id/history', async ({ data }) => {
  const token = localStorage.getItem('token');
  setChildren(document.body, getHeader('/account'));
  await accountHistoryPage(token, data);
});

router.on('/currency', async () => {
  const token = localStorage.getItem('token');
  setChildren(document.body, getHeader('/currency'));
  await currencyPage(token);
});

router.on('/exchanges', async () => {
  setChildren(document.body, getHeader('/exchanges'));
  await exchangesPage();
});

router.resolve();
