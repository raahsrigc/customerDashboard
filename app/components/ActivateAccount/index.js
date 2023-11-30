/**
 *
 * ActivateAccount
 *
 */

import React, { memo, useEffect, useState } from "react";
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import Button from 'antd/es/button';
import message from 'antd/es/message';
import Spin from 'antd/es/spin';
import './style.scss';
import aes256 from "../../services/aes256";
import moment from "moment";
import notification from 'antd/es/notification';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { stateData, cityData } from "../../services/AuthService";


function ActivateAccount({ activateActive, steps, active, loading, companyDetails, successMsg, setDateOfBirth, setSecondDateOfBirth, passportSizePhoto, setPassportSizePhoto, signatureUrl, setSignatureUrl, setRegistrationDate, activateAccountStep2Handle, activateAccountStep3Handle, closeaAtivateHanlde, backHandle, userData, toggleBtn }) {
  const { Option } = Select;
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [idType, setIdType] = useState("");
  const [lgaOption, setLgaOption] = useState("");
  const [rcNumber, setRcNumber] = useState({ value: null, error: false });
  const [pvcNumber, setpvcNumber] = useState({ value: null, error: false });
  const [nicNumber, setnicNumber] = useState({ value: null, error: false });
  const [drivingNumber, setDrivingNumber] = useState({ value: null, error: false });
  const [passportNumber, setPassportNumber] = useState({ value: null, error: false });
  const [bvnNumber, setBvnNumber] = useState({ value: null, error: false });
  const [stateOption, setStateOption] = useState([]);
  const [cityOption, setCityOption] = useState([]);

  const [secondEmail, setSecondEmail] = useState({ value: null, error: false });
  const [secondMobileNo, setSecondMobileNo] = useState({ value: null, error: false });
  const [secondIdType, setSecondIdType] = useState("");
  const [secondPvcNumber, setSecondPvcNumber] = useState({ value: null, error: false });
  const [secondDrivingNumber, setSecondDrivingNumber] = useState({ value: null, error: false });
  const [secondPassportNumber, setSecondPassportNumber] = useState({ value: null, error: false });
  const [secondBvnNumber, setSecondBvnNumber] = useState({ value: null, error: false });

  const [stepForm] = Form.useForm();
  const [defaultValue, setDefaultValue] = useState({});

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
  }

  const idTypeHandle2 = (value) => {
    setSecondIdType(value)
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

  const emailHandleKeyDown2 = (e) => {
    const validRegex = /^(([a-zA-Z0-9._]{1,50})|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]{2,50}\.)+[a-zA-Z]{2,20}))$/;
    if (e.target.value.match(validRegex)) {
      setSecondEmail({ value: e.target.value, error: false })
      return true;
    } else {
      setSecondEmail({ value: "", error: true })
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

  function alphaNumericHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
  }

  function companyHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9& ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
      return false;
    }
  }

  function addressHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9(!@#$&-+:',./) ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
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
    // const alpha = /^([0]{1})(?!\1+$)([7-9]{1})(?!\1+$)([0-1]{1})(?!\1+$)([0-9]{8})/;
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setMobileNo({ value: "", error: true })
      return false;
    }
  }

  function testMobileNo2(e) {
    // const alpha = /^([0]{1})(?!\1+$)([7-9]{1})(?!\1+$)([0-1]{1})(?!\1+$)([0-9]{8})/;
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setSecondMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setSecondMobileNo({ value: "", error: true })
      return false;
    }
  }

  const rcNumberHandle = (e) => {
    const rcRegex = /^[1-9]{1}[0-9]{4,}$/;
    if (e.target.value.match(rcRegex)) {
      setRcNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setRcNumber({ value: "", error: true })
      return false;
    }
  }

  const bvnHandle = (e) => {
    const bvnRegex = /^[1-9]{1}[0-9]{10}$/;
    if (e.target.value.match(bvnRegex)) {
      setBvnNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setBvnNumber({ value: "", error: true })
      return false;
    }
  }

  const bvnHandle2 = (e) => {
    const bvnRegex = /^[1-9]{1}[0-9]{10}$/;
    if (e.target.value.match(bvnRegex)) {
      setSecondBvnNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setSecondBvnNumber({ value: "", error: true })
      return false;
    }
  }

  const pvcHandle = (e) => {
    const pvcRegex = /^[a-zA-Z1-9]{1}[a-zA-Z0-9]{17,19}$/;
    if (e.target.value.match(pvcRegex)) {
      setpvcNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setpvcNumber({ value: "", error: true })
      return false;
    }
  }

  const pvcHandle2 = (e) => {
    const pvcRegex = /^[a-zA-Z1-9]{1}[a-zA-Z0-9]{17,19}$/;
    if (e.target.value.match(pvcRegex)) {
      setSecondPvcNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setSecondPvcNumber({ value: "", error: true })
      return false;
    }
  }

  const drivingHandle = (e) => {
    const drivingRegex = /^[a-zA-Z]{3}([ -]{1})?[a-zA-Z0-9]{6,12}$/;
    if (e.target.value.match(drivingRegex)) {
      setDrivingNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setDrivingNumber({ value: "", error: true })
      return false;
    }
  }

  const drivingHandle2 = (e) => {
    const drivingRegex = /^[a-zA-Z]{3}([ -]{1})?[a-zA-Z0-9]{6,12}$/;
    if (e.target.value.match(drivingRegex)) {
      setSecondDrivingNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setSecondDrivingNumber({ value: "", error: true })
      return false;
    }
  }

  const passportHandle = (e) => {
    const drivingRegex = /^[a-zA-Z]{1}[0-9]{8}$/;
    if (e.target.value.match(drivingRegex)) {
      setPassportNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setPassportNumber({ value: "", error: true })
      return false;
    }
  }

  const passportHandle2 = (e) => {
    const drivingRegex = /^[a-zA-Z]{1}[0-9]{8}$/;
    if (e.target.value.match(drivingRegex)) {
      setSecondPassportNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setSecondPassportNumber({ value: "", error: true })
      return false;
    }
  }

  function dateBirthdisabled(current) {
    const yesterday = moment("YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current > moment().subtract(0, 'years');
  }


  useEffect(() => {
    stateData(tokenKey, 50001, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res?.status === true) {
          setStateOption(res?.data)
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

  }, [])

  useEffect(() => {
    setDefaultValue({
      email: userData?.email,
      mobileNumber: userData?.phoneNumber
    })
    stepForm.setFieldsValue({
      email: userData?.email,
      mobileNumber: userData?.phoneNumber
    });
  }, [userData])

  const selectState = (value) => {
    cityData(tokenKey, value, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setCityOption(res.data)
          stepForm.setFieldsValue({
            city: "",
          });
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
  }


  return (
    <div className={activateActive ? "activate-account-sidebar active" : "activate-account-sidebar"}>
      <div className="activate-account-sidebar-inner">
        <div className="activate-account-header">
          <h4>{active === false ? "Your Business Information" : active === true ? <><ArrowLeftOutlined onClick={backHandle} /> Signatory Details</> : "Activate Account"} <i onClick={closeaAtivateHanlde}>&times;</i></h4>
        </div>
        <div className="activate-account-body">
          {steps === 1 ?
            <>
              <div className={active ? "step2" : "step2 active"}>
                <p></p>
                <>
                  <Form
                    name="activateAccount2"
                    onFinish={activateAccountStep2Handle}
                    autoComplete="off"
                    form={stepForm}
                  >
                    <div className="activateAccount-form">
                      <Form.Item
                        label="First Name"
                        name="directorFirstName"
                        rules={[{ required: true, message: 'Enter your First Name!' }]}
                      >
                        <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
                      </Form.Item>
                      <Form.Item
                        label="Last Name"
                        name="directorLastName"
                        rules={[{ required: true, message: 'Enter your Last Name!' }]}
                      >
                        <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
                      </Form.Item>
                      <Form.Item
                        label="Email"
                        name="email"
                      // rules={[
                      //   {
                      //     required: true,
                      //     validator(_, value) {
                      //       let error;
                      //       if (email.value !== null) {
                      //         if (email.error === true) {
                      //           error = "Enter valid Email Id!"
                      //         }
                      //       } else {
                      //         error = "Enter your Email Id!"
                      //       }
                      //       return error ? Promise.reject(error) : Promise.resolve();
                      //     },
                      //   },
                      // ]}
                      >
                        <Input className={email.error === true ? "error" : ""} onChange={emailHandleKeyDown} disabled />
                      </Form.Item>
                      <Form.Item
                        label="Phone Number"
                        name="mobileNumber"
                      // rules={[
                      //   {
                      //     required: true,
                      //     validator(_, value) {
                      //       let error;
                      //       if (mobileNo.value !== null) {
                      //         if (mobileNo.error === true) {
                      //           error = "Enter valid  Phone Number!"
                      //         }
                      //       } else {
                      //         error = "Enter your Phone Number!"
                      //       }
                      //       return error ? Promise.reject(error) : Promise.resolve();
                      //     },
                      //   },
                      // ]}
                      >
                        <Input
                          className={mobileNo.error === true ? "error" : ""}
                          maxLength='13'
                          onChange={testMobileNo}
                          onKeyDown={mobileHandleKeyDown}
                          disabled
                        />
                      </Form.Item>
                      <Form.Item
                        label="Business Type"
                        name="businessType"
                        rules={[{ required: true, message: 'Select your Business Type!' }]}
                      >
                        <Select>
                          <Option value="Sole Proprietorship">Sole Proprietorship</Option>
                          <Option value="Partnership">Partnership</Option>
                          <Option value="Cooperative">Cooperative</Option>
                          <Option value="Limited Liability Company">Limited Liability Company</Option>
                          <Option value="Companies Limited by Guarantee">Companies Limited by Guarantee</Option>
                          <Option value="Public Liability Company">Public Liability Company</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label="Industry Type"
                        name="industryType"
                        rules={[{ required: true, message: 'Select your Industry Type!' }]}
                      >
                        <Select>
                          <Option value="Energy &amp; Special Risks">Energy &amp; Special Risks</Option>
                          <Option value="Financial Institutions">Financial Institutions</Option>
                          <Option value="Manufacturing">Manufacturing</Option>
                          <Option value="Public Sector &amp; Power">Public Sector &amp; Power</Option>
                          <Option value="Services I">Services I</Option>
                          <Option value="Services II">Services II</Option>
                          <Option value="Upstream">Upstream</Option>
                          <Option value="Commercial Banks">Commercial Banks</Option>
                          <Option value="MDAs">MDAs</Option>
                          <Option value="Trade (Wholesale &amp; Retail)">Trade (Wholesale &amp; Retail)</Option>
                          <Option value="Information Technology (IT)">Information Technology (IT)</Option>
                          <Option value="Downstream &amp; Aviation">Downstream &amp; Aviation</Option>
                          <Option value="Primary Mortgage Institutions (PMI)">Primary Mortgage Institutions (PMI)</Option>
                          <Option value="Power">Power</Option>
                          <Option value="Telecomms">Telecomms</Option>
                          <Option value="Construction">Construction</Option>
                          <Option value="Oil Servicing">Oil Servicing</Option>
                          <Option value="Microfinance Banks (MfB)">Microfinance Banks (MfB)</Option>
                          <Option value="Voluntary Sector &amp; Other Corporates">Voluntary Sector &amp; Other Corporates</Option>
                          <Option value="Hospitality">Hospitality</Option>
                          <Option value="Education">Education</Option>
                          <Option value="Agriculture">Agriculture</Option>
                          <Option value="Capital Market Operators (CMO)">Capital Market Operators (CMO)</Option>
                          <Option value="Transport &amp; Logistics">Transport &amp; Logistics</Option>
                          <Option value="Health Care">Health Care</Option>
                          <Option value="Other Financial Institutions">Other Financial Institutions</Option>
                          <Option value="Real Estate">Real Estate</Option>
                          <Option value="Professional Services">Professional Services</Option>
                        </Select>
                      </Form.Item>
                      {
                        userData.agentType == "corporate" ?
                          <>
                            <Form.Item
                              label="RC Number"
                              name="rcNumber"
                              rules={[
                                {
                                  required: true,
                                  validator(_, value) {
                                    let error;
                                    if (rcNumber.value !== null) {
                                      if (rcNumber.error === true) {
                                        error = "Enter your valid RC Number"
                                      }
                                    } else {
                                      error = "Enter your RC Number!"
                                    }
                                    return error ? Promise.reject(error) : Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input onChange={rcNumberHandle} onKeyDown={numbricKeyDownHandle} maxLength={10} />
                            </Form.Item>
                          </>
                          :
                          <></>
                      }
                      <Form.Item
                        label="Address"
                        name="address"
                        rules={[{ required: true, message: 'Enter your Address!' }]}
                      >
                        <Input onKeyDown={addressHandleKeyDown} maxLength={200} />
                      </Form.Item>
                      <Form.Item
                        label="State"
                        name="state"
                        rules={[{ required: true, message: 'Please Select State' }]}
                      >
                        <Select
                          // showSearch
                          placeholder="Select State"
                          onChange={selectState}
                        >
                          {stateOption && stateOption?.map((item, index) => {
                            return <Option value={item?.CODE} key={index}>{item?.NAME}</Option>
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label="LGA"
                        name="city"
                        rules={[{ required: true, message: 'Please Select LGA!' }]}
                      >
                        <Select
                          // showSearch 
                          placeholder="Select LGA"
                        >
                          {cityOption?.map((item, index) => {
                            return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                          })}
                        </Select>
                      </Form.Item>
                      {
                        userData.agentType == "corporate" ?
                          <>
                            <Form.Item
                              label="Company Name"
                              name="companyName"
                              rules={[{ required: true, message: 'Enter your Company Name!' }]}
                            >
                              <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
                            </Form.Item>
                          </>
                          :
                          <>
                          </>
                      }

                      <Form.Item
                        label="Select ID type"
                        name="idType"
                        rules={[{ required: true, message: 'Select your ID Type!' }]}
                      >
                        <Select onChange={idTypeHandle}>
                          <Option value="Permanent Voters Card">Permanent Voters Card</Option>
                          <Option value="International Passport">International Passport</Option>
                          <Option value="Driver's Licence">Driver's Licence</Option>
                          <Option value="BVN">BVN</Option>
                        </Select>
                      </Form.Item>

                      {idType === "Permanent Voters Card" ?
                        <Form.Item
                          label="Permanent Voters ID Number"
                          name="permanentVotersCard"
                          rules={[
                            {
                              required: true,
                              validator(_, value) {
                                let error;
                                if (pvcNumber.value !== null) {
                                  if (pvcNumber.error === true) {
                                    error = "Enter your valid Permanent Voters ID Number!"
                                  }
                                } else {
                                  error = "Enter your Permanent Voters ID Number!"
                                }
                                return error ? Promise.reject(error) : Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input className={pvcNumber.error === true ? "error" : ""} onChange={pvcHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={19} />
                        </Form.Item>
                        : idType === "International Passport" ?
                          <Form.Item
                            label="Passport Number"
                            name="passport"
                            // rules={[{ required: true, message: 'Enter your Passport  Number!' }]}
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (passportNumber.value !== null) {
                                    if (passportNumber.error === true) {
                                      error = "Enter your valid Passport  Number!"
                                    }
                                  } else {
                                    error = "Enter your Passport  Number!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input className={passportNumber.error === true ? "error" : ""} onChange={passportHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={9} />
                          </Form.Item>

                          : idType === "Driver's Licence" ?
                            <Form.Item
                              label="Driver's Licence Number"
                              name="driverLicence"
                              rules={[
                                {
                                  required: true,
                                  validator(_, value) {
                                    let error;
                                    if (drivingNumber.value !== null) {
                                      if (drivingNumber.error === true) {
                                        error = "Enter your valid Driver's Licence Number!"
                                      }
                                    } else {
                                      error = "Enter your Driver's Licence Number!"
                                    }
                                    return error ? Promise.reject(error) : Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input className={drivingNumber.error === true ? "error" : ""} onChange={drivingHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={11} />
                            </Form.Item>
                            : idType === "BVN" ?
                              <Form.Item
                                label="BVN Number"
                                name="bvn"
                                rules={[
                                  {
                                    required: true,
                                    validator(_, value) {
                                      let error;
                                      if (bvnNumber.value !== null) {
                                        if (bvnNumber.error === true) {
                                          error = "Enter your valid BVN Number"
                                        }
                                      } else {
                                        error = "Enter your BVN Number!"
                                      }
                                      return error ? Promise.reject(error) : Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <Input
                                  className={bvnNumber.error === true ? "error" : ""}
                                  onChange={bvnHandle}
                                  onKeyDown={numbricKeyDownHandle}
                                  maxLength={11}
                                />
                              </Form.Item>
                              :
                              <></>
                      }
                      <Form.Item
                        label="Date of Birth"
                        name="dob"
                        rules={[{ required: true, message: 'Enter your Date of Birth!' }]}
                      >
                        <DatePicker
                          onChange={(a, b) => {
                            setDateOfBirth(b.split("-").join("-"));
                          }}
                          disabledDate={dateBirthdisabled}
                        />
                      </Form.Item>

                    </div>
                    <Form.Item className="activate-account-footer">
                      <Button disabled={loading ? true : false} htmlType="submit">Proceed {loading ? <Spin /> : <></>}</Button>
                    </Form.Item>
                  </Form>
                </>
              </div>

              {/* <div className={active ? "step3 active" : "step3"}>
                <p>Step 2 of 2</p>
                <Form
                  name="activateAccount"
                  onFinish={activateAccountStep3Handle}
                  autoComplete="off"
                >
                  <div className="activateAccount-form">
                    <Form.Item
                      label="Second Director's First Name"
                      name="secondDirectorFirstName"
                      rules={[{ required: true, message: 'Enter your Director First Name!' }]}
                    >
                      <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      label="Second Director's Last Name"
                      name="secondDirectorLastName"
                      rules={[{ required: true, message: 'Enter your Director Last Name!' }]}
                    >
                      <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      label="Second Director's Email"
                      name="secondDirectorEmail"
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (secondEmail.value !== null) {
                              if (secondEmail.error === true) {
                                error = "Enter valid Email Id!"
                              }
                            } else {
                              error = "Enter your Email Id!"
                            }
                            return error ? Promise.reject(error) : Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input className={secondEmail.error === true ? "error" : ""} onChange={emailHandleKeyDown2} />
                    </Form.Item>
                    <Form.Item
                      label="second Director's Phone Number"
                      name="secondDirectorMobileNumber"
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (secondMobileNo.value !== null) {
                              if (secondMobileNo.error === true) {
                                error = "Enter valid  Phone Number!"
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
                        className={secondMobileNo.error === true ? "error" : ""}
                        maxLength='13'
                        onChange={testMobileNo2}
                        onKeyDown={mobileHandleKeyDown}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Director’s Select ID type"
                      name="secondDirectorIdType"
                      rules={[{ required: true, message: 'Select your ID Type!' }]}
                    >
                      <Select onChange={idTypeHandle2}>
                        <Option value="Permanent Voters Card">Permanent Voters Card</Option>
                        <Option value="International Passport">International Passport</Option>
                        <Option value="Driver's Licence">Driver's Licence</Option>
                        <Option value="BVN">BVN</Option>
                      </Select>
                    </Form.Item>

                    {secondIdType === "Permanent Voters Card" ?
                      <Form.Item
                        label="Permanent Voters ID Number"
                        name="permanentVotersCard"
                        rules={[
                          {
                            required: true,
                            validator(_, value) {
                              let error;
                              if (secondPvcNumber.value !== null) {
                                if (secondPvcNumber.error === true) {
                                  error = "Enter your valid Permanent Voters ID Number!"
                                }
                              } else {
                                error = "Enter your Permanent Voters ID Number!"
                              }
                              return error ? Promise.reject(error) : Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input className={secondPvcNumber.error === true ? "error" : ""} onChange={pvcHandle2} onKeyDown={alphaNumericHandleKeyDown} maxLength={19} />
                      </Form.Item>
                      : secondIdType === "International Passport" ?
                        <Form.Item
                          label="Passport Number"
                          name="passport"
                          // rules={[{ required: true, message: 'Enter your Passport  Number!' }]}
                          rules={[
                            {
                              required: true,
                              validator(_, value) {
                                let error;
                                if (secondPassportNumber.value !== null) {
                                  if (secondPassportNumber.error === true) {
                                    error = "Enter your valid Passport  Number!"
                                  }
                                } else {
                                  error = "Enter your Passport  Number!"
                                }
                                return error ? Promise.reject(error) : Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input className={secondPassportNumber.error === true ? "error" : ""} onChange={passportHandle2} onKeyDown={alphaNumericHandleKeyDown} maxLength={9} />
                        </Form.Item>

                        : secondIdType === "Driver's Licence" ?
                          <Form.Item
                            label="Driver's Licence Number"
                            name="driverLicence"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (secondDrivingNumber.value !== null) {
                                    if (secondDrivingNumber.error === true) {
                                      error = "Enter your valid Driver's Licence Number!"
                                    }
                                  } else {
                                    error = "Enter your Driver's Licence Number!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input className={secondDrivingNumber.error === true ? "error" : ""} onChange={drivingHandle2} onKeyDown={alphaNumericHandleKeyDown} maxLength={11} />
                          </Form.Item>
                          : secondIdType === "BVN" ?
                            <Form.Item
                              label="Director's BVN Number"
                              name="bvn"
                              rules={[
                                {
                                  required: true,
                                  validator(_, value) {
                                    let error;
                                    if (secondBvnNumber.value !== null) {
                                      if (secondBvnNumber.error === true) {
                                        error = "Enter your valid BVN Number"
                                      }
                                    } else {
                                      error = "Enter your BVN Number!"
                                    }
                                    return error ? Promise.reject(error) : Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input
                                className={secondBvnNumber.error === true ? "error" : ""}
                                onChange={bvnHandle2}
                                onKeyDown={numbricKeyDownHandle}
                                maxLength={11}
                              />
                            </Form.Item>
                            :
                            <></>
                    }
                    <Form.Item
                      label="Director's Date of Birth"
                      name="secondDirectorDOB"
                      rules={[{ required: true, message: 'Enter your Date of Birth!' }]}
                    >
                      <DatePicker
                        onChange={(a, b) => {
                          setSecondDateOfBirth(b.split("-").join("/"));
                        }}
                        disabledDate={dateBirthdisabled}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item className="activate-account-footer">
                    <Button disabled={loading ? true : false} htmlType="submit">Proceed {loading ? <Spin /> : <></>}</Button>
                  </Form.Item>
                </Form>
              </div> */}
            </>
            :
            <div className="successfully-account">
              <h2>{successMsg}</h2>
            </div>
          }
        </div>

      </div>
    </div>
  );
}

ActivateAccount.propTypes = {};

export default memo(ActivateAccount);
