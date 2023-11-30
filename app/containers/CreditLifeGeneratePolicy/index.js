/**
 *
 * CreditLifeGeneratePolicy
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectCreditLifeGeneratePolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import CurrencyFormat from 'react-currency-format';
import './style.scss';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import Tabs from 'antd/es/tabs';
import { Tooltip } from 'antd';
import Button from 'antd/es/button';
import { Radio } from 'antd';
import Checkbox from 'antd/es/checkbox';
import moment from "moment";
import Modal from 'antd/es/modal';
import notification from 'antd/es/notification';
import Spin from 'antd/es/spin';
import logo from '../../images/logo.png';
import iconLocation from '../../images/icon-location.png';
import iconPhone from '../../images/icon-phone.png';
import iconEmail from '../../images/icon-mail.png';
import { WalletOutlined, CreditCardOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { generateCreditLifePolicyApi, generateCreditLifeDisbursementPremiumApi, creditLifePolicyPayApi, generateCreditLifeDisbursementApi, verifyDeviceApi, getCreditLifePolicyNoApi, getCreditLifePolicyByIdApi, getProfileData } from '../../services/AuthService';
import axios from 'axios';
import aes256 from "../../services/aes256";

export function CreditLifeGeneratePolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "creditLifeGeneratePolicy", reducer });
  useInjectSaga({ key: "creditLifeGeneratePolicy", saga });
  const title = "Credit Life Generate Policy";
  const { TabPane } = Tabs;
  const { TextArea } = Input;
  const redirectUrl = window.location.href
  const search = location.search;
  const queryTxRef = new URLSearchParams(search).get('trxref');
  const queryIsBulk = new URLSearchParams(search).get('isBulk');
  const userId = sessionStorage.getItem('email');
  const [allLoading, setAllLoading] = useState(false);
  const [form] = Form.useForm();
  const [disbursementForm] = Form.useForm();
  const [disbursementFormPay] = Form.useForm();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [showModal, setShowModal] = useState(false);
  const [quotationMsg, setQuotationMsg] = useState({ value: null, error: false });
  const [quotationNumber, setQuotationNumber] = useState("");
  const [premiumPeriodType, setPremiumPeriodType] = useState("");
  const [masterPoliciesNo, setMasterPoliciesNo] = useState([]);
  const [policyVerifyMsg, setPolicyVerifyMsg] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [policyVerifyModal, setPolicyVerifyModal] = useState("");
  const [minAgeInput, setMinAgeInput] = useState({ value: null, error: false });
  const [maxAgeInput, setMaxAgeInput] = useState({ value: null, error: false });
  const [minLoanAmountInput, setMinLoanAmountInput] = useState({ value: null, error: false });
  const [maxLoanAmountInput, setMaxLoanAmountInput] = useState({ value: null, error: false });
  const [minLoanTenureInput, setMinLoanTenureInput] = useState({ value: null, error: false });
  const [maxLoanTenureInput, setMaxLoanTenureInput] = useState({ value: null, error: false });
  const [masterPolicyData, setMasterPolicyData] = useState({});
  const [disbursementLoanAmountInput, setDisbursementLoanAmountInput] = useState({ value: null, error: false });
  const [disbursementLoanTenureInput, setDisbursementLoanTenureInput] = useState({ value: null, error: false });
  const [deviceBuyPolicyTermCheck, setDeviceBuyPolicyTermCheck] = useState();

  const [disbaled, setDisbaled] = useState(true);
  const [genderDisabled, setGenderDisabled] = useState(false);
  const [loanDisbursementCriticalIllness, setLoanDisbursementCriticalIllness] = useState(false);
  const [loanDisbursementDeath, setLoanDisbursementDeath] = useState(false);
  const [loanDisbursementDisability, setLoanDisbursementDisability] = useState(false);
  const [loanDisbursementJobLoss, setLoanDisbursementJobLoss] = useState(false);
  const [loanDisbursementBusinessLoss, setLoanDisbursementBusinessLoss] = useState(false);
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [loanDisbursementData, setLoanDisbursementData] = useState({});
  const [loanDisbursementPremiumData, setLoanDisbursementPremiumData] = useState({});

  const [loader, setLoader] = useState(false);
  const [conformModalVisible, setConformModalVisible] = useState(false);
  const [userProfileUpdate, setUserProfileUpdate] = useState({})
  const [confirmBulkUploadResponse, setConfirmBulkUploadResponse] = useState(false);
  const [confirmBulkUploadResponseData, setConfirmBulkUploadResponseData] = useState();
  const [confirmBulkUploadResponseMsg, setConfirmBulkUploadResponseMsg] = useState({ value: null, error: false });

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const premiumPeriodTypeHandle = (value) => {
    setPremiumPeriodType(value)
  }

  function companyHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9& ]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
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

  function alphaNumericHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9]+$");
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


  const disabledDate = (current) => {
    const yesterday = moment().subtract(3, "months");
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current < moment().subtract(2, 'months');
  }

  function disabledDate2(current) {
    const yesterday = moment().subtract(1, 'days')
    return (current && current < moment(yesterday, "YYYY-MM-DD"));
  }

  function dateBirthdisabled(current) {
    const yesterday = moment("YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current > moment().subtract(masterPolicyData?.MIN_AGE, 'years');
  }


  const generateCreditLifePolicyHandle = (values) => {

    // values.minLoanAmount = Number(values?.minLoanAmount);
    // values.maxLoanAmount = Number(values?.maxLoanAmount);

    values.minLoanAmount = values?.minLoanAmount?.replaceAll(",", "")
    values.maxLoanAmount = values?.maxLoanAmount?.replaceAll(",", "")

    // values.criticalIllness = values?.criticalIllness == "true" ? true : false;
    // values.deathOnly = values?.deathOnly == "true" ? true : false;
    // values.disability = values?.disability == "true" ? true : false;
    // values.jobLoss = values?.jobLoss == "true" ? true : false;
    // values.businessLoss = values?.businessLoss == "true" ? true : false;

    setAllLoading(true);
    generateCreditLifePolicyApi(tokenKey, values, toggleBtn)
      .then(res => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          form.resetFields();
          setShowModal(true);
          setQuotationMsg({ value: res.message, error: false })
        } else {
          setShowModal(true);
          setQuotationMsg({ value: res.message, error: true })
          setQuotationNumber("")
        }
      })
      .catch((err) => {
        setAllLoading(false);
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  }

  const getCreditLifePolicyNoHandle = () => {
    setAllLoading(true);
    getCreditLifePolicyNoApi(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setMasterPoliciesNo(res.data.DATA)
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
  }

  const getProfileHandle = () => {
    getProfileData(toggleBtn, { "email": userId })
      .then((res) => {
        if (res.success === true) {
          setUserData(res.data)
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

  const generateCreditLifeDisbursementHandle = (values) => {
    values.loanAmount = values?.loanAmount?.replaceAll(",", "")
    // values.loanAmount = Number(values?.loanAmount);
    values.dob = moment(values?.dob)?.format("YYYY-MM-DD");
    values.startDate = moment(values?.startDate)?.format("YYYY-MM-DD");
    values.endDate = moment(values?.endDate)?.format("YYYY-MM-DD");
    setAllLoading(true);
    generateCreditLifeDisbursementPremiumApi(tokenKey, values, toggleBtn)
      .then(res => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          setLoanDisbursementData(values)
          setLoanDisbursementPremiumData(res.data)
          setPaymentMethodModal(true)
        } else {
          setShowModal(true);
          setQuotationMsg({ value: res.message, error: true })
          setQuotationNumber("")
        }
      })
      .catch((err) => {
        setAllLoading(false);
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  }


  useEffect(() => {
    if (queryTxRef != null && userData?.token) {
      verifyDeviceApi(tokenKey, queryTxRef, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          if (res.data.status === "Success" || res.data.status === "successful") {
            setPolicyVerifyModal(true);
            if (queryIsBulk == "false") {
              setPolicyVerifyMsg("Your Policy has been successfully generated. Your Policy Number is")
              setPolicyNumber(res?.data?.POLICY_NUMBER)
            } else {
              setPolicyVerifyMsg("Your All Policy has been successfully generated.")
              setPolicyNumber("");
            }
          } else if (res.data.status === "pending") {
            setPolicyVerifyModal(true);
            setPolicyVerifyMsg("Your transaction could not complete successfully. Please reinitiate payment.")
            setPolicyNumber("");
          } else {
            setPolicyVerifyModal(true);
            setPolicyVerifyMsg("Transaction failed. Please reinitiate payment.")
            setPolicyNumber("");
          }
        })
        .catch((err) => {
          console.log(err);
          setPolicyVerifyModal(true);
          setPolicyVerifyMsg("Technical Error Occurred. Please reinitiate payment.")
          setPolicyNumber("");
        });
    }
  }, [queryTxRef && userData])

  useEffect(() => {
    getCreditLifePolicyNoHandle();
  }, [tokenKey])


  // Validation
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

  function testMobileNo(e) {
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setMobileNo({ value: "", error: true })
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

  const minAgeHandle = (e) => {
    if (Number(e.target.value) >= 18 && Number(e.target.value) <= 79) {
      setMinAgeInput({ value: e.target.value, error: false })
      return true;
    } else {
      setMinAgeInput({ value: "", error: true })
      return false;
    }
  }
  const maxAgeHandle = (e) => {
    if (Number(e.target.value) > Number(minAgeInput.value) && Number(e.target.value) <= 80) {
      setMaxAgeInput({ value: e.target.value, error: false })
      return true;
    } else {
      setMaxAgeInput({ value: "", error: true })
      return false;
    }
  }

  const minLoanAmountHandle = (e) => {
    const minLAmount = e.target.value.replaceAll(",", "")
    if (Number(minLAmount) >= 1) {
      setMinLoanAmountInput({ value: minLAmount, error: false })
      return true;
    } else {
      setMinLoanAmountInput({ value: "", error: true })
      return false;
    }
  }
  const maxLoanAmountHandle = (e) => {
    const maxLAmount = e.target.value.replaceAll(",", "")
    if (Number(maxLAmount) > Number(minLoanAmountInput.value)) {
      setMaxLoanAmountInput({ value: maxLAmount, error: false })
      return true;
    } else {
      setMaxLoanAmountInput({ value: "", error: true })
      return false;
    }
  }

  const minLoanTenureHandle = (e) => {
    if (Number(e.target.value) >= 2) {
      setMinLoanTenureInput({ value: e.target.value, error: false })
      return true;
    } else {
      setMinLoanTenureInput({ value: "", error: true })
      return false;
    }
  }
  const maxLoanTenureHandle = (e) => {
    if (Number(e.target.value) > Number(minLoanTenureInput.value)) {
      setMaxLoanTenureInput({ value: e.target.value, error: false })
      return true;
    } else {
      setMaxLoanTenureInput({ value: "", error: true })
      return false;
    }
  }
  const disbursementLoanAmountHandle = (e) => {
    const lAmount = e.target.value.replaceAll(",", "")
    if (Number(lAmount) >= masterPolicyData?.MIN_LOAN_AMOUNT && Number(lAmount) <= masterPolicyData?.MAX_LOAN_AMOUNT) {
      setDisbursementLoanAmountInput({ value: e.target.value, error: false })
      return true;
    } else {
      setDisbursementLoanAmountInput({ value: "", error: true })
      return false;
    }
  }

  const disbursementLoanTenureHandle = (e) => {
    if (Number(e.target.value) >= masterPolicyData?.MIN_TERM && Number(e.target.value) <= masterPolicyData?.MAX_TERM) {
      setDisbursementLoanTenureInput({ value: e.target.value, error: false })
      disbursementForm.setFieldsValue({
        endDate: startDate == "" ? "" : moment(startDate).add(e.target.value, 'years').subtract(1, 'days'),
      });
      return true;
    } else {
      setDisbursementLoanTenureInput({ value: "", error: true })
      return false;
    }
  }

  const masterPolicyHandle = (e) => {
    setAllLoading(true);
    setDisbaled(false)
    getCreditLifePolicyByIdApi(tokenKey, e, "", "Master", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setMasterPolicyData(res.data)
          disbursementForm.setFieldsValue({
            premiumFrequency: res?.data?.FREQUENCY == 1 ? "Annual" : "Monthly",
            loanAmount: "",
            loanTenure: "",
            endDate: "",
            dob: ""
          });
          setLoanDisbursementCriticalIllness(res?.data?.CRITICAL_ILLNESS);
          setLoanDisbursementDeath(res?.data?.DEATH_ONLY);
          setLoanDisbursementDisability(res?.data?.DISABILITY);
          setLoanDisbursementJobLoss(res?.data?.JOB_LOSS);
          setLoanDisbursementBusinessLoss(res?.data?.IS_LOSS_OF_BUSINESS);
        } else {
          setMasterPolicyData({})
        }
      })
      .catch((err) => {
        console.log(err);
        setAllLoading(false);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "An error has occurred. Please try again!",
        });
      });
  }

  const paymentMethodHandle = (values) => {
    setAllLoading(true);
    loanDisbursementData.premiumFrequency = loanDisbursementData.premiumFrequency == "Monthly" ? 4 : loanDisbursementData.premiumFrequency == "Annual" ? 1 : loanDisbursementData.premiumFrequency
    const data = { ...loanDisbursementData, wallet: values.paymentOption == "Wallet" ? true : false, transactionRef: "" }
    if (values.paymentOption == "Wallet") {
      generateCreditLifeDisbursementApi(tokenKey, data, toggleBtn)
        .then(res => {
          setAllLoading(false);
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          if (res.status == true) {
            disbursementForm.resetFields();
            setPaymentMethodModal(false)
            setShowModal(true);
            setQuotationMsg({ value: res.message, error: false })
            getProfileHandle();
          } else {
            setShowModal(true);
            setQuotationMsg({ value: res.message, error: true })
          }
        })
        .catch((err) => {
          setAllLoading(false);
          console.log(err);
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "Technical Error Occurred",
          });
        });
    } else {
      creditLifePolicyPayApi(tokenKey, loanDisbursementData?.policyId, redirectUrl, loanDisbursementPremiumData?.PREMIUM_AMOUNT, toggleBtn)
        .then(res => {
          setAllLoading(false);
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          if (res.status === true) {
            window.location.href = res.data.authorization_url
          } else {
            setShowModal(true);
            setQuotationMsg({ value: res.message, error: true })
          }
        })
        .catch((err) => {
          setAllLoading(false);
          console.log(err);
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "Technical Error Occurred",
          });
        });
    }

  }

  const deviceBuyPolicyTermOnChange = (e) => {
    setDeviceBuyPolicyTermCheck(e.target.checked)
  }

  const fileChangedHandler = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setUserProfileUpdate(undefined)
      return
    }
    setUserProfileUpdate(e.target.files[0]);
    setConformModalVisible(true);
    e.target.value = null;
  }

  const confirmBulkUpload = () => {
    const formData = new FormData();
    formData.append("file", userProfileUpdate);
    const data = Object.fromEntries(formData)
    setLoader(true)
    const BASE_URL_UAT = "https://valaria.globalcognito.com";
    const BASE_URL_LIVE = "https://valaria.globalcognito.com";
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/bulk/api/creditLife`;
    axios.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        token: tokenKey,
        b2bBulk: true
      }
    })
      .then((res) => {
        res.data.data = res.data.data == null ? res.data.data : JSON.parse(aes256.decrypt(res.data.data));
        setLoader(false);
        setConfirmBulkUploadResponse(true)
        if (res.data.status === true) {
          setConfirmBulkUploadResponseMsg({ value: res.data.message, error: true })
        } else {
          setConfirmBulkUploadResponseMsg({ value: res.data.message, error: false })
          setConfirmBulkUploadResponseData(typeof res.data.data == "string" ? "" : res.data.data)
        }
      })
      .catch((err) => {
        console.log(err);
        setLoader(false);
        setConformModalVisible(false);
        setConfirmBulkUploadResponse(false)
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  };

  const creditLifeTabChange = () => {
    form.resetFields();
    disbursementForm.resetFields();
    disbursementFormPay.resetFields();
  }
  const handleCancel = () => {
    disbursementForm.resetFields();
    disbursementFormPay.resetFields();
    setShowModal(false);
    setConformModalVisible(false);
    setConfirmBulkUploadResponse(false);
    setPaymentMethodModal(false)
    setPolicyVerifyModal(false);
    setPolicyVerifyMsg("");
    setDeviceBuyPolicyTermCheck()
    setQuotationMsg({ value: null, error: false });
    setMinLoanAmountInput({ value: null, error: false });
    setMaxLoanAmountInput({ value: null, error: false });
    setMinLoanTenureInput({ value: null, error: false });
    setMaxLoanTenureInput({ value: null, error: false });
    setDisbursementLoanAmountInput({ value: null, error: false });
    setDisbursementLoanTenureInput({ value: null, error: false });
  };

  const titleHandle = (data) => {
    if (data == "Mr." || data == "Alhaji" || data == "Alhaja" || data == "Prince" || data == "Otunba" || data == "Comrade" || data == "King" || data == "Oba") {
      disbursementForm.setFieldsValue({
        gender: "Male"
      });
      setGenderDisabled(true);
    } else if (data == "Mrs." || data == "Miss." || data == "Mr. and Ms" || data == "Princess" || data == "Queen") {
      disbursementForm.setFieldsValue({
        gender: "Female"
      });
      setGenderDisabled(true);
    } else {
      disbursementForm.setFieldsValue({
        gender: ""
      });
      setGenderDisabled(false);
    }
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="credit-life-policy-section">
          <div className="motor-quotation-left">
            <h6>Generate Policy :- </h6>
            <p>Please enter the following details to generate policy.</p>
            <Tabs defaultActiveKey={masterPoliciesNo.length ? "2" : "1"} onChange={creditLifeTabChange}>
              {
                masterPoliciesNo.length ?
                  <>
                  </>
                  :
                  <>
                    <TabPane tab="Master Policy" key="1">
                      <Form
                        form={form}
                        name="basic"
                        onFinish={generateCreditLifePolicyHandle}
                        autoComplete="off"
                      >
                        <div className="tooltip-input-item">
                          <Tooltip title="Need to know how Loan Premium are paid." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Premium Type"
                            name="premiumFrequency"
                            rules={[{ required: true, message: 'Select your Premium Type!' }]}
                          >
                            <Select onChange={premiumPeriodTypeHandle}>
                              <Option value={4}>Monthly</Option>
                              <Option value={1}>Annual</Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="Use your own alphanumeric ID for future reference." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Tracking Refrence"
                            name="trackingReference"
                            rules={[
                              {
                                required: true,
                                message: 'Enter Tracking Refrence!',
                              },
                            ]}
                          >
                            <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={30} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="What will be the Minimum Age of Borrowers?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Min Age"
                            name="minAge"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (minAgeInput.value !== null) {
                                    if (minAgeInput.error === true) {
                                      error = "Enter Age between 18 to 79!"
                                    }
                                  } else {
                                    error = "Enter Age between 18 to 79!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input onKeyDown={numbricKeyDownHandle} onChange={minAgeHandle} maxLength={2} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="What will be the Maximum Age of Borrowers?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Max Age"
                            name="maxAge"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (maxAgeInput.value !== null) {
                                    if (maxAgeInput.error === true) {
                                      error = "Max Age can't be greater than 80!"
                                    }
                                  } else {
                                    error = "Max Age can't be greater than 80!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input onKeyDown={numbricKeyDownHandle} onChange={maxAgeHandle} maxLength={2} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="What is the type of Loan your institution disburse?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Loan Category"
                            name="loanType"
                            rules={[{ required: true, message: 'Select Loan Category' }]}
                          >
                            <Select
                            >
                              <Option value="Secured">Secured</Option>
                              <Option value="Unsecured">Unsecured</Option>
                              <Option value="Both">Both</Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="Please select the Loan Type" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Loan Type"
                            name="typeOfLoans"
                            rules={[{ required: true, message: 'Select Loan Type' }]}
                          >
                            <Select
                            >
                              <Option value="Business-SME">Business-SME</Option>
                              <Option value="Business-Corporate">Business-Corporate</Option>
                              <Option value="Personal">Personal</Option>
                            </Select>
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="Specify age of your business." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Period in Credit Business"
                            name="creditBusinessPeriod"
                            rules={[{ required: true, message: 'Enter Period in Credit Busines' }]}
                          >
                            <Input onKeyDown={numbricKeyDownHandle} maxLength={2} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="Provide a minimum loan duration in Months." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Min. Loan Tenure"
                            name="minTenure"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (minLoanTenureInput.value !== null) {
                                    if (minLoanTenureInput.error === true) {
                                      error = "Min. Loan Tenure should be more than 1 Month"
                                    }
                                  } else {
                                    error = "Min. Loan Tenure should be more than 1 Month"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input onKeyDown={numbricKeyDownHandle} onChange={minLoanTenureHandle} maxLength={2} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="Provide a maximum loan duration in Months." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Max. Loan Tenure"
                            name="maxTenure"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (maxLoanTenureInput.value !== null) {
                                    if (maxLoanTenureInput.error === true) {
                                      error = "Max loan tenure should be More than min loan tenure!"
                                    }
                                  } else {
                                    error = "Max loan tenure should be More than min loan tenure!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input onKeyDown={numbricKeyDownHandle} onChange={maxLoanTenureHandle} maxLength={3} />
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="What will be the minimum Loan to be disbursed?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Min Loan Amount"
                            name="minLoanAmount"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (minLoanAmountInput.value !== null) {
                                    if (minLoanAmountInput.error === true) {
                                      error = "Enter min loan amount!"
                                    }
                                  } else {
                                    error = "Enter min loan amount!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <CurrencyFormat thousandSeparator={true} onKeyDown={numbricKeyDownHandle} onChange={minLoanAmountHandle} maxLength={12} className="amountInput" allowNegative={false} />
                            {/* <Input onKeyDown={numbricKeyDownHandle} onChange={minLoanAmountHandle} maxLength={12} /> */}
                          </Form.Item>
                        </div>
                        <div className="tooltip-input-item">
                          <Tooltip title="What will be the maximum Loan to be disbursed?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                            <span><InfoCircleOutlined /></span>
                          </Tooltip>
                          <Form.Item
                            label="Max Loan Amount"
                            name="maxLoanAmount"
                            rules={[
                              {
                                required: true,
                                validator(_, value) {
                                  let error;
                                  if (maxLoanAmountInput.value !== null) {
                                    if (maxLoanAmountInput.error === true) {
                                      error = "Max loan value should be More than min loan value!"
                                    }
                                  } else {
                                    error = "Max loan value should be More than min loan value!"
                                  }
                                  return error ? Promise.reject(error) : Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <CurrencyFormat thousandSeparator={true} onKeyDown={numbricKeyDownHandle} onChange={maxLoanAmountHandle} maxLength={12} className="amountInput" allowNegative={false} />
                            {/* <Input onKeyDown={numbricKeyDownHandle} onChange={maxLoanAmountHandle} maxLength={12} /> */}
                          </Form.Item>
                        </div>
                        <Form.Item
                          label="Critical Illness/Hospitalization"
                          name="criticalIllness"
                          rules={[{ required: true, message: 'Please Select Illness' }]}
                        >
                          <Select
                          >
                            <Option value={true}>Yes</Option>
                            <Option value={false}>No</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Death"
                          name="deathOnly"
                          rules={[{ required: true, message: 'Please Select Death' }]}
                        >
                          <Select
                          >
                            <Option value={true}>Yes</Option>
                            <Option value={false}>No</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Permanent Disability "
                          name="disability"
                          rules={[{ required: true, message: 'Please Select Disability' }]}
                        >
                          <Select
                          >
                            <Option value={true}>Yes</Option>
                            <Option value={false}>No</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Job Loss"
                          name="jobLoss"
                          rules={[{ required: true, message: 'Please Select Job Loss' }]}
                        >
                          <Select
                          >
                            <Option value={true}>Yes</Option>
                            <Option value={false}>No</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Loss of Business (Fire & Flood)"
                          name="lossOfBusiness"
                          rules={[{ required: true, message: 'Please Select Loss of Business' }]}
                        >
                          <Select
                          >
                            <Option value={true}>Yes</Option>
                            <Option value={false}>No</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item>
                          <Button htmlType="submit">Submit</Button>
                        </Form.Item>
                      </Form>
                    </TabPane>
                  </>
              }

              <TabPane tab="Loan Disbursement (Individual)" key="2">
                <Form
                  form={disbursementForm}
                  name="basic"
                  onFinish={generateCreditLifeDisbursementHandle}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please Select Title' }]}
                  >
                    <Select onChange={titleHandle}>
                      <Option value="Mr." attr-gender="Male">Mr.</Option>
                      <Option value="Mrs." attr-gender="Female">Mrs.</Option>
                      <Option value="Miss." attr-gender="Female">Miss.</Option>
                      <Option value="Dr." attr-gender="Unisex">Dr.</Option>
                      <Option value="Mr. and Mrs." attr-gender="Unisex">Mr. and Mrs.</Option>
                      <Option value="Mr. and Ms" attr-gender="Unisex">Mr. and Ms</Option>
                      <Option value="Mrs. and Ms" attr-gender="Female">Mrs. and Ms</Option>
                      <Option value="Mr. and Miss" attr-gender="Unisex">Mr. and Miss</Option>
                      <Option value="Dr. and Mrs" attr-gender="Unisex">Dr. and Mrs</Option>
                      <Option value="Dr. and Mr" attr-gender="Unisex">Dr. and Mr</Option>
                      <Option value="Prof. and Mrs" attr-gender="Unisex">Prof. and Mrs</Option>
                      <Option value="Prof. and Mr" attr-gender="Unisex">Prof. and Mr </Option>
                      <Option value="Rev. and Mrs" attr-gender="Unisex">Rev. and Mrs</Option>
                      <Option value="Rev. and Mr." attr-gender="Unisex">Rev. and Mr.</Option>
                      <Option value="Rev. and Ms" attr-gender="Unisex">Rev. and Ms</Option>
                      <Option value="Alhaji" attr-gender="Male">Alhaji</Option>
                      <Option value="Alhaja" attr-gender="Male">Alhaja</Option>
                      <Option value="Chief" attr-gender="Unisex">Chief</Option>
                      <Option value="Prince" attr-gender="Male">Prince</Option>
                      <Option value="Princess" attr-gender="Female">Princess</Option>
                      <Option value="Otunba" attr-gender="Male">Otunba</Option>
                      <Option value="HRH" attr-gender="Unisex">HRH</Option>
                      <Option value="Honourable" attr-gender="Unisex">Honourable</Option>
                      <Option value="Comrade" attr-gender="Male">Comrade</Option>
                      <Option value="Senator" attr-gender="Unisex">Senator</Option>
                      <Option value="King" attr-gender="Male">King</Option>
                      <Option value="Queen" attr-gender="Female">Queen</Option>
                      <Option value="Oba" attr-gender="Male">Oba</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Gender"
                    name="gender"
                    rules={[{ required: true, message: 'Please Select Gender' }]}
                  >
                    <Select disabled={genderDisabled ? true : false}>
                      <Option value="Male">Male</Option>
                      <Option value="Female">Female</Option>
                      <Option value="Other">Other</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: 'Enter your First Name!' }]}
                  >
                    <Input onKeyDown={alphaHandleKeyDown} maxLength={50} />
                  </Form.Item>
                  <Form.Item
                    label="Middle Name"
                    name="middlenName"
                  >
                    <Input onKeyDown={alphaHandleKeyDown} maxLength={50} />
                  </Form.Item>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: 'Enter your Last Name!' }]}
                  >
                    <Input onKeyDown={alphaHandleKeyDown} maxLength={50} />
                  </Form.Item>
                  <Form.Item
                    label="Email"
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
                    <Input onChange={emailHandleKeyDown} maxLength={50} />
                  </Form.Item>
                  <Form.Item
                    label="Mobile No."
                    name="phoneNumber"
                    rules={[
                      {
                        required: true,
                        validator(_, value) {
                          let error;
                          if (mobileNo.value !== null) {
                            if (mobileNo.error === true) {
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
                      maxLength={11}
                      onChange={testMobileNo}
                      onKeyDown={mobileHandleKeyDown}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Master Policy No."
                    name="policyId"
                    rules={[
                      {
                        required: true,
                        message: 'Enter Policy Id!',
                      },
                    ]}
                  >
                    <Select onChange={masterPolicyHandle}>
                      {masterPoliciesNo?.map((item, index) => {
                        return <Option value={item.ID} key={index}>{item["POLICY_#"]}</Option>
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Date of Birth"
                    name="dob"
                    rules={[{ required: true, message: 'Enter your Date of Birth!' }]}
                  >
                    <DatePicker
                      disabledDate={dateBirthdisabled}
                      disabled={disbaled}
                    />
                  </Form.Item>
                  <div className="tooltip-input-item">
                    <Tooltip title="Is borrower a Salaried or Business person?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                      <span><InfoCircleOutlined /></span>
                    </Tooltip>
                    <Form.Item
                      label="Borrower Type"
                      name="classOfBorrower"
                      rules={[
                        {
                          required: true,
                          message: 'Select Borrower Type!',
                        },
                      ]}
                    >
                      <Select>
                        <Option value="Salaried">Salaried</Option>
                        <Option value="SME">SME</Option>
                        <Option value="Trader">Trader</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="tooltip-input-item">
                    <Tooltip title="Need to know how Loan Premium are paid." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                      <span><InfoCircleOutlined /></span>
                    </Tooltip>
                    <Form.Item
                      label="Premium Type"
                      name="premiumFrequency"
                      rules={[{ required: true, message: 'Select your Premium Type!' }]}
                    >
                      <Select onChange={premiumPeriodTypeHandle} disabled={disbaled}>
                        <Option value={4}>Monthly</Option>
                        <Option value={1}>Annual</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="tooltip-input-item">
                    <Tooltip title="What is the Loan Disbursed Amount?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                      <span><InfoCircleOutlined /></span>
                    </Tooltip>
                    <Form.Item
                      label="Loan Amount"
                      name="loanAmount"
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (disbursementLoanAmountInput.value !== null) {
                              if (disbursementLoanAmountInput.error === true) {
                                error = "Enter min loan amount " + masterPolicyData?.MIN_LOAN_AMOUNT?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }) + " and max loan amount " + masterPolicyData?.MAX_LOAN_AMOUNT?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }) + "!"
                              }
                            } else {
                              error = "Enter min loan amount " + masterPolicyData?.MIN_LOAN_AMOUNT + " and max loan amount " + masterPolicyData?.MAX_LOAN_AMOUNT + "!"
                            }
                            return error ? Promise.reject(error) : Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <CurrencyFormat thousandSeparator={true} onKeyDown={numbricKeyDownHandle} onChange={disbursementLoanAmountHandle} maxLength={12} allowNegative={false} disabled={disbaled} className="amountInput" />
                      {/* <Input onKeyDown={numbricKeyDownHandle} onChange={disbursementLoanAmountHandle} disabled={disbaled} maxLength={12} /> */}
                    </Form.Item>
                  </div>
                  <div className="tooltip-input-item">
                    <Tooltip title="What is the tenure of this Loan?" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                      <span><InfoCircleOutlined /></span>
                    </Tooltip>
                    <Form.Item
                      label="Loan Tenure"
                      name="loanTenure"
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (disbursementLoanTenureInput.value !== null) {
                              if (disbursementLoanTenureInput.error === true) {
                                error = "Enter min loan tenure " + masterPolicyData?.MIN_TERM + " months and max loan tenure " + masterPolicyData?.MAX_TERM + " months!"
                              }
                            } else {
                              error = "Enter min loan tenure  " + masterPolicyData?.MIN_TERM + " months and max loan tenure " + masterPolicyData?.MAX_TERM + " months!"
                            }
                            return error ? Promise.reject(error) : Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input maxLength={2} disabled={disbaled} onChange={disbursementLoanTenureHandle} onKeyDown={numbricKeyDownHandle} />
                    </Form.Item>
                  </div>
                  <div className="tooltip-input-item">
                    <Tooltip title="Use your own alphanumeric ID for future reference." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                      <span><InfoCircleOutlined /></span>
                    </Tooltip>
                    <Form.Item
                      label="Tracking Refrence"
                      name="trackingReference"
                      rules={[
                        {
                          required: true,
                          message: 'Enter Tracking Refrence!',
                        },
                      ]}
                    >
                      <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={30} />
                    </Form.Item>
                  </div>
                  <Form.Item
                    label="Start Date"
                    name="startDate"
                    rules={[{ required: true, message: 'Enter Start Date!' }]}
                  >
                    <DatePicker
                      placeholder="Start Date"
                      disabledDate={disabledDate2}
                      onChange={(a, b) => {
                        setStartDate(b.split("/").join("-"));
                        disbursementForm.setFieldsValue({
                          endDate: b == "" ? "" : moment(b).add(disbursementLoanTenureInput?.value, 'months').subtract(1, 'days'),
                        });
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    label="End Date"
                    name="endDate"
                    rules={[{ required: true, message: 'Enter End Date!' }]}
                  >
                    <DatePicker disabled />
                  </Form.Item>
                  {loanDisbursementCriticalIllness ?
                    <Form.Item
                      label="Critical Illness/Hospitalization"
                      name="criticalIllness"
                      rules={[{ required: true, message: 'Please Select Illness' }]}
                    >
                      <Select
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                    :
                    <></>
                  }

                  {loanDisbursementDeath ?
                    <Form.Item
                      label="Death"
                      name="deathOnly"
                      rules={[{ required: true, message: 'Please Select Death' }]}
                    >
                      <Select
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                    :
                    <></>
                  }

                  {loanDisbursementDisability ?
                    <Form.Item
                      label="Permanent Disability "
                      name="disability"
                      rules={[{ required: true, message: 'Please Select Disability' }]}
                    >
                      <Select>
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                    :
                    <></>
                  }

                  {loanDisbursementJobLoss ?
                    <Form.Item
                      label="Job Loss"
                      name="jobLoss"
                      rules={[{ required: true, message: 'Please Select Job Loss' }]}
                    >
                      <Select
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                    :
                    <></>
                  }
                  {loanDisbursementBusinessLoss ?
                    <Form.Item
                      label="Loss of Business (Fire & Flood)"
                      name="lossOfBusiness"
                      rules={[{ required: true, message: 'Please Select Loss of Business' }]}
                    >
                      <Select
                      >
                        <Option value={true}>Yes</Option>
                        <Option value={false}>No</Option>
                      </Select>
                    </Form.Item>
                    :
                    <></>
                  }
                  <Form.Item
                    label="Narration"
                    name="narration"
                  // rules={[{ required: true, message: 'Enter Narration!' }]}
                  >
                    <TextArea />
                  </Form.Item>
                  <Form.Item>
                    <Button htmlType="submit">Submit</Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Loan Disbursement (Bulk)" key="3">
                <div className="bulk-upload">
                  <h6>Bulk Generate :-</h6>
                  <p>Please upload your file to create bulk loan disbursement policy.</p>
                  <label>
                    <input
                      type="file"
                      accept=".xls,.xlsx"
                      onChange={fileChangedHandler}
                    />
                    <span>+ Upload</span>
                  </label>
                  <a href="https://modulejs.apistudioz.com/CreditLifeTemplate.xlsx" download>Sample File Download</a>
                </div>
              </TabPane>
            </Tabs>

          </div>
          <div className="motor-quotation-right">
            {/* <img src={deviceImage} alt="" /> */}
          </div>
        </div>
      </div>

      <Modal width={700} centered title="Pay Quote" className="payment-method-modal" visible={paymentMethodModal} onCancel={handleCancel}>
        <div className="buy-policy-payment-card">
          <div className="policy-payment-card-header">
            <div className="product-name">
              <Button>Credit Life Insurance</Button>
            </div>
            <div className="payment-card-logo">
              <img src={logo} />
            </div>
          </div>
          <div className="card-premium">
            {/* <img src={buyPolicyPaymentImage} /> */}
            <div className="card-premium-amount">
              <span>Premium</span>
              <h4>{Number(loanDisbursementPremiumData?.PREMIUM_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</h4>
            </div>
          </div>
          <div className="card-info">
            <div className="card-info-col">
              <h3 style={{ lineHeight: "1.5" }}>Customer Name: <br /><span style={{ fontSize: "14px", fontWeight: "500" }}>{loanDisbursementData.firstName + " " + loanDisbursementData.lastName}</span></h3>
              <p>
                <span><img src={iconPhone} />{loanDisbursementData.phoneNumber}</span>
                <span><img src={iconEmail} />{loanDisbursementData.email}</span>
              </p>
            </div>
            <div className="card-info-col">
              <h3>{Number(loanDisbursementData.loanAmount)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</h3>
              <p>Total sum insured</p>
            </div>
            <div className="card-info-col">
              <h3>{loanDisbursementPremiumData?.RATE}%</h3>
              <p>
                Insurance Rate
              </p>
            </div>
          </div>
          <div className="card-validity">
            <p>Invoice Validity</p>
            <p>
              <span>From: {moment(loanDisbursementData.startDate).format("DD-MM-YYYY")}</span>
              <span>To: {moment(loanDisbursementData.endDate).format("DD-MM-YYYY")}</span>
            </p>
          </div>
        </div>
        <h4>Payment Method</h4>
        <Form
          className="bulk-payment-form"
          onFinish={paymentMethodHandle}
          form={disbursementFormPay}
        >
          <Form.Item
            name="paymentOption"
            rules={[
              {
                required: true,
                message: 'Select payment option!',
              },
            ]}
          >
            <Radio.Group>
              <Radio value="Wallet" disabled={userData?.wallet > 0 ? false : true}>
                <div className="payment-radio">
                  <WalletOutlined />
                  Wallet ({Number(userData?.wallet)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })})
                </div>
              </Radio>
              {/* <Radio value="Payment Gateway">
                <div className="payment-radio">
                  <CreditCardOutlined />
                  Payment Gateway
                </div>
              </Radio> */}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="terms"
            valuePropName="checked"
          // rules={[
          //   { required: true, message: 'Please select T&Cs' },
          // ]}
          >
            <Checkbox onChange={deviceBuyPolicyTermOnChange}>
              I agree to the <a rel="noopener noreferrer" href="https://modulejs.apistudioz.com/TERMS-AND-CONDITIONS.pdf" target="_blank">policy agreement T&Cs</a>
            </Checkbox>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" disabled={deviceBuyPolicyTermCheck ? false : true}>
              Pay Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal centered title="Verify Status" className="policy-verify-modal" visible={policyVerifyModal} onCancel={handleCancel}>
        <h6 style={{ textAlign: "center" }}>{policyVerifyMsg} <span className="success-blink">{policyNumber}</span>.</h6>
      </Modal>

      <Modal centered width={340} title="Quotation Status" className="motor-quotation-modal" visible={showModal} onCancel={handleCancel}>
        {quotationMsg.error === false ?
          <>
            <img src={SucessIcon} alt="" className="modal-response-icon" />
            <p>{quotationMsg.value}</p>
            <Button className="dismiss-btn" onClick={handleCancel}>Dismiss</Button>
          </>
          :
          <>
            <img src={ErrorIcon} alt="" className="modal-response-icon" />
            <p>{quotationMsg.value}</p>
            <Button className="dismiss-btn" onClick={handleCancel}>Dismiss</Button>
          </>
        }
      </Modal>

      <Modal centered title="Bulk Upload" className="bulk-confirmation" visible={conformModalVisible} onCancel={handleCancel}>
        {loader ?
          <div className="loader"><Spin tip="Please wait..." /></div>
          :
          <>
            {confirmBulkUploadResponse ?
              <>
                {confirmBulkUploadResponseMsg.error === true ?
                  <>
                    <h6>
                      {confirmBulkUploadResponseMsg.value}
                    </h6>
                  </>
                  :
                  <>
                    <h6>
                      {confirmBulkUploadResponseMsg.value}
                    </h6>
                    {
                      confirmBulkUploadResponseData?.length ?
                        <>
                          <div className="bulk-duplicate-record">
                            {/* <h5>Device Serial Numbers</h5> */}
                            {
                              confirmBulkUploadResponseData?.map((item, index) => {
                                return (
                                  <>
                                    {index == (confirmBulkUploadResponseData.length - 1) && confirmBulkUploadResponseData.length > 1 ? <span> and {item?.masterPolicyNo}</span> : index == (confirmBulkUploadResponseData.length - 2) || confirmBulkUploadResponseData.length == 1 ? <span>{item?.masterPolicyNo}</span> : <span>{item?.masterPolicyNo}, </span>}
                                  </>
                                )
                              })
                            }
                          </div>
                        </>
                        :
                        <>
                        </>
                    }

                  </>
                }
              </>
              :
              <>
                <h6>Are you sure you want to continue ?</h6>
                <Button onClick={confirmBulkUpload}>Confirm</Button>
              </>
            }
          </>
        }
      </Modal>
    </>
  );
}

CreditLifeGeneratePolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  creditLifeGeneratePolicy: makeSelectCreditLifeGeneratePolicy()
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
)(CreditLifeGeneratePolicy);
