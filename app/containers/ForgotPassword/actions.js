/*
 *
 * ForgotPassword actions
 *
 */

import { FORGOTPASSWORD_ACTION, FORGOTPASSWORDOTP_ACTION } from "./constants";

export function forgotPasswordData(value) {
  return {
    type: FORGOTPASSWORD_ACTION,
    payload: value
  };
}

export function forgotPasswordOtpdData(value) {
  return {
    type: FORGOTPASSWORDOTP_ACTION,
    payload: value
  };
}