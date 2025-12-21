import authService from "./authService";

type LogoutHandler = () => Promise<void> | void;

let logoutHandler: LogoutHandler | null = null;

export const setLogoutHandler = (handler: LogoutHandler | null) => {
  logoutHandler = handler;
};

export const requestLogout = async () => {
  if (logoutHandler) {
    await logoutHandler();
    return;
  }
  
  authService.logout();
};