/**
 *
 * SignUp
 *
 */

import React, { memo, useEffect, useState, useRef } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import history from 'utils/history';
import { Link } from 'react-router-dom';
import aes256 from "../../services/aes256";
import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectSignUp from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button'
import Spin from 'antd/es/spin';;
import { Radio } from 'antd';
import { Checkbox, Col, Row } from 'antd';
import login from '../../images/login.svg'
import logo from '../../images/logo.png'
import { LeftOutlined } from '@ant-design/icons';
import { signupData, emailValidationData, emailData } from './actions';
import { getSignUpProductsApi } from "../../services/AuthService";

export function SignUp(props) {
  useInjectReducer({ key: "signUp", reducer });
  useInjectSaga({ key: "signUp", saga });

  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [password, setPassword] = useState({ value: null, error: false });
  const [display, setDisplay] = useState(0);
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpFinalData, setSignUpFinalData] = useState({});
  const [signUpProductsData, setSignUpProductsData] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

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

  const mobileHandleKeyDown = (e) => {
    if ((e.keyCode !== 8) && (e.keyCode !== 9) && (e.keyCode !== 91 && e.keyCode !== 86) && (e.keyCode !== 17 && e.keyCode !== 86)) {
      const regex = new RegExp("^[0-9]+$");
      const key = e.key;
      if (!regex.test(key)) {
        e.preventDefault();
        return false;
      }
    }
  };

  function testMobileNo(e) {
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}$))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setMobileNo({ value: "", error: true })
      return false;
    }
  }

  function alphaHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
  }

  function bussinessHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z ]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
  }

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

  const signUpStep1 = (values) => {
    setSignUpFinalData({...signUpFinalData,...values})
    setSignUpStep(2)
  }
  const onFinish = (values) => {
    values.serviceType = "B2B";
    // productListData creation
    const productList = []
    for (let i = 0; i < values.signUpProducts.length; i++) {
      productList.push({ "productId": values.signUpProducts[i] })
    }
    delete values.signUpProducts;
    values.productList = productList;

    let finalData = []
    finalData= {...signUpFinalData,...values}

    // signup api call
    props.signupDataContent(finalData);
  };

  useEffect(() => {
    if ((props.signUp.signUpResponse && props.signUp.signUpResponse.success) === true) {
      setTimeout(() => {
        setDisplay(1);
        setStatus(STATUS.STARTED);
      }, 1000)
    }
  }, [props.signUp.signUpResponse])

  // verify email

  const resendOTPHandle = async () => {
    props.emailContent({ "email": email.value })
    setStatus(STATUS.STARTED);
    setSecondsRemaining(INITIAL_COUNT);
  }

  useEffect(() => {
    if ((props.signUp.emailResponse && props.signUp.emailResponse.success) === true) {
      setTimeout(() => {
        setDisplay(1);
        setStatus(STATUS.STARTED);
      }, 1000)
    }
  }, [props.signUp.emailResponse])

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
    props.emailValidationDataContent({ ...values, "email": email.value })
  }

  useEffect(() => {
    if ((props.signUp.emailValidationResponse && props.signUp.emailValidationResponse.success) === true) {
      setTimeout(() => {
        history.push("/registration/login")
      }, 1000)
    }
  }, [props.signUp.emailValidationResponse]);

  useEffect(() => {
    setAllLoading(true);
    getSignUpProductsApi()
      .then((res) => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res?.success === true) {
          setSignUpProductsData(res?.data)
        }
      })
      .catch((err) => {
        console.log(err);
        setAllLoading(false);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  }, [])


  return (
    <section className="signup-section">
      {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
      <div className="signup-left">
        <img src={login} alt="" />
      </div>
      <div className="signup-right">
        <div className="signup-form">
          <img src={logo} className="logo" alt="" />
          {display === 0 ?
            <>
              <h1>Open a New CoverQ Account</h1>
              <span>A borderless account, with powerful, personalised tools all in one place, giving you ultimate control over your business finances.</span>
              {
                signUpStep == 1 ?
                  <>
                    <Form
                      name="signUpForm1"
                      onFinish={signUpStep1}
                      autoComplete="off"
                    >
                      <Form.Item
                        label="Name"
                        name="businessName"
                        rules={[{ required: true, message: 'Enter your Name!' }]}
                      >
                        <Input onKeyDown={bussinessHandleKeyDown} maxLength={150} />
                      </Form.Item>
                      {/* <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[
                          { required: true, message: 'Enter your First Name!' },
                        ]}
                      >
                        <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
                      </Form.Item>
                      <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[
                          { required: true, message: 'Enter your Last Name!' },
                        ]}
                      >
                        <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
                      </Form.Item> */}
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
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                          {
                            required: true,
                            validator(_, value) {
                              let error;
                              if (mobileNo.value !== null) {
                                if (mobileNo.error === true) {
                                  error = "Enter your valid Phone Number!"
                                }
                              } else {
                                error = "Enter your Phone Number!"
                              }
                              return error ? Promise.reject(error) : Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          className={mobileNo.error === true ? "error" : ""}
                          maxLength='13'
                          onChange={testMobileNo}
                          onKeyDown={mobileHandleKeyDown}
                        />
                      </Form.Item>
                      
                      <Form.Item
                        label="Agent Type"
                        name="agentType"
                        rules={[
                          { required: true, message: 'Choose Agent Type!' },
                        ]}
                      >
                        <Radio.Group>
                          <Radio value="individual">Individual</Radio>
                          <Radio value="corporate">Corporate</Radio>
                        </Radio.Group>
                      </Form.Item>
                      <Form.Item
                        label="Password"
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
                              return Promise.reject('Password and Confirm Password Field do not match!');
                            },
                          }),
                        ]}
                      >
                        <Input.Password />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit">
                          Next
                        </Button>
                      </Form.Item>
                      {/* <Form.Item
                        name="remember"
                        valuePropName="checked"
                        rules={[
                          { required: true, message: 'Please select the CoverQ Terms & Conditions and Privacy Policy' },
                        ]}
                      >
                        <Checkbox>
                          I agree to CoverQ <a  rel="noopener noreferrer">Terms & Conditions</a> and <a  rel="noopener noreferrer">Privacy Policy</a>
                        </Checkbox>
                      </Form.Item> */}
                    </Form>
                  </>
                  :
                  <>
                    <Form
                      name="basic"
                      onFinish={onFinish}
                      autoComplete="off"
                      className="signUpStep2"
                    >
                      <span className="sign-up-back" onClick={()=> setSignUpStep(1)}><LeftOutlined /></span>
                      <Form.Item
                        label="Select Products"
                        name="signUpProducts"
                        className="sign-up-products"
                        rules={[
                          { required: true, message: 'Choose Products!' },
                        ]}
                      >
                        <Checkbox.Group
                        >
                          {
                            signUpProductsData?.map((item, index) => {
                              return (
                                <Checkbox value={item?.ID}>
                                  <em>
                                    <img src={item?.B2B_IMAGE_ICON} />
                                  </em>
                                  <div className="sign-up-products-desc">
                                    <h6>{item?.PRODUCT_NAME}</h6>
                                    <span>{item?.B2B_PRODUCT_DESCRIPTION}</span>
                                  </div>
                                  <div className="sign-up-products-desc-bottom">
                                    <span>Select</span>
                                  </div>
                                </Checkbox>
                              )
                            })
                          }
                        </Checkbox.Group>
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit">
                          Sign Up
                        </Button>
                      </Form.Item>
                    </Form>
                  </>
              }
              <p>
                Already have an account? <Link to="/registration/login">Sign In Now</Link>
              </p>
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
                  <Input 
                    onChange={otpHandle} 
                    onKeyDown={numbricKeyDownHandle} 
                    maxLength={4} 
                  />
                </Form.Item>
                <p className="resend-otp">Didn't recieve the mail? <i>{status === STATUS.STARTED ? <i>Resend Code in :{twoDigits(minutesToDisplay)}:{twoDigits(secondsToDisplay)}</i> : status}</i></p>
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

// SignUp.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  signUp: makeSelectSignUp()
});

function mapDispatchToProps(dispatch) {
  return {
    signupDataContent: (value) => {
      dispatch(signupData(value))
    },
    emailValidationDataContent: (value) => {
      dispatch(emailValidationData(value))
    },
    emailContent: (value) => {
      dispatch(emailData(value))
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
)(SignUp);
