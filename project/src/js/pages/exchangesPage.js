import { el, setChildren, mount, setAttr } from 'redom';
import { getBanks } from '../api';

const container = el('div', { class: 'container bill-container' });
const row1 = el('div', { class: 'bill-rows' }, [
  el('h2', { class: 'bill-header' }, 'Карта банкоматов'),
]);

export default async function exchangesPage() {
  const resp = await getBanks();

  const script = document.createElement('script');
  script.type = 'text/javascript';
  (script.src =
    'https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Ada7da6c967cc81915fbf53a61ec43a50fbd5c4d9540c2847c112430e3cc98a49&amp;width=769&amp;height=768&amp;lang=ru_RU&amp;scroll=true'),
    document.body.appendChild(script);

  const row2 = el('div', { class: 'map' }, script);

  // Отрисовка
  setChildren(container, row1, row2);
  window.document.body.append(container);
}
