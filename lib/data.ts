export const DATASET_LS_KEY = "policyguard:dataset";
export const USERS_LS_KEY = "policyguard:users";

export type Row = Record<string, any>;

export function saveDatasetToLS(rows: Row[]) {
  try {
    localStorage.setItem(DATASET_LS_KEY, JSON.stringify(rows));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadDatasetFromLS(): Row[] {
  try {
    const v = localStorage.getItem(DATASET_LS_KEY);
    if (!v) return [];
    return JSON.parse(v) as Row[];
  } catch (e) {
    return [];
  }
}

export function saveUsersToLS(users: any[]) {
  try {
    localStorage.setItem(USERS_LS_KEY, JSON.stringify(users));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadUsersFromLS(): any[] {
  try {
    const v = localStorage.getItem(USERS_LS_KEY);
    if (!v) return [];
    return JSON.parse(v);
  } catch (e) {
    return [];
  }
}

export function downloadJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const AUTH_LS_KEY = "policyguard:auth";

export function setAuth(userId: string) {
  try {
    const payload = { userId, ts: Date.now() };
    localStorage.setItem(AUTH_LS_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    return false;
  }
}

export function clearAuth() {
  try {
    localStorage.removeItem(AUTH_LS_KEY);
    return true;
  } catch (e) {
    return false;
  }
}

export function getAuthUser(): { userId: string; ts: number } | null {
  try {
    const v = localStorage.getItem(AUTH_LS_KEY);
    if (!v) return null;
    return JSON.parse(v);
  } catch (e) {
    return null;
  }
}

export function isAuthenticated(): boolean {
  try {
    return getAuthUser() !== null;
  } catch (e) {
    return false;
  }
}
