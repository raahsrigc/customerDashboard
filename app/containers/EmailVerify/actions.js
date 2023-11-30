/*
 *
 * EmailVerify actions
 *
 */

import { EMAIL_ACTION, EMAILVALIDATION_ACTION} from './constants';

export function emailData(value) {
  return {
    type: EMAIL_ACTION,
    payload: value
  };
}

export function emailValidationData(value) {
  return {
    type: EMAILVALIDATION_ACTION,
    payload: value
  };
}