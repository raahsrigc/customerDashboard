/**
 *
 * MotorGenerateQuotation
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import CurrencyFormat from 'react-currency-format';
import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectMotorGenerateQuotation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import { Tooltip } from 'antd';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import notification from 'antd/es/notification';
import Spin from 'antd/es/spin';
import { InfoCircleOutlined } from '@ant-design/icons';
import { generateQuoteMotorApi, makeApi, modelApi, planApi, getMotorPlanPremiumApi, vehicleTypeApi } from '../../services/AuthService';
import aes256 from "../../services/aes256";

export function MotorGenerateQuotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "motorGenerateQuotation", reducer });
  useInjectSaga({ key: "motorGenerateQuotation", saga });
  const title = "Motor Generate Quotation";
  const [allLoading, setAllLoading] = useState(false);
  const [form] = Form.useForm();
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [showModal, setShowModal] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [quotationMsg, setQuotationMsg] = useState({ value: null, error: false });
  const [quotationNumber, setQuotationNumber] = useState("");
  const [premiumPeriodType, setPremiumPeriodType] = useState("");
  const [makeOption, setMakeOption] = useState([]);
  const [planOption, setPlanOption] = useState([]);
  const [planPremium, setPlanPremium] = useState([]);
  const [planTypeId, setPlanTypeId] = useState();
  const [vehicleTypeOption, setVehicleTypeOption] = useState([]);
  const [modelOption, setModelOption] = useState([]);
  const [vehicleValue, setVehicleValue] = useState({ value: null, error: false });

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const premiumPeriodTypeHandle = (value) => {
    setPremiumPeriodType(value)
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

  function companyHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9& ]+$");
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

  function alphaNumeric2HandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9/-]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
  }

  const makeHandle = () => {
    makeApi(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setMakeOption(res.data.DATA)
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

  const planHandle = () => {
    planApi(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setPlanOption(res.data)
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

  const vehicleTypeHandle = () => {
    vehicleTypeApi(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setVehicleTypeOption(res.data)
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

  const selectMake = (value) => {
    form.setFieldsValue({
      vehicleModel: "",
    });
    modelApi(tokenKey, value, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setModelOption(res.data)
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

  useEffect(() => {
    if (tokenKey !== "") {
      makeHandle();
      planHandle();
      vehicleTypeHandle();
    }
  }, [tokenKey])


  const generateQuotationHandle = (values) => {
    values.vehicleValue = values?.vehicleValue?.replaceAll(",", "")
    setAllLoading(true);
    generateQuoteMotorApi(tokenKey, values, toggleBtn)
      .then(res => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          form.resetFields();
          setShowModal(true);
          setQuotationMsg({ value: "Your Details have been successfully submitted. The Quotation Number generated is", error: false })
          setQuotationNumber(res?.data?.QUOTATION_NUMBER)
          setPlanTypeId()
          setTimeout(() => {
            window.open(res?.data?.QUOTATION_DOC)
          }, [2000])
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

  const planOnchangeHandle = (value) => {
    setPlanTypeId(value);
  }

  const showPlansModal = () => {
    setPlansModalOpen(true);
  }

  const handleCancel = () => {
    setShowModal(false);
    setPlansModalOpen(false);
    setQuotationMsg({ value: null, error: false });
  };


  const vehicleValueHandle = (e) => {
    const regex = /^[1-9]{1}[0-9,]{2,}$/;
    if (e.target.value.match(regex)) {
      setVehicleValue({ value: e.target.value, error: false })
      return true;
    }
    else {
      setVehicleValue({ value: "", error: true })
      return false;
    }
  }

  const vehicleValueFinish = (e) => {
    getMotorPlanPremiumHandle();
  }

  const getMotorPlanPremiumHandle = (e) => {
    setAllLoading(true);
    getMotorPlanPremiumApi(tokenKey, 1, 2, planTypeId, vehicleValue?.value == null ? 0 : vehicleValue?.value?.replaceAll(",", ""), toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setPlanPremium(res.data)
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

  useEffect(() => {
    getMotorPlanPremiumHandle();
  }, [planTypeId || vehicleValue.value !== null])

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="motor-quotation-section">
          <div className="motor-quotation-left">
            <h6>Generate Quotation :- </h6>
            <p>Please enter the following details to generate quotation.</p>
            <Form
              form={form}
              name="basic"
              onFinish={generateQuotationHandle}
              autoComplete="off"
            >
              <Form.Item
                label="Insured Name"
                name="insuredName"
                rules={[{ required: true, message: 'Enter your Insured Name!' }]}
              >
                <Input onKeyDown={companyHandleKeyDown} maxLength={80} />
              </Form.Item>
              <Form.Item
                label="Email Id"
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
                label="Mobile No"
                name="mobileNumber"
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
                  className={mobileNo.error === true ? "error" : ""}
                  maxLength={11}
                  onChange={testMobileNo}
                  onKeyDown={mobileHandleKeyDown}
                />
              </Form.Item>
              <div className="plan-input">
                {
                  vehicleValue.value !== null ?
                    <>
                      <InfoCircleOutlined onClick={showPlansModal} />
                    </>
                    :
                    <></>
                }
                <Form.Item
                  label="Plan"
                  name="planId"
                  rules={[{ required: true, message: 'Please Select Plan' }]}
                >
                  <Select
                    placeholder="Select Plan"
                    onChange={(value) => { planOnchangeHandle(value) }}
                  >
                    {planOption && planOption?.map((item, index) => {
                      return <Option value={item?.PLAN_ID} key={index}>{item?.SECTION_NAME}</Option>
                    })}
                  </Select>
                </Form.Item>
              </div>
              <Form.Item
                label="Vehicle Type"
                name="vehicleTypeCode"
                rules={[{ required: true, message: 'Select Vehicle Type' }]}
              >
                <Select
                  placeholder="Vehicle Type"
                >
                  {vehicleTypeOption?.map((item, index) => {
                    return <Option value={item.ID} key={index}>{item.TYPE_SUB_CATEGORIES}</Option>
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label="Registration No"
                name="vehicleRegistrationNumber"
                rules={[
                  {
                    required: true,
                    message: 'Enter your Registration No!',
                  },
                ]}
              >
                <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={10} />
              </Form.Item>
              <Form.Item
                label="Make"
                name="vehicleMake"
                rules={[{ required: true, message: 'Please Select Make' }]}
              >
                <Select
                  placeholder="Select Make"
                  onChange={selectMake}
                >
                  {makeOption?.map((item, index) => {
                    return <Option value={item.Code} key={index}>{item.Description}</Option>
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label="Model"
                name="vehicleModel"
                rules={[{ required: true, message: 'Please Select Model' }]}
              >
                <Select
                  placeholder="Select Model"
                >
                  {modelOption?.map((item, index) => {
                    return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label="Vehicle Value"
                name="vehicleValue"
                rules={[
                  {
                    required: true,
                    validator(_, value) {
                      let error;
                      if (vehicleValue.value !== null) {
                        if (vehicleValue.error === true) {
                          error = "Enter Greater Vehicle Value!"
                        }
                      } else {
                        error = "Enter your Vehicle Value!"
                      }
                      return error ? Promise.reject(error) : Promise.resolve();
                    },
                  },
                ]}
              >
                <CurrencyFormat thousandSeparator={true} onBlur={vehicleValueFinish} onChange={vehicleValueHandle} maxLength={12} className="amountInput" allowNegative={false} />
                {/* <Input onChange={vehicleValueHandle} onKeyDown={numbricKeyDownHandle} onKeyUp={formatCurrency} maxLength={12} /> */}
              </Form.Item>
              <div className="tooltip-input-item">
                <Tooltip title="Use your own alphanumeric ID for future reference." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                  <span><InfoCircleOutlined /></span>
                </Tooltip>
                <Form.Item
                  label="Tracking Refrence"
                  name="requestId"
                  rules={[
                    {
                      required: true,
                      message: 'Enter your Tracking Refrence!',
                    },
                  ]}
                >
                  <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={30} />
                </Form.Item>
              </div>
              <div className="tooltip-input-item">
                <Tooltip title="Need to know how Loan Premium are paid." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                  <span><InfoCircleOutlined /></span>
                </Tooltip>
                <Form.Item
                  label="Premium Type"
                  name="premiumPeriodType"
                  rules={[{ required: true, message: 'Select your Premium Type!' }]}
                >
                  <Select onChange={premiumPeriodTypeHandle}>
                    <Option value="1">Annual</Option>
                    {/* <Option value="2">Half Yearly</Option>
                  <Option value="3">Quarterly</Option>
                  <Option value="4">Monthly</Option>
                  <Option value="5">Day</Option> */}
                  </Select>
                </Form.Item>
              </div>
              {premiumPeriodType == "5" ?
                <Form.Item
                  label="Number Of Days"
                  name="numberOfDays"
                  rules={[{ required: true, message: 'Enter your Number Of Days!' }]}
                >
                  <Input onKeyDown={numbricKeyDownHandle} maxLength={3} />
                </Form.Item>
                :
                <></>
              }
              <Form.Item>
                <Button htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>
          </div>
          <div className="motor-quotation-right">
            {/* <img src={deviceImage} alt="" /> */}
          </div>
        </div>
      </div>


      <Modal centered width={340} title="Quotation Status" className="motor-quotation-modal" visible={showModal} onCancel={handleCancel}>
        {quotationMsg.error === false ?
          <>
            <img src={SucessIcon} alt="" className="modal-response-icon" />
            <p>{quotationMsg.value} <span className="success-blink">{quotationNumber}</span></p>
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
      <Modal centered width={600} title="Plan" className="motor-plans-modal" visible={plansModalOpen} onCancel={handleCancel}>
        {
          planTypeId == 146 ?
            <>
              <div className="plan-grid">
                <h3>Comprehensive</h3>
                <h5>Premium Rate : {planPremium?.BENEFITS && planPremium?.BENEFITS[0]?.PREMIUM_RATE}%</h5>
                <ul>
                  {
                    planPremium?.BENEFITS?.map((item, index) => {
                      return (
                        <li>{item?.COVER_NAME}</li>
                      )
                    })
                  }
                </ul>
              </div>
            </>
            :
            <>
              <div className="plan-grid">
                <h3>Third Party</h3>
                <ul>
                  {
                    planPremium?.BENEFITS?.map((item, index) => {
                      return (
                        <li>{item?.COVER_NAME}</li>
                      )
                    })
                  }
                </ul>
              </div>
            </>
        }
      </Modal>
    </>
  );
}

MotorGenerateQuotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  motorGenerateQuotation: makeSelectMotorGenerateQuotation()
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
)(MotorGenerateQuotation);
