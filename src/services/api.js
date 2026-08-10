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

function adminRequest(path, email, options = {}) {
  return request(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'demo-jwt-token',
      'x-user-email': email,
      ...(options.headers || {}),
    },
  });
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

export async function getAdminSummary(email) {
  return adminRequest('/api/admin/summary', email, { method: 'GET' });
}

export async function getAdminAuditLogs(email, limit = 50) {
  return adminRequest(`/api/admin/audit-logs?limit=${encodeURIComponent(limit)}`, email, { method: 'GET' });
}

export async function getAdminUsers(email) {
  return adminRequest('/api/admin/users', email, { method: 'GET' });
}

export async function updateAdminUser(email, userId, payload) {
  return adminRequest(`/api/admin/users/${userId}`, email, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateVotingWindow(email, votingOpen) {
  return adminRequest('/api/admin/voting-window', email, {
    method: 'PATCH',
    body: JSON.stringify({ votingOpen }),
  });
}

export async function createBanner(email, payload) {
  return adminRequest('/api/admin/banners', email, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateBanner(email, bannerId, payload) {
  return adminRequest(`/api/admin/banners/${bannerId}`, email, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function createBroadcast(email, payload) {
  return adminRequest('/api/admin/broadcasts', email, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPurchaseGroups(email) {
  return adminRequest('/api/admin/purchase-groups', email, { method: 'GET' });
}

export async function createPurchaseGroup(email, payload) {
  return adminRequest('/api/admin/purchase-groups', email, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePurchaseGroup(email, groupId, payload) {
  return adminRequest(`/api/admin/purchase-groups/${groupId}`, email, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getAdminPosts(email) {
  return adminRequest('/api/admin/posts', email, { method: 'GET' });
}

export async function updateAdminPost(email, postId, payload) {
  return adminRequest(`/api/admin/posts/${postId}`, email, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getCommunityPosts() {
  return request('/api/community-posts', { method: 'GET' });
}

export async function createCommunityPost(payload) {
  return request('/api/community-posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
