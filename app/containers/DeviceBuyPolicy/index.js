/**
 *
 * DeviceBuyPolicy
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDeviceBuyPolicy, { selectDeviceBuyPolicyDomain } from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import "./style.scss"

import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Pagination from 'antd/es/pagination';
import DatePicker from 'antd/es/date-picker';
import Checkbox from 'antd/es/checkbox';
import Tabs from 'antd/es/tabs';
import Modal from 'antd/es/modal';
import { Tooltip } from 'antd';
import { Radio } from 'antd';
import moment from "moment";
import Spin from 'antd/es/spin'
import Highlighter from "react-highlight-words";
import notification from 'antd/es/notification';
import arrow from '../../images/arrow.svg'
import excelIcon from '../../images/excel-icon.png'
import buyPolicyPaymentImage from '../../images/buy-policy-payment.png'
import noData from "../../images/no-data.svg";
import logo from '../../images/logo.png';
import iconLocation from '../../images/icon-location.png';
import iconPhone from '../../images/icon-phone.png';
import iconEmail from '../../images/icon-mail.png';
import history from 'utils/history';
import { SearchOutlined, SortDescendingOutlined, SortAscendingOutlined, WalletOutlined, CreditCardOutlined, PhoneOutlined, MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { summaryDataDeviceApi, getAllQuotationsDeviceApi, getQuotationsByIdDeviceApi, getBulkBuyPolicyDeviceApi, getBulkByBatchDeviceApi, getBulkPolicyDeviceApi, devicePaymentKyc, bulkBuyPolicyDevicePaymentInfoApi, savePolicyDeviceApi, getBuyPolicyKycDataDeviceApi, deviceBuyPolicyWalletPay, devicePolicyPay, verifyDeviceApi, getCommentDeviceApi, commentDeviceApi, getHistoryDeviceApi, getProfileData } from "../../services/AuthService";
import aes256 from "../../services/aes256";
import { set } from "lodash";


export function DeviceBuyPolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "deviceBuyPolicy", reducer });
  useInjectSaga({ key: "deviceBuyPolicy", saga });

  const title = "Device Quotation";
  const [allLoading, setAllLoading] = useState(false);
  const search = location.search;
  const queryStatus = new URLSearchParams(search).get('status');
  const queryTxRef = new URLSearchParams(search).get('trxref');
  const queryTransactionId = new URLSearchParams(search).get('transaction_id');
  const queryIsBulk = new URLSearchParams(search).get('isBulk');
  const queryIsMode = new URLSearchParams(search).get('mode');
  const userId = sessionStorage.getItem('email');

  const [form] = Form.useForm();
  const [deviceFormPay] = Form.useForm();
  const { TextArea } = Input;
  const [commentForm] = Form.useForm();
  const [policyForm] = Form.useForm();
  const [showModal, setShowModal] = useState("");
  const [policyMsg, setPolicyMsg] = useState("");
  const [policyModal, setPolicyModal] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [policyVerifyMsg, setPolicyVerifyMsg] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [singlePaymentVerifyResponse, setSinglePaymentVerifyResponse] = useState("");
  const [policyVerifyModal, setPolicyVerifyModal] = useState("");
  const [isBulk, setIsBulk] = useState(false);
  const [bulkFailed, setBulkFailed] = useState(false);
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [paymentMethodStatus, setPaymentMethodStatus] = useState({ value: null, policyNumber: null, response: false, error: false });
  const [paymentData, setPaymentData] = useState("")
  const redirectUrl = window.location.href + "?isBulk=" + isBulk + "&mode=" + toggleBtn
  // const redirectUrl = window.location.href + "?isBulk=" + isBulk
  const [cardStatsData, setCardStatsData] = useState({});
  const [quotationDetails, setQuotationDetails] = useState({ value: null, error: false });
  const [bulkQuotationDetails, setBulkQuotationDetails] = useState({ value: null, error: false });
  const [idType, setIdType] = useState("");
  const [deviceBuyPolicyTermCheck, setDeviceBuyPolicyTermCheck] = useState();
  const [urlValidation, setUrlValidation] = useState({ value: null, error: false });
  const [pvcNumber, setpvcNumber] = useState({ value: null, error: false });
  const [nicNumber, setnicNumber] = useState({ value: null, error: false });
  const [bvnNumber, setBvnNumber] = useState({ value: null, error: false });
  const [drivingNumber, setDrivingNumber] = useState({ value: null, error: false });
  const [passportNumber, setPassportNumber] = useState({ value: null, error: false });
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startDate2, setStartDate2] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startMonthDate, setStartMonthDate] = useState("");
  const [endMonthDate, setEndMonthDate] = useState("");
  const [visible, setVisible] = useState(false);
  const [reset, setReset] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [columns, setColumns] = useState([]);
  const [quotationTableData, setQuotationTableData] = useState([]);
  const [quotationTablePagination, setQuotationTablePagination] = useState("");
  const [bulkQuotationColumns, setBulkQuotationColumns] = useState([]);
  const [bulkQuotationTableData, setBulkQuotationTableData] = useState([]);
  const [bulkQuotationTablePagination, setBulkQuotationTablePagination] = useState("");
  const [bulkQuotationIndividualColumns, setBulkQuotationIndividualColumns] = useState([]);
  const [bulkQuotationIndividualTable, setBulkQuotationIndividualTable] = useState([]);
  const [bulkCSVData, setBulkCSVData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [policyFormData, setPolicyFormData] = useState({})
  const [KYCFormData, setKYCFormData] = useState({})
  const [defaultValue, setDefaultValue] = useState({});
  const [sorting, setSorting] = useState(false);
  const [commentSubmitBtn, setCommentSubmitBtn] = useState(false);
  const [quotationCommentsData, setQuotationCommentsData] = useState([]);
  const [quotationHistoryData, setQuotationHistoryData] = useState([]);
  const [bulkBuyPolicyPaymentData, setBulkBuyPolicyPaymentData] = useState([]);
  const [deviceBuyPolicyPaymentResponse, setDeviceBuyPolicyPaymentResponse] = useState([]);
  const [genderDisabled, setGenderDisabled] = useState(false);

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);
  const [isDataStatus, setIsDataStatus] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  useEffect(() => {
    setDefaultValue({
      mobileNumber: policyFormData && policyFormData["Mobile_#!"] ? policyFormData && policyFormData["Mobile_#!"] : policyFormData && policyFormData["Mobile_#"],
      email: policyFormData && policyFormData["Email_Id!"] ? policyFormData["Email_Id!"] : policyFormData["Email_Id"],
      deviceValue: policyFormData && policyFormData["Sum_Insured!"] ? policyFormData["Sum_Insured!"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.split('₦')[1] : policyFormData["Sum_Insured"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.split('₦')[1],
      deviceSerialNumber: policyFormData && policyFormData["Device_Serial_#!"] ? policyFormData["Device_Serial_#!"] : policyFormData["Device_Serial_#"]
    })
    policyForm.setFieldsValue({
      mobileNumber: policyFormData && policyFormData["Mobile_#!"] ? policyFormData && policyFormData["Mobile_#!"] : policyFormData && policyFormData["Mobile_#"],
      email: policyFormData && policyFormData["Email_Id!"] ? policyFormData["Email_Id!"] : policyFormData["Email_Id"],
      // deviceValue: policyFormData && policyFormData["Sum_Insured!"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.replaceAll(/\₦/g, ""),
      deviceValue: policyFormData && policyFormData["Sum_Insured!"] ? policyFormData["Sum_Insured!"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.split('₦')[1] : policyFormData["Sum_Insured"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.split('₦')[1],
      deviceSerialNumber: policyFormData && policyFormData["Device_Serial_#!"] ? policyFormData["Device_Serial_#!"] : policyFormData["Device_Serial_#"]
    });
  }, [Object.keys(policyFormData || {}).length || Object.keys(KYCFormData || {}).length])


  const alphaHandleKeyDown = (e) => {
    const regex = new RegExp(/^[a-zA-Z-' ]+(?: [a-zA-Z-']+)*$/);
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
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

  const alphaNumericHandleKeyDown = (e) => {
    const regex = new RegExp("^[a-zA-Z0-9]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
      return false;
    }
  }

  const urlHandleKeyDown = (e) => {
    const validRegex = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    if (e.target.value.match(validRegex)) {
      setUrlValidation({ value: e.target.value, error: false })
      return true;
    } else {
      setUrlValidation({ value: "", error: true })
      return false;
    }
  }

  const alphaNumeric2HandleKeyDown = (e) => {
    const regex = new RegExp("^[a-zA-Z0-9 ]+$");
    const key = e.key;
    if (!regex.test(key)) {
      e.preventDefault();
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

  const nicHandle = (e) => {
    const nicRegex = /^[1-9]{1}[0-9]{10}$/;
    if (e.target.value.match(nicRegex)) {
      setnicNumber({ value: e.target.value, error: false })
      return true;
    }
    else {
      setnicNumber({ value: "", error: true })
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

  function addressHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9(!@#$&-+:',./) ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
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

  const idTypeHandle = (value) => {
    setIdType(value)
  }

  const deviceBuyPolicyTermOnChange = (e) => {
    setDeviceBuyPolicyTermCheck(e.target.checked)
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
  })

  /* antd table filter */
  const getColumnSearchProps2 = (dataIndex) => ({
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
    onFilter: (value, record) => {
      if (record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children) {
        return (
          record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children
            ? record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase())
            : ""
        )
      }
      return (
        record[dataIndex]
          ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
          : ""
      )
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput1.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

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
      if (!isBulk) {
        getBuyPolicyHandle(1, perPage);
      } else {
        if (bulkFailed) {
          getBulkFailedPolicyHandle(1, perPage);
        } else {
          getBulkPolicyHandle(1, perPage);
        }
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (!isBulk) {
      getBuyPolicyHandle(pageNumber, pageCount);
    } else {
      if (bulkFailed) {
        getBulkFailedPolicyHandle(pageNumber, pageCount);
      } else {
        getBulkPolicyHandle(pageNumber, pageCount);
      }
    }
  }


  const cardStats = () => {
    summaryDataDeviceApi(tokenKey, toggleBtn)
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

  useEffect(() => {
    if (userData?.token) {
      cardStats();
    }
  }, [userData])

  const tabChange = (key) => {
    setQuotationTableData([])
    setColumns([])
    setQuotationTablePagination("")
    form.resetFields();
    setStartDate("");
    setStartDate2("")
    setEndDate("");
    setReset(true)
    setVisible(false)
    setQuotationDetails({ value: null, error: false })
    setBulkQuotationDetails({ value: null, error: false })
    setColNameArr([])
    setColValueArr([])
    if (key === "bulkQuotation") {
      setIsBulk(true);
      setBulkFailed(false)
    } else if (key === "bulkQuotationFailed") {
      setBulkFailed(true)
      setIsBulk(true);
    } else {
      setIsBulk(false);
      setBulkFailed(false)
    }
  };


  useEffect(() => {
    const monthDate = [moment().subtract(30, 'days'), moment().subtract(0, 'days')]
    const startDate = moment(monthDate[0]).format("YYYY-MM-DD");
    const endDate = moment(monthDate[1]).format("YYYY-MM-DD");
    setStartMonthDate(startDate);
    setEndMonthDate(endDate);
  }, [])

  const disabledDate = (current) => {
    const yesterday = moment().subtract(3, "months");
    return current < yesterday || current > moment().subtract(0, 'days');
  }

  function disabledDate2(current) {
    const yesterday = moment(startDate, "YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current > moment().subtract(0, 'days');
  }

  const dateOfPurchaseDisbaled = (current) => {
    const yesterday = moment().subtract(30, "days");
    return current < yesterday || current > moment().subtract(0, 'days');
  }
  const dobDisabledDate = (current) => {
    const yesterday = moment().subtract();
    return current > moment().subtract(0, 'days');
  }


  const getBuyPolicyHandle = (pageNumber, pageCount, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    setAllLoading(true)
    getAllQuotationsDeviceApi(tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.responseCode === "200") {
          setQuotationTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res.data.PER_PAGE)
          setIsDataStatus(false)
          const object1 = res.data.DATA;
          object1.map(data => {

            data["Quote_#!"] = data["QUOTE_#"];
            data["Device_Serial_#!"] = data["DEVICE_SERIAL_#"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["Email_Id!"] = data["EMAIL_ID"];
            data["Valid_From!"] = data["VALID_FROM"];
            data["Valid_To!"] = data["VALID_TO"];
            data["Sum_Insured!"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];
            data["Status"] = data["POLICY_STATUS"];

            delete data["EMAIL_ID"]
            delete data["MOBILE_#"]
            delete data["QUOTE_#"]
            delete data["DEVICE_SERIAL_#"]
            delete data["CREATED_ON"]
            delete data["SUM_INSURED"]
            delete data["VALID_FROM"]
            delete data["VALID_TO"]
            // delete data["PREMIUM"]
            delete data["POLICY_STATUS"]

            return data;

          })
          if (object1 && object1.length) {
            let dataColumn = [];
            let object2 = [
              {
                title: '#',
                dataIndex: 'number',
                key: 'number',
                width: 60,
                render: (x, records) => {
                  return `${res.data.PER_PAGE * (res.data.PAGE_NUMBER - 1) + records.key + 1}.`
                },
              }
            ]
            dataColumn.push(...object2);

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "POLICY_ID" && key !== "INSURED_ID" && key !== "IS_KYC" && key !== "Status" && key !== "PREMIUM") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getQuotationsByIdHandle(record);
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
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <>
                      {records.Status == "0" || records.Status == "3" ? <span onClick={() => continuePayHandle(records)}>Pay</span> : records.IS_KYC == "2" ? <span className="fail-status" onClick={() => buyPolicyHandle(records)}>Re-KYC</span> : records.IS_KYC == 6 ? <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span> : <span className="fail-status" onClick={() => buyPolicyHandle(records)}>Re-KYC</span>}
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);
            setColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Valid_To!"] = moment(responseData["Valid_To!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setQuotationTableData(tableData);
          } else {
            setQuotationTableData([])
            setQuotationTablePagination("")
          }
        } else {
          // setIsDataStatus(dataStatus)
          setQuotationTableData([])
          setQuotationTablePagination("")
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

  const getBulkPolicyHandle = (pageNumber, pageCount, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    setAllLoading(true)

    getBulkBuyPolicyDeviceApi(tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, null, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.responseCode === "200") {
          setBulkQuotationTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res.data.PER_PAGE)
          setIsDataStatus(false)
          const object1 = res.data.DATA;
          object1.map(data => {

            // data["Batch_Id!"] = data["BATCH_ID"];
            // data["#_of_Proposers!"] = data["#_OF_PROPOSERS"];
            // data["KYC_Success!"] = data["KYC_SUCCESS"];
            // data["KYC_Failed!"] = data["KYC_FAILED"];
            // data["Created_On!"] = data["CREATED_ON"];
            // data["Premium!"] = data["PREMIUM"];
            // data["Status"] = data["STATUS"];

            // delete data["BATCH_ID"]
            // delete data["#_OF_PROPOSERS"]
            // delete data["KYC_SUCCESS"]
            // delete data["KYC_FAILED"]
            // delete data["CREATED_ON"]
            // delete data["PREMIUM"]
            // delete data["STATUS"]

            data["Batch_Id!"] = data["BATCH_ID"];
            data["Quote_#"] = data["QUOTE_#"];
            data["Device_#"] = data["DEVICE_#"];
            data["Sum_Insured"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];

            data["Created_On!"] = data["CREATED_ON"];

            data["Status"] = data["STATUS"];

            delete data["BATCH_ID"]
            delete data["QUOTE_#"]
            delete data["NO_OF_DEVICE"]
            delete data["MOBILE_#"]
            delete data["SUM_INSURED"]
            // delete data["PREMIUM"]
            delete data["CREATED_ON"]
            delete data["STATUS"]
            delete data["DEVICE_#"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];
            let object2 = [
              {
                title: '#',
                dataIndex: 'number',
                key: 'number',
                width: 60,
                render: (x, records) => {
                  return `${res.data.PER_PAGE * (res.data.PAGE_NUMBER - 1) + records.key + 1}.`
                },
              }
            ]
            dataColumn.push(...object2);

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status" && key !== "PREMIUM") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      // onClick: () => { record.IS_ENABLED == "Y" ? getBulkByBatchHandle(record) : <></> }
                      onClick: () => { getBulkByBatchHandle(record) }
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
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <>
                      {
                        <>
                          {records.Status == "0" || records.Status == "3" ? <span onClick={() => continuePayHandle(records)}>Pay</span> : records.IS_KYC == "2" ? <span className="fail-status" onClick={() => buyPolicyHandle(records)}>Re-KYC</span> : records.IS_KYC == 6 ? <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span> : <span className="na-status">Pending</span>}
                          {/* {
                            records.Status == 0 || records.Status == 3 ?
                              <span onClick={() => continuePayHandle(records)}>Pay</span>
                              : records.Status == 1 ?
                                <span>Success</span>
                                :
                                <span>Failed</span>
                          } */}
                        </>
                      }
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);
            setBulkQuotationColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured"] = Number(responseData["Sum_Insured"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBulkQuotationTableData(tableData);
          } else {
            setBulkQuotationTableData([])
            setBulkQuotationTablePagination("")
          }
        } else {
          // setIsDataStatus(dataStatus)
          setBulkQuotationTableData([])
          setBulkQuotationTablePagination("")
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
  const getBulkFailedPolicyHandle = (pageNumber, pageCount, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    setAllLoading(true)

    getBulkPolicyDeviceApi(tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, null, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.responseCode === "200") {
          setBulkQuotationTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res.data.PER_PAGE)
          setIsDataStatus(false)
          const object1 = res.data.DATA;
          object1.map(data => {

            data["Batch_Id!"] = data["BATCH_ID"];
            data["#_Of_Proposers"] = data["#_OF_PROPOSERS"];
            data["KYC_Failed"] = data["KYC_FAILED"];
            data["Created_On!"] = data["CREATED_ON"];
            data["Sum_Insured"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];
            data["Status"] = data["STATUS"];

            delete data["BATCH_ID"]
            delete data["#_OF_PROPOSERS"]
            delete data["CREATED_ON"]
            delete data["SUM_INSURED"]
            // delete data["PREMIUM"]
            delete data["STATUS"]
            delete data["KYC_SUCCESS"]
            delete data["KYC_FAILED"]
            delete data["IS_ENABLED"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];
            let object2 = [
              {
                title: '#',
                dataIndex: 'number',
                key: 'number',
                width: 60,
                render: (x, records) => {
                  return `${res.data.PER_PAGE * (res.data.PAGE_NUMBER - 1) + records.key + 1}.`
                },
              }
            ]
            dataColumn.push(...object2);

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status" && key !== "PREMIUM") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      // onClick: () => { record.IS_ENABLED == "Y" ? getBulkByBatchHandle(record) : <></> }
                      onClick: () => { getBulkByBatchHandle(record) }
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
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <>
                      {
                        <>
                          {/* {records.Status == "0" ? <span className="fail-status" onClick={() => continuePayHandle(records)}>Re-initiate payment</span> : records.Status == "3" ? <span onClick={() => continuePayHandle(records)}>Pay</span> : records.Status == "2" ? <span className="pending-status">Pending</span> : <span className="na-status">N/A</span>} */}
                          {
                            <span className="fail-status">Failed</span>
                          }
                        </>
                      }
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);
            setBulkQuotationColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured"] = Number(responseData["Sum_Insured"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBulkQuotationTableData(tableData);
          } else {
            setBulkQuotationTableData([])
            setBulkQuotationTablePagination("")
          }
        } else {
          // setIsDataStatus(dataStatus)
          setBulkQuotationTableData([])
          setBulkQuotationTablePagination("")
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

  const transactionFilterHandle = () => {
    setVisible(true)
    setQuotationDetails({ value: null, error: false })
    setBulkQuotationDetails({ value: null, error: false })
    if (!isBulk) {
      getBuyPolicyHandle("", "", "", true);
    } else {
      if (bulkFailed) {
        getBulkFailedPolicyHandle("", "", "", true);
      } else {
        getBulkPolicyHandle("", "", "", true);
      }
    }
  }

  const onReset = () => {
    form.resetFields();
    setStartDate("");
    setStartDate2("")
    setEndDate("");
    setReset(true)
    setVisible(false)
    setQuotationDetails({ value: null, error: false })
    setBulkQuotationDetails({ value: null, error: false })
  };

  useEffect(() => {
    setReset(false)
    if (reset === true) {
      if (!isBulk) {
        getBuyPolicyHandle("", "", "", true);
      } else {
        if (bulkFailed) {
          getBulkFailedPolicyHandle("", "", "", true);
        } else {
          getBulkPolicyHandle("", "", "", true);
        }
      }
    }
  }, [reset])

  useEffect(() => {
    if (userData?.token && startMonthDate) {
      if (!isBulk) {
        getBuyPolicyHandle("", "", "", true);
      } else {
        if (bulkFailed) {
          getBulkFailedPolicyHandle("", "", "", true);
        } else {
          getBulkPolicyHandle("", "", "", true);
        }
      }
    }
  }, [(startMonthDate || isBulk) && userData?.token && policyVerifyMsg])


  const buyPolicyHandle = (data) => {
    setShowModal(true);
    setPolicyFormData(data)
    setPaymentMethodModal(false)
    setAllLoading(true)
    getBuyPolicyKycDataDeviceApi(tokenKey, data.INSURED_ID, data.ID, bulkFailed ? 1 : 0, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.status == true) {
          setKYCFormData(res?.data)
          setIdType(res?.data?.ID_TYPE == "Driver's Licence" || res?.data?.ID_TYPE == "DRIVERS_LICENSE" ? "DRIVERS_LICENSE" : res?.data?.ID_TYPE == "PVC" || res?.data?.ID_TYPE == "Permanent Voters Card" ? "PVC" : res?.data?.ID_TYPE == "NIN" || res?.data?.ID_TYPE == "National Identity Card" ? "NIN" : res?.data?.ID_TYPE == "INTERNATIONAL_PASSPORT" || res?.data?.ID_TYPE == "International Passport" ? "INTERNATIONAL_PASSPORT" : res?.data?.ID_TYPE)
          setDateOfBirth(res?.data?.DOB == null ? "" : res?.data?.DOB)
          res?.data?.ID_TYPE == "Driver's Licence" || res?.data?.ID_TYPE == "DRIVERS_LICENSE" ? setDrivingNumber({ value: res?.data?.ID_NUMBER, error: false }) : res?.data?.ID_TYPE == "PVC" || res?.data?.ID_TYPE == "Permanent Voters Card" ? setpvcNumber({ value: res?.data?.ID_NUMBER, error: false }) : res?.data?.ID_TYPE == "NIN" || res?.data?.ID_TYPE == "National Identity Card" ? setnicNumber({ value: res?.data?.ID_NUMBER, error: false }) : res?.data?.ID_TYPE == "INTERNATIONAL_PASSPORT" || res?.data?.ID_TYPE == "International Passport" ? setPassportNumber({ value: res?.data?.ID_NUMBER, error: false }) : "";
          res?.data?.INVOICE_PROOF_URL == "" ? setUrlValidation({ value: null, error: false }) : setUrlValidation({ value: res?.data?.INVOICE_PROOF_URL, error: false })
          setStartDate2(res?.data?.DATE_OF_PURCHASE == null ? "" : moment(res?.data?.DATE_OF_PURCHASE)?.format("YYYY-MM-DD"))
          setGenderDisabled(true)
          policyForm.setFieldsValue({
            title: res?.data?.TITLE,
            firstName: res?.data?.FIRST_NAME,
            middleName: res?.data?.MIDDLE_NAME,
            lastName: res?.data?.LAST_NAME,
            gender: res?.data?.GENDER,
            mobileNumber: res?.data["Mobile_#"],
            email: res?.data["Email_Id"],
            deviceValue: res?.data["Sum_Insured"]?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.split('₦')[1],
            deviceSerialNumber: res?.data["Device_Serial_#"],
            dob: res?.data?.DOB == null ? "" : moment(res?.data?.DOB),
            deviceMake: res?.data?.DEVICE_MAKE,
            deviceModal: res?.data?.DEVICE_MODAL,
            deviceType: res?.data?.DEVICE_TYPE,
            imeiNumber: res?.data?.IMEI_NUMBER,
            dateOfPurchase: res?.data?.DATE_OF_PURCHASE == null ? "" : moment(res?.data?.DATE_OF_PURCHASE),
            invoiceProofUrl: res?.data?.INVOICE_PROOF_URL,
            idType: res?.data?.ID_TYPE == "Driver's Licence" || res?.data?.ID_TYPE == "DRIVERS_LICENSE" ? "DRIVERS_LICENSE" : res?.data?.ID_TYPE == "PVC" || res?.data?.ID_TYPE == "Permanent Voters Card" ? "PVC" : res?.data?.ID_TYPE == "NIN" || res?.data?.ID_TYPE == "National Identity Card" ? "NIN" : res?.data?.ID_TYPE == "INTERNATIONAL_PASSPORT" || res?.data?.ID_TYPE == "International Passport" ? "INTERNATIONAL_PASSPORT" : res?.data?.ID_TYPE,
            permanentVotersCard: res?.data?.ID_TYPE == "PVC" || res?.data?.ID_TYPE == "Permanent Voters Card" ? res?.data?.ID_NUMBER : res?.data?.ID_NUMBER,
            driverLicence: res?.data?.ID_TYPE == "Driver's Licence" || res?.data?.ID_TYPE == "DRIVERS_LICENSE" ? res?.data?.ID_NUMBER : "",
            nationalIdentityCard: res?.data?.ID_TYPE == "NIN" || res?.data?.ID_TYPE == "National Identity Card" ? res?.data?.ID_NUMBER : "",
            passport: res?.data?.ID_TYPE == "INTERNATIONAL_PASSPORT" || res?.data?.ID_TYPE == "International Passport" ? res?.data?.ID_NUMBER : "",
            bvn: res?.data?.ID_TYPE == "BVN" ? res?.data?.ID_NUMBER : ""
          });
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

  const policyDetailsHandle = (values) => {
    let id = values.permanentVotersCard || values.nationalIdentityCard || values.driverLicence || values.passport || values.bvn
    delete values.passportPhoto;
    delete values.permanentVotersCard;
    delete values.nationalIdentityCard;
    delete values.driverLicence;
    delete values.bvn;
    delete values.email;
    delete values.dob;

    values["dateOfPurchase"] = startDate2;
    values["deviceValue"] = values["deviceValue"]?.replace(/\₦|,/g, '')?.replace(" ", '');
    values = { ...values, idNumber: id, insuredId: policyFormData?.INSURED_ID, dob: dateOfBirth, quotationId: policyFormData.Id ? policyFormData.Id : policyFormData.ID }
    setAllLoading(true);
    savePolicyDeviceApi(tokenKey, values, toggleBtn)
      .then((res) => {
        setAllLoading(false);
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setShowModal(false);
        setPolicyVerifyModal(false);
        if (res.status == true) {
          if (res?.data?.POLICY_ID === null) {
            setPolicyModal(true);
            setPolicyMsg("Your KYC has been failed. Please update the KYC details!")
          } else {
            setPolicyModal(true);
            setPolicyId(res?.data?.POLICY_ID)
            setPolicyMsg("Your Policy has been generated successfully with Policy Number " + res?.data?.POLICY_NUMBER)
          }
        } else {
          setPolicyModal(true);
          setPolicyId("")
          setPolicyMsg("Your KYC details have not been verified. Please check the KYC Details against Insurer name.")
        }

        if (!isBulk) {
          getBuyPolicyHandle("", "", "", true);
        } else {
          if (bulkFailed) {
            getBulkFailedPolicyHandle("", "", "", true);
          } else {
            getBulkPolicyHandle("", "", "", true);
          }
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

  const continuePayHandle = (data) => {
    setAllLoading(true);
    setPaymentData(data);
    bulkBuyPolicyDevicePaymentInfoApi(tokenKey, data.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        setPolicyModal(false);
        setPaymentMethodModal(true);
        if (res.status === true) {
          setBulkBuyPolicyPaymentData(res.data)
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


  const paymentMethodHandle = (values) => {
    values.paymentOption = values.paymentOption == "Wallet" ? true : false;
    setAllLoading(true);
    if (values.paymentOption == true) {
      deviceBuyPolicyWalletPay(tokenKey, paymentData.ID, paymentData["Batch_Id!"], paymentData["PREMIUM"], isBulk, values.paymentOption, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false);
          if (res.status === true) {
            getProfileHandle();
            setDeviceBuyPolicyPaymentResponse(res.data)
            setPaymentMethodStatus({ value: res.message, policyNumber: null, response: true, error: false })
            if (!isBulk) {
              getBuyPolicyHandle("", "", "", true);
            } else {
              if (bulkFailed) {
                getBulkFailedPolicyHandle("", "", "", true);
              } else {
                getBulkPolicyHandle("", "", "", true);
              }
            }
          } else {
            setPaymentMethodStatus({ value: res.message, policyNumber: null, response: true, error: true })
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
    } else {
      devicePolicyPay(tokenKey, paymentData.POLICY_ID ? paymentData.POLICY_ID : policyId, paymentData.ID, redirectUrl, isBulk, paymentData["Batch_Id!"], paymentData["PREMIUM"], values.paymentOption, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false);
          if (res.status === true) {
            window.location.href = res.data.authorization_url
          } else {
            setPaymentMethodStatus({ value: res.message, policyNumber: null, response: true, error: true })
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
  }


  useEffect(() => {
    if (queryTxRef != null && userData?.token) {
      // setIsBulk(true);
      verifyDeviceApi(tokenKey, queryTxRef, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          if (res.data.status === "success" || res.data.status === "successful") {
            setPolicyVerifyModal(true);
            if (queryIsBulk == "false") {
              setPolicyVerifyMsg("Payment Successful, Please complete the Kyc details")
              setPolicyNumber(res?.data?.POLICY_NUMBER)
              setSinglePaymentVerifyResponse(res?.data)
              setPaymentMethodStatus({ value: res.message, policyNumber: null, response: true, error: false })
            } else {
              setIsBulk(true);
              setPolicyVerifyMsg("Payment Successful, Policy Status will be updated in sometimes.")
              devicePaymentKyc(tokenKey, res.data.quotationId, res.data.batchNo, res.data.amount, queryIsBulk, toggleBtn)
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

  const getQuotationsByIdHandle = (data) => {
    if (data?.POLICY_ID !== null) {
      getQuotationsByIdDeviceApi(tokenKey, data?.POLICY_ID ? data?.POLICY_ID : data?.ID, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          if (res.status === true) {
            setQuotationDetails({ value: res?.data, error: true })
            getQuotationComments(res.data.DEVICE_ID)
            getQuotationRequestHistory(res.data.DEVICE_ID)
            setSorting(false)
          } else {
            setQuotationDetails({ value: null, error: false })
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
  }

  const getBulkByBatchHandle = (data) => {
    setAllLoading(true)
    getBulkByBatchDeviceApi(tokenKey, data["Batch_Id!"], 0, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.status === true) {
          setBulkQuotationDetails({ value: null, error: true })
          const object1 = res.data;
          object1.map(data => {

            data["Quote_#!"] = data["QUOTE_#"];
            data["Device_Serial_#!"] = data["DEVICE_SERIAL_#"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["Email_Id!"] = data["EMAIL_ID"];
            data["Valid_From!"] = data["QUOTE_VALID_FROM"];
            data["Valid_To!"] = data["QUOTE_VALID_TO"];
            data["Sum_Insured!"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];
            data["Status"] = data["STATUS"];

            delete data["QUOTE_#"]
            delete data["DEVICE_TYPE"]
            delete data["QUOTATION_ID"]
            delete data["DEVICE_MAKE"]
            delete data["PRODUCT_NAME"]
            delete data["TXN_UNIQE_REF_ID"]
            delete data["PRODUCT_CODE"]
            delete data["POLICY_#"]
            delete data["MESSAGE"]
            delete data["IMEI_#"]
            delete data["STATUS"]
            delete data["PAYMENT_LINK_URL"]
            delete data["DEVICE_SERIAL_#"]
            delete data["SUM_INSURED"]
            // delete data["PREMIUM"]
            delete data["VALID_FROM"]
            delete data["VALID_TO"]
            delete data["DEVICE_MODAL"]
            delete data["PAYMENT_DATE"]
            delete data["PROOF_OF_PURCHASE"]
            delete data["EMAIL_ID"]
            delete data["MOBILE_#"]
            delete data["CREATED_ON"]
            delete data["QUOTE_VALID_FROM"]
            delete data["QUOTE_VALID_TO"]
            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];
            let object2 = [
              {
                title: '#',
                dataIndex: 'number',
                key: 'number',
                width: 60,
                render: (x, records) => {
                  return `${records.key + 1}.`
                },
              }
            ]
            dataColumn.push(...object2);

            for (let key in object1[0]) {
              if (key !== "QUOTATION_ID" && key !== "ID" && key !== "POLICY_ID" && key !== "Status" && key !== "BATCH_#" && key !== "ID_TYPE" && key !== "ID_#" && key !== "DATE_OF_PURCHASE" && key !== "FIRST_NAME" && key !== "LAST_NAME" && key !== "IS_KYC" && key !== "INSURED_ID" && key !== "PREMIUM") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getQuotationsByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps2(key)
                };
                dataColumn.push(object);
              }
            }

            // let object3 = [
            //   {
            //     title: "Status",
            //     dataIndex: 'status',
            //     key: 'status',
            //     sorter: (a, b) => {
            //       return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
            //     },
            //     render: (x, records) => {
            //       return (
            //         <>
            //           {records.Status == "0" || records.Status == "3" ? <span onClick={() => continuePayHandle(records)}>Pay</span> : records.IS_KYC == "2" ? <span className="fail-status" onClick={() => buyPolicyHandle(records)}>Re-KYC</span> : records.IS_KYC == 6 ? <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span> : <span className="na-status">Pending</span>}
            //         </>
            //       )
            //     },
            //   }
            // ]

            // dataColumn.push(...object3);

            setBulkQuotationIndividualColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Valid_To!"] = moment(responseData["Valid_To!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBulkQuotationIndividualTable(tableData);
            setBulkCSVData(object1)
          } else {
            setBulkQuotationIndividualTable([])
            setBulkCSVData([])
          }
        } else {
          setBulkQuotationIndividualTable([])
          setBulkCSVData([])
          setBulkQuotationDetails({ value: null, error: false })
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

  /* CSV download */
  const handleCSVDownload = async type => {
    let finalArray = [];
    if (bulkCSVData && bulkCSVData.length) {
      for (let i = 0; i < bulkCSVData.length; i++) {
        const item = bulkCSVData[i];
        const index = i + 1
        const obj = {}

        obj['S.No.'] = index
        obj['Quote #'] = item["Quote_#!"]
        obj['Device Serial #'] = item["Device_Serial_#!"]
        obj['Mobile Number'] = item["Mobile_#!"]
        obj['Email Id'] = item["Email_Id!"]
        obj['Valid From'] = moment(item["Valid_From!"]).format("DD-MM-YYYY");
        obj['Valid To'] = moment(item["Valid_To!"]).format("DD-MM-YYYY");
        obj['Sum_Insured'] = item["Sum_Insured!"].toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
        obj['Premium'] = item["Premium!"].toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
        obj['Status'] = "Failed"

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
      Sheets: { [`Bulk Quotation List`]: ws },
      SheetNames: [`Bulk Quotation List`],
    };
    const excelBuffer = XLSX.write(wb, {
      bookType: 'csv',
      type: 'array'
    });
    const data1 = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data1, `${bulkQuotationIndividualTable[0] && bulkQuotationIndividualTable[0]["BATCH_#"]}-Bulk-Quotation-List-${datestring}${fileExtension}`);
  };

  const backAllQuotationHandle = () => {
    setQuotationDetails({ value: null, error: false })
  }

  const backBulkQuotationHandle = () => {
    setBulkQuotationDetails({ value: null, error: false })
  }

  const commentTabChange = () => {
    setCommentSubmitBtn(false);
    setSorting(false);
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
  const commentHandle = (values) => {
    commentDeviceApi(tokenKey, quotationDetails.value.DEVICE_ID, values.comment, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          commentForm.resetFields();
          setCommentSubmitBtn(false)
          getQuotationComments(quotationDetails.value.DEVICE_ID)
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

  const getQuotationRequestHistory = (data) => {
    getHistoryDeviceApi(tokenKey, data, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          setQuotationHistoryData(res.data)
        } else {
          setQuotationHistoryData([]);
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

  const getQuotationComments = (data) => {
    getCommentDeviceApi(tokenKey, data, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          setQuotationCommentsData(res.data)
        } else {
          setQuotationCommentsData([]);
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

  const sortingHandle = () => {
    setSorting(!sorting)
  }

  const handleCancel = () => {
    setShowModal(false);
    setPolicyModal(false);
    setPolicyVerifyModal(false);
    setPolicyFormData({})
    setPolicyId("")
    setDeviceBuyPolicyTermCheck()
    deviceFormPay.resetFields()
    form.resetFields();
    policyForm.resetFields();
    setUrlValidation({ value: null, error: false });
    setPaymentMethodStatus({ value: null, policyNumber: null, response: false, error: false })
    setIdType("")
    // setIsBulk(false);
    setPolicyVerifyMsg("");
    setPaymentMethodModal(false)

    if (queryTxRef != null) {
      history.push("/registration/device/quotation");
    }
  };

  const titleHandle = (data) => {
    if (data == "Mr." || data == "Alhaji" || data == "Alhaja" || data == "Prince" || data == "Otunba" || data == "Comrade" || data == "King" || data == "Oba") {
      policyForm.setFieldsValue({
        gender: "Male"
      });
      setGenderDisabled(true);
    } else if (data == "Mrs." || data == "Miss." || data == "Mr. and Ms" || data == "Princess" || data == "Queen") {
      policyForm.setFieldsValue({
        gender: "Female"
      });
      setGenderDisabled(true);
    } else {
      policyForm.setFieldsValue({
        gender: ""
      });
      setGenderDisabled(false);
    }
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData, setPolicyVerifyMsg, queryIsMode }} />

        <section className="device-buy-policy-section">
          <div className="policy-card-inner">
            <div className="policy-card">
              <p># Quotation Generated</p>
              <h2>{cardStatsData?.quotation_generate ? cardStatsData?.quotation_generate : 0}</h2>
            </div>
            <div className="policy-card">
              <p># KYC Validated</p>
              <h2>{cardStatsData?.kyc_validated ? cardStatsData?.kyc_validated : 0}</h2>
            </div>
            <div className="policy-card">
              <p># KYC Failed</p>
              <h2>{cardStatsData?.kyc_failed ? cardStatsData?.kyc_failed : 0}</h2>
            </div>
            {/* <div className="policy-card">
              <p># Pending Payment</p>
              <h2>{cardStatsData?.padding_payment ? cardStatsData?.padding_payment : 0}</h2>
            </div>
            <div className="policy-card">
              <p># Failed Payment</p>
              <h2>{cardStatsData?.total_failed_payment ? cardStatsData?.total_failed_payment : 0}</h2>
            </div> */}
          </div>

          <div className="buy-policy-form">
            <Form
              form={form}
              onFinish={transactionFilterHandle}
            >
              <Form.Item
                name="fromDate"
                rules={[{ required: true, message: 'Please Select Start Date!' }]}
              >
                <DatePicker
                  placeholder="Start Date"
                  onChange={(a, b) => {
                    setStartDate(b.split("/").join("-"));
                  }}
                  disabledDate={disabledDate}
                />
              </Form.Item>
              <Form.Item
                name="toDate"
                rules={[{ required: true, message: 'Please Select End Date!' }]}
              >
                <DatePicker
                  placeholder="End Date"
                  disabled={!startDate ? true : false}
                  onChange={(a, b) => {
                    setEndDate(b.split("/").join("-"));
                  }}
                  disabledDate={disabledDate2}
                />
              </Form.Item>
              <Form.Item className="activate-account-footer">
                <Button
                  htmlType="submit"> Submit
                </Button>
                <Button
                  disabled={!visible ? true : false}
                  onClick={onReset}
                >Clear
                </Button>
              </Form.Item>
            </Form>
          </div>

          <Tabs defaultActiveKey={queryIsBulk == "true" ? "bulkQuotation" : "individualQuotation"} onChange={tabChange}>
            <Tabs.TabPane tab="Individual Quotation" key="individualQuotation">
              <div className="buy-policy-data">
                {quotationDetails.error === false ?
                  <>
                    <div className="buy-policy-header">
                      <h6>Individual Quotation List</h6>
                    </div>

                    <div className="buy-policy-body">
                      {isDataStatus ?
                        <div className="policy-no-data">
                          <img src={noData} alt="" />
                          <h6>There is presently no user data available</h6>
                        </div>
                        :
                        <>
                          <Table
                            columns={columns}
                            dataSource={quotationTableData}
                            scroll={{ x: "max-content" }}
                            pagination={false}
                          />
                          <Pagination
                            current={currentPage}
                            onChange={paginationHandle}
                            total={quotationTablePagination}
                            pageSize={perPage}
                          />
                        </>
                      }
                      {/* <span className="page-count">Page {currentPage} of {quotationTablePagination}</span> */}
                    </div>
                  </>
                  :
                  <>
                    <div className="buy-policy-header">
                      <span onClick={backAllQuotationHandle}><img src={arrow} alt="" /> Back</span>
                      <div><h6>Individual Quotation List <i>Quote # : {quotationDetails?.value?.QUOTATION_NUMBER}</i></h6></div>
                    </div>
                    <div className="buy-policy-by-id">
                      <ul>
                        <li><b>Quotation Number :</b><span>{quotationDetails?.value?.QUOTATION_NUMBER}</span></li>
                        <li><b>First Name :</b><span>{quotationDetails.value.FIRST_NAME}</span></li>
                        <li><b>Last Name :</b><span>{quotationDetails.value.LAST_NAME}</span></li>
                        <li><b>Gender :</b><span>{quotationDetails.value.GENDER == "F" ? "Female" : quotationDetails.value.GENDER == "M" ? "Male" : quotationDetails.value.GENDER == "O" ? "Others" : quotationDetails.value.GENDER}</span></li>
                        <li><b>Date Of Birth :</b><span>{moment(quotationDetails.value.DOB).format("DD-MM-YYYY")}</span></li>
                        <li className="lowerCaseText"><b>Email Id :</b><span>{quotationDetails.value.EMAIL_ID}</span></li>
                        <li><b>Mobile Number :</b><span>{quotationDetails.value.MOBILE_NUMBER}</span></li>
                        <li><b>Quotation Valid From :</b><span>{moment(quotationDetails.value.Quotation_Valid_From).format("DD-MM-YYYY")}</span></li>
                        <li><b>Quotation Valid To :</b><span>{moment(quotationDetails.value.Quotation_Valid_To).format("DD-MM-YYYY")}</span></li>
                        <li><b>Device Serial Number :</b><span>{quotationDetails.value.DEVICE_SERIAL_NUMBER}</span></li>
                        <li><b>Device Type :</b><span>{quotationDetails.value.DEVICE_TYPE?.toUpperCase()}</span></li>
                        <li><b>Device Make :</b><span>{quotationDetails.value.DEVICE_MAKE}</span></li>
                        <li><b>Device Model :</b><span>{quotationDetails.value.DEVICE_MODAL}</span></li>
                        <li><b>IMEI Number :</b><span>{quotationDetails.value.IMEI_NUMBER}</span></li>
                        <li><b>Date of Purchase :</b><span>{moment(quotationDetails.value.DATE_OF_PURCHASE).format("DD-MM-YYYY")}</span></li>
                        <li className="lowerCaseText"><b>Invoice Proof Url :</b><span>{quotationDetails.value.POLICY_DOCUMENT_URL !== null ? quotationDetails.value.POLICY_DOCUMENT_URL : "N/A"}</span></li>
                        <li><b>ID Type :</b><span>{quotationDetails.value.ID_TYPE?.replaceAll("_", " ")}</span></li>
                        <li><b>ID Number :</b><span>{quotationDetails.value.ID_NUMBER}</span></li>
                        <li><b>KYC Status :</b> {quotationDetails.value.IS_KYC === "0" ? <span className="fail-status">failed</span> : quotationDetails.value.IS_KYC == "2" ? <span className="pending-status">Pending</span> : quotationDetails.value.IS_KYC == "1" ? <span className="na-status">Success</span> : <span className="na-status">N/A</span>}</li>
                        <li><b>Sum Insured :</b><span>{quotationDetails.value.Sum_Insured.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        <li><b>Premium :</b><span>{quotationDetails.value.Premium.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        {/* <li><b>Payment Status :</b> {quotationDetails.value.STATUS === "0" ? <span className="fail-status" onClick={() => continuePayHandle(quotationDetails.value)}>Re-initiate payment</span> : quotationDetails.value.STATUS == "2" ? <span className="pending-status">Pending</span> : quotationDetails.value.STATUS == "3" ? <span className="na-status" onClick={() => continuePayHandle(quotationDetails.value)}>Pay</span> : <span className="na-status">N/A</span>}</li> */}
                      </ul>
                    </div>
                  </>
                }
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Bulk Quotation" key="bulkQuotation">
              <div className="buy-policy-data">
                {bulkQuotationDetails.error === false ?
                  <>
                    <div className="buy-policy-header">
                      <h6>Bulk Quotation List</h6>
                    </div>
                    <div className="buy-policy-body">
                      {isDataStatus ?
                        <div className="policy-no-data">
                          <img src={noData} alt="" />
                          <h6>There is presently no user data available</h6>
                        </div>
                        :
                        <>
                          <Table
                            columns={bulkQuotationColumns}
                            dataSource={bulkQuotationTableData}
                            scroll={{ x: "max-content" }}
                            pagination={false}
                          />
                          <Pagination
                            current={currentPage}
                            onChange={paginationHandle}
                            total={bulkQuotationTablePagination}
                            pageSize={perPage}
                          />
                        </>
                      }
                    </div>
                  </>
                  :
                  <>
                    {quotationDetails.error === false ?
                      <>
                        <div className="buy-policy-header">
                          <span onClick={backBulkQuotationHandle}><img src={arrow} alt="" /> Back</span>
                          <div><h6>Bulk All Quotation List <i>Batch # : {bulkQuotationIndividualTable[0] && bulkQuotationIndividualTable[0]["BATCH_#"]}</i></h6></div>
                          <div className="excel-download" onClick={handleCSVDownload}><img src={excelIcon} alt="" /></div>
                        </div>
                        <div className="buy-policy-body">
                          <Table
                            columns={bulkQuotationIndividualColumns}
                            dataSource={bulkQuotationIndividualTable}
                            scroll={{ x: "max-content" }}
                          />
                        </div>
                      </>
                      :
                      <>
                        <div className="buy-policy-header">
                          <span onClick={backAllQuotationHandle}><img src={arrow} alt="" /> Back</span>
                          <div><h6>Individual Quotation List <i>Quote # : {quotationDetails?.value?.QUOTATION_NUMBER}</i></h6></div>
                        </div>
                        <div className="buy-policy-by-id">
                          <ul>
                            <li><b>Quotation Number :</b><span>{quotationDetails?.value?.QUOTATION_NUMBER}</span></li>
                            <li><b>First Name :</b><span>{quotationDetails.value.FIRST_NAME}</span></li>
                            <li><b>Last Name :</b><span>{quotationDetails.value.LAST_NAME}</span></li>
                            <li><b>Gender :</b><span>{quotationDetails.value.GENDER == "F" ? "Female" : quotationDetails.value.GENDER == "M" ? "Male" : quotationDetails.value.GENDER == "O" ? "Others" : quotationDetails.value.GENDER}</span></li>
                            <li><b>Date Of Birth :</b><span>{moment(quotationDetails.value.DOB).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Email Id :</b><span>{quotationDetails.value.EMAIL_ID}</span></li>
                            <li><b>Mobile Number :</b><span>{quotationDetails.value.MOBILE_NUMBER}</span></li>
                            <li><b>Quotation Valid From :</b><span>{moment(quotationDetails.value.Quotation_Valid_From).format("DD-MM-YYYY")}</span></li>
                            <li><b>Quotation Valid To :</b><span>{moment(quotationDetails.value.Quotation_Valid_To).format("DD-MM-YYYY")}</span></li>
                            <li><b>Device Serial Number :</b><span>{quotationDetails.value.DEVICE_SERIAL_NUMBER}</span></li>
                            <li><b>Device Type :</b><span>{quotationDetails.value.DEVICE_TYPE?.toUpperCase()}</span></li>
                            <li><b>Device Make :</b><span>{quotationDetails.value.DEVICE_MAKE}</span></li>
                            <li><b>Device Model :</b><span>{quotationDetails.value.DEVICE_MODAL}</span></li>
                            <li><b>IMEI Number :</b><span>{quotationDetails.value.IMEI_NUMBER}</span></li>
                            <li><b>Date of Purchase :</b><span>{moment(quotationDetails.value.DATE_OF_PURCHASE).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Invoice Proof Url :</b><span>{quotationDetails.value.POLICY_DOCUMENT_URL !== null ? quotationDetails.value.POLICY_DOCUMENT_URL : "N/A"}</span></li>
                            <li><b>ID Type :</b><span>{quotationDetails.value.ID_TYPE?.replaceAll("_", " ")}</span></li>
                            <li><b>ID Number :</b><span>{quotationDetails.value.ID_NUMBER}</span></li>
                            <li><b>KYC Status :</b> {quotationDetails.value.IS_KYC === "0" ? <span className="fail-status">failed</span> : quotationDetails.value.IS_KYC == "2" ? <span className="pending-status">Pending</span> : quotationDetails.value.IS_KYC == "1" ? <span className="na-status">Success</span> : <span className="na-status">N/A</span>}</li>
                            <li><b>Sum Insured :</b><span>{quotationDetails.value.Sum_Insured.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                            <li><b>Premium :</b><span>{quotationDetails.value.Premium.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                          </ul>
                        </div>
                      </>
                    }
                  </>
                }
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Bulk Quotation (failed)" key="bulkQuotationFailed">
              <div className="buy-policy-data">
                {bulkQuotationDetails.error === false ?
                  <>
                    <div className="buy-policy-header">
                      <h6>Bulk Quotation List (failed)</h6>
                    </div>
                    <div className="buy-policy-body">
                      {isDataStatus ?
                        <div className="policy-no-data">
                          <img src={noData} alt="" />
                          <h6>There is presently no user data available</h6>
                        </div>
                        :
                        <>
                          <Table
                            columns={bulkQuotationColumns}
                            dataSource={bulkQuotationTableData}
                            scroll={{ x: "max-content" }}
                            pagination={false}
                          />
                          <Pagination
                            current={currentPage}
                            onChange={paginationHandle}
                            total={bulkQuotationTablePagination}
                            pageSize={perPage}
                          />
                        </>
                      }
                    </div>
                  </>
                  :
                  <>
                    {quotationDetails.error === false ?
                      <>
                        <div className="buy-policy-header">
                          <span onClick={backBulkQuotationHandle}><img src={arrow} alt="" /> Back</span>
                          <div><h6>Bulk All Quotation List <i>Batch # : {bulkQuotationIndividualTable[0] && bulkQuotationIndividualTable[0]["BATCH_#"]}</i></h6></div>
                          <div className="excel-download" onClick={handleCSVDownload}><img src={excelIcon} alt="" /></div>
                        </div>
                        <div className="buy-policy-body">
                          <Table
                            columns={bulkQuotationIndividualColumns}
                            dataSource={bulkQuotationIndividualTable}
                            scroll={{ x: "max-content" }}
                          />
                        </div>
                      </>
                      :
                      <>
                        <div className="buy-policy-header">
                          <span onClick={backAllQuotationHandle}><img src={arrow} alt="" /> Back</span>
                          <div><h6>Individual Quotation List <i>Quote # : {quotationDetails?.value?.QUOTATION_NUMBER}</i></h6></div>
                        </div>
                        <div className="buy-policy-by-id">
                          <ul>
                            <li><b>Quotation Number :</b><span>{quotationDetails?.value?.QUOTATION_NUMBER}</span></li>
                            <li><b>First Name :</b><span>{quotationDetails.value.FIRST_NAME}</span></li>
                            <li><b>Last Name :</b><span>{quotationDetails.value.LAST_NAME}</span></li>
                            <li><b>Gender :</b><span>{quotationDetails.value.GENDER == "F" ? "Female" : quotationDetails.value.GENDER == "M" ? "Male" : quotationDetails.value.GENDER == "O" ? "Others" : quotationDetails.value.GENDER}</span></li>
                            <li><b>Date Of Birth :</b><span>{moment(quotationDetails.value.DOB).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Email Id :</b><span>{quotationDetails.value.EMAIL_ID}</span></li>
                            <li><b>Mobile Number :</b><span>{quotationDetails.value.MOBILE_NUMBER}</span></li>
                            <li><b>Quotation Valid From :</b><span>{moment(quotationDetails.value.Quotation_Valid_From).format("DD-MM-YYYY")}</span></li>
                            <li><b>Quotation Valid To :</b><span>{moment(quotationDetails.value.Quotation_Valid_To).format("DD-MM-YYYY")}</span></li>
                            <li><b>Device Serial Number :</b><span>{quotationDetails.value.DEVICE_SERIAL_NUMBER}</span></li>
                            <li><b>Device Type :</b><span>{quotationDetails.value.DEVICE_TYPE?.toUpperCase()}</span></li>
                            <li><b>Device Make :</b><span>{quotationDetails.value.DEVICE_MAKE}</span></li>
                            <li><b>Device Model :</b><span>{quotationDetails.value.DEVICE_MODAL}</span></li>
                            <li><b>IMEI Number :</b><span>{quotationDetails.value.IMEI_NUMBER}</span></li>
                            <li><b>Date of Purchase :</b><span>{moment(quotationDetails.value.DATE_OF_PURCHASE).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Invoice Proof Url :</b><span>{quotationDetails.value.POLICY_DOCUMENT_URL !== null ? quotationDetails.value.POLICY_DOCUMENT_URL : "N/A"}</span></li>
                            <li><b>ID Type :</b><span>{quotationDetails.value.ID_TYPE?.replaceAll("_", " ")}</span></li>
                            <li><b>ID Number :</b><span>{quotationDetails.value.ID_NUMBER}</span></li>
                            <li><b>KYC Status :</b> {quotationDetails.value.IS_KYC === "0" ? <span className="fail-status">failed</span> : quotationDetails.value.IS_KYC == "2" ? <span className="pending-status">Pending</span> : quotationDetails.value.IS_KYC == "1" ? <span className="na-status">Success</span> : <span className="na-status">N/A</span>}</li>
                            <li><b>Sum Insured :</b><span>{quotationDetails.value.Sum_Insured.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                            <li><b>Premium :</b><span>{quotationDetails.value.Premium.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                          </ul>
                        </div>
                      </>
                    }
                  </>
                }
              </div>
            </Tabs.TabPane>
          </Tabs>

          {quotationDetails.error === true ?
            <div className={sorting ? "buy-policy-bottom order-change" : "buy-policy-bottom"}>
              <span className="sorting"><i onClick={sortingHandle}>{sorting ? <>Oldest First <SortDescendingOutlined /> </> : <>Newest First <SortAscendingOutlined /> </>}</i></span>
              <Tabs defaultActiveKey="history" onChange={commentTabChange}>
                <Tabs.TabPane tab="History" key="history">
                  <div className="buy-policy-data history-section">
                    <div className="buy-policy-body">
                      <ul>
                        {quotationHistoryData.map((item, index) => {
                          return (
                            <li key={index} className={item.REMARK != "KYC Failed" ? "success" : "fail"}>
                              <b>Insured Name : {item.FIRST_NAME} {item.LAST_NAME}</b>
                              <ul>
                                <li>Device Serial Number :  <b>{item.DEVICE_SERIAL_NUMBER}</b></li>
                                <li>Created On :  <b>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</b></li>
                                <li>Updated On :  <b>{moment(item?.UPDATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</b></li>
                                <li>Updated By : <b>{item.UPDATED_BY}</b></li>
                                <li>Remark :  <b className={item.REMARK != "KYC Failed" ? "success" : "fail"}>{item.REMARK}</b></li>
                              </ul>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Comment" key="comment">
                  <div className="buy-policy-data comment-section">
                    <div className="buy-policy-body">
                      <Form
                        name="commentForm"
                        onFinish={commentHandle}
                        autoComplete="off"
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

                      <ul>
                        {quotationCommentsData?.map((item, index) => {
                          return (
                            <li key={index}>
                              <b><span>{item?.USER_ID === null ? "" : item?.USER_ID[0]}</span> {item?.USER_ID} <i>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</i></b>
                              <span dangerouslySetInnerHTML={{ __html: item.COMMENT }}></span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </div>
            :
            <></>
          }
        </section>
      </div>

      <Modal width={1050} centered title={"Quotation Details : " + `${policyFormData["Quote_#!"] ? policyFormData["Quote_#!"] : policyFormData["Quote_#"] ? policyFormData["Quote_#"] : policyFormData["QUOTATION_NUMBER"]}`} className="policy-modal" visible={showModal} onCancel={handleCancel}>
        <Form
          form={policyForm}
          name="basic"
          onFinish={policyDetailsHandle}
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
            rules={[
              {
                required: true,
                message: 'Enter your First Name!',
              },
            ]}
          >
            <Input onKeyPress={alphaHandleKeyDown} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="Middle Name"
            name="middleName"
          >
            <Input onKeyDown={alphaHandleKeyDown} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: 'Enter your Last Name!' }]}
          >
            <Input onKeyPress={alphaHandleKeyDown} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="Mobile No"
            name="mobileNumber"
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            label="Email Id"
            name="email"
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            label="Date of Birth"
            name="dob"
            rules={[{ required: true, message: 'Select your Date of Birth!' }]}
          >
            <DatePicker
              onChange={(a, b) => {
                setDateOfBirth(b.split("/").join("-"));
              }}
              disabledDate={dobDisabledDate}
            />
          </Form.Item>
          <Form.Item
            label="Device Serial No"
            name="deviceSerialNumber"
          >
            <Input readOnly />
          </Form.Item>
          <Form.Item
            label="Device Make"
            name="deviceMake"
            rules={[{ required: true, message: 'Enter Device Make!' }]}
          >
            <Input onKeyDown={alphaNumeric2HandleKeyDown} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="Device Model"
            name="deviceModal"
            rules={[{ required: true, message: 'Enter Device Model!' }]}
          >
            <Input onKeyDown={alphaNumeric2HandleKeyDown} maxLength={20} />
          </Form.Item>
          <Form.Item
            label="Device Type"
            name="deviceType"
            rules={[{ required: true, message: 'Enter Device Type!' }]}
          >
            <Input onKeyDown={alphaNumeric2HandleKeyDown} maxLength={20} />
          </Form.Item>
          <div className="tooltip-input-item">
            <Tooltip title="Please provide device IMEI Number" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="IMEI No"
              name="imeiNumber"
            >
              <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={20} />
            </Form.Item>
          </div>
          <Form.Item
            label="Device Value"
            name="deviceValue"
          >
            <Input readOnly />
          </Form.Item>
          <div className="tooltip-input-item">
            <Tooltip title="Please provide device date of purchase" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Date of Purchase"
              name="dateOfPurchase"
              rules={[{ required: true, message: 'Select your Date of Purchase!' }]}
            >
              <DatePicker
                onChange={(a, b) => {
                  setStartDate2(b.split("/").join("-"));
                }}
                disabledDate={dateOfPurchaseDisbaled}
              />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Please provide Proof of Purchase/ invoice web URL" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Invoice Proof URL"
              name="invoiceProofUrl"
              // rules={[{ required: true, message: 'Enter Invoice Proof URL!' }]}
              rules={[
                {
                  required: true,
                  validator(_, value) {
                    let error;
                    if (urlValidation.value !== null) {
                      if (urlValidation.error === true) {
                        error = "Enter valid Invoice Proof URL!"
                      }
                    } else {
                      error = "Enter Invoice Proof URL!"
                    }
                    return error ? Promise.reject(error) : Promise.resolve();
                  },
                },
              ]}
            >
              <Input onChange={urlHandleKeyDown} />
            </Form.Item>
          </div>
          <Form.Item
            label="ID Type"
            name="idType"
            rules={[{ required: true, message: 'Select your ID Type!' }]}
          >
            <Select onChange={idTypeHandle}>
              <Option value="PVC">Permanent Voters Card</Option>
              {/* <Option value="NIN">National Identity Card</Option> */}
              <Option value="BVN">BVN</Option>
              <Option value="DRIVERS_LICENSE">Driver's Licence</Option>
              <Option value="INTERNATIONAL_PASSPORT">International Passport</Option>
            </Select>
          </Form.Item>
          {idType === "PVC" ?
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
              : idType === "DRIVERS_LICENSE" ?
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
                : idType === "INTERNATIONAL_PASSPORT" ?
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
                  :
                  <></>
          }
          <Form.Item>
            <Button htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal centered title="Policy Status" className="policy-status-modal" visible={policyModal} onCancel={handleCancel}>
        <h6>{policyMsg}</h6>
        {/* {policyId === "" ? <></> : <Button onClick={continuePayHandle}>Continue to Pay</Button>} */}
      </Modal>

      <Modal centered title="Verify Status" className="policy-verify-modal" visible={policyVerifyModal} onCancel={handleCancel}>
        <h6 style={{ textAlign: "center" }}>{policyVerifyMsg} <span className="success-blink">{policyNumber}</span>.</h6>
        {
          isBulk == false ?
            <>
              <p style={{ textAlign: "center", marginTop: "15px" }}>
                <Button style={{ background: "#4cc9f0" }} onClick={() => buyPolicyHandle(singlePaymentVerifyResponse)}>Complete KYC</Button>
              </p>
            </>
            :
            <></>
        }
      </Modal>

      <Modal width={700} centered title="Pay Quote" className="payment-method-modal" visible={paymentMethodModal} onCancel={handleCancel}>
        {paymentMethodStatus.response === false ?
          <>
            <div className="buy-policy-payment-card">
              <div className="policy-payment-card-header">
                <div className="product-name">
                  <Button>
                    Device Insurance
                  </Button>
                </div>
                <div className="payment-card-logo">
                  <img src={logo} />
                </div>
              </div>
              <div className="card-premium">
                <div className="card-premium-icon">
                  <img src={buyPolicyPaymentImage} />
                </div>
                <div className="card-premium-amount">
                  <span>Premium</span>
                  <h4>{Number(bulkBuyPolicyPaymentData.PREMIUM_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</h4>
                </div>
                <div className="quote-details">
                  <h4>Quote No: {bulkBuyPolicyPaymentData.QUOTATION_NUMBER}</h4>
                  <h5>Quote Date: {moment(bulkBuyPolicyPaymentData.VALID_FROM).format("DD-MM-YYYY")}</h5>
                </div>
              </div>
              <div className="card-info">
                <div className="card-info-col">
                  <h3 style={{ lineHeight: "1.5" }}>Customer Name: <br /><span style={{ fontSize: "14px", fontWeight: "500" }}>{bulkBuyPolicyPaymentData.CUSTOMER_NAME == null ? "N/A" : bulkBuyPolicyPaymentData.CUSTOMER_NAME}</span></h3>
                  <p>
                    <span><img src={iconLocation} />{bulkBuyPolicyPaymentData.ADDRESS == null ? "N/A" : bulkBuyPolicyPaymentData.ADDRESS}</span>
                    <span><img src={iconPhone} />{bulkBuyPolicyPaymentData.MOBILE_NUMBER == null ? "N/A" : bulkBuyPolicyPaymentData.MOBILE_NUMBER}</span>
                    <span><img src={iconEmail} />{bulkBuyPolicyPaymentData.EMAIL_ID == null ? "N/A" : bulkBuyPolicyPaymentData.EMAIL_ID}</span>
                  </p>
                </div>
                <div className="card-info-col">
                  <h3>{bulkBuyPolicyPaymentData.NO_OF_DEVICE}</h3>
                  <p>
                    No. of Devices
                  </p>
                </div>
                <div className="card-info-col">
                  <h3>{bulkBuyPolicyPaymentData.PREMIUM_PERCENTAGE}%</h3>
                  <p>
                    Insurance Rate
                  </p>
                </div>
              </div>
              <div className="card-validity">
                <p>Invoice Validity</p>
                <p>
                  <span>From: {moment(bulkBuyPolicyPaymentData.VALID_FROM).format("DD-MM-YYYY")}</span>
                  <span>To: {moment(bulkBuyPolicyPaymentData.VALID_TO).format("DD-MM-YYYY")}</span>
                </p>
              </div>
            </div>
            <h4>Payment Method</h4>
            <Form
              className="bulk-payment-form"
              form={deviceFormPay}
              onFinish={paymentMethodHandle}
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
                      Wallet ({Number(bulkBuyPolicyPaymentData.BALANCE_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })})
                    </div>
                  </Radio>
                  <Radio value="Payment Gateway">
                    <div className="payment-radio">
                      <CreditCardOutlined />
                      Payment Gateway
                    </div>
                  </Radio>
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
          </>
          :
          <>
            <h6 style={{ textAlign: "center" }}>{paymentMethodStatus?.value}</h6>
            {
              isBulk == false && paymentMethodStatus?.error == false ?
                <>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    <Button onClick={() => buyPolicyHandle(deviceBuyPolicyPaymentResponse)}>Complete KYC</Button>
                  </p>
                </>
                :
                <></>
            }
          </>
        }
      </Modal>
    </>
  );
}

DeviceBuyPolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  deviceBuyPolicy: makeSelectDeviceBuyPolicy()
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
)(DeviceBuyPolicy);
