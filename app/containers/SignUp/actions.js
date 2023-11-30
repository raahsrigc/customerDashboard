/*
 *
 * SignUp actions
 *
 */

import { SIGNUP_ACTION, EMAILVALIDATION_ACTION, EMAIL_ACTION} from './constants';

export function signupData(value) {
  return {
    type: SIGNUP_ACTION,
    payload: value
  };
}

export function emailValidationData(value) {
  return {
    type: EMAILVALIDATION_ACTION,
    payload: value
  };
}

export function emailData(value) {
  return {
    type: EMAIL_ACTION,
    payload: value
  };
}