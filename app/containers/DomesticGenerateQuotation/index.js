/**
 *
 * DomesticGenerateQuotation
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDomesticGenerateQuotation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import Button from 'antd/es/button';
import Modal from 'antd/es/modal';
import moment from "moment";
import notification from 'antd/es/notification';
import Spin from 'antd/es/spin';
import { InfoCircleOutlined } from '@ant-design/icons';
import { domesticGenerateQuotationApi, domesticPackagesApi, domesticDestinationApi } from '../../services/AuthService';
import aes256 from "../../services/aes256";

export function DomesticGenerateQuotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "domesticGenerateQuotation", reducer });
  useInjectSaga({ key: "domesticGenerateQuotation", saga });

  const title = "Domestic Generate Quotation";
  const [allLoading, setAllLoading] = useState(false);
  const search = location.search;
  const [form] = Form.useForm();
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [showModal, setShowModal] = useState(false);
  const [quotationMsg, setQuotationMsg] = useState({ value: null, error: false });
  const [packageOption, setPackageOption] = useState([]);
  const [packageTypeId, setPackageTypeId] = useState();
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [destinationOption, setDestinationOption] = useState([]);
  const [departureStartDate, setDepartureStartDate] = useState("");
  const [returnEndDate, setReturnEndDate] = useState("");

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  function disabledDate(current) {
    const yesterday = moment("YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current < moment().subtract(0, 'years');
  }

  function disabledDate2(current) {
    const yesterday = moment(departureStartDate, "YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD"));
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
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
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

  const domesticPackagesHandle = () => {
    domesticPackagesApi(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.success === true) {
          setPackageOption(res.data)
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

  const domesticDestinationHandle = (id) => {
    domesticDestinationApi(tokenKey, id, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setDestinationOption(res.data)
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
    if (tokenKey !== "") {
      domesticPackagesHandle();
      domesticDestinationHandle();
    }
  }, [tokenKey])


  const generateQuotationHandle = (values) => {
    setAllLoading(true);
    values = { ...values, departureDate: departureStartDate, returnDate: returnEndDate, productId: "116", promoCode: "", noOfPassanger: Number(values?.noOfMinors) + Number(values?.noOfAdults) }
    delete values.departureStartDate
    delete values.returnEndDate

    domesticGenerateQuotationApi(tokenKey, values, toggleBtn)
      .then(res => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.success == true) {
          form.resetFields();
          setShowModal(true);
          setQuotationMsg(res.message)
          setQuotationMsg({ value: res.message, error: false })
          setPackageTypeId()
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

  const packageOnchangeHandle = (value) => {
    setPackageTypeId(value);
  }

  const showPlansModal = () => {
    setPackageModalOpen(true);
  }

  const handleCancel = () => {
    setShowModal(false);
    setPackageModalOpen(false);
    setQuotationMsg({ value: null, error: false });
  };


  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="domestic-generate-quotation-section">
          <div className="domestic-generate-quotation-left">
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
                <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
              </Form.Item>

              <Form.Item
                label="Email Id"
                name="emailId"
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
                          error = "Enter valid  Mobile Number!"
                        }
                      } else {
                        error = "Enter your Mobile Number!"
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
                label="No Of Minors"
                name="numberOfMinors"
                rules={[
                  {
                    required: true,
                    message: 'Enter your No Of Minors!',
                  },
                ]}
              >
                <Input onKeyDown={numbricKeyDownHandle} maxLength={2} />
              </Form.Item>
              <Form.Item
                label="No Of Adults"
                name="numberOfAdults"
                rules={[
                  {
                    required: true,
                    message: 'Enter your No Of Adults!',
                  },
                ]}
              >
                <Input onKeyDown={numbricKeyDownHandle} maxLength={2} />
              </Form.Item>
              {/* <Form.Item
                label="No Of Travel Days"
                name="numberOfTravelDays"
                rules={[
                  {
                    required: true,
                    message: 'Enter your No Of Travel Days!',
                  },
                ]}
              >
                <Input onKeyDown={numbricKeyDownHandle} maxLength={3} />
              </Form.Item> */}

              <Form.Item
                label="Departure Date"
                name="departureStartDate"
                rules={[{ required: true, message: 'Select Departure Date!' }]}
              >
                <DatePicker
                  onChange={(a, b) => {
                    setDepartureStartDate(b.split("/").join("-"));
                    form.setFieldsValue({
                      returnDate: "",
                    });
                  }}
                  disabledDate={disabledDate}
                />
              </Form.Item>
              <Form.Item
                label="Return Date"
                name="returnEndDate"
              >
                <DatePicker
                  disabled={!departureStartDate ? true : false}
                  onChange={(a, b) => {
                    setReturnEndDate(b.split("/").join("-"));
                  }}
                  disabledDate={disabledDate2}
                />
              </Form.Item>
              <div className="plan-input">
                {
                  packageTypeId == 545 || packageTypeId == 546 ?
                    <>
                      <InfoCircleOutlined onClick={showPlansModal} />
                    </>
                    :
                    <></>
                }
                <Form.Item
                  label="Package"
                  name="packageId"
                  rules={[{ required: true, message: 'Select Package' }]}
                >
                  <Select
                    placeholder="Package"
                    onChange={(value) => { packageOnchangeHandle(value) }}
                  >
                    {packageOption?.map((item, index) => {
                      return <Option value={item.planId} key={index}>{item.planName}</Option>
                    })}
                  </Select>
                </Form.Item>
              </div>
              {/* <Form.Item
                label="Package"
                name="packageId"
                rules={[{ required: true, message: 'Select Package' }]}
              >
                <Select
                  placeholder="Package"
                >
                  {packageOption?.map((item, index) => {
                    return <Option value={item.planId} key={index}>{item.planName}</Option>
                  })}
                </Select>
              </Form.Item> */}
              <Form.Item
                label="Source"
                name="sourceId"
                rules={[{ required: true, message: 'Select Source' }]}
              >
                <Select
                  placeholder="Source"
                >
                  {destinationOption?.map((item, index) => {
                    return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                  })}
                </Select>
              </Form.Item>
              <Form.Item
                label="Destination"
                name="destination"
                rules={[{ required: true, message: 'Select Destination' }]}
              >
                <Select
                  placeholder="Destination"
                >
                  {destinationOption?.map((item, index) => {
                    return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                  })}
                </Select>
              </Form.Item>

              {/* <Form.Item
                label="Promo Code"
                name="promoCode"
                rules={[
                  {
                    required: true,
                    message: 'Enter your Promo Code!',
                  },
                ]}
              >
                <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={10} />
              </Form.Item> */}
              <Form.Item
                label="Request Id"
                name="requestId"
                rules={[
                  {
                    required: true,
                    message: 'Enter your Request Id!',
                  },
                ]}
              >
                <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={15} />
              </Form.Item>

              <Form.Item>
                <Button htmlType="submit">Submit</Button>
              </Form.Item>
            </Form>

          </div>
          <div className="domestic-generate-quotation-right">
            {/* <img src={deviceImage} alt="" /> */}
          </div>
        </div>
      </div>


      <Modal centered width={340} title="Quotation Status" className="domestic-generate-quotation-modal" visible={showModal} onCancel={handleCancel}>
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

      <Modal centered width={600} title="Package" className="plans-modal" visible={packageModalOpen} onCancel={handleCancel}>
        {
          packageTypeId == 545 ?
            <>
              <div className="plan-grid">
                <h3>Economy</h3>
                <ul>
                  {
                    packageOption[0]?.Covers.map((item, index) => {
                      return (
                        <li>{item.cover_name}</li>
                      )
                    })
                  }
                </ul>
              </div>
            </>
            :
            <>
              <div className="plan-grid">
                <h3>Executive</h3>
                <ul>
                  {
                    packageOption[0]?.Covers.map((item, index) => {
                      return (
                        <li>{item.cover_name}</li>
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

DomesticGenerateQuotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  domesticGenerateQuotation: makeSelectDomesticGenerateQuotation()
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
)(DomesticGenerateQuotation);
