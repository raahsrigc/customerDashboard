/**
 *
 * DevicePolicy
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDevicePolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';

import TopBar from '../../components/TopBar/Loadable';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import DatePicker from 'antd/es/date-picker';
import Modal from 'antd/es/modal';
import Tabs from 'antd/es/tabs';
import Spin from 'antd/es/spin'
import moment from "moment";
import Highlighter from "react-highlight-words";
import notification from 'antd/es/notification';
import arrow from '../../images/arrow.svg';
import excelIcon from '../../images/excel-icon.png';
import certificateImage from '../../images/certificate.jpg';
import Certificate from '../../components/Certificate';
import noData from "../../images/no-data.svg";
import { SearchOutlined, SortDescendingOutlined, SortAscendingOutlined } from '@ant-design/icons';
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { summaryDataDeviceApi, getAllPolicyDeviceApi, getQuotationsByIdDeviceApi, getBulkPolicyDeviceApi, getBulkByBatchDeviceApi, getCommentDeviceApi, commentDeviceApi, getHistoryDeviceApi, getPaymentHistoryApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function DevicePolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {

  useInjectReducer({ key: "devicePolicy", reducer });
  useInjectSaga({ key: "devicePolicy", saga });

  const title = "Device Policy";
  const [allLoading, setAllLoading] = useState(false);

  const { TextArea } = Input;
  const [commentForm] = Form.useForm();
  const [isBulk, setIsBulk] = useState(false);
  const [cardStatsData, setCardStatsData] = useState({});
  const [quotationDetails, setQuotationDetails] = useState({ value: null, error: false });
  const [bulkQuotationDetails, setBulkQuotationDetails] = useState({ value: null, error: false });
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startMonthDate, setStartMonthDate] = useState("");
  const [endMonthDate, setEndMonthDate] = useState("");
  const [visible, setVisible] = useState(false);
  const [reset, setReset] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [columns, setColumns] = useState([]);
  const [buyPolicyData, setBuyPolicyData] = useState([]);
  const [buyPolicyPagination, setBuyPolicyPagination] = useState("");
  const [bulkPolicyColumns, setBulkPolicyColumns] = useState([]);
  const [bulkPolicyTableData, setBulkPolicyTableData] = useState([]);
  const [bulkPolicyTablePagination, setBulkPolicyTablePagination] = useState("");
  const [bulkPolicyIndividualColumns, setBulkPolicyIndividualColumns] = useState([]);
  const [bulkPolicyIndividualTableData, setBulkPolicyIndividualTableData] = useState([]);
  const [bulkCSVData, setBulkCSVData] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [commentSubmitBtn, setCommentSubmitBtn] = useState(false);
  const [quotationCommentsData, setQuotationCommentsData] = useState([]);
  const [quotationHistoryData, setQuotationHistoryData] = useState([]);
  const [devicePaymentHistoryData, setDevicePaymentHistoryData] = useState();
  const [insuranceCertificateVisible, setInsuranceCertificateVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  let searchInput1;

  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);
  const [isDataStatus, setIsDataStatus] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;


  function addressHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9(!@#$&-+:',./) ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
      return false;
    }
  }

  const tabChange = (key) => {
    setBuyPolicyData([])
    setColumns([])
    setBuyPolicyPagination("")
    form.resetFields();
    setStartDate("");
    setEndDate("");
    setReset(true);
    setVisible(false);
    setQuotationDetails({ value: null, error: false });
    setBulkQuotationDetails({ value: null, error: false });
    if (key === "bulkPolicy") {
      setIsBulk(true);
    } else {
      setIsBulk(false);
    }
  };

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

  useEffect(() => {
    if (searchTableHandle) {
      if (!isBulk) {
        getBuyPolicyHandle(1, perPage);
      } else {
        getBulkPolicyHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (!isBulk) {
      getBuyPolicyHandle(pageNumber, pageCount);
    } else {
      getBulkPolicyHandle(pageNumber, pageCount);
    }
  }


  const getBuyPolicyHandle = (pageNumber, pageCount, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    setAllLoading(true)
    getAllPolicyDeviceApi(tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.responseCode === "200") {
          setBuyPolicyPagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res.data.PER_PAGE)
          setIsDataStatus(false)

          const object1 = res.data.DATA;
          object1.map(data => {
            data["Policy_#!"] = data["POLICY_#"];
            data["Device_Serial_#!"] = data["DEVICE_SERIAL_#"];
            data["Valid_From!"] = data["VALID_FROM"];
            data["Valid_Till!"] = data["VALID_TILL"];
            data["Sum_Insured!"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];
            data["Status"] = data["STATUS"];

            delete data["POLICY_#"]
            delete data["DEVICE_SERIAL_#"]
            delete data["Created_On"]
            delete data["VALID_FROM"]
            delete data["VALID_TILL"]
            delete data["SUM_INSURED"]
            delete data["PREMIUM"]
            delete data["STATUS"]
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
              if (key !== "ID" && key !== "TXN_REF_ID" && key !== "Status") {
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
                render: (x, records) => {
                  return (
                    <>
                      {records["Status"] == "1" ? <span className="success-status">Approved</span> : <span className="na-status">N/A</span>}
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Valid_From!"] = responseData["Valid_From!"] == null || responseData["Valid_From!"] == "" ? "-" : moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Valid_Till!"] = responseData["Valid_Till!"] == null || responseData["Valid_Till!"] == "" ? "-" : moment(responseData["Valid_Till!"]).format("DD-MM-YYYY");
              responseData["Policy_#!"] = responseData["Policy_#!"] === null ? "N/A" : responseData["Policy_#!"];
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBuyPolicyData(tableData);
          } else {
            setBuyPolicyData([])
            setBuyPolicyPagination("")
          }
        } else {
          setIsDataStatus(dataStatus)
          setBuyPolicyData([])
          setBuyPolicyPagination("")
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
    getBulkPolicyDeviceApi(tokenKey, startDate, endDate, startMonthDate, endMonthDate, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, "ALL", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.responseCode === "200") {
          setBulkPolicyTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res.data.PER_PAGE)
          setIsDataStatus(false)
          const object1 = res.data.DATA;
          object1.map(data => {
            data["Batch_Id!"] = data["BATCH_ID"];
            data["#_of_Proposers!"] = data["#_OF_PROPOSERS"];
            data["KYC_Success!"] = data["KYC_SUCCESS"];
            data["KYC_Failed!"] = data["KYC_FAILED"];
            data["Created_On!"] = data["CREATED_ON"];
            data["Sum_Insured"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];
            data["Status"] = data["STATUS"];
            delete data["BATCH_ID"]
            delete data["#_OF_PROPOSERS"]
            delete data["KYC_SUCCESS"]
            delete data["KYC_FAILED"]
            delete data["CREATED_ON"]
            delete data["SUM_INSURED"]
            delete data["PREMIUM"]
            delete data["STATUS"]
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
              if (key !== "Status" && key !== "IS_ENABLED") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => { record.IS_ENABLED == "Y" ? getBulkByBatchHandle(record) : <></> }
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
                      {records.Status == "1" ? <span className="success-status">Approved</span> : <span className="na-status">N/A</span>}
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setBulkPolicyColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["KYC_Success!"] = responseData["KYC_Success!"] == 0 ? "0" : responseData["KYC_Success!"];
              responseData["KYC_Failed!"] = responseData["KYC_Failed!"] == 0 ? "0" : responseData["KYC_Failed!"];
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Sum_Insured"] = Number(responseData["Sum_Insured"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBulkPolicyTableData(tableData);
          } else {
            setBulkPolicyTableData([])
            setBulkPolicyTablePagination("")
          }
        } else {
          setIsDataStatus(dataStatus)
          setBulkPolicyTableData([])
          setBulkPolicyTablePagination("")
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
    setVisible(true);
    setQuotationDetails({ value: null, error: false })
    setBulkQuotationDetails({ value: null, error: false })
    if (!isBulk) {
      getBuyPolicyHandle("", "", "");
    } else {
      getBulkPolicyHandle("", "", "");
    }
  }

  const onReset = () => {
    form.resetFields();
    setStartDate("");
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
        getBuyPolicyHandle("", "", "");
      } else {
        getBulkPolicyHandle("", "", "");
      }
    }
  }, [reset])

  useEffect(() => {
    if (userData?.token && startMonthDate) {
      if (!isBulk) {
        getBuyPolicyHandle("", "", "", true);
      } else {
        getBulkPolicyHandle("", "", "", true);
      }
    }
  }, [(startMonthDate || isBulk) && userData?.token])

  const getQuotationsByIdHandle = (data) => {
    getQuotationsByIdDeviceApi(tokenKey, data?.POLICY_ID ? data?.POLICY_ID : data?.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setQuotationDetails({ value: res?.data, error: true })
          getQuotationComments(res?.data?.DEVICE_ID)
          getQuotationRequestHistory(res?.data?.DEVICE_ID)
          getDevicePaymentHistoryHandle(res?.data?.POLICY_ID)
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

  const getBulkByBatchHandle = (data) => {
    setAllLoading(true)
    getBulkByBatchDeviceApi(tokenKey, data["Batch_Id!"], 1, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
        if (res.status === true) {
          setBulkQuotationDetails({ value: null, error: true })
          const object1 = res.data;
          object1.map(data => {
            data["Policy_#!"] = data["POLICY_#"];
            data["Device_Serial_#!"] = data["DEVICE_SERIAL_#"];
            data["Email_Id!"] = data["EMAIL_ID"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["Policy_Valid_From!"] = data["VALID_FROM"];
            data["Policy_Valid_Till!"] = data["VALID_TO"];
            data["Sum_Insured!"] = data["SUM_INSURED"];
            data["Premium!"] = data["PREMIUM"];

            delete data["STATUS"]
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
            delete data["PREMIUM"]
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
              if (key !== "Id" && key !== "POLICY_ID" && key !== "BATCH_#" && key !== "ID_TYPE" && key !== "ID_#" && key !== "DATE_OF_PURCHASE" && key !== "FIRST_NAME" && key !== "MIDDLE_NAME" && key !== "LAST_NAME" && key !== "IS_KYC") {
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
                      {records.IS_KYC == "1" ? <span className="success-status">Success</span> : <span className="failed">Failed</span>}
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setBulkPolicyIndividualColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Policy_Valid_From!"] = responseData["Policy_Valid_From!"] == null || responseData["Policy_Valid_From!"] == "" ? "-" : moment(responseData["Policy_Valid_From!"]).format("DD-MM-YYYY");
              responseData["Policy_Valid_Till!"] = responseData["Policy_Valid_Till!"] == null || responseData["Policy_Valid_Till!"] == "" ? "-" : moment(responseData["Policy_Valid_Till!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              responseData["Premium!"] = Number(responseData["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              return { key: index++, ...responseData }
            })
            setBulkPolicyIndividualTableData(tableData);
            setBulkCSVData(object1)
          } else {
            setBulkPolicyIndividualTableData([])
            setBulkCSVData([])
          }
        } else {
          setBulkPolicyIndividualTableData([])
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
        obj['Title'] = item.TITLE
        obj['First Name'] = item.FIRST_NAME
        obj['Middle Name'] = item.MIDDLE_NAME
        obj['Last Name'] = item.LAST_NAME
        obj['Email Id'] = item["Email_Id!"]
        obj['Mobile Number'] = item["Mobile_#!"]
        obj['Policy #'] = item["Policy_#!"]
        obj['Device Serial #'] = item["Device_Serial_#!"]
        obj['Id Type'] = item["ID_TYPE"]
        obj['Id Number'] = item["ID_#"]
        obj['Date Of Purchase'] = moment(item.DATE_OF_PURCHASE).format("DD-MM-YYYY");
        obj['Sum_Insured'] = Number(item["Sum_Insured!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
        obj['Premium'] = Number(item["Premium!"]).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
        obj['KYC Status'] = item.IS_KYC == "1" ? "Success" : "Failed"
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
      Sheets: { [`Bulk Policy List`]: ws },
      SheetNames: [`Bulk Policy List`],
    };
    const excelBuffer = XLSX.write(wb, {
      bookType: 'csv',
      type: 'array'
    });
    const data1 = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data1, `${bulkPolicyIndividualTableData[0] && bulkPolicyIndividualTableData[0]["BATCH_#"]}-Bulk-Policy-List-${datestring}${fileExtension}`);
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

  const getDevicePaymentHistoryHandle = (data) => {
    getPaymentHistoryApi(tokenKey, data, "", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status == true) {
          setDevicePaymentHistoryData(res.data)
        } else {
          setDevicePaymentHistoryData([]);
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

  const sortingHandle = () => {
    setSorting(!sorting)
  }

  const certificateModalHandle = () => {
    setInsuranceCertificateVisible(true);
  };

  const handleCancel = () => {
    setInsuranceCertificateVisible(false);
  };

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}

        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />

        <div className="device-policy-section" onClick={outSideClick}>
          <div className="policy-card-inner">
            <div className="policy-card">
              <p># Policy Generated</p>
              <h2>{cardStatsData?.total_policy_generate ? cardStatsData?.total_policy_generate : 0}</h2>
            </div>
            <div className="policy-card">
              <p># Success Payment</p>
              <h2>{cardStatsData?.success_payment ? cardStatsData?.success_payment : 0}</h2>
            </div>
          </div>

          <div className="all-policy-form">
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

          <Tabs defaultActiveKey="individualPolicy" onChange={tabChange}>
            <Tabs.TabPane tab="Individual Policy" key="individualPolicy">
              <div className="all-policy-data">
                {quotationDetails.error === false ?
                  <>
                    <div className="all-policy-header">
                      <h6>All Policy List</h6>
                    </div>
                    <div className="all-policy-body">
                      <Table
                        columns={columns}
                        dataSource={buyPolicyData}
                        scroll={{ x: "max-content" }}
                        pagination={false}
                      />
                      <Pagination
                        current={currentPage}
                        onChange={paginationHandle}
                        total={buyPolicyPagination}
                        pageSize={perPage}
                      />
                      {/* <span className="page-count">Page {currentPage} of {totalPage}</span> */}
                    </div>
                  </>
                  :
                  <>
                    <div className="all-policy-header">
                      <div className="header-policy-title">
                        <span onClick={backAllQuotationHandle}><img src={arrow} alt="" /> Back</span>
                        <div><h6>Individual Policy List <i>Policy # : {quotationDetails?.value?.POLICY_NUMBER}</i></h6></div>
                      </div>
                      {/* <div className="insurance-certificate" onClick={certificateModalHandle}>
                        <i><img src={certificateImage} alt="" /></i> <b>Insurance Certificate</b>
                      </div> */}
                      <div className="insurance-certificate">
                        <i><a href={quotationDetails?.value?.CERTIFICATE_URL} target="_blank" rel="noopener noreferrer" download><img src={certificateImage} alt="" /></a></i> <b>Certificate</b>
                      </div>
                    </div>
                    <div className="all-policy-by-id">
                      <ul>
                        <li><b>Policy Number :</b><span>{quotationDetails?.value?.POLICY_NUMBER}</span></li>
                        <li><b>Title :</b><span>{quotationDetails?.value?.TITLE}</span></li>
                        <li><b>First Name :</b><span>{quotationDetails?.value?.FIRST_NAME}</span></li>
                        <li><b>Middle Name :</b><span>{quotationDetails?.value?.MIDDLE_NAME}</span></li>
                        <li><b>Last Name :</b><span>{quotationDetails?.value?.LAST_NAME}</span></li>
                        <li><b>Gender :</b><span>{quotationDetails?.value?.GENDER == "F" ? "Female" : quotationDetails?.value?.GENDER == "M" ? "Male" : quotationDetails?.value?.GENDER == "O" ? "Others" : quotationDetails?.value?.GENDER}</span></li>
                        <li><b>Date Of Birth :</b><span>{moment(quotationDetails?.value?.DOB).format("DD-MM-YYYY")}</span></li>
                        <li className="lowerCaseText"><b>Email Id :</b><span>{quotationDetails?.value?.EMAIL_ID}</span></li>
                        <li><b>Mobile Number :</b><span>{quotationDetails?.value?.MOBILE_NUMBER}</span></li>
                        <li><b>Valid From :</b><span>{moment(quotationDetails?.value?.Valid_From).format("DD-MM-YYYY")}</span></li>
                        <li><b>Valid To :</b><span>{moment(quotationDetails?.value?.Valid_To).format("DD-MM-YYYY")}</span></li>
                        <li><b>Device Serial Number :</b><span>{quotationDetails?.value?.DEVICE_SERIAL_NUMBER}</span></li>
                        <li><b>Device Type :</b><span>{quotationDetails?.value?.DEVICE_TYPE?.toUpperCase()}</span></li>
                        <li><b>Device Make :</b><span>{quotationDetails?.value?.DEVICE_MAKE}</span></li>
                        <li><b>Device Model :</b><span>{quotationDetails?.value?.DEVICE_MODAL}</span></li>
                        <li><b>IMEI Number :</b><span>{quotationDetails?.value?.IMEI_NUMBER}</span></li>
                        <li><b>Date of Purchase :</b><span>{moment(quotationDetails?.value?.DATE_OF_PURCHASE).format("DD-MM-YYYY")}</span></li>
                        <li className="lowerCaseText"><b>Invoice Proof Url :</b><span>{quotationDetails?.value?.POLICY_DOCUMENT_URL !== null ? quotationDetails?.value?.POLICY_DOCUMENT_URL : "N/A"}</span></li>
                        <li><b>ID Type :</b><span>{quotationDetails?.value?.ID_TYPE?.replaceAll("_", " ")}</span></li>
                        <li><b>ID Number :</b><span>{quotationDetails?.value?.ID_NUMBER}</span></li>
                        <li><b>KYC Status :</b> {quotationDetails?.value?.IS_KYC === "0" ? <span className="fail-status">failed</span> : quotationDetails?.value?.IS_KYC == "2" ? <span className="pending-status">Pending</span> : quotationDetails?.value?.IS_KYC == "1" ? <span className="na-status">Success</span> : <span className="na-status">N/A</span>}</li>
                        <li><b>Sum Insured :</b><span>{quotationDetails?.value?.Sum_Insured.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        <li><b>Premium :</b><span>{quotationDetails?.value?.Premium.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        <li><strong>Commission Amount :</strong><span>{Number(quotationDetails?.value?.COMMISION_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                        <li><strong>Commission Rate :</strong><span>{quotationDetails?.value?.COMMISSION_RATE}%</span></li>
                        {/* <li><b>Payment Status :</b> {quotationDetails.value.STATUS == "1" ? <span className="success-status">Success</span> : <span className="na-status">N/A</span>}</li> */}
                      </ul>
                    </div>
                  </>
                }
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Bulk Policy" key="bulkPolicy">
              <div className="all-policy-data">
                {bulkQuotationDetails.error === false ?
                  <>
                    <div className="all-policy-header">
                      <h6>Bulk Policy List</h6>
                    </div>
                    <div className="all-policy-body">
                      {isDataStatus ?
                        <div className="policy-no-data">
                          <img src={noData} alt="" />
                          <h6>There is presently no user data available</h6>
                        </div>
                        :
                        <>
                          <Table
                            columns={bulkPolicyColumns}
                            dataSource={bulkPolicyTableData}
                            scroll={{ x: "max-content" }}
                            pagination={false}
                          />
                          <Pagination
                            current={currentPage}
                            onChange={paginationHandle}
                            total={bulkPolicyTablePagination}
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
                        <div className="all-policy-header">
                          <div className="header-policy-title">
                            <span onClick={backBulkQuotationHandle}><img src={arrow} alt="" /> Back</span>
                            <div><h6>Bulk All Quotation List <i>Batch # : {bulkPolicyIndividualTableData[0] && bulkPolicyIndividualTableData[0]["BATCH_#"]}</i></h6></div>
                          </div>
                          <div className="excel-download" onClick={handleCSVDownload}><img src={excelIcon} alt="" /></div>
                        </div>
                        <div className="all-policy-body">
                          <Table
                            columns={bulkPolicyIndividualColumns}
                            dataSource={bulkPolicyIndividualTableData}
                            scroll={{ x: "max-content" }}
                          />
                        </div>
                      </>
                      :
                      <>
                        <div className="all-policy-header">
                          <div className="header-policy-title">
                            <span onClick={backAllQuotationHandle}><img src={arrow} alt="" /> Back</span>
                            <div><h6>Individual Policy <i>Policy # : {quotationDetails?.value?.POLICY_NUMBER}</i></h6></div>
                          </div>
                          {/* <div className="insurance-certificate" onClick={certificateModalHandle}>
                            <i><img src={certificateImage} alt="" /></i> <b>Insurance Certificate</b>
                          </div> */}
                          <div className="insurance-certificate">
                            <i><a href={quotationDetails?.value?.CERTIFICATE_URL} target="_blank" rel="noopener noreferrer" download><img src={certificateImage} alt="" /></a></i> <b>Certificate</b>
                          </div>
                        </div>
                        <div className="all-policy-by-id">
                          <ul>
                            <li><b>Policy Number :</b><span>{quotationDetails?.value?.POLICY_NUMBER}</span></li>
                            <li><b>Title :</b><span>{quotationDetails?.value?.TITLE == null ? "-" : quotationDetails?.value?.TITLE}</span></li>
                            <li><b>First Name :</b><span>{quotationDetails?.value?.FIRST_NAME == null ? "-" : quotationDetails?.value?.FIRST_NAME}</span></li>
                            <li><b>Middle Name :</b><span>{quotationDetails?.value?.MIDDLE_NAME == null ? "-" : quotationDetails?.value?.MIDDLE_NAME}</span></li>
                            <li><b>Last Name :</b><span>{quotationDetails?.value?.LAST_NAME == null ? "-" : quotationDetails?.value?.LAST_NAME}</span></li>
                            <li><b>Gender :</b><span>{quotationDetails?.value?.GENDER == "F" ? "Female" : quotationDetails?.value?.GENDER == "M" ? "Male" : quotationDetails?.value?.GENDER == "O" ? "Others" : quotationDetails?.value?.GENDER}</span></li>
                            <li><b>Date Of Birth :</b><span>{moment(quotationDetails?.value?.DOB).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Email Id :</b><span>{quotationDetails?.value?.EMAIL_ID}</span></li>
                            <li><b>Mobile Number :</b><span>{quotationDetails?.value?.MOBILE_NUMBER}</span></li>
                            <li><b>Valid From :</b><span>{moment(quotationDetails?.value?.Valid_From).format("DD-MM-YYYY")}</span></li>
                            <li><b>Valid To :</b><span>{moment(quotationDetails?.value?.Valid_To).format("DD-MM-YYYY")}</span></li>
                            <li><b>Device Serial Number :</b><span>{quotationDetails?.value?.DEVICE_SERIAL_NUMBER}</span></li>
                            <li><b>Device Type :</b><span>{quotationDetails?.value?.DEVICE_TYPE?.toUpperCase()}</span></li>
                            <li><b>Device Make :</b><span>{quotationDetails?.value?.DEVICE_MAKE}</span></li>
                            <li><b>Device Model :</b><span>{quotationDetails?.value?.DEVICE_MODAL}</span></li>
                            <li><b>IMEI Number :</b><span>{quotationDetails?.value?.IMEI_NUMBER}</span></li>
                            <li><b>Date of Purchase :</b><span>{moment(quotationDetails?.value?.DATE_OF_PURCHASE).format("DD-MM-YYYY")}</span></li>
                            <li className="lowerCaseText"><b>Invoice Proof Url :</b><span>{quotationDetails?.value?.POLICY_DOCUMENT_URL !== null ? quotationDetails?.value?.POLICY_DOCUMENT_URL : "N/A"}</span></li>
                            <li><b>ID Type :</b><span>{quotationDetails?.value?.ID_TYPE?.replaceAll("_", " ")}</span></li>
                            <li><b>ID Number :</b><span>{quotationDetails?.value?.ID_NUMBER}</span></li>
                            <li><b>KYC Status :</b> {quotationDetails?.value?.IS_KYC === "0" ? <span className="fail-status">failed</span> : quotationDetails?.value?.IS_KYC == "2" ? <span className="pending-status">Pending</span> : quotationDetails?.value?.IS_KYC == "1" ? <span className="na-status">Success</span> : <span className="na-status">N/A</span>}</li>
                            <li><b>Sum Insured :</b><span>{quotationDetails?.value?.Sum_Insured.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                            <li><b>Premium :</b><span>{quotationDetails?.value?.Premium.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                            <li><strong>Commission Amount :</strong><span>{Number(quotationDetails?.value?.COMMISION_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                            <li><strong>Commission Rate :</strong><span>{quotationDetails?.value?.COMMISSION_RATE}%</span></li>
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
            <div className={sorting ? "all-policy-bottom order-change" : "all-policy-bottom"}>
              <span className="sorting"><i onClick={sortingHandle}>{sorting ? <>Oldest First <SortDescendingOutlined /> </> : <>Newest First <SortAscendingOutlined /> </>}</i></span>
              <Tabs defaultActiveKey="history" onChange={commentTabChange}>
                <Tabs.TabPane tab="History" key="history">
                  <div className="all-policy-data history-section">
                    <div className="all-policy-body">
                      <ul>
                        {quotationHistoryData.map((item, index) => {
                          return (
                            <li key={index} className={item.REMARK != "KYC Failed" ? "success" : "fail"}>
                              <b>Insured Name : {item.FIRST_NAME} {item.LAST_NAME}</b>
                              <ul>
                                <li>Device Serial Number :  <b>{item.DEVICE_SERIAL_NUMBER}</b></li>
                                <li>Created On :  <b>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</b></li>
                                <li>Updated On :  <b>{moment(item.UPDATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</b></li>
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
                  <div className="all-policy-data comment-section">
                    <div className="all-policy-body">
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
                <Tabs.TabPane tab="Payment History" key="paymentHistory">
                  <div className="all-policy-data history-section">
                    <div className="all-policy-body">
                      {/* <ul class="paymentTabHeader">
                        <li>
                          <span>Policy Number</span>
                          <span>Transaction Date</span>
                          <span>Amount</span>
                          <span>Payment Mode</span>
                          <span>Created By</span>
                          <span>Status</span>
                        </li>
                      </ul>
                      <ul class="paymentTabData">
                        {
                          devicePaymentHistoryData?.map((item, index) => {
                            return (
                              <>
                                <li>
                                  <span>{item?.POLICY_NUMBER}</span>
                                  <span>{moment(item?.PAYMENT_DATE).format("DD-MM-YYYY HH:MM:SS")}</span>
                                  <span>{item?.PREMIUM_AMOUNT.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span>
                                  <span>{item?.PAYMENT_MODE == null ? "-" : item?.PAYMENT_MODE}</span>
                                  <span>{item?.CREATED_BY == null ? "-" : item?.CREATED_BY}</span>
                                  <span>{item?.STATUS == 0 || item?.STATUS == 3 ? "pending" : item?.STATUS == 1 ? "success" : "failed"}</span>
                                </li>
                              </>
                            )
                          })
                        }
                      </ul> */}
                      <ul>
                        {devicePaymentHistoryData?.map((item, index) => {
                          return (
                            <li key={index} className={item?.STATUS == 0 || item?.STATUS == 3 ? "pending" : item?.STATUS == 1 ? "success" : "failed"}>
                              <b>Name : {quotationDetails?.value?.FIRST_NAME} {quotationDetails?.value?.MIDDLE_NAME} {quotationDetails?.value?.LAST_NAME}</b>
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
                </Tabs.TabPane>
              </Tabs>
            </div>
            :
            <></>
          }
        </div>
      </div>

      <Modal centered className="certificate-modal" visible={insuranceCertificateVisible} onCancel={handleCancel} width={1000}>
        <Certificate quotationDetails={quotationDetails} />
      </Modal>
    </>
  );
}

DevicePolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  devicePolicy: makeSelectDevicePolicy()
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
)(DevicePolicy);
