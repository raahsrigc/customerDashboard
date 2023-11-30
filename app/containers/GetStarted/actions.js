/*
 *
 * GetStarted actions
 *
 */

import { RCVERIFY_ACTION, ACTIVATEACCOUNT_ACTION } from "./constants";

export function rcVerifyData(value) {
  return {
    type: RCVERIFY_ACTION,
    payload: value
  };
}


export function activateAccountData(value) {
  return {
    type: ACTIVATEACCOUNT_ACTION,
    payload: value
  };
}
