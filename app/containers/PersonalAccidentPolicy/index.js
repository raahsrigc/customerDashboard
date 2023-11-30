/**
 *
 * PersonalAccidentPolicy
 *
 */

import React, { memo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";
import { FormattedMessage } from "react-intl";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectPersonalAccidentPolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import messages from "./messages";

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
import { personalAccidentSummaryDataApi, getPersonalAccidentPolicyApi, getPersonalAccidentApprovedPolicyApi, getPersonalAccidentPolicyByIdApi, getPolicyHistoryApi, getCommentsApi, insertCommentApi, getPaymentHistoryApi, getKYCDataApi, updateKYCDetailsApi, countryData, stateData, cityData } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function PersonalAccidentPolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "personalAccidentPolicy", reducer });
  useInjectSaga({ key: "personalAccidentPolicy", saga });

  const title = "Personal Accident Policy";
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
  const [paymentHistoryData, setPaymentHistoryData] = useState();

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
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


  const selectCountry = (value) => {
    setAllLoading(true);
    stateData(tokenKey, value)
      .then((res) => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setStateOption(res.data)
          kycForm.setFieldsValue({
            country: "",
          });
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

  const selectState = (value) => {
    setAllLoading(true);
    cityData(tokenKey, value)
      .then((res) => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setCityOption(res.data)
          kycForm.setFieldsValue({
            city: ""
          });
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
    personalAccidentSummaryDataApi(tokenKey, toggleBtn)
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
      } else {
        getUnderwritingPolicyApprovedHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (policyType == "All Policy") {
      getUnderwritingPolicyHandle(pageNumber, pageCount);
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
    getPersonalAccidentPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Insured_Name!"] = data["Insured_Name"];
            data["Policy_#!"] = data["Policy_#"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Created_On!"] = data["Created_On"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["Insured_Name"]
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


  const getUnderwritingPolicyApprovedHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();
    setAllLoading(true)
    getPersonalAccidentApprovedPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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

  const getPolicyByIdHandle = (data) => {
    setAllLoading(true);
    getPersonalAccidentPolicyByIdApi(tokenKey, data?.ID, toggleBtn)
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

  const handleCancel = () => {
    setIsCertificateModalOpen(false);
    setIsKYCModalOpen(false);
    setIsKYCFormModalOpen(false);
  }

  const kycHandle = (data) => {
    setIsKYCModalOpen(true);
    setIsStatus(data)
  }

  const kycFormHandle = async () => {
    setKYCStatusResponse({ value: null, response: false, error: false })
    setIsKYCFormModalOpen(true);
    setAllLoading(true);
    await getKYCDataApi(tokenKey, policyByIdData?.INSURED_EMAIL_ID, policyByIdData?.INSURED_OFFICE_MOBILE, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setIdType(res.data?.ID_TYPE)
          const country = res.data?.COUNTRY_CODE
          const state = res.data?.STATE_CODE
          await countryData(tokenKey, toggleBtn)
            .then(async (res) => {
              res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
              setAllLoading(false);
              if (res.status === true) {
                setCountryOption(res.data.DATA)
                await stateData(tokenKey, country, toggleBtn)
                  .then(async (res) => {
                    res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
                    setAllLoading(false);
                    if (res.status === true) {
                      setStateOption(res.data)
                      await cityData(tokenKey, state, toggleBtn)
                        .then((res) => {
                          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
                          setAllLoading(false);
                          if (res.status === true) {
                            setCityOption(res.data)
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

          setEmail({ value: res.data?.EMAIL_ID, error: false })
          setMobileNo({ value: res.data?.MOBILE_NUMBER, error: false });
          setpvcNumber({ value: res.data?.ID_NUMBER, error: false })
          setDrivingNumber({ value: res.data?.ID_NUMBER, error: false })
          setPassportNumber({ value: res.data?.ID_NUMBER, error: false })
          setBvnNumber({ value: res.data?.ID_NUMBER, error: false })
          const DateOfBirth = moment(res.data?.DOB).format("YYYY-MM-DD");
          setDateOfBirth(DateOfBirth)

          if (res.data?.TITLE == "Mr." || res.data?.TITLE == "Alhaji" || res.data?.TITLE == "Alhaja" || res.data?.TITLE == "Prince" || res.data?.TITLE == "Otunba" || res.data?.TITLE == "Comrade" || res.data?.TITLE == "King" || res.data?.TITLE == "Oba") {
            setGenderDisabled(true);
          } else if (res.data?.TITLE == "Mrs." || res.data?.TITLE == "Miss." || res.data?.TITLE == "Mr. and Ms" || res.data?.TITLE == "Princess" || res.data?.TITLE == "Queen") {
            setGenderDisabled(true);
          } else {
            setGenderDisabled(false);
          }

          kycForm.setFieldsValue({
            title: res.data?.TITLE == null ? "" : res.data?.TITLE,
            gender: res.data?.GENDER == null ? "" : res.data?.GENDER,
            firstName: res.data?.FIRST_NAME == null ? "" : res.data?.FIRST_NAME,
            middleName: res.data?.MIDDLE_NAME == null ? "" : res.data?.MIDDLE_NAME,
            lastName: res.data?.LAST_NAME == null ? "" : res.data?.LAST_NAME,
            email: res.data?.EMAIL_ID == null ? "" : res.data?.EMAIL_ID,
            phoneNumber: res.data?.MOBILE_NUMBER == null ? "" : res.data?.MOBILE_NUMBER,
            dob: res.data?.DOB == null ? "" : moment(res.data?.DOB),
            idType: res.data?.ID_TYPE == null ? "" : res.data?.ID_TYPE,
            permanentVotersCard: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
            passport: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
            driverLicence: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
            bvn: res.data?.ID_NUMBER == null ? "" : res.data?.ID_NUMBER,
            address: res.data?.ADDRESS == null ? "" : res.data?.ADDRESS,
            country: res.data?.COUNTRY_CODE == null ? "" : res.data?.COUNTRY_CODE,
            state: res.data?.STATE_CODE == null ? "" : res.data?.STATE_CODE,
            city: res.data?.CITY_CODE == null ? "" : res.data?.CITY_CODE,
            annualIncome: res.data?.ANNUAL_INCOME_RANGE == null ? "" : res.data?.ANNUAL_INCOME_RANGE,
          });
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

  const kycFormSubmitHandle = (values) => {
    delete values.dob;
    values = { ...values, dob: dateOfBirth, quotationId: policyByIdData?.QUOTATION_ID, insuredCode: policyByIdData?.INSURED_CODE, assuredBusinessSectrorCode: "01", insuredName: values?.firstName + " " + values?.middleName + " " + values?.lastName, idNumber: values.permanentVotersCard ? values.permanentVotersCard : values.passport ? values.passport : values.driverLicence ? values.driverLicence : values.bvn ? values.bvn : "" }
    delete values.permanentVotersCard
    delete values.passport
    delete values.driverLicence
    delete values.bvn
    setAllLoading(true);
    updateKYCDetailsApi(tokenKey, values, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          kycForm.resetFields();
          setKYCStatusResponse({ value: res.message, response: true, error: false })
          setSteps("1")
        } else {
          setKYCStatusResponse({ value: res.message, response: true, error: false })
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
      getPersonalAccidentPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
                obj["Insured Name"] = item["Insured_Name"];
                obj["Policy #"] = item["Policy_#"];
                obj["Mobile #"] = item["Mobile_#"];
                obj["Created_On"] = moment(item["Created_On"]).format('DD-MM-YYYY');
                obj["Sum Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
    } else {
      getPersonalAccidentApprovedPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
                obj["Insured Name"] = item["Insured_Name"];
                obj["Policy #"] = item["Policy_#"];
                obj["Mobile #"] = item["Mobile_#"];
                obj["Created_On"] = moment(item["Created_On"]).format('DD-MM-YYYY');
                obj["Sum Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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


  const titleHandle = (data) => {
    if (data == "Mr." || data == "Alhaji" || data == "Alhaja" || data == "Prince" || data == "Otunba" || data == "Comrade" || data == "King" || data == "Oba") {
      kycForm.setFieldsValue({
        gender: "Male"
      });
      setGenderDisabled(true);
    } else if (data == "Mrs." || data == "Miss." || data == "Mr. and Ms" || data == "Princess" || data == "Queen") {
      kycForm.setFieldsValue({
        gender: "Female"
      });
      setGenderDisabled(true);
    } else {
      kycForm.setFieldsValue({
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
        <div className="personal-accident-policy-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="policy-card-inner">
                <div className={policyType == "All Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Policy")}>
                  <p>Total Policy</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_POLICY ? cardStatsData[0]?.NO_OF_POLICY : 0}</h2>
                </div>
                {/* <div className={policyType == "All Pending" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Pending")}>
                  <p>Policy Pending</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_PENDING_FOR_APPROVAL ?  cardStatsData[0]?.NO_OF_PENDING_FOR_APPROVAL : 0}</h2>
                </div> */}
                <div className={policyType == "All Issued" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Issued")}>
                  <p>Policy Issued</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_PENDING_ISSUED ? cardStatsData[0]?.NO_OF_PENDING_ISSUED : 0}</h2>
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
                <em>Personal Accident Insurance</em>
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
                      <li><strong>Premium Type :</strong><span>{policyByIdData?.PREMIUM_PERIOD_TYPE == 0 ? "Annual" : policyByIdData?.PREMIUM_PERIOD_TYPE == 4 ? "Monthly" : ""}</span></li>
                      <li><strong>Sum Insured Amount :</strong><span>{Number(policyByIdData?.SUM_INSURED_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Premium Amount :</strong><span>{Number(policyByIdData?.TOTAL_PREMIUM_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Commission Amount :</strong><span>{Number(policyByIdData?.COMMISION_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Commission Rate :</strong><span>{policyByIdData?.COMMISSION_RATE}%</span></li>
                      {/* <li><strong>NIID Status : </strong><span>{policyByIdData?.NIID_Status == "Pending" ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.NIID_Status == "Success" ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("NIID")} /></>}</span></li> */}
                      <li><strong>NAICOM Status : </strong><span>{policyByIdData?.Naicom_Status == "Pending" ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.Naicom_Status == "Success" ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("NAICOM")} /></>}</span></li>
                      <li><strong>KYC Status : </strong><span>{policyByIdData?.IS_KYC == 0 ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.IS_KYC == 1 ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("KYC")} /><EditOutlined onClick={() => kycFormHandle("KYC")} /></>}</span></li>
                      <li><strong>Status :</strong><span>{policyByIdData?.STATUS === 0 || policyByIdData?.STATUS === 38 ? <em className='pending blink-animation'>Pending</em> : policyByIdData?.STATUS === 58 ? <em className='pending blink-animation'>Pending for RI Approval</em> : policyByIdData?.STATUS === 1 ? <em className='approved'>Approved</em> : policyByIdData?.STATUS === 39 ? <em className='approved'>Approve Cancellation</em> : policyByIdData?.STATUS === 40 ? <em className='rejected'>Reject Cancellation</em> : policyByIdData?.STATUS === 41 ? <em className='pending blink-animation'>Hold Cancellation</em> : policyByIdData?.STATUS === 42 ? <em className='rejected'>Cancelled</em> : <em className='rejected'>Rejected</em>}</span></li>
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
                                    <li>Policy Number : <strong> {item?.POLICY_NUMBER}</strong></li>
                                    <li>Sum Insured Amount : <strong>{Number(item?.REQUESTED_SI).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</strong></li>
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
                          {/* <ul className={sorting ? "order-change" : ""}>
                            {policyHistoryData?.map((item, index) => {
                              return (
                                <li className="success" key={index}>
                                  <strong>{policyByIdData?.INSURED_NAME}</strong>
                                  <ul>
                                    <li>Created On : <strong>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</strong></li>
                                    <li>Updated On : <strong>{moment(item?.UPDATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</strong></li>
                                    <li>Updated By : <strong> {item?.UPDATED_BY}</strong></li>
                                    <li>Policy Number : <strong> {item?.POLICY_NUMBER}</strong></li>
                                    <li>Sum Insured Amount : <strong>{Number(item?.REQUESTED_SI).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</strong></li>
                                    <li>Premium Amount : <strong>{Number(item?.PREMIUM_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</strong></li>
                                    <li>Status : <strong className={item?.STATUS_KEY === "5" || item?.STATUS_KEY === "1" ? "approved" : item?.STATUS_KEY === "54" || item?.STATUS_KEY === "45" || item?.STATUS_KEY === "0" ? "pending" : item?.STATUS_KEY === "6" ? "settled" : item?.STATUS_KEY === "7" ? "failed" : item?.STATUS_KEY === "4" ? "reopened" : item?.STATUS_KEY === "46" ? "final-settlement" : ""}> {item?.STATUS}</strong></li>
                                    <li>Remarks : <strong> {item?.REMARK}</strong></li>
                                  </ul>
                                </li>
                              )
                            })}
                          </ul> */}
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
        <p>{isStatus == "NIID" ? policyByIdData?.NIID_Response_Remark == "" ? "Failed" : policyByIdData?.NIID_Response_Remark : isStatus == "NAICOM" ? Array.isArray(policyByIdData?.NAICOM_Response_Remark) ? policyByIdData?.NAICOM_Response_Remark.length ? policyByIdData?.NAICOM_Response_Remark[0] : "Failed" : policyByIdData?.NAICOM_Response_Remark == "" ? "Failed" : policyByIdData?.NAICOM_Response_Remark : policyByIdData?.KYC_FAILURE_REMARKS}</p>
      </Modal>


      <Modal width={kycStatusResponse.response ? 320 : 900} className={kycStatusResponse.response ? "kyc-form-modal active" : "kyc-form-modal"} title="KYC Details" centered visible={isKYCFormModalOpen} onCancel={handleCancel}>
        {kycStatusResponse.response === false ?
          <Form
            name="basic"
            onFinish={kycFormSubmitHandle}
            autoComplete="off"
            form={kycForm}
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
              <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
            </Form.Item>
            <Form.Item
              label="Middle Name"
              name="middleName"
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Enter your Last Name!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={50} />
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
                maxLength='13'
                onChange={testMobileNo}
                onKeyDown={mobileHandleKeyDown}
              />
            </Form.Item>
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
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Enter your Address!' }]}
            >
              <Input onKeyDown={addressHandleKeyDown} maxLength={200} />
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: 'Please Select Country' }]}
            >
              <Select
                placeholder="Select Country"
                onChange={selectCountry}
              >
                {countryOption?.map((item, index) => {
                  return <Option value={item.Code} key={index}>{item.Description}</Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: 'Please Select State' }]}
            >
              <Select
                placeholder="Select State"
                onChange={selectState}
              >
                {stateOption?.map((item, index) => {
                  return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item
              label="LGA"
              name="city"
              rules={[{ required: true, message: 'Please Select LGA!' }]}
            >
              <Select
                placeholder="Select LGA"
              >
                {cityOption?.map((item, index) => {
                  return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item
              label="Annual Personal Income"
              name="annualIncome"
            >
              <Select>
                <Option value="360K - 1M">360K - 1M</Option>
                <Option value="1M - 2M">1M - 2M</Option>
                <Option value="2M - 5M">2M - 5M</Option>
                <Option value="5M - 10M">5M - 10M</Option>
                <Option value="0M - 15M">10M - 15M</Option>
                <Option value="15M - 30M">15M - 30M</Option>
                <Option value=">30M">&gt;30M</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
          :
          <>
            {kycStatusResponse.error === false ?
              <>
                <img src={SucessIcon} alt="" className="modal-response-icon" />
                <p>{kycStatusResponse.value}</p>
                <Button className="dismiss-btn" onClick={handleCancel}>Dismiss</Button>
              </>
              :
              <>
                <img src={ErrorIcon} alt="" className="modal-response-icon" />
                <p>{kycStatusResponse.value}</p>
                <Button className="dismiss-btn" onClick={handleCancel}>Dismiss</Button>
              </>
            }
          </>
        }
      </Modal>

    </>
  );
}

PersonalAccidentPolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  personalAccidentPolicy: makeSelectPersonalAccidentPolicy()
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
)(PersonalAccidentPolicy);
