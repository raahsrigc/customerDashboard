/**
 *
 * PersonalAccidentGenerateQuotation
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
import makeSelectPersonalAccidentGenerateQuotation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import { Tooltip } from 'antd';
import Select from 'antd/es/select';
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import notification from 'antd/es/notification';
import Spin from 'antd/es/spin';
import { InfoCircleOutlined } from '@ant-design/icons';
import { generateQuotePersonalAccidentApi } from '../../services/AuthService';
import axios from 'axios';
import aes256 from "../../services/aes256";

export function PersonalAccidentGenerateQuotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "personalAccidentGenerateQuotation", reducer });
  useInjectSaga({ key: "personalAccidentGenerateQuotation", saga });

  const title = "Personal Accident Generate Quotation";
  const [allLoading, setAllLoading] = useState(false);
  const [form] = Form.useForm();
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [showModal, setShowModal] = useState(false);
  const [quotationMsg, setQuotationMsg] = useState({ value: null, error: false });
  const [quotationNumber, setQuotationNumber] = useState("");
  const [loader, setLoader] = useState(false);
  
  const [bulkFileUpdate, setBulkFileUpdate] = useState({})
  const [conformModalVisible, setConformModalVisible] = useState(false);
  const [confirmBulkUploadResponse, setConfirmBulkUploadResponse] = useState(false);
  const [confirmBulkUploadResponseData, setConfirmBulkUploadResponseData] = useState();
  const [confirmBulkUploadResponseMsg, setConfirmBulkUploadResponseMsg] = useState({ value: null, error: false });

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  function alphaHandleKeyDown(e) {
    const regex = new RegExp(/^[a-zA-Z-' ]+(?: [a-zA-Z-']+)*$/);
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
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

  const generateQuotationHandle = (values) => {
    values.SIAmount = values?.SIAmount?.replaceAll(",", "")
    setAllLoading(true)
    generateQuotePersonalAccidentApi(tokenKey, values, toggleBtn)
      .then(res => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.status == true) {
          form.resetFields();
          setShowModal(true);
          setQuotationMsg({ value: "Your Details have been successfully submitted. The Quotation Number generated is", error: false })
          setQuotationNumber(res?.data?.QUOTATION_NUMBER)
          setTimeout(() => {
            window.open(res?.data?.QUOTATION_DOCUMENT)
          }, [2000])
        } else {
          setShowModal(true);
          setQuotationMsg({ value: res.message, error: true })
          setQuotationNumber("")
        }
      })
      .catch((err) => {
        console.log(err);
        setAllLoading(false)
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "Technical Error Occurred",
        });
      });
  }

  const fileChangedHandler = e => {
    if (!e.target.files || e.target.files.length === 0) {
      setBulkFileUpdate(undefined)
      return
    }
    setBulkFileUpdate(e.target.files[0]);
    setConformModalVisible(true);
    e.target.value = null;
  }

  const confirmBulkUpload = () => {
    const formData = new FormData();
    formData.append("file", bulkFileUpdate);
    const data = Object.fromEntries(formData)
    setLoader(true)
    const BASE_URL_UAT = "https://valaria.globalcognito.com";
    const BASE_URL_LIVE = "https://valaria.globalcognito.com";
    const url = `${toggleBtn ? BASE_URL_LIVE : BASE_URL_UAT}/b2b/v1/bulk/api/personalaccident`;
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

  const handleCancel = () => {
    setShowModal(false);
    setConformModalVisible(false);
    setConfirmBulkUploadResponse(false);
    setQuotationMsg({ value: null, error: false });
  };


  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="personal-accident-quotation-section">
          <div className="personal-accident-quotation-left">
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
                rules={[
                  {
                    required: true,
                    message: 'Enter your Insured Name!',
                  },
                ]}
              >
                <Input onKeyDown={alphaHandleKeyDown} maxLength={50} />
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
              <div className="tooltip-input-item">
                <Tooltip title="Need to know how Loan Premium are paid." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                  <span><InfoCircleOutlined /></span>
                </Tooltip>
                <Form.Item
                  label="Premium Type"
                  name="premiumPeriodType"
                  rules={[{ required: true, message: 'Select your Premium Type!' }]}
                >
                  <Select>
                    <Option value="0">Annual</Option>
                    {/* <Option value="4">Monthly</Option> */}
                  </Select>
                </Form.Item>
              </div>
              <Form.Item
                label="Sum Insured"
                name="SIAmount"
                rules={[
                  {
                    required: true,
                    message: 'Enter Sum Insured!',
                  },
                ]}
              >
                {/* <Input maxLength={12} disabled defaultValue="1,100,000" /> */}
                <CurrencyFormat thousandSeparator={true} maxLength={12} className="amountInput" allowNegative={false} />
              </Form.Item>

              <Form.Item>
                <Button htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>

            <div className="bulk-upload">
              <h6>Bulk Generate Quotation :-</h6>
              <p>Please upload your Bulk file to create policy.</p>
              <label>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={fileChangedHandler}
                />
                <span>+ Upload</span>
              </label>
              <a href="javascript:void(0)" download>Sample File Download</a>
            </div>

          </div>
          <div className="personal-accident-quotation-right">
            {/* <img src={deviceImage} alt="" /> */}
          </div>
        </div>
      </div>

      <Modal centered width={340} title="Quotation Status" className="personal-accident-quotation-modal" visible={showModal} onCancel={handleCancel}>
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

      <Modal centered title="Bulk Quotation" className="bulk-confirmation" visible={conformModalVisible} onCancel={handleCancel}>
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
                                    {index == (confirmBulkUploadResponseData.length - 1) && confirmBulkUploadResponseData.length > 1 ? <span> and {item?.DEVICE_SERIAL_NUMBER}</span> : index == (confirmBulkUploadResponseData.length - 2) || confirmBulkUploadResponseData.length == 1 ? <span>{item?.DEVICE_SERIAL_NUMBER}</span> : <span>{item?.DEVICE_SERIAL_NUMBER}, </span>}
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

PersonalAccidentGenerateQuotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  personalAccidentGenerateQuotation: makeSelectPersonalAccidentGenerateQuotation()
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
)(PersonalAccidentGenerateQuotation);
