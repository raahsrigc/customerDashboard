/*
 *
 * GetStarted reducer
 *
 */
import produce from "immer";
import { DEFAULT_ACTION, RCVERIFY_DATA_SUCCESS, RCVERIFY_ERROR, ACTIVATEACCOUNT_DATA_SUCCESS, ACTIVATEACCOUNT_ERROR } from "./constants";

export const initialState = {
  activateAccountResponse: {},
  rcVerifyResponse: {},
  error: ''
};
/* eslint-disable default-case, no-param-reassign */
const getStartedReducer = (state = initialState, action) =>
  produce(state, (/* draft */) => {
    switch (action.type) {
      case RCVERIFY_DATA_SUCCESS:
        return {
          ...state,
          rcVerifyResponse: action.payload
        }
      case RCVERIFY_ERROR:
        return {
          ...state,
          rcVerifyResponse: action.payload
        }
      case ACTIVATEACCOUNT_DATA_SUCCESS:
        return {
          ...state,
          activateAccountResponse: action.payload
        }
      case ACTIVATEACCOUNT_ERROR:
        return {
          ...state,
          activateAccountResponse: action.payload
        }
      case DEFAULT_ACTION:
        break;
    }
  });

export default getStartedReducer;
