import { call, put, takeLatest } from 'redux-saga/effects';
import { FORGOTPASSWORD_ACTION, FORGOTPASSWORD_DATA_SUCCESS, FORGOTPASSWORD_ERROR , FORGOTPASSWORDOTP_ACTION, FORGOTPASSWORDOTP_DATA_SUCCESS, FORGOTPASSWORDOTP_ERROR} from "./constants";
import {forgotPassword, forgetPasswordOtp} from '../../services/AuthService'
import message from 'antd/es/message';

function* forgotPasswordLoadData (payload) {
  try {
    const forgotPasswordDataApi = yield call(forgotPassword, payload)
    if(forgotPasswordDataApi && forgotPasswordDataApi.success) {
      yield put({
        type: FORGOTPASSWORD_DATA_SUCCESS,
        payload: forgotPasswordDataApi
      })
    }
    else {
      message.error(forgotPasswordDataApi && forgotPasswordDataApi.message);
    }
  }
  catch(e) {
    yield put({
      type: FORGOTPASSWORD_ERROR,
      error: e,
    })
  }
}

function* forgotPasswordOtpLoadData (payload) {
  try {
    const forgotPasswordOtpDataApi = yield call(forgetPasswordOtp, payload)
    if(forgotPasswordOtpDataApi && forgotPasswordOtpDataApi.success) {
      // message.success(forgotPasswordOtpDataApi && forgotPasswordOtpDataApi.message);
      yield put({
        type: FORGOTPASSWORDOTP_DATA_SUCCESS,
        payload: forgotPasswordOtpDataApi
      })
    }
    else {
      message.error(forgotPasswordOtpDataApi && forgotPasswordOtpDataApi.message);
    }
  }
  catch(e) {
    yield put({
      type: FORGOTPASSWORDOTP_ERROR,
      error: e,
    })
  }
}

function* forgotPasswordSaga() {
  yield takeLatest(FORGOTPASSWORD_ACTION, forgotPasswordLoadData)
  yield takeLatest(FORGOTPASSWORDOTP_ACTION, forgotPasswordOtpLoadData)
}

export default forgotPasswordSaga;