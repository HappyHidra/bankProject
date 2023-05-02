export async function authorization(login, password) {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    body: JSON.stringify({
      login,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}

export async function getAccounts(token) {
  const response = await fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export async function createAccount(token) {
  const response = await fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
}

export async function getCurrentAccount(token, id) {
  const response = await fetch(`http://localhost:3000/account/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export async function transferFunds(from, to, amount, token) {
  const response = await fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export async function getAllCurrencies(token) {
  const response = await fetch('http://localhost:3000/all-currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export async function getCurrencies(token) {
  const response = await fetch('http://localhost:3000/currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export async function currencyBuy(from, to, amount, token) {
  const response = await fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to,
      amount,
    }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  return await response.json();
}

export function getCurrencyFeed() {
  return new WebSocket('ws://localhost:3000/currency-feed');
}

export async function getBanks() {
  const response = await fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}
