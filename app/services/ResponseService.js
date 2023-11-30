import { logout } from "./AuthService";

export function handleResponse(response) {
  if (response.results) {
    return response.results;
  }
  if (response.errorCode || response?.message == "Agent Disabled") {
    if (response?.errorCode === "SESSION_EXPIRED") {
      logout({ "email": sessionStorage.getItem('email') })
        .then(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/registration/session-expired");
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (response?.message == "Agent Disabled") {
      logout({ "email": sessionStorage.getItem('email') })
        .then(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.replace("/registration/invalid-agent");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      if (response?.errorCode === "INVALID_SESSION") {
        logout({ "email": sessionStorage.getItem('email') })
          .then(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/registration/invalid-session");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
  return response;
}

export function handleError(error) {
  if (error.data) {
    return error.data;
  }
  return error;
}
