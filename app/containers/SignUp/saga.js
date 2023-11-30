import { call, put, takeLatest } from 'redux-saga/effects';
import { EMAIL_ACTION, EMAIL_DATA_SUCCESS, EMAIL_ERROR, SIGNUP_ACTION, SIGNUP_DATA_SUCCESS, SIGNUP_ERROR, EMAILVALIDATION_ACTION, EMAILVALIDATION_DATA_SUCCESS, EMAILVALIDATION_ERROR } from "./constants";
import {signupData, emailValidationData, forgotPassword} from '../../services/AuthService'
import message from 'antd/es/message';

function* signupLoadData (payload) {
  try {
    const signupDataApi = yield call(signupData, payload)
    if(signupDataApi && signupDataApi.success) {
      message.success(signupDataApi.message);
      yield put({
        type: SIGNUP_DATA_SUCCESS,
        payload: signupDataApi
      })
    }
    else {
      message.error(signupDataApi && signupDataApi.message);
    }
  }
  catch(e) {
    yield put({
      type: SIGNUP_ERROR,
      error: e,
    })
  }
}

function* emailValidationLoadData (payload) {
  try {
    const emailValidationDataApi = yield call(emailValidationData, payload)
    if(emailValidationDataApi && emailValidationDataApi.success) {
      message.success(emailValidationDataApi.message);
      yield put({
        type: EMAILVALIDATION_DATA_SUCCESS,
        payload: emailValidationDataApi
      })
    }
    else {
      message.error(emailValidationDataApi && emailValidationDataApi.message);
    }
  }
  catch(e) {
    yield put({
      type: EMAILVALIDATION_ERROR,
      error: e,
    })
  }
}

function* emailLoadData (payload) {
  try {
    const emailDataApi = yield call(forgotPassword, payload)
    if(emailDataApi && emailDataApi.success) {
      yield put({
        type: EMAIL_DATA_SUCCESS,
        payload: emailDataApi
      })
    }
    else {
      message.error(emailDataApi && emailDataApi.message);
    }
  }
  catch(e) {
    yield put({
      type: EMAIL_ERROR,
      error: e,
    })
  }
}

function* signUpSaga() {
  yield takeLatest(SIGNUP_ACTION, signupLoadData)
  yield takeLatest(EMAILVALIDATION_ACTION, emailValidationLoadData)
  yield takeLatest(EMAIL_ACTION, emailLoadData)
}

export default signUpSaga;