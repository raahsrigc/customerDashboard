import { call, put, takeLatest } from 'redux-saga/effects';
import { RCVERIFY_ACTION, RCVERIFY_DATA_SUCCESS, RCVERIFY_ERROR, ACTIVATEACCOUNT_ACTION, ACTIVATEACCOUNT_DATA_SUCCESS, ACTIVATEACCOUNT_ERROR } from "./constants";
import {rcVerifyData, activateAccountData} from '../../services/AuthService'
import notification from 'antd/es/notification';

function* rcVerifyLoadData (payload) {
  try {
    const rcVerifyDataApi = yield call(rcVerifyData, payload)
    if(rcVerifyDataApi && rcVerifyDataApi.success) {
      yield put({
        type: RCVERIFY_DATA_SUCCESS,
        payload: rcVerifyDataApi
      })
    } else {
      yield put({
        type: RCVERIFY_ERROR,
        payload: rcVerifyDataApi
      })
      notification.info({
        duration: 3,
        message: 'Notification',
        description: rcVerifyDataApi && rcVerifyDataApi.data && rcVerifyDataApi.data.message,
      });
    }
  }
  catch(e) {
    yield put({
      type: RCVERIFY_ERROR,
      error: e,
    })
  }
}

function* activateAccountLoadData (payload) {
  try {
    const activateAccountDataApi = yield call(activateAccountData, payload)
    if(activateAccountDataApi && activateAccountDataApi.success) {
      yield put({
        type: ACTIVATEACCOUNT_DATA_SUCCESS,
        payload: activateAccountDataApi
      })
    } else {
      yield put({
        type: ACTIVATEACCOUNT_ERROR,
        payload: activateAccountDataApi
      })
      notification.info({
        duration: 3,
        message: 'Notification',
        description: activateAccountDataApi.message ? activateAccountDataApi.message : "Technical Error Occurred",
      });
    }
  }
  catch(e) {
    yield put({
      type: ACTIVATEACCOUNT_ERROR,
      error: e,
    })
  }
}

function* getStartedSaga() {
  yield takeLatest(RCVERIFY_ACTION, rcVerifyLoadData);
  yield takeLatest(ACTIVATEACCOUNT_ACTION, activateAccountLoadData);
}

export default getStartedSaga;