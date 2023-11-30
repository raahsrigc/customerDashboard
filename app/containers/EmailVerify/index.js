/**
 *
 * EmailVerify
 *
 */

import React, { memo, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectEmailVerify from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import login from '../../images/login.svg';
import logo from '../../images/logo.png';

import { emailData, emailValidationData } from './actions';

export function EmailVerify(props) {
  useInjectReducer({ key: "emailVerify", reducer });
  useInjectSaga({ key: "emailVerify", saga });

  const [email, setEmail] = useState({ value: null, error: false });
  const [display, setDisplay] = useState(0);

  const INITIAL_COUNT = 120;
  const twoDigits = (num) => String(num).padStart(2, '0');
  const [otp, setOtp] = useState({ value: null, error: false });
  const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_COUNT);
  const secondsToDisplay = secondsRemaining % 60;
  const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60;
  const minutesToDisplay = minutesRemaining % 60;

  const emailHandleKeyDown = (e) => {
    const validRegex = /^(([a-zA-Z0-9._]{1,50})|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]{2,50}\.)+[a-zA-Z]{2,20}))$/;
    if (e.target.value.match(validRegex)) {
      setEmail({ value: e.target.value, error: false })
      return true;
    } else {
      setEmail({ value: "", error: true })
      return false;
    }
  }

  const onFinish = (values) => {
    props.emailContent(values);
  };

  useEffect(() => {
    if ((props.emailVerify.emailResponse && props.emailVerify.emailResponse.success) === true) {
      setTimeout(() => {
        setDisplay(1);
        setStatus(STATUS.STARTED);
      }, 1000)
    }
  }, [props.emailVerify.emailResponse])

  // verify email

  const resendOTPHandle = async () => {
    props.emailContent({"email" : email.value});
    setStatus(STATUS.STARTED);
    setSecondsRemaining(INITIAL_COUNT)
  }

  const STATUS = { STOPPED: <i onClick={resendOTPHandle}>Resend Code</i> }

  const [status, setStatus] = useState(STATUS.STOPPED);

  useInterval(() => {
    if (secondsRemaining > 0) {
      setSecondsRemaining(secondsRemaining - 1)
    } else {
      setStatus(STATUS.STOPPED)
    }
  },
    status === STATUS.STARTED ? 1000 : null,
  )

  function useInterval(callback, delay) {
    const savedCallback = useRef()
    useEffect(() => {
      savedCallback.current = callback
    }, [callback])

    useEffect(() => {
      function tick() {
        savedCallback.current()
      }
      if (delay !== null) {
        let id = setInterval(tick, delay)
        return () => clearInterval(id)
      }
    }, [delay])
  }

  // const numbricKeyDownHandle = (e) => {
  //   if (e.keyCode !== 8) {
  //     const regex = new RegExp("^[0-9]+$");
  //     const key = e.key;
  //     if (!regex.test(key)) {
  //       e.preventDefault();
  //       return false;
  //     }
  //   }
  // };

  const numbricKeyDownHandle = (e) => {
    if ((e.keyCode !== 8) && (e.keyCode !== 9) && (e.keyCode !== 91 && e.keyCode !== 86) && (e.keyCode !== 17 && e.keyCode !== 86)) {
      const regex = new RegExp("^[0-9]+$");
      const key = e.key;
      if (!regex.test(key)) {
        e.preventDefault();
        return false;
      }
    }
  };

  const otpHandle = (e) => {
    const otpRegex = /^[0-9]{4}$/;
    if (e.target.value.match(otpRegex)) {
      setOtp({ value: e.target.value, error: false })
      return true;
    }
    else {
      setOtp({ value: "", error: true })
      return false;
    }
  }

  const onOTPFinish = (values) => {
    props.emailValidationDataContent({...values, "email": email.value})
  }

  useEffect(() => {
    if ((props.emailVerify.emailValidationResponse && props.emailVerify.emailValidationResponse.success) === true) {
      setTimeout(() => {
        window.location.href = "/registration/login"
      }, 1000)
    }
  }, [props.emailVerify.emailValidationResponse])

  return (
    <section className="email-verify-section">
      <div className="signup-left">
        <img src={login} alt="" />
      </div>
      <div className="signup-right">
        <div className="signup-form">
          <img src={logo} className="logo" alt="" />
          {display === 0 ?
            <>
              <h1>Verify your email</h1>
              <span>Please enter your registered email id. An auth code will be sent to the email id.</span>
              <Form
                name="basic"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    {
                      required: true,
                      validator(_, value) {
                        let error;
                        if (email.value !== null) {
                          if (email.error === true) {
                            error = "Enter your valid Email Id!"
                          }
                        } else {
                          error = "Enter your Email Id!"
                        }
                        return error ? Promise.reject(error) : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input className={email.error === true ? "error" : ""} onChange={emailHandleKeyDown} />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit">
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </>
            :
            <>
              <h1>A passcode has been sent to your email</h1>
              <span>An email has been sent to <b>{email.value}</b>. Please enter the code recieved to activate your account.</span>
              <Form
                name="basic"
                onFinish={onOTPFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="Activation Code"
                  name="authToken"
                  rules={[
                    {
                      required: true,
                      validator(_, value) {
                        let error;
                        if (otp.value !== null) {
                          if (otp.error === true) {
                            error = "Enter valid Code!"
                          }
                        } else {
                          error = "Enter Code!"
                        }
                        return error ? Promise.reject(error) : Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input onChange={otpHandle} onKeyDown={numbricKeyDownHandle} maxLength={4} />
                </Form.Item>
                <p className="resend-otp">Didn’t recieve the mail? <i>{status === STATUS.STARTED ? <i>Resend Code in :{twoDigits(minutesToDisplay)}:{twoDigits(secondsToDisplay)}</i> : status}</i></p>
                <Form.Item>
                  <Button htmlType="submit">Submit</Button>
                </Form.Item>
              </Form>
            </>
          }
        </div>
      </div>
    </section>
  );
}

// EmailVerify.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  emailVerify: makeSelectEmailVerify()
});

function mapDispatchToProps(dispatch) {
  return {
    emailContent: (value) => {
      dispatch(emailData(value))
    },
    emailValidationDataContent: (value) => {
      dispatch(emailValidationData(value))
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withConnect,
  memo
)(EmailVerify);
