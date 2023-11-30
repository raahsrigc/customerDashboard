/**
 *
 * SessionExpired
 *
 */

import React, { memo, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import history from 'utils/history';
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectSessionExpired from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import './style.scss';
import ErrorIcon from '../../images/error-icon.svg';


export function SessionExpired({sessionExpiredData, invalidSessionData, invalidAgentData}) {
  useInjectReducer({ key: "sessionExpired", reducer });
  useInjectSaga({ key: "sessionExpired", saga });

  const [isvisible, setIsVisible] = useState(true)
  const handleLogout = () => {
    history.push("/registration/login");
    setIsVisible(false);
  }

  return (
    <Modal className="session-timeout-modal" width={400} centered visible={isvisible}>
      <img src={ErrorIcon} alt="" className="modal-response-icon" />
      <h2>{sessionExpiredData ? sessionExpiredData : invalidSessionData ? invalidSessionData : invalidAgentData}</h2>
      <Button className="ant-btn ant-btn-primary" onClick={handleLogout}>Log In</Button>
    </Modal>
  );
}

SessionExpired.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  sessionExpired: makeSelectSessionExpired()
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withConnect,
  memo
)(SessionExpired);
