/**
 *
 * ForgotPassword
 *
 */

import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectForgotPassword from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import login from '../../images/login.svg';
import logo from '../../images/logo.png'
import {
  MailOutlined,
  LinkOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { forgotPasswordData, forgotPasswordOtpdData } from './actions'

export function ForgotPassword(props) {
  useInjectReducer({ key: "forgotPassword", reducer });
  useInjectSaga({ key: "forgotPassword", saga });

  const [email, setEmail] = useState({ value: null, error: false });
  const [display, setDisplay] = useState(0);
  const [password, setPassword] = useState({ value: null, error: false });
  const [otp, setOtp] = useState({ value: null, error: false });

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

  const onForgotPasswordHandle = (value) => {
    props.forgotPasswordDataContent(value)
  }

  useEffect(() => {
    if (props.forgotPassword.forgotPasswordDataResponse.success === true) {
      setDisplay(1)
    } 
  }, [props.forgotPassword.forgotPasswordDataResponse])


  // ForgotPasswordOtpHandle
  function passwordHandle(e) {
    const validRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,16}$/;
    if (e.target.value.match(validRegex)) {
      setPassword({ value: e.target.value, error: false })
      return true;
    }
    else {
      setPassword({ value: "", error: true })
      return false;
    }
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
      // if ((e.ctrlKey && e.key === "c")) {
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

  const onForgotPasswordOtpHandle = (value) => {
    props.forgotPasswordOtpDataContent({ ...value, "email": email.value })
  }

  useEffect(() => {
    if (props.forgotPassword.forgotPasswordOtpDataResponse.success === true) {
      setDisplay(2)
      setTimeout(() => {
        window.location.href = "/registration/login"
      }, 3000)
    }
  }, [props.forgotPassword.forgotPasswordOtpDataResponse])

  useEffect(() => {
    setDisplay(0);
  }, [])

  return (
    <section className="forgot-section">
      <div className="signup-left">
        <img src={login} alt="" />
      </div>
      <div className="signup-right">
        <div className="signup-form">
          <img src={logo} className="logo" alt="" />
          <h1>Get a New Password </h1>
          <span>{display === 0 ? "Enter your email address to reset your password." : display === 1 ? "Enter your OTP to reset your password." : ""}</span>
          <ul>
            <li className={display === 0 ? "active" : display === 1 || display === 2 ? "active-next" : ""}><i><MailOutlined /></i><span>Email</span></li>
            <li className={display === 1 ? "active" : display === 2 ? "active-next" : ""}><i><LinkOutlined /></i><span>OTP and Create Password</span></li>
            <li className={display === 2 ? "active" : ""}><i><CheckOutlined /></i><span>Done</span></li>
          </ul>
          {display === 0 ?
            <Form
              name="basic"
              onFinish={onForgotPasswordHandle}
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
                <Button htmlType="submit">Submit</Button>
              </Form.Item>
              {/* <p>Go back to  <Link to="/registration/login">Sign In </Link> instead</p> */}
            </Form>
            :
            display === 1 ?
            <Form
              name="forgotPasswordOtp"
              onFinish={onForgotPasswordOtpHandle}
              autoComplete="off"
            >
              <Form.Item
                label="OTP"
                name="authToken"
                rules={[
                  {
                    required: true,
                    validator(_, value) {
                      let error;
                      if (otp.value !== null) {
                        if (otp.error === true) {
                          error = "Enter your valid OTP!"
                        }
                      } else {
                        error = "Enter OTP!"
                      }
                      return error ? Promise.reject(error) : Promise.resolve();
                    },
                  },
                ]}
              >
                <Input onChange={otpHandle} onKeyDown={numbricKeyDownHandle} maxLength={4} />
              </Form.Item>
              <Form.Item
                label="New Password"
                name="password"
                rules={[
                  {
                    required: true,
                    validator(_, value) {
                      let error;
                      if (password.value !== null) {
                        if (password.error === true) {
                          error = "Passwords must contain at least 8 characters, one lowercase, one uppercase, one number and one special character."
                        }
                      } else {
                        error = "Enter your Password!"
                      }
                      return error ? Promise.reject(error) : Promise.resolve();
                    },
                  },
                ]}
              >
                <Input.Password onChange={passwordHandle} maxLength="16" />
              </Form.Item>
              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('New Password and Confirm Password Field do not match!');
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>
            :
            <div className="password-change">
               <h2>Your Password has been Successfully Changed.</h2>
            </div>
          }
        </div>
      </div>
    </section>
  );
}

// ForgotPassword.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  forgotPassword: makeSelectForgotPassword()
});

function mapDispatchToProps(dispatch) {
  return {
    forgotPasswordDataContent: (value) => {
      dispatch(forgotPasswordData(value))
    },
    forgotPasswordOtpDataContent: (value) => {
      dispatch(forgotPasswordOtpdData(value))
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
)(ForgotPassword);
