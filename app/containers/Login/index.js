/**
 *
 * Login
 *
 */

import React, { memo, useEffect, useState } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import { Link } from 'react-router-dom';

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectLogin from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import './style.scss';

import { useCookies } from 'react-cookie';

import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import Checkbox from 'antd/es/checkbox';
import login from '../../images/login.svg';
import logo from '../../images/logo.png';

import { loginData } from './actions';

export function Login(props) {
  useInjectReducer({ key: "login", reducer });
  useInjectSaga({ key: "login", saga });

  const [loginForm] = Form.useForm();
  const [email, setEmail] = useState({ value: null, error: false });
  const [password, setPassword] = useState({ value: null, error: false });
  const [cookies, setCookie] = useCookies(['user']);
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

  const userAgent = navigator.userAgent;
  let browserName = "Unknown";

  if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Google Chrome";
  } else if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Mozilla Firefox";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Apple Safari";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    browserName = "Opera";
  } else if (userAgent.indexOf("Edge") > -1) {
    browserName = "Microsoft Edge";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
    browserName = "Internet Explorer";
  }


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
  const passwordHandleKeyDown = (e) => {
    setPassword({ value: e.target.value, error: false })
  }

  const onLoginHandle = (values) => {
    values = {...values, "browser": browserName}
    props.loginDataContent(values)
    if (isRememberMeChecked) {
      setUserCookie();
    }
  }

  const onRememberChange = (e) => {
    setIsRememberMeChecked(e.target.checked)
  }

  const setUserCookie = () => {
    setCookie('Email', email.value, { path: '/' });
    setCookie('Password', password.value == null ? "" : password.value, { path: '/' });
  }

  useEffect(() => {
    if ((props.login.loginResponse && props.login.loginResponse.success) === true) {
      sessionStorage.setItem("email", props.login.loginResponse.data.email);
      sessionStorage.setItem('sessionRefNo', props.login.loginResponse.data.sessionId);
      sessionStorage.setItem("activatedAccount", props.login.loginResponse.data.isValidated);
      sessionStorage.setItem("accessName", "");
      window.location.href = "/registration/get-started";
    }
  }, [props.login.loginResponse])


  useEffect(() => {
    setEmail({ value: "", error: false })
    const validRegex = /^(([a-zA-Z]{1,2}[a-zA-Z0-9-._]{1,50})|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]{2,50}\.)+[a-zA-Z]{2,20}))$/;
    if (cookies.Email?.match(validRegex)) {
      setEmail({ value: cookies.Email, error: false })
    } else {
      setEmail({ value: "", error: true })
    }
    loginForm.setFieldsValue({
      email: cookies.Email,
      password: cookies.Password == null ? "" : cookies.Password
    });
  }, [])

  return (
    <section className="login-section">
      <div className="signup-left">
        <img src={login} alt="" />
      </div>
      <div className="signup-right">
        <div className="signup-form">
          <img src={logo} className="logo" alt="" />
          <h1>Welcome Back to CoverQ Dashboard!</h1>
          <span>A borderless account, with powerful, personalised tools all in one place, giving you ultimate control over your business finances.</span>
          <Form
            form={loginForm}
            name="basic"
            onFinish={onLoginHandle}
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
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Enter your Password!' }]}
            >
              <Input.Password maxLength={16} onChange={passwordHandleKeyDown} />
            </Form.Item>
            <div className="rememberSection">
              <Checkbox onChange={onRememberChange}>Remember me</Checkbox>
              <span>
                <Link to="/registration/forgot-password" className="forgot-pswd">
                  Forgot Password?
                </Link>
              </span>
            </div>
            {/* <Checkbox onChange={onRememberChange}>Remember me</Checkbox>
              <span>
                <Link to="/registration/forgot-password" className="forgot-pswd">
                  Forgot Password?
                </Link>
              </span> */}
            <Form.Item>
              <Button htmlType="submit">Login</Button>
            </Form.Item>
          </Form>
          <p>
            Not having an account yet? <Link to="/registration/signup">Sign Up Now</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

// Login.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  login: makeSelectLogin()
});

function mapDispatchToProps(dispatch) {
  return {
    loginDataContent: (value) => {
      dispatch(loginData(value))
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
)(Login);
