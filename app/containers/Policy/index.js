/**
 *
 * Policy
 *
 */

import React, { memo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectPolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import noData from "../../images/no-data.svg";
import BackArrow from '../../images/back-arrow.svg';
import pdfPreview from '../../images/pdf-preview.jpg';
import certificate from '../../images/certificate.jpg';
import signs from '../../images/signs.jpg';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Tabs from 'antd/es/tabs';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Pagination from 'antd/es/pagination';
import Modal from 'antd/es/modal';
import Spin from 'antd/es/spin';
import moment from "moment";
import DatePicker from 'antd/es/date-picker';
import { SearchOutlined, SortDescendingOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { summaryDataApi, getUnderwritingPolicyApi, getUnderwritingPendingPolicyApi, getUnderwritingApprovedPolicyApi, getUnderwritingRenewalPolicyApi, getPolicyByIdApi, getPolicyHistoryApi, getCommentsApi, insertCommentApi, getPaymentHistoryApi, makeApi, modelApi, getKYCDataApi, updateKYCDetailsApi, updateNIIDKYCDetailsApi, countryData, stateData, cityData, getMotorQuotationInsuredDetailsApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function Policy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "policy", reducer });
  useInjectSaga({ key: "policy", saga });

  const title = "Motor Policy";
  const { TabPane } = Tabs;
  const { TextArea } = Input;
  const [commentForm] = Form.useForm();
  const { Option } = Select;
  const [kycForm] = Form.useForm();

  const [steps, setSteps] = useState("1");
  const [allLoading, setAllLoading] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isKYCFormModalOpen, setIsKYCFormModalOpen] = useState(false);
  const [isRenewalFormModalOpen, setIsRenewalFormModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState("All Policy");
  const [cardStatsData, setCardStatsData] = useState({});
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [directAllPolicyColumns, setDirectAllPolicyColumns] = useState([]);
  const [directAllPolicyData, setDirectAllPolicyData] = useState([]);
  const [policyByIdData, setPolicyByIdData] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [policyHistoryData, setPolicyHistoryData] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [commentSubmitBtn, setCommentSubmitBtn] = useState(false);
  const [genderDisabled, setGenderDisabled] = useState(false);
  const [isKYCForm2ModalOpen, setIsKYCForm2ModalOpen] = useState(false);
  const [modelOption, setModelOption] = useState([]);

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [idType, setIdType] = useState("");
  const [pvcNumber, setpvcNumber] = useState({ value: null, error: false });
  const [drivingNumber, setDrivingNumber] = useState({ value: null, error: false });
  const [passportNumber, setPassportNumber] = useState({ value: null, error: false });
  const [bvnNumber, setBvnNumber] = useState({ value: null, error: false });
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [cityOption, setCityOption] = useState([]);
  const [kycStatusResponse, setKYCStatusResponse] = useState({ value: null, response: false, error: false });
  const [isStatus, setIsStatus] = useState("");
  const [isDataStatus, setIsDataStatus] = useState(false);
  const [makeOption, setMakeOption] = useState([]);
  const [registrationStartDate, setregistrationStartDate] = useState("");
  const [registrationEndDate, setregistrationEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [paymentHistoryData, setPaymentHistoryData] = useState();

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);


  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
  }

  function disabledDate2(current) {
    const yesterday = moment(registrationStartDate, "YYYY-MM-DD")
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

  function alphaHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z ]+$");
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

  function chassisHandleKeyDown(e) {
    if ((e.keyCode !== 73) && (e.keyCode !== 79)) {
      const regex = new RegExp("^[a-zA-Z0-9]+$");
      const key = e.key;
      if (!regex.test(key)) {
        e.preventDefault();
        return false;
      }
    } else {
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

  function dateBirthdisabled(current) {
    const yesterday = moment("YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current > moment().subtract(0, 'years');
  }


  const selectCountry = (value, reKycData) => {
    stateData(tokenKey, value, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setStateOption(res.data)
          kycForm.setFieldsValue({
            state: reKycData ? reKycData.STATE : "",
            city: ""
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

  const selectState = (value, reKycData) => {
    cityData(tokenKey, value, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setCityOption(res.data)
          kycForm.setFieldsValue({
            city: reKycData ? reKycData.CITY : "",
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

  const selectMake = (value) => {
    kycForm.setFieldsValue({
      model: "",
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

  /* antd table filter */
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput1 = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => {
              confirm();
              setSearchColumn(dataIndex);
              setSearchText(selectedKeys[0]);
              setTableColumnValuesArray(dataIndex, selectedKeys)
              handleColumnSearchApi(dataIndex, selectedKeys)
            }}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0])
              setSearchColumn(dataIndex)
              resetTableColumnValuesArray(dataIndex, selectedKeys)
              handleColumnSearchApi(dataIndex, selectedKeys)
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput1.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "transparent", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });


  const cardStats = () => {
    summaryDataApi(tokenKey, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setCardStatsData(res.data)
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

  const setTableColumnValuesArray = (dataIndex, selectedKeys) => {
    for (var i = 0; i < colNameArr?.length; i++) {
      if (colNameArr[i] === dataIndex) {
        colNameArr.splice(i, 1);
        colValueArr.splice(i, 1);
      }
    }
    dataIndex = dataIndex?.toString();
    setColNameArr([...colNameArr, dataIndex])
    selectedKeys = selectedKeys?.toString();
    setColValueArr([...colValueArr, selectedKeys])
  }

  const resetTableColumnValuesArray = (dataIndex, selectedKeys) => {
    dataIndex = dataIndex?.toString();
    for (var i = 0; i < colNameArr.length; i++) {
      if (colNameArr[i] === dataIndex) {
        colNameArr.splice(i, 1);
        colValueArr.splice(i, 1);
      }
    }
    setColNameArr(colNameArr)
    setColValueArr(colValueArr)
  }

  const handleColumnSearchApi = () => {
    setSearchTableHandle(true)
  }

  useEffect(() => {
    if (searchTableHandle) {
      if (policyType == "All Policy") {
        getUnderwritingPolicyHandle(1, perPage);
      } else if (policyType == "All Pending") {
        getUnderwritingPolicyPendingHandle(1, perPage);
      } else if (policyType == "All Renewal") {
        getUnderwritingRenewalPolicyHandle(1, perPage);
      } else {
        getUnderwritingPolicyApprovedHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (policyType == "All Policy") {
      getUnderwritingPolicyHandle(pageNumber, pageCount);
    } else if (policyType == "All Pending") {
      getUnderwritingPolicyPendingHandle(pageNumber, pageCount);
    } else if (policyType == "All Renewal") {
      getUnderwritingRenewalPolicyHandle(pageNumber, pageCount);
    } else {
      getUnderwritingPolicyApprovedHandle(pageNumber, pageCount);
    }
  }

  /* Quotation Table */
  const getUnderwritingPolicyHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();

    setAllLoading(true)
    getUnderwritingPolicyApi(tokenKey, pageNumber, pageCount, "10", colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, "2", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Insured_Name!"] = data["INSURED_NAME"];
            data["Policy_#!"] = data["Policy_#"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Created_On!"] = data["Created_On"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["INSURED_NAME"]
            delete data["Quote_#"]
            delete data["Policy_#"]
            delete data["PREMIA_POLICY_#"]
            delete data["Mobile_#"]
            delete data["Sum_Insured"]
            delete data["Premium"]
            delete data["P_T"]
            delete data["CURRENCY"]
            delete data["REMARK"]
            delete data["Valid_From"]
            delete data["Valid_Till"]
            delete data["BRANCH"]
            delete data["Created_On"]
            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getPolicyByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps(key)
                };
                dataColumn.push(object);
              }
            }

            let object3 = [
              {
                title: "Status",
                dataIndex: 'status',
                key: 'Status',
                ...getColumnSearchProps("Status"),
                render: (x, records) => {
                  return (
                    <>
                      {records?.STATUS == 7 ? <span className="closed">Closed</span> : records?.STATUS == 1 ? <span className="approved">Approved</span> : records?.STATUS == 45 ? <span className="pending">Bank Details Pending</span> : records?.STATUS == 6 ? <span className="settled">Settled</span> : records?.STATUS == "0" || records?.STATUS == "5" || records?.STATUS == "38" || records?.STATUS == 54 ? <span className="pending">Pending</span> : records?.STATUS == 46 ? <span className="updateSettlement">Update Settlement</span> : records?.STATUS == 43 || records?.STATUS == 57 ? <span className="failed">Failed</span> : records?.STATUS == 4 || records?.STATUS == 48 ? <span className="reopened">Reopened</span> : records?.STATUS == 55 ? <span className="pending">Settlement in Progress</span> : records?.STATUS == 2 ? <span className="failed">Rejected</span> : records?.STATUS == 39 ? <span className="approved">Approve Cancellation</span> : records?.STATUS == 40 ? <span className="failed">Reject Cancellation</span> : records?.STATUS == 41 ? <span className="pending">Hold Cancellation</span> : records?.STATUS == 42 ? <span className="failed">Cancelled</span> : records?.STATUS == 45 ? <span className="pending">Discharge Voucher Sent</span> : records?.STATUS == 46 ? <span className="approved">Ack Settlement</span> : records?.STATUS == 47 ? <span className="failed">Discharge Voucher Rejected</span> : records?.STATUS == 55 ? <span className="pending">Settlement in Progress</span> : records?.STATUS == 58 ? <span className="pending">Pending for RI Approval</span> : records?.STATUS == 59 ? <span className="pending">Pending From Internal Control</span> : records?.STATUS == 60 ? <span className="failed">Rejected From Internal Control</span> : records?.STATUS == 67 ? <span className="pending">Pending With Finance</span> : <></>}
                    </>
                  )
                },
              },
            ]
            dataColumn.push(...object3);
            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })

            setDirectAllPolicyData(tableData);
          }
        } else {
          setDirectAllPolicyData([])
          setTablePagination("")
          setIsDataStatus(dataStatus)
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

  const getUnderwritingPolicyPendingHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();
    setAllLoading(true)
    getUnderwritingPendingPolicyApi(tokenKey, pageNumber, pageCount, "10", colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, "2", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Insured_Name!"] = data["INSURED_NAME"];
            data["Policy_#!"] = data["Policy_#"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Created_On!"] = data["Created_On"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["INSURED_NAME"]
            delete data["Quote_#"]
            delete data["Policy_#"]
            delete data["PREMIA_POLICY_#"]
            delete data["Mobile_#"]
            delete data["Sum_Insured"]
            delete data["Premium"]
            delete data["P_T"]
            delete data["CURRENCY"]
            delete data["REMARK"]
            delete data["Valid_From"]
            delete data["Valid_Till"]
            delete data["BRANCH"]
            delete data["Created_On"]
            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getPolicyByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps(key)
                };
                dataColumn.push(object);
              }
            }

            let object3 = [
              {
                title: "Status",
                dataIndex: 'status',
                key: 'status',
                render: (x, records) => {
                  return (
                    <>
                      <ul className="claimStatusCol" style={{ listStyle: "none" }}>
                        {records?.STATUS == "1" ?
                          <li className="approved">Approved</li>
                          : records?.STATUS == "0" || records?.STATUS == "5" || records?.STATUS == "38" || records?.STATUS == 54 || records?.STATUS == 68 ?
                            <li className="pending">Pending</li>
                            : records?.STATUS == "2" ?
                              <li className="failed">Rejected</li>
                              :
                              <></>
                        }
                      </ul>
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object3);
            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })

            setDirectAllPolicyData(tableData);
          }
        } else {
          setDirectAllPolicyData([])
          setTablePagination("")
          setIsDataStatus(dataStatus)
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

  const getUnderwritingPolicyApprovedHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();
    setAllLoading(true)
    getUnderwritingApprovedPolicyApi(tokenKey, pageNumber, pageCount, "10", colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, "2", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Insured_Name!"] = data["INSURED_NAME"];
            data["Policy_#!"] = data["Policy_#"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Created_On!"] = data["Created_On"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["INSURED_NAME"]
            delete data["Quote_#"]
            delete data["Policy_#"]
            delete data["PREMIA_POLICY_#"]
            delete data["Mobile_#"]
            delete data["Sum_Insured"]
            delete data["Premium"]
            delete data["P_T"]
            delete data["CURRENCY"]
            delete data["REMARK"]
            delete data["Valid_From"]
            delete data["Valid_Till"]
            delete data["BRANCH"]
            delete data["Created_On"]
            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getPolicyByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps(key)
                };
                dataColumn.push(object);
              }
            }

            let object3 = [
              {
                title: "Status",
                dataIndex: 'status',
                key: 'status',
                render: (x, records) => {
                  return (
                    <>
                      <ul className="claimStatusCol" style={{ listStyle: "none" }}>
                        {records?.STATUS == "1" ?
                          <li className="approved">Approved</li>
                          : records?.STATUS == "0" || records?.STATUS == "5" || records?.STATUS == "38" ?
                            <li className="pending">Pending</li>
                            : records?.STATUS == "2" ?
                              <li className="failed">Rejected</li>
                              :
                              <></>
                        }
                      </ul>
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object3);
            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })

            setDirectAllPolicyData(tableData);
          }
        } else {
          setDirectAllPolicyData([])
          setTablePagination("")
          setIsDataStatus(dataStatus)
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

  const getUnderwritingRenewalPolicyHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();
    setAllLoading(true)
    getUnderwritingRenewalPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {

            data["Insured_Name"] = data["INSURED_NAME"];
            data["Policy_#!"] = data["Policy_#"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];
            data["Valid_From!"] = data["Valid_From"];
            data["Valid_Till!"] = data["Valid_Till"];

            delete data["INSURED_NAME"]
            delete data["Policy_#"]
            delete data["Mobile_#"]
            delete data["Sum_Insured"]
            delete data["Premium"]
            delete data["Valid_From"]
            delete data["Valid_Till"]

            delete data["Policy_#"]
            delete data["Quotation_Id"]
            delete data["Created_On"]
            delete data["Quote_#"]
            delete data["REMARK"]
            delete data["CURRENCY"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getPolicyByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps(key)
                };
                dataColumn.push(object);
              }
            }

            let object3 = [
              {
                title: "Status",
                dataIndex: 'status',
                key: 'status',
                render: (x, records) => {
                  return (
                    <>
                      <ul className="claimStatusCol" style={{ listStyle: "none" }}>
                        <li className="failed">{records?.STATUS}</li>
                      </ul>
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object3);

            let object4 = [
              {
                title: "Action",
                dataIndex: 'action',
                key: 'action',
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <>
                      {
                        <span className="pending-status" onClick={() => showRenewalModal(records)}>Renew</span>
                      }
                    </>
                  )
                },
              }
            ]
            dataColumn.push(...object4);

            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Valid_Till!"] = moment(responseData["Valid_Till!"]).format("DD-MM-YYYY");
              return { key: index++, ...responseData }
            })

            setDirectAllPolicyData(tableData);
          }
        } else {
          setDirectAllPolicyData([])
          setTablePagination("")
          setIsDataStatus(dataStatus)
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

  const showRenewalModal = () => {
    setIsRenewalFormModalOpen(true);
  }

  const getPolicyByIdHandle = (data) => {
    setAllLoading(true);
    getPolicyByIdApi(tokenKey, data?.ID, "2", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setPolicyByIdData(res.data)
          setSteps("2")
          getPolicyHistoryHandle(res.data)
          getCommentsHandle(res.data)
          setCommentSubmitBtn(false);
          getPaymentHistoryHandle(res.data)
        } else {
          setPolicyByIdData([])
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

  const getPaymentHistoryHandle = (data) => {
    getPaymentHistoryApi(tokenKey, data?.ID, "", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          setPaymentHistoryData(res.data)
        } else {
          setPaymentHistoryData([]);
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

  const policyCardHandle = (status) => {
    setColNameArr([])
    setColValueArr([])
    setPolicyType(status)
  }

  useEffect(() => {
    setColNameArr([])
    setColValueArr([])
    for (var i = 0; i < colNameArr.length; i++) {
      colNameArr.splice([]);
    }
    for (var i = 0; i < colValueArr.length; i++) {
      colValueArr.splice([]);
    }
    cardStats();
  }, [tokenKey && toggleBtn])

  useEffect(() => {
    if (policyType == "All Policy") {
      getUnderwritingPolicyHandle("", "", "", "", "", true);
    } else if (policyType == "All Pending") {
      getUnderwritingPolicyPendingHandle("", "", "", "", "", true);
    } else if (policyType == "All Renewal") {
      getUnderwritingRenewalPolicyHandle("", "", "", "", "", true);
    } else {
      getUnderwritingPolicyApprovedHandle("", "", "", "", "", true);
    }
  }, [tokenKey, policyType])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  const backToPolicyList = () => {
    setSteps("1");
  }

  const kycHandle = (data) => {
    setIsKYCModalOpen(true);
    setIsStatus(data)
  }

  const kycFormHandle = async (data) => {
    setKYCStatusResponse({ value: null, response: false, error: false })
    setIsKYCFormModalOpen(true);
    setAllLoading(true);

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

    getMotorQuotationInsuredDetailsApi(tokenKey, data, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          await modelApi(tokenKey, res.data.make, toggleBtn)
            .then((res) => {
              res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
              if (res.status === true) {
                setModelOption(res.data)
                kycForm.setFieldsValue({
                  model: res.data.model
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

          kycForm.setFieldsValue({
            title: res.data.TITLE,
            gender: res.data.GENDER,
            firstName: res.data.firstName,
            middleName: res.data.MIDDLE_NAME,
            lastName: res.data.lastName,
            emailId: res.data.EMAIL_ID,
            mobileNumber: res.data.mobileNumber,
            dob: moment(res?.data?.dob).format("DD-MM-YYYY"),
            idType: res.data.idTpye,
            idNumber: res.data.idNumber,
            address: res.data.address,
            country: res.data.country_name,
            state: res.data.state_name,
            city: res.data.city_name,
            fromDate: moment(res.data && res.data.FROM_DATE),
            toDate: moment(res.data.FROM_DATE).add(1, 'years').subtract(1, 'days'),
            registrationNumber: res.data.vehicleId,
            make: res.data.make,
            model: res.data.model,
            registrationFromDate: moment(res.data && res.data.regisrtrationDate),
            registrationToDate: moment(res.data && res.data.regisrtrationEndDate),
            vehicleId: res.data.vehicleId,
            autoType: res.data.autoType,
            yearOfMake: res.data.YearofMake,
            chassisNo: res.data.chassisNo,
            vehicleCategory: res.data.vehicleCategory,
          });
        } else {

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

    // await getKYCDataApi(tokenKey, policyByIdData?.INSURED_EMAIL_ID, policyByIdData?.INSURED_OFFICE_MOBILE, toggleBtn)
    //   .then(async (res) => {
    //     res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
    //     setAllLoading(false);
    //     if (res.status === true) {
    //       setIdType(res.data?.ID_TYPE)
    //       const country = res.data?.COUNTRY_CODE
    //       const state = res.data?.STATE_CODE
    //       await countryData(tokenKey, toggleBtn)
    //         .then(async (res) => {
    //           res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
    //           setAllLoading(false);
    //           if (res.status === true) {
    //             setCountryOption(res.data.DATA)
    //             await stateData(tokenKey, country, toggleBtn)
    //               .then(async (res) => {
    //                 res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
    //                 setAllLoading(false);
    //                 if (res.status === true) {
    //                   setStateOption(res.data)
    //                   await cityData(tokenKey, state, toggleBtn)
    //                     .then((res) => {
    //                       res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
    //                       setAllLoading(false);
    //                       if (res.status === true) {
    //                         setCityOption(res.data)
    //                       }
    //                     })
    //                     .catch((err) => {
    //                       console.log(err);
    //                       setAllLoading(false);
    //                       notification.info({
    //                         duration: 3,
    //                         message: 'Notification',
    //                         description: "Technical Error Occurred",
    //                       });
    //                     });
    //                 }
    //               })
    //               .catch((err) => {
    //                 console.log(err);
    //                 notification.info({
    //                   duration: 3,
    //                   message: 'Notification',
    //                   description: "Technical Error Occurred",
    //                 });
    //               });
    //           }
    //         })
    //         .catch((err) => {
    //           console.log(err);
    //           setAllLoading(false);
    //           notification.info({
    //             duration: 3,
    //             message: 'Notification',
    //             description: "Technical Error Occurred",
    //           });
    //         });

    //       setEmail({ value: res.data?.EMAIL_ID, error: false })
    //       setMobileNo({ value: res.data?.MOBILE_NUMBER, error: false });
    //       setpvcNumber({ value: res.data?.ID_NUMBER, error: false })
    //       setDrivingNumber({ value: res.data?.ID_NUMBER, error: false })
    //       setPassportNumber({ value: res.data?.ID_NUMBER, error: false })
    //       setBvnNumber({ value: res.data?.ID_NUMBER, error: false })
    //       const DateOfBirth = moment(res.data?.DOB).format("YYYY-MM-DD");
    //       setDateOfBirth(DateOfBirth)

    //       if (res.data?.TITLE == "Mr." || res.data?.TITLE == "Alhaji" || res.data?.TITLE == "Alhaja" || res.data?.TITLE == "Prince" || res.data?.TITLE == "Otunba" || res.data?.TITLE == "Comrade" || res.data?.TITLE == "King" || res.data?.TITLE == "Oba") {
    //         setGenderDisabled(true);
    //       } else if (res.data?.TITLE == "Mrs." || res.data?.TITLE == "Miss." || res.data?.TITLE == "Mr. and Ms" || res.data?.TITLE == "Princess" || res.data?.TITLE == "Queen") {
    //         setGenderDisabled(true);
    //       } else {
    //         setGenderDisabled(false);
    //       }

    //       kycForm.setFieldsValue({
    //         title: res.data?.TITLE == null ? "" : res.data?.TITLE,
    //         gender: res.data?.GENDER == null ? "" : res.data?.GENDER,
    //         firstName: res.data?.FIRST_NAME == null ? "" : res.data?.FIRST_NAME,
    //         middleName: res.data?.MIDDLE_NAME == null ? "" : res.data?.MIDDLE_NAME,
    //         lastName: res.data?.LAST_NAME == null ? "" : res.data?.LAST_NAME,
    //         email: res.data?.EMAIL_ID == null ? "" : res.data?.EMAIL_ID,
    //         phoneNumber: res.data?.MOBILE_NUMBER == null ? "" : res.data?.MOBILE_NUMBER,
    //         dob: res.data?.DOB == null ? "" : moment(res.data?.DOB),
    //         idType: res.data?.ID_TYPE == null ? "" : res.data?.ID_TYPE,
    //         permanentVotersCard: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
    //         passport: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
    //         driverLicence: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
    //         bvn: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
    //         address: res.data?.ADDRESS == null ? "" : res.data?.ADDRESS,
    //         country: res.data?.COUNTRY_CODE == null ? "" : res.data?.COUNTRY_CODE,
    //         state: res.data?.STATE_CODE == null ? "" : res.data?.STATE_CODE,
    //         city: res.data?.CITY_CODE == null ? "" : res.data?.CITY_CODE,
    //         annualIncome: res.data?.ANNUAL_INCOME_RANGE == null ? "" : res.data?.ANNUAL_INCOME_RANGE,
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     setAllLoading(false);
    //     notification.info({
    //       duration: 3,
    //       message: 'Notification',
    //       description: "Technical Error Occurred",
    //     });
    //   });
  }

  const kycFormSubmitHandle = (values) => {
    const data = {
      policyId: policyByIdData?.ID,
      vehicleId: values?.vehicleId,
      make: values?.make,
      model: values?.model,
      registrationDate: moment(values.registrationFromDate).format("YYYY-MM-DD"),
      registrationEndDate: moment(values.registrationToDate).format("YYYY-MM-DD"),
      autoType: values?.autoType,
      yearOfMake: values?.yearOfMake,
      chassisNo: values?.chassisNo,
      vehicleCategory: values?.vehicleCategory
    }

    setAllLoading(true);
    updateNIIDKYCDetailsApi(tokenKey, data, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          kycForm.resetFields();
          setIsKYCFormModalOpen(false);
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: res.message, response: true, error: false })
          getUnderwritingPolicyHandle("", "", "", "", "", true);
          setSteps("1")
        } else {
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: res.message, response: true, error: true })
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

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    if (policyType == "All Policy") {
      getUnderwritingPolicyApi(tokenKey, 1, tablePagination, "10", searchedColumn ? searchedColumn : "", searchText ? searchText : "", colValueArr.length ? true : false, "2", toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Insured_Name"] = item["INSURED_NAME"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Mobile_#"] = item["Mobile_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Sum_Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == 7 ? "Closed" : item.STATUS == 1 ? "Approved" : item.STATUS == 45 ? "Bank Details Pending" : item.STATUS == 6 ? "Settled" : item.STATUS == "0" || item.STATUS == "5" || item.STATUS == "38" || item.STATUS == 54 ? "Pending" : item.STATUS == 46 ? "Update Settlement" : item.STATUS == 43 || item.STATUS == 57 ? "Failed" : item.STATUS == 4 || item.STATUS == 48 ? "Reopened" : item.STATUS == 55 ? "Settlement in Progress" : item.STATUS == 2 ? "Rejected" : item.STATUS == 39 ? "Approve Cancellation" : item.STATUS == 40 ? "Reject Cancellation" : item.STATUS == 41 ? "Hold Cancellation" : item.STATUS == 42 ? "Cancelled" : item.STATUS == 45 ? "Discharge Voucher Sent" : item.STATUS == 46 ? "Ack Settlement" : item.STATUS == 47 ? "Discharge Voucher Rejected" : item.STATUS == 55 ? "Settlement in Progress" : item.STATUS == 58 ? "Pending for RI Approval" : item.STATUS == 59 ? "Pending From Internal Control" : item.STATUS == 60 ? "Rejected From Internal Control" : item.STATUS == 67 ? "Pending With Finance" : "";
                finalArray.push(obj)
              }
            }
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.csv';
            const ws = XLSX.utils.json_to_sheet(finalArray);
            var d = new Date();
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear() + "-" + ("0" + d.getSeconds()).slice(-2);

            const colWidth = [];
            for (let i = 0; i < finalArray.length; i++) {
              colWidth.push({ wch: 20 });
            }
            ws['!cols'] = [...colWidth];
            const wb = {
              Sheets: { [`Policy List`]: ws },
              SheetNames: [`Policy List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Policy-List-${datestring}${fileExtension}`);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllLoading(false)
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "An error has occurred. Please try again!",
          });
        });
    } else if (policyType == "All Pending") {
      getUnderwritingPendingPolicyApi(tokenKey, 1, 5535, "10", "", "", false, "2", toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Insured_Name"] = item["INSURED_NAME"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Mobile_#"] = item["Mobile_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Sum_Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == "1" ? "Approved" : item.STATUS == "0" || item.STATUS == "5" || item.STATUS == "38" || item.STATUS == "54" || item.STATUS == "68" ? "Pending" : item.STATUS == "2" ? "Rejected" : "";
                finalArray.push(obj)
              }
            }
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.csv';
            const ws = XLSX.utils.json_to_sheet(finalArray);
            var d = new Date();
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear() + "-" + ("0" + d.getSeconds()).slice(-2);

            const colWidth = [];
            for (let i = 0; i < finalArray.length; i++) {
              colWidth.push({ wch: 20 });
            }
            ws['!cols'] = [...colWidth];
            const wb = {
              Sheets: { [`Policy List`]: ws },
              SheetNames: [`Policy List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Pending-Policy-List-${datestring}${fileExtension}`);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllLoading(false)
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "An error has occurred. Please try again!",
          });
        });
    } else if (policyType == "All Renewal") {
      getUnderwritingRenewalPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Insured_Name"] = item["INSURED_NAME"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Mobile_#"] = item["Mobile_#"];
                obj["Sum_Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Valid From"] = moment(item["Valid_From"]).format("DD-MM-YYYY");
                obj["Valid Till"] = moment(item["Valid_Till"]).format("DD-MM-YYYY");
                obj['Status'] = item.STATUS == "Expired" ? "Expired" : "N/A";
                finalArray.push(obj)
              }
            }
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.csv';
            const ws = XLSX.utils.json_to_sheet(finalArray);
            var d = new Date();
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear() + "-" + ("0" + d.getSeconds()).slice(-2);

            const colWidth = [];
            for (let i = 0; i < finalArray.length; i++) {
              colWidth.push({ wch: 20 });
            }
            ws['!cols'] = [...colWidth];
            const wb = {
              Sheets: { [`Policy List`]: ws },
              SheetNames: [`Policy List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Renewal-Policy-List-${datestring}${fileExtension}`);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllLoading(false)
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "An error has occurred. Please try again!",
          });
        });
    } else {
      getUnderwritingApprovedPolicyApi(tokenKey, 1, 5535, "10", "", "", false, "2", toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Insured_Name"] = item["INSURED_NAME"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Mobile_#"] = item["Mobile_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Sum_Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == "1" ? "Approved" : item.STATUS == "0" || item.STATUS == "5" || item.STATUS == "38" ? "Pending" : item.STATUS == "2" ? "Rejected" : "";
                finalArray.push(obj)
              }
            }
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const fileExtension = '.csv';
            const ws = XLSX.utils.json_to_sheet(finalArray);
            var d = new Date();
            var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear() + "-" + ("0" + d.getSeconds()).slice(-2);

            const colWidth = [];
            for (let i = 0; i < finalArray.length; i++) {
              colWidth.push({ wch: 20 });
            }
            ws['!cols'] = [...colWidth];
            const wb = {
              Sheets: { [`Policy List`]: ws },
              SheetNames: [`Policy List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Approved-Policy-List-${datestring}${fileExtension}`);
          }
        })
        .catch((err) => {
          console.log(err);
          setAllLoading(false)
          notification.info({
            duration: 3,
            message: 'Notification',
            description: "An error has occurred. Please try again!",
          });
        });
    }
  };

  const getPolicyHistoryHandle = (data) => {
    getPolicyHistoryApi(tokenKey, data?.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setPolicyHistoryData(res.data)
        } else {
          setPolicyHistoryData([])
        }
      })
      .catch((err) => {
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "An error has occurred. Please try again!",
        });
      });
  }
  const sortingHandle = () => {
    setSorting(!sorting)
  }

  const commentHandle = (values) => {
    insertCommentApi(tokenKey, values.comment, policyByIdData?.ID, 200, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          commentForm.resetFields();
          getCommentsHandle(policyByIdData)
          setCommentSubmitBtn(false);
        }
      })
      .catch((err) => {
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "An error has occurred. Please try again!",
        });
      });
  }

  const getCommentsHandle = (data) => {
    getCommentsApi(tokenKey, 200, data.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setCommentsData(res.data)
        } else {
          setCommentsData([]);
        }
      })
      .catch((err) => {
        console.log(err);
        notification.info({
          duration: 3,
          message: 'Notification',
          description: "An error has occurred. Please try again!",
        });
      });
  }

  const commentTabChange = () => {
    setCommentSubmitBtn(false);
    setSorting(false);
    commentForm.resetFields();
  };

  const commentInput = (e) => {
    if (e.target.value !== "") {
      setCommentSubmitBtn(true)
    }
  }

  const commentInputFocus = () => {
    setCommentSubmitBtn(true);
  }

  const commentCancel = () => {
    commentForm.resetFields();
    setCommentSubmitBtn(false);
  }


  const handleCancel = () => {
    setIsKYCModalOpen(false);
    setIsKYCFormModalOpen(false);
    setIsRenewalFormModalOpen(false);
    kycForm.resetFields();
    setKYCStatusResponse({ value: null, response: false, error: false })
  }

  const handleCancel2 = () => {
    setIsKYCForm2ModalOpen(false);
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="policy-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="policy-card-inner">
                <div className={policyType == "All Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Policy")}>
                  <p>Total Policy</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_POLICY ? cardStatsData[0]?.NO_OF_POLICY : 0}</h2>
                </div>
                <div className={policyType == "All Issued" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Issued")}>
                  <p>Policy Issued</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_PENDING_ISSUED ? cardStatsData[0]?.NO_OF_PENDING_ISSUED : 0}</h2>
                </div>
                <div className={policyType == "All Renewal" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Renewal")}>
                  <p>Renewal</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_PENDING_FOR_RENEWAL ? cardStatsData[0]?.NO_OF_PENDING_FOR_RENEWAL : 0}</h2>
                </div>
                <div className="policy-card">
                  <p>Policy MTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.MTD_POLICY ? cardStatsData[0]?.MTD_POLICY : 0}</h2>
                </div>
                <div className="policy-card">
                  <p>Policy YTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.YTD_POLICY ? cardStatsData[0]?.YTD_POLICY : 0}</h2>
                </div>
              </div>
              <div className="policy-data">
                <div className="policy-card-header">
                  <h6>Policy List</h6>
                  {!directAllPolicyData.length ?
                    <></> :
                    <ul>
                      <li onClick={handleCSVDownload}>CSV Download</li>
                    </ul>
                  }
                </div>
                <div className="policy-card-body">
                  {isDataStatus ?
                    <div className="policy-no-data">
                      <img src={noData} alt="" />
                      <h6>There is presently no user data available</h6>
                    </div>
                    :
                    <>
                      <Table
                        columns={directAllPolicyColumns}
                        dataSource={directAllPolicyData}
                        scroll={{ x: "max-content" }}
                        pagination={false}
                      />
                      <Pagination
                        current={currentPage}
                        onChange={paginationHandle}
                        total={tablePagination}
                        pageSize={perPage}
                      />
                    </>
                  }
                </div>
              </div>
            </>
            :
            <>
              <div className="underwriting-policy-header">
                <span onClick={backToPolicyList}><img src={BackArrow} /></span>
                <em>Motor Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">

                  <h6>
                    <span className="insured-name">{policyByIdData?.INSURED_NAME && policyByIdData?.INSURED_NAME[0]}</span>
                    <em className="policyTitle">
                      <span>{policyByIdData?.INSURED_NAME}</span>
                      <em>Policy No. : <strong className="policyNumber">{policyByIdData?.POLICY_NUMBER}</strong></em>
                    </em>
                  </h6>
                  {
                    policyType == "All Renewal" ?
                      <>
                        <Button>Renewal</Button>
                      </>
                      :
                      <></>
                  }

                  {policyByIdData?.CERTIFICATE_URL != "" && policyByIdData?.CERTIFICATE_URL != null ?
                    <span className="certificate-pdf">
                      <a href={policyByIdData?.CERTIFICATE_URL} target="_blank" rel="noopener noreferrer" download>
                        <img src={certificate} alt="" />
                        <strong>Certificate</strong>
                      </a>
                    </span>
                    :
                    <></>
                  }

                  {policyByIdData?.POLICY_DOC != "" && policyByIdData?.POLICY_DOC != null ?
                    <span className="policy-pdf">
                      <a href={policyByIdData?.POLICY_DOC} target="_blank" rel="noopener noreferrer" download>
                        <img src={pdfPreview} alt="" />
                        <strong>Document</strong>
                      </a>
                    </span>
                    :
                    <></>
                  }
                </div>
                <div className="underwriting-insurance-body">
                  <div className="underwriting-insurance-details">
                    <ul>
                      <li><strong>Insured Code :</strong><span>{policyByIdData?.INSURED_CODE}</span></li>
                      <li><strong>Insured Name :</strong><span>{policyByIdData?.INSURED_NAME === null ? "-" : policyByIdData?.INSURED_NAME}</span></li>
                      <li><strong>Quotation No :</strong><span>{policyByIdData?.QUOTATION_NUMBER}</span></li>
                      <li><strong>Policy No :</strong><span>{policyByIdData?.POLICY_NUMBER}</span></li>
                      <li><strong>Vehicle Registration No.  :</strong><span>{policyByIdData?.Vehicle_Details[0]?.VEHICLE_REGISTRATION_NUMBER === "" || policyByIdData?.Vehicle_Details[0]?.VEHICLE_REGISTRATION_NUMBER === null ? "-" : policyByIdData?.Vehicle_Details[0]?.VEHICLE_REGISTRATION_NUMBER}</span></li>
                      <li><strong>Vehicle Make :</strong><span>{policyByIdData?.Vehicle_Details[0]?.VEHICLE_MAKE === "" || policyByIdData?.Vehicle_Details[0]?.VEHICLE_MAKE === null ? "-" : policyByIdData?.Vehicle_Details[0]?.VEHICLE_MAKE}</span></li>
                      <li><strong>Vehicle Model :</strong><span>{policyByIdData?.Vehicle_Details[0]?.VEHICLE_MAKE === "" || policyByIdData?.Vehicle_Details[0]?.VEHICLE_MODEL === null ? "-" : policyByIdData?.Vehicle_Details[0]?.VEHICLE_MODEL}</span></li>
                      <li><strong>Valid From :</strong><span>{moment(policyByIdData?.START_DATE).format('DD-MM-YYYY hh:mm:ss A')}</span></li>
                      <li><strong>Valid Till :</strong><span>{moment(policyByIdData?.END_DATE).format('DD-MM-YYYY hh:mm:ss A')}</span></li>
                      <li><strong>Mobile :</strong><span>{policyByIdData?.INSURED_OFFICE_MOBILE}</span></li>
                      <li><strong>Email :</strong><span>{policyByIdData?.INSURED_EMAIL_ID}</span></li>
                      <li><strong>Date of Birth :</strong><span>{policyByIdData?.INSURED_DOB === null || policyByIdData?.INSURED_DOB === "" ? "-" : moment(policyByIdData?.INSURED_DOB).format('DD-MM-YYYY')}</span></li>
                      <li><strong>State :</strong><span>{policyByIdData?.STATE_NAME}</span></li>
                      <li><strong>LGA :</strong><span>{policyByIdData?.CITY_NAME}</span></li>
                      <li><strong>Address :</strong><span>{policyByIdData?.INSURED_ADDRESS}</span></li>
                      <li><strong>ID Type :</strong><span>{policyByIdData?.INSURED_ID_TYPE === null || policyByIdData?.INSURED_ID_TYPE === "" ? "-" : policyByIdData?.INSURED_ID_TYPE}</span></li>
                      <li><strong>ID Number :</strong><span>{policyByIdData?.INSURED_ID_NUMBER === null || policyByIdData?.INSURED_ID_NUMBER === "" ? "-" : policyByIdData?.INSURED_ID_NUMBER}</span></li>
                      <li><strong>Product Name :</strong><span>{policyByIdData?.PRODUCT_NAME}</span></li>
                      {/* <li><strong>Product Code :</strong><span>{policyByIdData?.PRODUCT_CODE}</span></li> */}
                      <li><strong>Plan :</strong><span>{policyByIdData?.Policy_Type}</span></li>
                      <li><strong>Premium Type :</strong><span>{policyByIdData?.PREMIUM_PERIOD_TYPE == 1 ? "Annual" : policyByIdData?.PREMIUM_PERIOD_TYPE == 2 ? "Half Yearly" : policyByIdData?.PREMIUM_PERIOD_TYPE == 3 ? "Quarterly" : policyByIdData?.PREMIUM_PERIOD_TYPE == 4 ? "Monthly" : policyByIdData?.PREMIUM_PERIOD_TYPE == 5 ? "Day" : ""}</span></li>
                      {policyByIdData?.PREMIUM_PERIOD_TYPE == 5 ? <li><strong>Number Of Days :</strong><span>{policyByIdData?.NUMBER_OF_DAYS}</span></li> : <></>}
                      <li><strong>Sum Insured :</strong><span>{Number(policyByIdData?.SUM_INSURED_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Premium Amount :</strong><span>{Number(policyByIdData?.TOTAL_PREMIUM_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Commission Amount :</strong><span>{Number(policyByIdData?.COMMISION_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Commission Rate :</strong><span>{policyByIdData?.COMMISSION_RATE}%</span></li>
                      <li><strong>NIID Status : </strong><span>{policyByIdData?.NIID_Status == "Pending" ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.NIID_Status == "Success" ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("NIID")} /> <EditOutlined onClick={() => kycFormHandle(policyByIdData?.QUOTATION_ID)} /></>}</span></li>
                      <li><strong>NAICOM Status : </strong><span>{policyByIdData?.Naicom_Status == "Pending" ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.Naicom_Status == "Success" ? <><em className='approved'>Success</em></> : policyByIdData?.NIID_Status == "Success" ? <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("NAICOM")} /> <EditOutlined onClick={() => kycFormHandle(policyByIdData?.QUOTATION_ID)} /></> : <></>}</span></li>
                      <li><strong>KYC Status : </strong><span>{policyByIdData?.IS_KYC == 0 ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.IS_KYC == 1 ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("KYC")} /></>}</span></li>
                      {
                        policyType == "All Renewal" ?
                          <>
                          </>
                          :
                          <>
                            <li><strong>Status :</strong><span>{policyByIdData?.STATUS === 0 || policyByIdData?.STATUS === 38 ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.STATUS === 58 ? <em className='pending blink-animation'>Pending for RI Approval</em> : policyByIdData?.STATUS === 1 ? <em className='approved'>Approved</em> : policyByIdData?.STATUS === 39 ? <em className='approved'>Approve Cancellation</em> : policyByIdData?.STATUS === 40 ? <em className='rejected'>Reject Cancellation</em> : policyByIdData?.STATUS === 41 ? <em className='pending blink-animation'>Hold Cancellation</em> : policyByIdData?.STATUS === 42 ? <em className='rejected'>Cancelled</em> : <em className='rejected'>Rejected</em>}</span></li>
                          </>
                      }
                      {/* <li><strong>Remarks :</strong><span>{policyByIdData?.REMARK == null ? "--" : policyByIdData?.REMARK}</span></li> */}
                    </ul>
                  </div>
                </div>
              </div>


              <div className="underwriting-policy-steps3-bottom">
                <div className="underwriting-insurance-data">
                  <span className="sorting"><i onClick={sortingHandle}>{sorting ? <>Oldest First <SortDescendingOutlined /> </> : <>Newest First <SortDescendingOutlined /> </>}</i></span>
                  <Tabs defaultActiveKey="1" onChange={commentTabChange}>
                    <TabPane tab="History" key="1">
                      <div className="history">
                        <div className="underwriting-insurance-body">
                          <ul className={sorting ? "order-change" : ""}>
                            {policyHistoryData?.map((item, index) => {
                              return (
                                <li className="success" key={index}>
                                  <strong>{policyByIdData?.INSURED_NAME}</strong>
                                  <ul>
                                    <li>Created On : <strong>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</strong></li>
                                    <li>Updated On : <strong>{moment(item?.UPDATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</strong></li>
                                    <li>Updated By : <strong> {item?.UPDATED_BY}</strong></li>
                                    {
                                      item?.POLICY_NUMBER == null ?
                                        <>
                                          <li>Quotation Number : <strong> {item?.QUOTATION_NUMBER}</strong></li>
                                        </>
                                        :
                                        <>
                                          <li>Policy Number : <strong> {item?.POLICY_NUMBER}</strong></li>
                                        </>
                                    }
                                    <li>Sum Insured : <strong>{Number(item?.REQUESTED_SI).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</strong></li>
                                    <li>Premium Amount : <strong>{Number(item?.PREMIUM_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</strong></li>
                                    <li>Status : <strong className={item?.STATUS_KEY === "5" || item?.STATUS_KEY === "1" ? "approved" : item?.STATUS_KEY === "54" || item?.STATUS_KEY === "45" || item?.STATUS_KEY === "0" ? "pending" : item?.STATUS_KEY === "6" ? "settled" : item?.STATUS_KEY === "7" ? "failed" : item?.STATUS_KEY === "4" ? "reopened" : item?.STATUS_KEY === "46" ? "final-settlement" : ""}> {item?.STATUS}</strong></li>
                                    <li>Remarks : <strong> {item?.REMARK}</strong></li>
                                  </ul>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab="Comments" key="2">
                      <div className="comments">
                        <div className="underwriting-insurance-body">
                          <Form
                            name="commentForm"
                            onFinish={commentHandle}
                            form={commentForm}
                          >
                            <Form.Item
                              name="comment"
                              rules={[{ required: true, message: 'Please input your Comment!' }]}
                            >
                              <TextArea onKeyDown={addressHandleKeyDown} maxLength={2000} onChange={commentInput} onFocus={commentInputFocus} placeholder="Add a comment..." rows={commentSubmitBtn === true ? 4 : 2} />
                            </Form.Item>
                            {commentSubmitBtn === true ?
                              <Form.Item>
                                <Button type="primary" htmlType="submit">Submit</Button>
                                <Button onClick={commentCancel} >Cancel</Button>
                              </Form.Item>
                              :
                              <></>
                            }
                          </Form>
                          <ul className={sorting ? "order-change" : ""}>
                            {commentsData?.map((item, index) => {
                              return (
                                <li key={index}>
                                  <strong>
                                    <span>{item?.USER_ID === null ? "A" : item?.USER_ID[0]}</span>
                                    {item?.USER_ID === null ? "null" : item?.USER_ID}
                                    <em>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</em>
                                  </strong>
                                  <span dangerouslySetInnerHTML={{ __html: item.COMMENT }}></span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab="Payment History" key="3">
                      <div className="history">
                        <div className="underwriting-insurance-body">
                          <ul>
                            {paymentHistoryData?.map((item, index) => {
                              return (
                                <li key={index} className={item?.STATUS == 0 || item?.STATUS == 3 ? "pending" : item?.STATUS == 1 ? "success" : "failed"}>
                                  <b>Name : {policyByIdData?.INSURED_NAME}</b>
                                  <ul>
                                    <li>Policy Number :  <b>{item?.POLICY_NUMBER}</b></li>
                                    <li>Transaction Date :  <b>{moment(item?.PAYMENT_DATE).format('DD-MM-YYYY hh:mm:ss A')}</b></li>
                                    <li>Amount :  <b>{item?.AMOUNT == null ? "-" : item?.AMOUNT.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</b></li>
                                    <li>Payment Mode : <b>{item?.payment_mode == null ? "-" : item?.payment_mode}</b></li>
                                    <li>Txn. Ref. :  <b>{item?.transactionRefNumber == null ? "-" : item?.transactionRefNumber}</b></li>
                                    <li>Created By :  <b>{item?.CREATED_BY == null ? "-" : item?.CREATED_BY}</b></li>
                                    <li>Status :  <b className={item?.STATUS == 0 || item?.STATUS == 3 ? "pending" : item?.STATUS == 1 ? "success" : "failed"}>{item?.STATUS == 0 || item?.STATUS == 3 ? "Pending" : item?.STATUS == 1 ? "Success" : "Failed"}</b></li>
                                  </ul>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    </TabPane>
                  </Tabs>
                </div>
              </div>
            </>
          }
        </div>
      </div>

      <Modal width={400} className="kyc-status-modal" title={isStatus == "NIID" ? "NIID Status" : isStatus == "NAICOM" ? "NAICOM Status" : "KYC Status"} centered visible={isKYCModalOpen} onCancel={handleCancel}>
        <p dangerouslySetInnerHTML={{ __html: isStatus == "NIID" ? policyByIdData?.NIID_Response_Remark == "" ? "Failed" : policyByIdData?.NIID_Response_Remark : isStatus == "NAICOM" ? Array.isArray(policyByIdData?.NAICOM_Response_Remark) ? policyByIdData?.NAICOM_Response_Remark.length ? policyByIdData?.NAICOM_Response_Remark[0] : "Failed" : policyByIdData?.NAICOM_Response_Remark == "" ? "Failed" : policyByIdData?.NAICOM_Response_Remark : policyByIdData?.KYC_FAILURE_REMARKS }}>
        </p>
      </Modal>

      <Modal width={900} className="renewal-form-modal" title="Renewal" centered visible={isRenewalFormModalOpen} onCancel={handleCancel}>
        <Form
          name="basic"
          onFinish={kycFormSubmitHandle}
          autoComplete="off"
          form={kycForm}
        >
          <Form.Item
            label="Policy No."
            name="policyNo"
          // rules={[{ required: true, message: 'Select Policy End Date!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Plan"
            name="plan"
          >
            <Select>
              <Option value="146">Comprehensive</Option>
              <Option value="152">Third Party</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Start Date"
            name="fromDate"
            rules={[{ required: true, message: 'Select Policy Start Date!' }]}
          >
            <DatePicker
            />
          </Form.Item>
          <Form.Item
            label="End Date"
            name="toDate"
          >
            <DatePicker
            />
          </Form.Item>
          <Form.Item
            label="Sum Insured"
            name="sumInsured"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Premium"
            name="premium"
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Make Payment</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal width={900} className="kyc-form-modal" title="Complete KYC" centered visible={isKYCFormModalOpen} onCancel={handleCancel}>
        <Form
          name="basic"
          onFinish={kycFormSubmitHandle}
          autoComplete="off"
          form={kycForm}
        >
          <div className="kyc-form-title">
            <h6>Personal Information</h6>
          </div>
          <div className="kyc-form-items">
            <Form.Item
              label="Title"
              name="title"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Gender"
              name="gender"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="First Name"
              name="firstName"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Middle Name"
              name="middleName"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="emailId"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Phone Number"
              name="mobileNumber"
            >
              <Input
                disabled={true}
              />
            </Form.Item>
            <Form.Item
              label="Date of Birth"
              name="dob"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Select ID type"
              name="idType"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="ID Number"
              name="idNumber"
            >
              <Input disabled={true} />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="State"
              name="state"
            >
              <Input disabled={true} />
            </Form.Item>
            <Form.Item
              label="LGA"
              name="city"
            >
              <Input disabled={true} />
            </Form.Item>
          </div>

          <div className="kyc-form-title">
            <h6>Vehicle Information</h6>
          </div>
          <div className="kyc-form-items">
            <Form.Item
              label="Policy Start Date"
              name="fromDate"
              rules={[{ required: true, message: 'Select Policy Start Date!' }]}
            >
              <DatePicker
                disabled={true}
              />
            </Form.Item>
            <Form.Item
              label="Policy End Date"
              name="toDate"
            // rules={[{ required: true, message: 'Select Policy End Date!' }]}
            >
              <DatePicker
                disabled={true}
              />
            </Form.Item>
            <Form.Item
              label="Registration No"
              name="registrationNumber"
              rules={[
                {
                  required: true,
                  message: 'Enter your Registration No!',
                },
              ]}
            >
              <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={10} disbaled />
            </Form.Item>
            <Form.Item
              label="Make"
              name="make"
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
              name="model"
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
              label="Registration Start Date"
              name="registrationFromDate"
              rules={[{ required: true, message: 'Select Registration Start Date!' }]}
            >
              <DatePicker
                onChange={(a, b) => {
                  setregistrationStartDate(b.split("/").join("-"));
                  kycForm.setFieldsValue({
                    registrationEndDate: "",
                  });
                }}
              />
            </Form.Item>
            <Form.Item
              label="Registration End Date"
              name="registrationToDate"
              rules={[{ required: true, message: 'Select Registration End Date!' }]}
            >
              <DatePicker
                disabled={!registrationStartDate ? true : false}
                onChange={(a, b) => {
                  setregistrationEndDate(b.split("/").join("-"));
                }}
                disabledDate={disabledDate2}
              />
            </Form.Item>
            <Form.Item
              label="Vehicle Id"
              name="vehicleId"
              rules={[{ required: true, message: 'Enter your vehicle id!' }]}
            >
              <Input onKeyDown={numbricKeyDownHandle} maxLength={20} />
            </Form.Item>
            <Form.Item
              label="AutoType"
              name="autoType"
              rules={[{ required: true, message: 'Enter your auto type!' }]}
            >
              {/* <Input onKeyDown={alphaHandleKeyDown} maxLength={20} /> */}
              <Select>
                <Option value="Car">Car</Option>
                <Option value="Truck">Truck</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Year Of Make"
              name="yearOfMake"
              rules={[{ required: true, message: 'Enter your year of make!' }]}
            >
              <Input onKeyDown={numbricKeyDownHandle} maxLength={4} />
            </Form.Item>

            <Form.Item
              label="Chassis No"
              name="chassisNo"
              rules={[{ required: true, message: 'Enter your chassis no!' }]}
            >
              <Input onKeyDown={chassisHandleKeyDown} maxLength={20} />
            </Form.Item>

            <Form.Item
              label="Vehicle Category"
              name="vehicleCategory"
              rules={[{ required: true, message: 'Enter your vehicle category!' }]}
            >
              <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
            </Form.Item>
          </div>

          {

          }
          <Form.Item>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal width={320} className="kyc-form-modal active" title="Complete KYC Status" centered visible={isKYCForm2ModalOpen} onCancel={handleCancel2}>
        {kycStatusResponse.error === false ?
          <>
            <img src={SucessIcon} alt="" className="modal-response-icon" />
            <p>{kycStatusResponse.value}</p>
            <Button className="dismiss-btn" onClick={handleCancel2}>Dismiss</Button>
          </>
          :
          <>
            <img src={ErrorIcon} alt="" className="modal-response-icon" />
            <p>{kycStatusResponse.value}</p>
            <Button className="dismiss-btn" onClick={handleCancel2}>Dismiss</Button>
          </>
        }
      </Modal>

    </>
  );
}

Policy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  policy: makeSelectPolicy()
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
)(Policy);
