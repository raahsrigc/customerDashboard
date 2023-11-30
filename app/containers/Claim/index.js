/**
 *
 * Claim
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectClaim from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import noData from "../../images/no-data.svg";
import BackArrow from '../../images/back-arrow.svg';
import pdfPreview from '../../images/pdf-preview.jpg';
import certificate from '../../images/certificate.jpg';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Tabs from 'antd/es/tabs';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import { SearchOutlined, SortDescendingOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { getClaimCardsApi, getClaimTableApi, getAllRegisteredClaimsApi, getAllApprovedClaimsApi, getAllSettledClaimsApi, getClaimByIdApi, getClaimHistoryApi, getCommentsApi, insertCommentApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function Claim({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "claim", reducer });
  useInjectSaga({ key: "claim", saga });

  const title = "Motor Claim";
  const { TabPane } = Tabs;
  const { TextArea } = Input;
  const [commentForm] = Form.useForm();

  const [steps, setSteps] = useState("1");
  const [allLoading, setAllLoading] = useState(false);
  const [claimType, setClaimType] = useState("All Claims");
  const [cardStatsData, setCardStatsData] = useState({});
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [columns, setColumns] = useState([]);
  const [claimData, setClaimData] = useState([]);
  const [claimByIdData, setClaimByIdData] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [commentSubmitBtn, setCommentSubmitBtn] = useState(false);
  const [isDataStatus, setIsDataStatus] = useState(false);

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;


  function addressHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9(!@#$&-+:',./) ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
      return false;
    }
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
              handleColumnSearchApi("", "")
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
    // onFilter: (value, record) => {
    //   if (record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children) {
    //     return (
    //       record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children
    //         ? record[dataIndex] && record[dataIndex].props && record[dataIndex].props.children
    //           .toString()
    //           .toLowerCase()
    //           .includes(value.toLowerCase())
    //         : ""
    //     )
    //   }
    //   return (
    //     record[dataIndex]
    //       ? record[dataIndex]
    //         .toString()
    //         .toLowerCase()
    //         .includes(value.toLowerCase())
    //       : ""
    //   )
    // },
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
    getClaimCardsApi(tokenKey, 1, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setCardStatsData(res?.data)
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
    for (var i = 0; i < colNameArr.length; i++) {
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
      if (claimType == "All Claims") {
        getClaimHandle(1, perPage);
      } else if (claimType == "Registered Claims") {
        getAllRegisteredClaimsHandle(1, perPage);
      } else if (claimType == "Approved Claims") {
        getAllApprovedClaimsHandle(1, perPage);
      } else {
        getAllSettledClaimsHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])

  const paginationHandle = (pageNumber, pageCount) => {
    if (claimType == "All Claims") {
      getClaimHandle(pageNumber, pageCount);
    } else if (claimType == "Registered Claims") {
      getAllRegisteredClaimsHandle(pageNumber, pageCount);
    } else if (claimType == "Approved Claims") {
      getAllApprovedClaimsHandle(pageNumber, pageCount);
    } else {
      getAllSettledClaimsHandle(pageNumber, pageCount);
    }
  }

  /* Quotation Table */
  const getClaimHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();
    setAllLoading(true)

    getClaimTableApi(tokenKey, pageNumber, pageCount, 1, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false)
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
            data["Claim_#!"] = data["Claim_#"];
            data["Created_On!"] = data["Created_On"];
            data["Requested_Amount!"] = data["Requested_Amount"];
            data["Approved_Amount!"] = data["Approved_Amount"];

            delete data["Insured_Name"]
            delete data["Policy_Id"]
            delete data["Policy_#"]
            delete data["Claim_#"]
            delete data["Requested_Amount"]
            delete data["Approved_Amount"]
            delete data["BRANCH"]
            delete data["Agent_Broker_Id"]
            delete data["Lob_Id"]
            delete data["Created_On"]
            delete data["Last_Modified_Date"]
            delete data["Loss_Address"]
            delete data["Loss_City"]
            delete data["Loss_Date"]
            delete data["Remarks"]
            delete data["CURRENCY"]
            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getClaimByIdHandle(record);
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
                dataIndex: 'Status',
                key: 'Status',
                ...getColumnSearchProps("Status"),
                render: (x, records) => {
                  return (
                    <>
                      {records?.Status === 7 ? <span className="closed">Closed</span> : records?.Status === 1 ? <span className="approved">Approved</span> : records?.Status === 45 ? <span className="pending">Bank Details Pending</span> : records?.Status === 6 ? <span className="settled">Settled</span> : records?.Status === 5 || records?.Status === 54 ? <span className="pending">Pending</span> : records?.Status === 46 ? <span className="updateSettlement">Update Settlement</span> : records?.Status === 43 || records?.Status === 57 ? <span className="failed">Failed</span> : records?.Status === 4 || records?.Status === 48 ? <span className="reopened">Reopened</span> : records?.Status === 55 ? <span className="pending">Settlement in Progress</span> : records?.Status === 2 ? <span className="failed">Rejected</span> : records?.Status === 39 ? <span className="approved">Approve Cancellation</span> : records?.Status === 40 ? <span className="failed">Reject Cancellation</span> : records?.Status === 41 ? <span className="pending">Hold Cancellation</span> : records?.Status === 42 ? <span className="failed">Cancelled</span> : records?.Status === 45 ? <span className="pending">Discharge Voucher Sent</span> : records?.Status === 46 ? <span className="approved">Ack Settlement</span> : records?.Status === 47 ? <span className="failed">Discharge Voucher Rejected</span> : records?.Status === 55 ? <span className="pending">Settlement in Progress</span> : records?.Status === 58 ? <span className="pending">Pending for RI Approval</span> : records?.Status === 59 ? <span className="pending">Pending From Internal Control</span> : records?.Status === 60 ? <span className="failed">Rejected From Internal Control</span> : records?.Status === 67 ? <span className="pending">Pending With Finance</span> : <></>}
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object3);
            setColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Requested_Amount!"] = Number(responseData["Requested_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Approved_Amount!"] = Number(responseData["Approved_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })
            setClaimData(tableData);
          }
        } else {
          setClaimData([])
          setTablePagination("")
          setIsDataStatus(dataStatus)
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

  const getAllRegisteredClaimsHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {

    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }

    colValue = colValue?.toString();
    setAllLoading(true);
    getAllRegisteredClaimsApi(tokenKey, pageNumber, pageCount, 1, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Claim_#!"] = data["Claim_#"];
            data["Created_On!"] = data["Created_On"];
            data["Requested_Amount!"] = data["Requested_Amount"];
            data["Approved_Amount!"] = data["Approved_Amount"];

            delete data["POLICY_ID"]
            delete data["Insured_Name"]
            delete data["Policy_#"]
            delete data["Claim_#"]
            delete data["Requested_Amount"]
            delete data["Approved_Amount"]
            delete data["STATUS"]
            delete data["BRANCH"]
            delete data["BUSINESS_TYPE"]
            delete data["CURRENCY"]
            delete data["CURRENCY"]
            delete data["LOSS_DATE"]
            delete data["LOSS_DESC"]
            delete data["NATURE_OF_LOSS"]
            delete data["QUOTATION_ID"]
            delete data["Quotation_#"]
            delete data["Created_On"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getClaimByIdHandle(record);
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
                    <span className="pending">Pending</span>
                  )
                }
              },
            ]
            dataColumn.push(...object3);

            setColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Requested_Amount!"] = Number(responseData["Requested_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Approved_Amount!"] = Number(responseData["Approved_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })

            setClaimData(tableData);
          }
        } else {
          setClaimData([])
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

  const getAllApprovedClaimsHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }

    colValue = colValue?.toString();
    setAllLoading(true);
    getAllApprovedClaimsApi(tokenKey, pageNumber, pageCount, 1, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Claim_#!"] = data["Claim_#"];
            data["Created_On!"] = data["Created_On"];
            data["Requested_Amount!"] = data["Requested_Amount"];
            data["Approved_Amount!"] = data["Approved_Amount"];

            delete data["Insured_Name"]
            delete data["Policy_Id"]
            delete data["Policy_#"]
            delete data["Claim_#"]
            delete data["Requested_Amount"]
            delete data["Approved_Amount"]
            delete data["BRANCH"]
            delete data["Agent_Broker_Id"]
            delete data["CURRENCY"]
            delete data["Created_On"]
            delete data["Lob_Id"]
            delete data["Last_Modified_Date"]
            delete data["Loss_Address"]
            delete data["Loss_City"]
            delete data["Loss_Date"]
            delete data["Remarks"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getClaimByIdHandle(record);
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
                    <span className="approved">Approved</span>
                  )
                }
              },
            ]
            dataColumn.push(...object3);

            setColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Requested_Amount!"] = Number(responseData["Requested_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Approved_Amount!"] = Number(responseData["Approved_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })
            setClaimData(tableData);
          }
        } else {
          setClaimData([])
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

  const getAllSettledClaimsHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }

    colValue = colValue?.toString();
    setAllLoading(true);
    getAllSettledClaimsApi(tokenKey, pageNumber, pageCount, 1, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Claim_#!"] = data["Claim_#"];
            data["Created_On!"] = data["Created_On"];
            data["Requested_Amount!"] = data["Requested_Amount"];
            data["Approved_Amount!"] = data["Approved_Amount"];

            delete data["Insured_Name"]
            delete data["Policy_Id"]
            delete data["Policy_#"]
            delete data["Claim_#"]
            delete data["Requested_Amount"]
            delete data["Approved_Amount"]
            delete data["BRANCH"]
            delete data["Agent_Broker_Id"]
            delete data["CURRENCY"]
            delete data["Created_On"]
            delete data["Lob_Id"]
            delete data["Last_Modified_Date"]
            delete data["Loss_Address"]
            delete data["Loss_City"]
            delete data["Loss_Date"]
            delete data["Remarks"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getClaimByIdHandle(record);
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
                    <span className="settled">Settled</span>
                  )
                }
              },
            ]
            dataColumn.push(...object3);

            setColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Requested_Amount!"] = Number(responseData["Requested_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Approved_Amount!"] = Number(responseData["Approved_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })
            setClaimData(tableData);
          }
        } else {
          setClaimData([])
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

  const getClaimByIdHandle = (data) => {
    setAllLoading(true);
    getClaimByIdApi(tokenKey, data?.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setClaimByIdData(res.data)
          setSteps("2")
          getClaimHistoryHandle(res.data);
          getCommentsHandle(res.data)
          setCommentSubmitBtn(false);
        } else {
          setClaimByIdData([])
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

  const claimCardHandle = (status) => {
    setColNameArr([])
    setColValueArr([])
    setClaimType(status)
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
    if (claimType == "All Claims") {
      getClaimHandle("", "", "", "", "", true);
    } else if (claimType == "Registered Claims") {
      getAllRegisteredClaimsHandle("", "", "", "", "", true);
    } else if (claimType == "Approved Claims") {
      getAllApprovedClaimsHandle("", "", "", "", "", true);
    } else {
      getAllSettledClaimsHandle("", "", "", "", "", true);
    }
  }, [tokenKey, claimType])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }
  const backToPolicyList = () => {
    setSteps("1");
  }

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    if (claimType == "All Claims") {
      getClaimTableApi(tokenKey, 1, 5535, 1, "", "", false, toggleBtn)
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
                obj["Insured_Name"] = item["Insured_Name"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Claim_#"] = item["Claim_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Requested_Amount"] = Number(item["Requested_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Approved_Amount"] = Number(item["Approved_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item?.Status === 7 ? "Closed" : item?.Status === 1 ? "Approved" : item?.Status === 45 ? "Bank Details Pending" : item?.Status === 6 ? "Settled" : item?.Status === 5 || item?.Status === 54 ? "Pending" : item?.Status === 46 ? "Update Settlement" : item?.Status === 43 || item?.Status === 57 ? "Failed" : item?.Status === 4 || item?.Status === 48 ? "Reopened" : item?.Status === 55 ? "Settlement in Progress" : item?.Status === 2 ? "Rejected" : item?.Status === 39 ? "Approve Cancellation" : item?.Status === 40 ? "Reject Cancellation" : item?.Status === 41 ? "Hold Cancellation" : item?.Status === 42 ? "Cancelled" : item?.Status === 45 ? "Discharge Voucher Sent" : item?.Status === 46 ? "Ack Settlement" : item?.Status === 47 ? "Discharge Voucher Rejected" : item?.Status === 55 ? "Settlement in Progress" : item?.Status === 58 ? "Pending for RI Approval" : item?.Status === 59 ? "Pending From Internal Control" : item?.Status === 60 ? "Rejected From Internal Control" : item?.Status === 67 ? "Pending With Finance" : <></>;
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
              Sheets: { [`Claims List`]: ws },
              SheetNames: [`Claims List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Claims-List-${datestring}${fileExtension}`);
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
    } else if (claimType == "Registered Claims") {
      getAllRegisteredClaimsApi(tokenKey, 1, 5535, 1, "", "", false, toggleBtn)
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
                obj["Insured_Name"] = item["Insured_Name"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Claim_#"] = item["Claim_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Requested_Amount"] = Number(item["Requested_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Approved_Amount"] = Number(item["Approved_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = "Pending";
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
              Sheets: { [`Claims List`]: ws },
              SheetNames: [`Claims List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Registered-Claims-List-${datestring}${fileExtension}`);
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
    } else if (claimType == "Approved Claims") {
      getAllApprovedClaimsApi(tokenKey, 1, 5535, 1, "", "", false, toggleBtn)
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
                obj["Insured_Name"] = item["Insured_Name"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Claim_#"] = item["Claim_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Requested_Amount"] = Number(item["Requested_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Approved_Amount"] = Number(item["Approved_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = "Approved";
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
              Sheets: { [`Claims List`]: ws },
              SheetNames: [`Claims List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Approved-Claims-List-${datestring}${fileExtension}`);
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
      getAllSettledClaimsApi(tokenKey, 1, 5535, 1, "", "", false, toggleBtn)
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
                obj["Insured_Name"] = item["Insured_Name"];
                obj["Policy_#"] = item["Policy_#"];
                obj["Claim_#"] = item["Claim_#"];
                obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
                obj["Requested_Amount"] = Number(item["Requested_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Approved_Amount"] = Number(item["Approved_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = "Settled";
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
              Sheets: { [`Claims List`]: ws },
              SheetNames: [`Claims List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `Settled-Claims-List-${datestring}${fileExtension}`);
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


  const getClaimHistoryHandle = (data) => {
    getClaimHistoryApi(tokenKey, data?.CLAIM_ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setHistoryData(res.data)
        } else {
          setHistoryData([])
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
    insertCommentApi(tokenKey, values.comment, claimByIdData?.CLAIM_ID, 119, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          commentForm.resetFields();
          getCommentsHandle(claimByIdData)
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
    getCommentsApi(tokenKey, 119, data.CLAIM_ID, toggleBtn)
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

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="claim-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="claim-card-inner">
                <div className={claimType == "All Claims" ? "claim-card active" : "claim-card"} onClick={() => claimCardHandle("All Claims")}>
                  <p>Total Claim</p>
                  <h2>{cardStatsData && cardStatsData[0]?.Total_No_of_Claim ? cardStatsData[0]?.Total_No_of_Claim : 0}</h2>
                </div>
                <div className={claimType == "Registered Claims" ? "claim-card active" : "claim-card"} onClick={() => claimCardHandle("Registered Claims")}>
                  <p>Registered Claims</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_CLAIM_REGISTERED ? cardStatsData[0]?.NO_OF_CLAIM_REGISTERED : 0}</h2>
                </div>
                <div className={claimType == "Approved Claims" ? "claim-card active" : "claim-card"} onClick={() => claimCardHandle("Approved Claims")}>
                  <p>Approved Claims</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_CLAIMS_APPROVED ? cardStatsData[0]?.NO_OF_CLAIMS_APPROVED : 0}</h2>
                </div>
                <div className={claimType == "Settled Claims" ? "claim-card active" : "claim-card"} onClick={() => claimCardHandle("Settled Claims")}>
                  <p>Settled Claims</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_CLAIMS_SETTLED ? cardStatsData[0]?.NO_OF_CLAIMS_SETTLED : 0}</h2>
                </div>
                <div className="claim-card">
                  <p>Claims MTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_CLAIM_MTD ? cardStatsData[0]?.NO_OF_CLAIM_MTD : 0}</h2>
                </div>
                <div className="claim-card">
                  <p>Claims YTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_CLAIM_YTD ? cardStatsData[0]?.NO_OF_CLAIM_YTD : 0}</h2>
                </div>
              </div>
              <div className="claim-data">
                <div className="claim-card-header">
                  <h6>Claims List</h6>
                  {!claimData.length ?
                    <></> :
                    <ul>
                      <li onClick={handleCSVDownload}>CSV Download</li>
                    </ul>
                  }
                </div>
                <div className="claim-card-body">
                  {isDataStatus ?
                    <div className="claim-no-data">
                      <img src={noData} alt="" />
                      <h6>There is presently no user data available</h6>
                    </div>
                    :
                    <>
                      <Table
                        columns={columns}
                        dataSource={claimData}
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
              <div className="underwriting-claim-header">
                <span onClick={backToPolicyList}><img src={BackArrow} /></span>
                <em>Motor Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">
                  <h6>
                    <span className="insured-name">{claimByIdData?.INSURED_NAME && claimByIdData?.INSURED_NAME[0]}</span>
                    <em className="policyTitle">
                      <span>{claimByIdData?.INSURED_NAME}</span>
                      <em>Policy No. : <strong className="policyNumber">{claimByIdData?.POLICY_NUMBER}</strong></em>
                    </em>
                  </h6>

                  {claimByIdData?.STATUS === 1 && claimByIdData?.NIID_Status == "Success" && claimByIdData?.PRODUCT_CODE != "1003" && claimByIdData?.PRODUCT_CODE != "1008" && claimByIdData?.PRODUCT_CODE != "1013" && claimByIdData?.PRODUCT_CODE != "1022" ?
                    <span class="certificate-pdf">
                      <img src={certificate} alt="" />
                      <strong>Certificate</strong>
                    </span>
                    :
                    <></>
                  }

                  {claimByIdData?.STATUS === 1 && claimByIdData.IS_KYC !== 2 ?
                    <span className="policy-pdf">
                      <a href={claimByIdData?.POLICY_DOC} target="_blank" rel="noopener noreferrer" download>
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
                      <li><strong>Insured Code :</strong><span>{claimByIdData?.INSURED_CODE}</span></li>
                      <li><strong>Insured Name :</strong><span>{claimByIdData?.INSURED_NAME === null ? "-" : claimByIdData?.INSURED_NAME}</span></li>
                      <li><strong>Policy No :</strong><span>{claimByIdData?.POLICY_NUMBER}</span></li>
                      <li><strong>Mobile :</strong><span>{claimByIdData?.MOBILE}</span></li>
                      <li><strong>Email :</strong><span>{claimByIdData?.EMAIL}</span></li>
                      <li><strong>Date of Birth :</strong><span>{claimByIdData?.INSURED_DOB === null || claimByIdData?.INSURED_DOB === "" ? "-" : moment(claimByIdData?.INSURED_DOB).format('DD-MM-YYYY')}</span></li>
                      <li><strong>Address :</strong><span>{claimByIdData?.LOSS_ADDRESS}</span></li>
                      <li><strong>State :</strong><span>{claimByIdData?.LOSS_STATE}</span></li>
                      <li><strong>LGA :</strong><span>{claimByIdData?.LOSS_CITY}</span></li>
                      <li><strong>Claim Number :</strong><span>{claimByIdData?.CLAIM_NUMBER}</span></li>
                      <li><strong>Nature of Loss :</strong><span>{claimByIdData?.NATURE_OF_LOSS}</span></li>
                      <li><strong>Cause of Loss :</strong><span>{claimByIdData?.CAUSE_OF_LOSS}</span></li>
                      <li><strong>Loss Date :</strong><span>{claimByIdData?.LOSS_DATE === null || claimByIdData?.LOSS_DATE === "" ? "-" : moment(claimByIdData?.LOSS_DATE).format('DD-MM-YYYY')}</span></li>
                      <li><strong>Loss Description :</strong><span>{claimByIdData?.LOSS_DESC}</span></li>
                      <li><strong>LOB Description :</strong><span>{claimByIdData?.LOB_DESC}</span></li>
                      <li><strong>Estimate Amount :</strong><span>{Number(claimByIdData?.ESTIMATE_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Approved Amount :</strong><span>{Number(claimByIdData?.APPROVED_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Last Modified Date:</strong><span>{claimByIdData?.LAST_MODIFIED_DATE === null || claimByIdData?.LAST_MODIFIED_DATE === "" ? "-" : moment(claimByIdData?.LAST_MODIFIED_DATE).format('DD-MM-YYYY')}</span></li>
                      <li><strong>Status :</strong><span>{claimByIdData?.CLAIM_STATUS === 7 ? <span className="closed">Closed</span> : claimByIdData?.CLAIM_STATUS === 1 ? <span className="approved">Approved</span> : claimByIdData?.CLAIM_STATUS === 45 ? <span className="pending">Bank Details Pending</span> : claimByIdData?.CLAIM_STATUS === 6 ? <span className="settled">Settled</span> : claimByIdData?.CLAIM_STATUS === 5 || claimByIdData?.CLAIM_STATUS === 54 ? <span className="pending">Pending</span> : claimByIdData?.CLAIM_STATUS === 46 ? <span className="updateSettlement">Update Settlement</span> : claimByIdData?.CLAIM_STATUS === 43 || claimByIdData?.CLAIM_STATUS === 57 ? <span className="failed">Failed</span> : claimByIdData?.CLAIM_STATUS === 4 || claimByIdData?.CLAIM_STATUS === 48 ? <span className="reopened">Reopened</span> : claimByIdData?.CLAIM_STATUS === 55 ? <span className="pending">Settlement in Progress</span> : claimByIdData?.CLAIM_STATUS === 2 ? <span className="failed">Rejected</span> : claimByIdData?.CLAIM_STATUS === 39 ? <span className="approved">Approve Cancellation</span> : claimByIdData?.CLAIM_STATUS === 40 ? <span className="failed">Reject Cancellation</span> : claimByIdData?.CLAIM_STATUS === 41 ? <span className="pending">Hold Cancellation</span> : claimByIdData?.CLAIM_STATUS === 42 ? <span className="failed">Cancelled</span> : claimByIdData?.CLAIM_STATUS === 45 ? <span className="pending">Discharge Voucher Sent</span> : claimByIdData?.CLAIM_STATUS === 46 ? <span className="approved">Ack Settlement</span> : claimByIdData?.CLAIM_STATUS === 47 ? <span className="failed">Discharge Voucher Rejected</span> : claimByIdData?.CLAIM_STATUS === 55 ? <span className="pending">Settlement in Progress</span> : claimByIdData?.CLAIM_STATUS === 58 ? <span className="pending">Pending for RI Approval</span> : claimByIdData?.CLAIM_STATUS === 59 ? <span className="pending">Pending From Internal Control</span> : claimByIdData?.CLAIM_STATUS === 60 ? <span className="failed">Rejected From Internal Control</span> : claimByIdData?.CLAIM_STATUS === 67 ? <span className="pending">Pending With Finance</span> : ""}</span></li>
                      <li><strong>Remarks :</strong><span>{claimByIdData?.REMARKS}</span></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="claim-steps3-bottom">
                <div className="underwriting-insurance-data">
                  <span className="sorting"><i onClick={sortingHandle}>{sorting ? <>Oldest First <SortDescendingOutlined /> </> : <>Newest First <SortDescendingOutlined /> </>}</i></span>
                  <Tabs defaultActiveKey="1" onChange={commentTabChange}>
                    <TabPane tab="History" key="1">
                      <div className="history">
                        <div className="claim-data">
                          <div className="claim-body">
                            <ul className={sorting ? "order-change" : ""}>
                              {
                                historyData.map((item, index) => {
                                  return (
                                    <>
                                      <li className="success">
                                        <strong>Claim No - {item?.CLAIM_NUMBER}</strong>
                                        <ul>
                                          <li>
                                            Created On :
                                            <strong> {moment(item.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')} </strong>
                                          </li>
                                          <li>
                                            Updated On :
                                            <strong> {moment(item.UPDATED_ON).format('DD-MM-YYYY hh:mm:ss A')} </strong>
                                          </li>
                                          <li>
                                            Updated By :
                                            <strong> {item?.UPDATED_BY}</strong>
                                          </li>
                                          <li>
                                            Requested Amount :
                                            <strong> {Number(item?.REQUESTED_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })} </strong>
                                          </li>
                                          <li>
                                            Approved Amount :
                                            <strong> {Number(item?.APPROVED_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })} </strong>
                                          </li>
                                          <li>
                                            Status :
                                            <strong className={item?.STATUS_KEY === "5" || item?.STATUS_KEY === "1" ? "approved" : item?.STATUS_KEY === "54" || item?.STATUS_KEY === "45" ? "pending" : item?.STATUS_KEY === "6" ? "settled" : item?.STATUS_KEY === "7" ? "failed" : item?.STATUS_KEY === "4" ? "reopened" : item?.STATUS_KEY === "46" ? "final-settlement" : ""}> {item?.STATUS}</strong>
                                          </li>
                                          <li>
                                            Remarks :
                                            <strong> {item?.REMARK}</strong>
                                          </li>
                                        </ul>
                                      </li>
                                    </>
                                  )
                                })
                              }

                            </ul>
                          </div>
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab="Comments" key="2">
                      <div className="comments">
                        <div className="claim-data">
                          <div className="claim-body">
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
                              {
                                commentsData?.map((item, index) => {
                                  return (
                                    <>
                                      <li>
                                        <strong>
                                          <span>{item?.USER_ID === null ? "A" : item?.USER_ID[0]}</span>
                                          {item?.USER_ID === null ? "null" : item?.USER_ID}
                                          <em>{moment(item?.CREATED_ON).format('DD-MM-YYYY hh:mm:ss A')}</em>
                                        </strong>
                                        {/* <span>{item?.COMMENT}</span> */}
                                        <span dangerouslySetInnerHTML={{ __html: item.COMMENT }}></span>
                                      </li>
                                    </>
                                  )
                                })
                              }

                            </ul>
                          </div>
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
    </>
  );
}

Claim.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  claim: makeSelectClaim()
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
)(Claim);
