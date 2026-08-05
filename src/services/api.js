async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'הפעולה נכשלה');
  }

  return data;
}

export async function loginUser(email, password) {
  return request('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser({ name, email, password, cardNumber }) {
  return request('/api/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, cardNumber }),
  });
}

export async function topupBalance(email, amount) {
  return request('/api/topup', {
    method: 'POST',
    body: JSON.stringify({ email, amount }),
  });
}

export async function getAdminUsers(token) {
  return request('/api/admin/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
}
