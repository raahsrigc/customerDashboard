/*
 *
 * ChangePassword actions
 *
 */

import { CHANGEPASSWORD_ACTION } from "./constants";


export function changePasswordData(value) {
  return {
    type: CHANGEPASSWORD_ACTION,
    payload: value
  };
}