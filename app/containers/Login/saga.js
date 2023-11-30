import { call, put, takeLatest } from 'redux-saga/effects';
import { LOGIN_ACTION, LOGIN_DATA_SUCCESS, LOGIN_ERROR } from "./constants";
import {loginData} from '../../services/AuthService'
import message from 'antd/es/message';
import history from 'utils/history';

function* loginLoadData (payload) {
  try {
    const loginDataApi = yield call(loginData, payload)
    if(loginDataApi && loginDataApi.success) {
      yield put({
        type: LOGIN_DATA_SUCCESS,
        payload: loginDataApi
      })
    }
    else {
      message.error(loginDataApi && loginDataApi.message);
      if(loginDataApi && loginDataApi.message === "Please verify the email") {
        setTimeout(() => {
          history.push("/registration/email-verify")
        }, 1000);
      }
    }
  }
  catch(e) {
    yield put({
      type: LOGIN_ERROR,
      error: e,
    })
  }
}

function* loginSaga() {
  yield takeLatest(LOGIN_ACTION, loginLoadData)
}

export default loginSaga;