/*
 *
 * ForgotPassword reducer
 *
 */
import produce from "immer";
import { DEFAULT_ACTION, FORGOTPASSWORD_DATA_SUCCESS, FORGOTPASSWORD_ERROR, FORGOTPASSWORDOTP_DATA_SUCCESS, FORGOTPASSWORDOTP_ERROR } from "./constants";

export const initialState = {
  forgotPasswordDataResponse: [],
  forgotPasswordOtpDataResponse: [],
  error: ''
};
/* eslint-disable default-case, no-param-reassign */
const forgotPasswordReducer = (state = initialState, action) =>
  produce(state, (/* draft */) => {
    switch (action.type) {
      case FORGOTPASSWORD_DATA_SUCCESS:
        return {
          ...state,
          forgotPasswordDataResponse: action.payload
        }
      case FORGOTPASSWORD_ERROR:
        return {
          ...state,
          error: action.error
        }
      case FORGOTPASSWORDOTP_DATA_SUCCESS:
        return {
          ...state,
          forgotPasswordOtpDataResponse: action.payload
        }
      case FORGOTPASSWORDOTP_ERROR:
        return {
          ...state,
          error: action.error
        }
      case DEFAULT_ACTION:
        break;
    }
  });

export default forgotPasswordReducer;
