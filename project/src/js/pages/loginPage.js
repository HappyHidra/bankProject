import { el, setChildren } from 'redom';
import { authorization } from '../api';
import { router } from '../main';

const container = el('div', {
  class: 'd-flex justify-content-center login-container',
});

export default function () {
  const loginBtn = el(
    'button',
    { id: 'loginBtn', type: 'submit', class: 'btn btn-primary disabled' },
    'Войти'
  );

  const login = el('input', {
    class: 'form-control',
    id: 'login',
    name: 'login',
    // value: "123456"
    // value: 'developer',
    value: '',
  });

  const password = el('input', {
    class: 'form-control',
    id: 'password',
    name: 'password',
    type: 'password',
    // value: "123456"
    // value: 'skillbox',
    value: '',
  });

  const loginLabel = el('label', { for: 'login' }, 'Логин');
  const passwordLabel = el('label', { for: 'password' }, 'Пароль');

  const loginInfo = el('div', { id: 'login-info' });
  const passwordInfo = el('div', { id: 'password-info' });

  const formWrapper = el('div', { class: 'form-wrapper' });
  const form = el('form', { class: 'form' }, [
    el('h1', 'Вход в аккаунт'),
    el('div', { class: ['form-group'] }, loginLabel, login, loginInfo),
    el('div', { class: ['form-group'] }, passwordLabel, password, passwordInfo),
    loginBtn,
    el('div', { class: 'errors errors__input' }),
  ]);

  form.addEventListener('submit', (e) => e.preventDefault());

  let inputloginValue = null;
  let inputPasswordValue = null;

  // Отрисовка
  setChildren(formWrapper, form);
  setChildren(container, formWrapper);
  window.document.body.append(container);

  const errors = {
    login: '',
    password: '',
  };

  const errorsEl = document.querySelector('.errors');

  loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (inputloginValue && inputPasswordValue) {
      await authorization(inputloginValue, inputPasswordValue).then((resp) => {
        if (resp.error) {
          errorsEl.innerText = resp.error;
        } else {
          localStorage.setItem('token', resp.payload.token);
          router.navigate('account');
        }
      });
    }
  });

  [login, password].forEach((input) => {
    input.addEventListener('blur', (e) => {
      if (e.target.name === 'login') {
        inputloginValue = e.target.value;
        if (/\S{6,}$/g.test(inputloginValue)) {
          delete errors[e.target.name];
          login.classList.remove('is-invalid');
          login.classList.add('is-valid');
        } else {
          errors[e.target.name] = 'Длина больше 6, без пробельных символов';
          login.classList.remove('is-valid');
          login.classList.add('is-invalid');
        }
        loginInfo.textContent = errors[e.target.name];
      } else if (e.target.name === 'password') {
        inputPasswordValue = e.target.value;
        // password
        if (/\S{6,}$/g.test(e.target.value)) {
          delete errors[e.target.name];
          password.classList.remove('is-invalid');
          password.classList.add('is-valid');
        } else {
          errors[e.target.name] = 'Длина больше 6, без пробельных символов';
          password.classList.remove('is-valid');
          password.classList.add('is-invalid');
        }
        passwordInfo.textContent = errors[e.target.name];
      }
      // проверка на отсутствие ошибок в форме
      if (Object.keys(errors).length === 0) {
        loginBtn.classList.remove('disabled');
      } else {
        loginBtn.classList.add('disabled');
      }
    });
  });
}
