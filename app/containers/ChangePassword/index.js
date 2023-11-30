/**
 *
 * ChangePassword
 *
 */

import React, { memo, useState, useEffect } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectChangePassword from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import TopBar from '../../components/TopBar/Loadable';
import ProfileCard from '../../components/ProfileCard';
import { getProfileData } from "../../services/AuthService";
import { changePasswordData } from './actions'

export function ChangePassword({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, changePassword, changePasswordDataContent, toggleBtn, setToggleBtn, userData }) {
  useInjectReducer({ key: "changePassword", reducer });
  useInjectSaga({ key: "changePassword", saga });

  const title = "Change Password";
  const [cpassword, setCpassword] = useState({ value: null, error: false });
  const [password, setPassword] = useState({ value: null, error: false });
  const [profileData, setProfileData] = useState({});
  const [profileImage, setProfileImage] = useState();
  const email = sessionStorage.getItem("email");
  const [changePasswordForm] = Form.useForm();

  function cpasswordHandle(e) {
    const validRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,16}$/;
    if (e.target.value.match(validRegex)) {
      setCpassword({ value: e.target.value, error: false })
      return true;
    }
    else {
      setCpassword({ value: "", error: true })
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

  const onChangePasswordHandle = (value) => {
    changePasswordDataContent({ ...value, "email": email });
  }

  useEffect(() => {
    if (changePassword.changePasswordResponse.success === true) {
      changePasswordForm.resetFields();
    }
  }, [changePassword])

  const getProfile = () => {
    getProfileData(toggleBtn, { "email": email })
      .then((res) => {
        if (res.success === true) {
          setProfileData(res.data)
          setProfileImage(res.data.profilePic);
        }
      })
      .catch((err) => {
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  };

  useEffect(() => {
    getProfile();
  }, [])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  return (
    <>
      <div className="sidebar-tab-content">
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData }} />
        <div className="profile-main-section" onClick={outSideClick}>
          <ProfileCard data={{profileData, profileImage}}/>
          <div className="profile-main-right">
            <div className="profile-section">
              <h4>Change Password</h4>
              <Form
                name="changePassword"
                onFinish={onChangePasswordHandle}
                autoComplete="off"
                initialValues={{ remember: true, email: email }}
                form={changePasswordForm}
              >
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input readOnly />
                </Form.Item>
                <Form.Item
                  label="Current Password"
                  name="oldPassword"
                  rules={[
                    {
                      required: true,
                      validator(_, value) {
                        let error;
                        if (cpassword.value !== null) {
                          if (cpassword.error === true) {
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
                  <Input.Password onChange={cpasswordHandle} maxLength="16" />
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
                          if(cpassword.value === password.value) {
                            error = "The New Passwords can not be same as Current Password!"
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
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ChangePassword.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  changePassword: makeSelectChangePassword()
});

function mapDispatchToProps(dispatch) {
  return {
    changePasswordDataContent: (value) => {
      dispatch(changePasswordData(value))
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
)(ChangePassword);
