import { call, put, takeLatest } from 'redux-saga/effects';
import { CHANGEPASSWORD_ACTION, CHANGEPASSWORD_DATA_SUCCESS, CHANGEPASSWORD_ERROR } from "./constants";
import {changePassword} from '../../services/AuthService'
import message from 'antd/es/message';

function* changePasswordLoadData (payload) {
  try {
    const changePasswordApi = yield call(changePassword, payload)
    if(changePasswordApi && changePasswordApi.success) {
      message.success(changePasswordApi.message);
      yield put({
        type: CHANGEPASSWORD_DATA_SUCCESS,
        payload: changePasswordApi
      })
    }
    else {
      message.error(changePasswordApi && changePasswordApi.message);
    }
  }
  catch(e) {
    yield put({
      type: CHANGEPASSWORD_ERROR,
      error: e,
    })
  }
}

function* changePasswordSaga() {
  yield takeLatest(CHANGEPASSWORD_ACTION, changePasswordLoadData);
}

export default changePasswordSaga;