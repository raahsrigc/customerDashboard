/*
 *
 * SignUp reducer
 *
 */
import produce from "immer";
import { DEFAULT_ACTION, SIGNUP_DATA_SUCCESS, SIGNUP_ERROR, EMAILVALIDATION_DATA_SUCCESS, EMAILVALIDATION_ERROR, EMAIL_DATA_SUCCESS, EMAIL_ERROR } from "./constants";

export const initialState = {
  signUpResponse: [],
  emailValidationResponse: [],
  emailResponse: [],
  error: ''
};

/* eslint-disable default-case, no-param-reassign */
const signUpReducer = (state = initialState, action) =>
  produce(state, (/* draft */) => {
    switch (action.type) {
      case EMAILVALIDATION_DATA_SUCCESS:
        return {
          ...state,
          emailValidationResponse: action.payload
        }
      case EMAILVALIDATION_ERROR:
        return {
          ...state,
          error: action.error
        }
      case SIGNUP_DATA_SUCCESS:
        return {
          ...state,
          signUpResponse: action.payload
        }
      case SIGNUP_ERROR:
        return {
          ...state,
          error: action.error
        }
      case EMAIL_DATA_SUCCESS:
        return {
          ...state,
          emailResponse: action.payload
        }
      case EMAIL_ERROR:
        return {
          ...state,
          error: action.error
        }
      case DEFAULT_ACTION:
        break;
    }
  });

export default signUpReducer;
