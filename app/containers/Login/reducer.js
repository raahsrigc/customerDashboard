/*
 *
 * Login reducer
 *
 */
import produce from 'immer';
import { DEFAULT_ACTION, LOGIN_DATA_SUCCESS, LOGIN_ERROR } from "./constants";

export const initialState = {
  loginResponse: [],
  error: ''
};

/* eslint-disable default-case, no-param-reassign */
const loginReducer = (state = initialState, action) =>
  produce(state, (/* draft */) => {
    switch (action.type) {
      case LOGIN_DATA_SUCCESS:
        return {
          ...state,
          loginResponse: action.payload
        }
      case LOGIN_ERROR:
        return {
          ...state,
          error: action.error
        }
      case DEFAULT_ACTION:
        break;
    }
  });

export default loginReducer;
