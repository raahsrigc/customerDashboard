/*
 *
 * Login actions
 *
 */

import { LOGIN_ACTION } from './constants';

export function loginData(value) {
  return {
    type: LOGIN_ACTION,
    payload: value
  };
}