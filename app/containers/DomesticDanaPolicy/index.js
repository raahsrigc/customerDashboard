/**
 *
 * DomesticDanaPolicy
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDomesticDanaPolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import noData from "../../images/no-data.svg";
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
import { FilePdfOutlined } from '@ant-design/icons';
import BackArrow from '../../images/back-arrow.svg';

/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { danaDomesticSummaryDataApi, getAllDanaDomesticPolicyApi, getAllDanaDomesticPolicyByIdApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function DomesticDanaPolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "domesticDanaPolicy", reducer });
  useInjectSaga({ key: "domesticDanaPolicy", saga });

  const title = "Domestic Dana Policy";
  const [steps, setSteps] = useState("1");
  const [allLoading, setAllLoading] = useState(false);
  const [cardStatsData, setCardStatsData] = useState([]);
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [directAllPolicyColumns, setDirectAllPolicyColumns] = useState([]);
  const [directAllPolicyData, setDirectAllPolicyData] = useState([]);
  const [policyIdData, setPolicyIdData] = useState({ value: null, error: false });
  const [isDataStatus, setIsDataStatus] = useState(false);
  const [policyType, setPolicyType] = useState("All Policy");

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token ? userData.token : "";

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
    danaDomesticSummaryDataApi(tokenKey, toggleBtn)
      .then((res) => {
        res.data = res?.data == null ? res?.data : JSON.parse(aes256.decrypt(res?.data));
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
      } else if (policyType == "Life Policy") {
        getUnderwritingPolicyPendingHandle(1, perPage);
      } else {
        getUnderwritingPolicyApprovedHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (policyType == "All Policy") {
      getUnderwritingPolicyHandle(pageNumber, pageCount);
    } else if (policyType == "Life Policy") {
      getUnderwritingPolicyPendingHandle(pageNumber, pageCount);
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
    getAllDanaDomesticPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn, "ALL")
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.success == true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res?.data?.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Policy_#!"] = data["POLICY_#"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["DOB!"] = data["DOB"];
            data["PNR_#!"] = data["PNR_#"];
            data["Valid_From!"] = data["VALID_FROM"];
            data["Type!"] = data["TYPE"];
            data["Created_On!"] = data["CREATED_ON"];
            data["Premium_Amount!"] = data["PREMIUM_AMOUNT"];

            delete data["DOB"]
            delete data["MOBILE_#"]
            delete data["POLICY_#"]
            delete data["PNR_#"]
            delete data["PREMIUM_AMOUNT"]
            delete data["VALID_FROM"]
            delete data["CREATED_ON"]
            delete data["TYPE"]
            return data;
          })

          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS") {
                let object = {
                  title: key?.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  sorter: (a, b) => {
                    if (key === "Status") {
                      return a[`${key}`].props.children.localeCompare(b[`${key}`].props.children, 'en', { numeric: true })
                    }
                    return a[`${key}`] && a[`${key}`].localeCompare(b[`${key}`], 'en', { numeric: true })
                  },
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
                      {records.STATUS == "1" ? <span className="success-status">Success</span> : records.STATUS == "2" ? <span className="rejected">Rejected</span> : <span className="pending">Pending</span>}
                    </>
                  )
                },
              },
            ]

            dataColumn.push(...object3);

            setDirectAllPolicyColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["DOB!"] = moment(responseData["DOB!"]).format("DD-MM-YYYY");
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Premium_Amount!"] = Number(responseData["Premium_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
    getAllDanaDomesticPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn, "LI")
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.success === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Policy_#!"] = data["POLICY_#"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["DOB!"] = data["DOB"];
            // data["PNR_#!"] = data["PNR_#"];
            data["Valid_From!"] = data["VALID_FROM"];
            data["Type!"] = data["TYPE"];
            data["Created_On!"] = data["CREATED_ON"];
            data["Premium_Amount!"] = data["PREMIUM_AMOUNT"];

            delete data["DOB"]
            delete data["MOBILE_#"]
            delete data["POLICY_#"]
            delete data["PNR_#"]
            delete data["PREMIUM_AMOUNT"]
            delete data["VALID_FROM"]
            delete data["CREATED_ON"]
            delete data["TYPE"]
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
                      {records.STATUS == "1" ? <span className="success-status">Success</span> : records.STATUS == "2" ? <span className="rejected">Rejected</span> : <span className="pending">Pending</span>}
                    </>
                  )
                },
              },
            ]

            dataColumn.push(...object3);
            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["DOB!"] = moment(responseData["DOB!"]).format("DD-MM-YYYY");
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Premium_Amount!"] = Number(responseData["Premium_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
    getAllDanaDomesticPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn, "GI")
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.success === true) {
          setTablePagination(res.data.TOTAL_RECORD)
          setCurrentPage(res.data.PAGE_NUMBER)
          setPerPage(res?.data?.PER_PAGE)
          setSteps("1")
          setIsDataStatus(false)
          const object1 = res?.data?.DATA;
          object1?.map(data => {
            data["Policy_#!"] = data["POLICY_#"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["DOB!"] = data["DOB"];
            data["PNR_#!"] = data["PNR_#"];
            data["Valid_From!"] = data["VALID_FROM"];
            data["Type!"] = data["TYPE"];
            data["Created_On!"] = data["CREATED_ON"];
            data["Premium_Amount!"] = data["PREMIUM_AMOUNT"];

            delete data["DOB"]
            delete data["MOBILE_#"]
            delete data["POLICY_#"]
            delete data["PNR_#"]
            delete data["PREMIUM_AMOUNT"]
            delete data["VALID_FROM"]
            delete data["CREATED_ON"]
            delete data["TYPE"]
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
                      {records.STATUS == "1" ? <span className="success-status">Success</span> : records.STATUS == "2" ? <span className="rejected">Rejected</span> : <span className="pending">Pending</span>}
                    </>
                  )
                },
              },
            ]
            
            dataColumn.push(...object3);
            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["DOB!"] = moment(responseData["DOB!"]).format("DD-MM-YYYY");
              responseData["Valid_From!"] = moment(responseData["Valid_From!"]).format("DD-MM-YYYY");
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Premium_Amount!"] = Number(responseData["Premium_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
    getAllDanaDomesticPolicyByIdApi(tokenKey, data?.ID, data["Type!"], toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.success === true) {
          setPolicyIdData({ value: res?.data, error: true })
          setSteps("2")
        } else {
          setPolicyIdData({ value: null, error: false })
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

  const policyCardHandle = (status) => {
    setColNameArr([])
    setColValueArr([])
    setPolicyType(status)
  }

  useEffect(() => {
    setColNameArr([])
    setColValueArr([])
    for (var i = 0; i < colNameArr?.length; i++) {
      colNameArr?.splice([]);
    }
    for (var i = 0; i < colValueArr?.length; i++) {
      colValueArr?.splice([]);
    }
    if (tokenKey !== "") {
      cardStats();
    }
  }, [tokenKey && toggleBtn])


  useEffect(() => {
    if (policyType == "All Policy") {
      getUnderwritingPolicyHandle("", "", "", "", "", true);
    } else if (policyType == "Life Policy") {
      getUnderwritingPolicyPendingHandle("", "", "", "", "", true);
    } else {
      getUnderwritingPolicyApprovedHandle("", "", "", "", "", true);
    }
  }, [tokenKey, policyType])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  const backToPolicyList = () => {
    setSteps("1");
    setPolicyIdData({ value: null, error: false })
  }

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    if (policyType == "All Policy") {
      getAllDanaDomesticPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn, "ALL")
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.success === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Policy #"] = item["POLICY_#"];
                obj["Mobile #"] = item["MOBILE_#"];
                obj["DOB"] = moment(item["DOB"]).format("DD-MM-YYYY");
                obj["PNR #"] = item["PNR_#"];
                obj["Valid From"] = moment(item["VALID_FROM"]).format("DD-MM-YYYY");
                obj["Type"] = item["TYPE"];
                obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
                obj["Premium Amount"] = Number(item["PREMIUM_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == "1" ? "Success" : item.STATUS == "2" ? "Reject" : "Pending"
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
    } else if (policyType == "Life Policy") {
      getAllDanaDomesticPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn, "LI")
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.success === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Policy #"] = item["POLICY_#"];
                obj["Mobile #"] = item["MOBILE_#"];
                obj["DOB"] = moment(item["DOB"]).format("DD-MM-YYYY");
                // obj["PNR #"] = item["PNR_#"];
                obj["Valid From"] = moment(item["VALID_FROM"]).format("DD-MM-YYYY");
                obj["Type"] = item["TYPE"];
                obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
                obj["Premium Amount"] = Number(item["PREMIUM_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == "1" ? "Success" : item.STATUS == "2" ? "Reject" : "Pending"
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
      getAllDanaDomesticPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn, "GI")
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.success === true) {
            let finalArray = [];
            const CSVTable = res?.data?.DATA
            if (CSVTable && CSVTable?.length) {
              for (let i = 0; i < CSVTable?.length; i++) {
                const item = CSVTable[i];
                const index = i + 1
                const obj = {}
                obj['S.No.'] = index
                obj["Policy #"] = item["POLICY_#"];
                obj["Mobile #"] = item["MOBILE_#"];
                obj["DOB"] = moment(item["DOB"]).format("DD-MM-YYYY");
                obj["PNR #"] = item["PNR_#"];
                obj["Valid From"] = moment(item["VALID_FROM"]).format("DD-MM-YYYY");
                obj["Type"] = item["TYPE"];
                obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
                obj["Premium Amount"] = Number(item["PREMIUM_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj['Status'] = item.STATUS == "1" ? "Success" : item.STATUS == "2" ? "Reject" : "Pending"
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
    }
  };


  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="dana-policy-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="policy-card-inner">
                <div className={policyType == "All Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Policy")}>
                  <p>Total Policy</p>
                  <h2>{cardStatsData?.NO_OF_POLICY ? cardStatsData?.NO_OF_POLICY : 0}</h2>
                </div>
                <div className={policyType == "Life Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("Life Policy")}>
                  <p>Life Policy</p>
                  <h2>{cardStatsData?.NO_OF_LIFE_POLICY ? cardStatsData?.NO_OF_LIFE_POLICY : 0}</h2>
                </div>
                <div className={policyType == "Travel Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("Travel Policy")}>
                  <p>Travel Policy</p>
                  <h2>{cardStatsData?.NO_OF_GENERAL_POLICY ? cardStatsData?.NO_OF_GENERAL_POLICY : 0}</h2>
                </div>
                <div className="policy-card">
                  <p># Policy YTD</p>
                  <h2>{cardStatsData?.YTD_POLICY ? cardStatsData?.YTD_POLICY : 0}</h2>
                </div>
                <div className="policy-card">
                  <p># Policy MTD</p>
                  <h2>{cardStatsData?.MTD_POLICY ? cardStatsData?.MTD_POLICY : 0}</h2>
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
            // <DomesticDanaPolicyByIdData policyType={policyType} policyIdData={policyIdData} backToPolicyList={backToPolicyList} />
            <>
              <div className="underwriting-policy-header">
                <span onClick={backToPolicyList}><img src={BackArrow} /></span>
                <em>Travel Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">
                  <h6>
                    <span className="insured-name">{policyIdData?.value?.LIFE_POLICY?.insuredName ? policyIdData?.value?.LIFE_POLICY?.insuredName && policyIdData?.value?.LIFE_POLICY?.insuredName[0] : policyIdData?.value?.GENERAL_POLICY?.insuredName && policyIdData?.value?.GENERAL_POLICY?.insuredName[0]}</span>
                    <em className="policyTitle">
                      <span>{policyIdData?.value?.LIFE_POLICY?.insuredName ? policyIdData?.value?.LIFE_POLICY?.insuredName : policyIdData?.value?.GENERAL_POLICY?.insuredName}</span>
                      <em>Policy No. : <strong className="policyNumber">{policyIdData?.value?.LIFE_POLICY?.policyNumber ? policyIdData?.value?.LIFE_POLICY?.policyNumber : policyIdData?.value?.GENERAL_POLICY?.policyNumber}</strong></em>
                    </em>
                  </h6>
                </div>
                <div className="underwriting-insurance-body">
                  <div className="underwriting-insurance-details">
                    <ul className="internal-tab-details">
                      {policyIdData.value?.GENERAL_POLICY !== null ?
                        <>
                          <li><b>Policy Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.policyNumber}</span></li>
                          <li><b>Insured Name :</b><span>{policyIdData?.value?.GENERAL_POLICY?.insuredName}</span></li>
                          <li><b>Date Of Birth :</b><span>{moment(policyIdData?.GENERAL_POLICY?.value?.dob).format("DD-MM-YYYY")}</span></li>
                          <li><b>Gender :</b><span>{policyIdData?.value?.GENERAL_POLICY?.gender == "F" ? "Female" : policyIdData?.value?.GENERAL_POLICY?.gender == "M" ? "Male" : policyIdData?.value?.GENERAL_POLICY?.gender == "O" ? "Others" : policyIdData?.value?.GENERAL_POLICY?.gender}</span></li>
                          <li><b>Email Id :</b><span>{policyIdData?.value?.GENERAL_POLICY?.emailId}</span></li>
                          <li><b>Mobile Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.mobileNumber}</span></li>
                          <li><b>Address :</b><span>{policyIdData?.value?.GENERAL_POLICY?.address}</span></li>
                          <li><b>Plan :</b><span>{policyIdData?.value?.GENERAL_POLICY?.planType}</span></li>
                          <li><b>Certificate Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.certificateNumber}</span></li>
                          <li><b>Policy Valid From :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.fromDate).format("DD-MM-YYYY")}</span></li>
                          <li><b>Policy Valid To :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.toDate).format("DD-MM-YYYY")}</span></li>
                          <li><b>PNR Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.pnrNumber}</span></li>
                          <li><b>Flight Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.flightnumber}</span></li>
                          <li><b>Flight Sequence :</b><span>{policyIdData?.value?.GENERAL_POLICY?.flightSequence}</span></li>
                          <li><b>Source  :</b><span>{policyIdData?.value?.GENERAL_POLICY?.sectorFrom}</span></li>
                          <li><b>Destination :</b><span>{policyIdData?.value?.GENERAL_POLICY?.sectorTo}</span></li>
                          <li><b>Departure Date :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.journeyDepartureDate).format("DD-MM-YYYY")}</span></li>
                          <li><b>Departure Time :</b><span>{policyIdData?.value?.GENERAL_POLICY?.journeyDepartureTime}</span></li>
                          <li><b>Arrival Time :</b><span>{policyIdData?.value?.GENERAL_POLICY?.journeyArrivalTime}</span></li>
                          <li><b>Premium Amount :</b><span>{policyIdData?.value?.GENERAL_POLICY?.premiumAmount?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                          <li><b>Policy Document :</b><span><a href={policyIdData?.value?.GENERAL_POLICY?.idurl_GI} target="_blank"><FilePdfOutlined /></a></span></li>
                          <li><b>Status :</b><span><span className="success-status">Success</span></span></li>
                          <li className="traveller-details"><b>Traveller Details :</b>
                            <span>
                              <span>#</span>
                              <span>Title</span>
                              <span className="gender-row">Gender</span>
                              <span>First Name</span>
                              <span>Surname</span>
                              <span>Mobile #</span>
                              <span>Email Id</span>
                              <span>DOB</span>
                            </span>
                            {policyIdData?.value?.GENERAL_POLICY?.TRAVELLER_DETAILS?.map((item, index) => {
                              return (
                                <span key={index}>
                                  <span>{index + 1}.</span>
                                  <span>{item?.TITLE}</span>
                                  <span className="gender-row">{item?.GENDER}</span>
                                  <span>{item?.FIRST_NAME}</span>
                                  <span>{item?.LAST_NAME}</span>
                                  <span>{item?.MOBILE_NUMBER}</span>
                                  <span>{item?.EMAIL_ID}</span>
                                  <span>{moment(item?.DOB).format("DD-MM-YYYY")}</span>
                                </span>
                              )
                            })}
                          </li>
                          <li className="cover-details"><b>Cover Details :</b>
                            <span>
                              <span>#</span>
                              <span>Cover Description</span>
                              <span>Cover Amount</span>
                            </span>
                            {policyIdData?.value?.GENERAL_POLICY?.travelInsurancePlan?.map((item, index) => {
                              return (
                                <span key={index}>
                                  <span>{index + 1}.</span>
                                  <span>{item?.COVER_NAME}</span>
                                  <span>{item?.COVER_AMOUNT?.replaceAll("Naira ", "₦")}</span>
                                </span>
                              )
                            })}
                          </li>

                        </>
                        :
                        <>
                          <li><b>Policy Number :</b><span>{policyIdData?.value?.LIFE_POLICY?.policyNumber}</span></li>
                          <li><b>Insured Name :</b><span>{policyIdData?.value?.LIFE_POLICY?.insuredName}</span></li>
                          <li><b>Date Of Birth :</b><span>{moment(policyIdData?.value?.LIFE_POLICY?.dob).format("DD-MM-YYYY")}</span></li>
                          <li><b>Gender :</b><span>{policyIdData?.value?.LIFE_POLICY?.gender == "F" ? "Female" : policyIdData?.value?.LIFE_POLICY?.gender == "M" ? "Male" : policyIdData?.value?.LIFE_POLICY?.gender == "O" ? "Others" : policyIdData?.value?.LIFE_POLICY?.gender}</span></li>
                          <li><b>Email Id :</b><span>{policyIdData?.value?.LIFE_POLICY?.emailId}</span></li>
                          <li><b>Mobile Number :</b><span>{policyIdData?.value?.LIFE_POLICY?.mobileNumber}</span></li>
                          <li><b>Address :</b><span>{policyIdData?.value?.LIFE_POLICY?.address}</span></li>
                          <li><b>Certificate Number :</b><span>{policyIdData?.value?.LIFE_POLICY?.certificateNumber}</span></li>
                          <li><b>Policy Valid From :</b><span>{moment(policyIdData?.value?.LIFE_POLICY?.fromDate).format("DD-MM-YYYY")}</span></li>
                          <li><b>Policy Valid To :</b><span>{moment(policyIdData?.value?.LIFE_POLICY?.toDate).format("DD-MM-YYYY")}</span></li>
                          <li><b>Premium Amount :</b><span>{policyIdData?.value?.LIFE_POLICY?.premiumAmount?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                          <li><b>Policy Document :</b><span><a href={policyIdData?.value?.LIFE_POLICY?.idurl_GI} target="_blank"><FilePdfOutlined /></a></span></li>
                          <li><b>Status :</b><span>{policyIdData?.value?.LIFE_POLICY?.status == 1 ? <span className="success-status">Success</span> : policyIdData?.value?.LIFE_POLICY?.status == 2 ? <span className="rejected">Reject</span> : <span className="pending">Pending</span>}</span></li>

                          <li className="traveller-details"><b>Beneficiary Details :</b>
                            <span>
                              <span>#</span>
                              <span>Title</span>
                              <span>Beneficiary Name</span>
                              <span className="gender-row">Gender</span>
                              <span>Mobile #</span>
                              <span>Email Id</span>
                              <span>DOB</span>
                              <span>ADDRESS</span>
                            </span>
                            {policyIdData?.value?.LIFE_POLICY?.BENEFICIARY_DETAILS?.map((item, index) => {
                              return (
                                <span key={index}>
                                  <span>{index + 1}.</span>
                                  <span>{item?.TITLE}</span>
                                  <span>{item?.FIRST_NAME} {item?.MIDDLE_NAME} {item?.LAST_NAME}</span>
                                  <span className="gender-row">{item?.GENDER}</span>
                                  <span>{item?.MOBILE_NUMBER}</span>
                                  <span>{item?.EMAIL_ID}</span>
                                  <span>{moment(item?.DOB).format("DD-MM-YYYY")}</span>
                                  <span>{item?.ADDRESS}</span>
                                </span>
                              )
                            })}
                          </li>

                        </>
                      }
                    </ul>
                  </div>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </>
  );
}

DomesticDanaPolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  domesticDanaPolicy: makeSelectDomesticDanaPolicy()
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
)(DomesticDanaPolicy);
