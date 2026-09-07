const TOKEN_KEY = "repairlink_auth_token";
const USER_KEY = "repairlink_auth_user";

export function getStoredAuthSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);

    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function setStoredAuthSession({ accessToken, tokenType, user }) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, tokenType }));
}

export function updateStoredAuthUser(updates) {
  const session = getStoredAuthSession();

  if (!session.user) {
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ ...session.user, ...updates }),
  );
  window.dispatchEvent(new Event("repairlink_auth_updated"));
}

export function clearStoredAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isCustomerAuthenticated() {
  const session = getStoredAuthSession();
  return Boolean(session.token && session.user?.role === "CUSTOMER");
}
