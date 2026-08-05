export async function getAdminUsers() {
  const response = await fetch('/api/admin/users');
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'לא ניתן לטעון משתמשים');
  return data.users || [];
}
