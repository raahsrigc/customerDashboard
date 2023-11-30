/*
 *
 * ChangePassword reducer
 *
 */
import produce from "immer";
import { DEFAULT_ACTION, CHANGEPASSWORD_DATA_SUCCESS, CHANGEPASSWORD_ERROR } from "./constants";

export const initialState = {
  changePasswordResponse: [],
  error: ''
};

/* eslint-disable default-case, no-param-reassign */
const changePasswordReducer = (state = initialState, action) =>
  produce(state, (/* draft */) => {
    switch (action.type) {
      case CHANGEPASSWORD_DATA_SUCCESS:
        return {
          ...state,
          changePasswordResponse: action.payload
        }
      case CHANGEPASSWORD_ERROR:
        return {
          ...state,
          error: action.error
        }
      case DEFAULT_ACTION:
        break;
    }
  });

export default changePasswordReducer;
