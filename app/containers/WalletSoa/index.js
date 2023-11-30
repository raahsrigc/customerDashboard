/**
 *
 * WalletSoa
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectWalletSoa from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import CurrencyFormat from 'react-currency-format';
import noData from "../../images/no-data.svg";
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
import Form from 'antd/es/form';
import Modal from 'antd/es/modal';
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { getWalletSoaApi, getWalletSoaAllProductApi, walletSummaryDataApi, getBankListApi, walletCreditApi, getProfileData } from "../../services/AuthService";
import aes256 from "../../services/aes256";
import { DatePicker } from "antd";

export function WalletSoa({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "walletSoa", reducer });
  useInjectSaga({ key: "walletSoa", saga });

  const [walletCreditForm] = Form.useForm();
  const access = sessionStorage.getItem("access");
  const accessName = sessionStorage.getItem("accessName");
  const pathname = location.pathname;
  const pathnameArray = pathname?.split("/");
  const danaSoa = pathnameArray && pathnameArray[4]?.split("/");
  const title = `${access == 1 ? "Motor SOA" : access == 31 ? "Device SOA" : access == 6 ? "Personal Accident SOA" : access == 33 && accessName == "Domestic Travel Insurance" ? "Domestic Travel SOA" : access == 33 && accessName == "International Travel Insurance" ? "International Travel SOA" : access == 33 && accessName == "Dana Air Travel Insurance" && danaSoa == "life" ? "Life SOA" : access == 33 && accessName == "Dana Air Travel Insurance" && danaSoa == "travel" ? "Travel SOA" : "SOA" }`
  const userId = sessionStorage.getItem('email');
  const [allLoading, setAllLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [columns, setColumns] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [isDataStatus, setIsDataStatus] = useState(false);
  const [cardStatsData, setCardStatsData] = useState({});
  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);
  const [walletCreditModal, setWalletCreditModal] = useState(false);
  const [walletCreditModalStatus, setWalletCreditModalStatus] = useState({ value: null, response: false, error: false })
  const [uploadReceiptData, setUploadReceiptData] = useState("");
  const [uploadReceiptFileName, setUploadReceiptFileName] = useState("");
  const [uploadReceiptImageType, setUploadReceiptImageType] = useState("");
  const [bankListData, setBankListData] = useState([]);
  const [bankPaymentMode, setBankPaymentMode] = useState(false);
  
  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

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
    walletSummaryDataApi(tokenKey, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setCardStatsData(res?.data && res?.data[0])
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
      getWalletSoaHandle(1, perPage);
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])

  const paginationHandle = (pageNumber, pageCount) => {
    getWalletSoaHandle(pageNumber, pageCount);
  }

  /* Quotation Table */
  const getWalletSoaHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (accessName == "") {
      if (colValueArr.length) {
        isSearch = true;
      } else {
        isSearch = false;
      }

      colValue = colValue?.toString();
      setAllLoading(true)
      getWalletSoaApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            setTablePagination(res.data.TOTAL_RECORD)
            setCurrentPage(res.data.PAGE_NUMBER)
            setPerPage(res?.data?.PER_PAGE)
            setIsDataStatus(false)
            const object1 = res?.data?.DATA;
            object1?.map(data => {
              data["Created_On"] = data["CREATED_ON"];
              data["Txn_Id"] = data["txn_id"];
              data["Txn_Number"] = data["TXN_NUMBER"];
              data["Amount"] = data["AMOUNT"];
              data["Ledger_Balance"] = data["LEDGER_BALANCE"];
              delete data["TXN_NUMBER"]
              delete data["txn_id"]
              delete data["#"]
              delete data["CREATED_ON"]
              delete data["AMOUNT"]
              delete data["LEDGER_BALANCE"]
              return data;

              return data;
            })
            if (object1 && object1.length) {
              let dataColumn = [];
              let object2 = [
                {
                  title: '#',
                  dataIndex: 'number',
                  key: 'number',
                  width: 80,
                  sorter: (a, b) => {
                    return a.key - b.key
                  },
                  render: (x, records) => {
                    return `${res.data.PER_PAGE * (res.data.PAGE_NUMBER - 1) + records.key + 1}.`
                  },
                }
              ]
              dataColumn.push(...object2);

              for (let key in object1[0]) {
                if (key !== "ID" && key !== "#" && key !== "CR_DR") {
                  let object = {
                    title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                    dataIndex: key,
                    key: key,
                    onCell: (record, rowIndex) => {
                      return {
                        onClick: () => {
                          getQuotationByIdHandle(record);
                        },
                      };
                    },
                    ...getColumnSearchProps(key)
                  };
                  dataColumn.push(object);
                }
              }

              setColumns(dataColumn);

              const tableData = object1?.map((item, index) => {
                let responseData = { ...item } || {};
                responseData["Created_On"] = moment(responseData["Created_On"]).format("DD-MM-YYYY hh:mm:ss A");
                responseData.Amount = responseData["CR_DR"] === "D" ? Number(responseData.Amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") : Number(responseData.Amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") + " CR"
                responseData.Ledger_Balance = Number(responseData.Ledger_Balance).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")
                return { key: index++, ...responseData }
              })

              setWalletData(tableData);
            }
          } else {
            setWalletData([])
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
    } else {
      if (colValueArr.length) {
        isSearch = true;
      } else {
        isSearch = false;
      }

      colValue = colValue?.toString();
      setAllLoading(true)
      getWalletSoaAllProductApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn, accessName, danaSoa)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false)
          if (res.status === true) {
            setTablePagination(res.data.TOTAL_RECORD)
            setCurrentPage(res.data.PAGE_NUMBER)
            setPerPage(res?.data?.PER_PAGE)
            setIsDataStatus(false)
            const object1 = res?.data?.DATA;
            object1?.map(data => {
              data["Created_On"] = data["CREATED_ON"];
              data["Txn_Id"] = data["txn_id"];
              data["Txn_Number"] = data["TXN_NUMBER"];
              data["Amount"] = data["AMOUNT"];
              data["Ledger_Balance"] = data["LEDGER_BALANCE"];
              delete data["TXN_NUMBER"]
              delete data["txn_id"]
              delete data["#"]
              delete data["CREATED_ON"]
              delete data["AMOUNT"]
              delete data["LEDGER_BALANCE"]
              return data;

              return data;
            })
            if (object1 && object1.length) {
              let dataColumn = [];
              let object2 = [
                {
                  title: '#',
                  dataIndex: 'number',
                  key: 'number',
                  width: 80,
                  sorter: (a, b) => {
                    return a.key - b.key
                  },
                  render: (x, records) => {
                    return `${res.data.PER_PAGE * (res.data.PAGE_NUMBER - 1) + records.key + 1}.`
                  },
                }
              ]
              dataColumn.push(...object2);

              for (let key in object1[0]) {
                if (key !== "ID" && key !== "#" && key !== "CR_DR") {
                  let object = {
                    title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                    dataIndex: key,
                    key: key,
                    onCell: (record, rowIndex) => {
                      return {
                        onClick: () => {
                          getQuotationByIdHandle(record);
                        },
                      };
                    },
                    ...getColumnSearchProps(key)
                  };
                  dataColumn.push(object);
                }
              }

              setColumns(dataColumn);

              const tableData = object1?.map((item, index) => {
                let responseData = { ...item } || {};
                responseData["Created_On"] = moment(responseData["Created_On"]).format("DD-MM-YYYY hh:mm:ss A");
                responseData.Amount = responseData["CR_DR"] === "D" ? Number(responseData.Amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") : Number(responseData.Amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") + " CR"
                responseData.Ledger_Balance = Number(responseData.Ledger_Balance).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")
                return { key: index++, ...responseData }
              })

              setWalletData(tableData);
            }
          } else {
            setWalletData([])
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
  }

  useEffect(() => {
    if (tokenKey) {
      setColNameArr([])
      setColValueArr([])
      for (var i = 0; i < colNameArr.length; i++) {
        colNameArr.splice([]);
      }
      for (var i = 0; i < colValueArr.length; i++) {
        colValueArr.splice([]);
      }
      if (accessName == "") {
        cardStats();
      }
      getWalletSoaHandle("", "", "", "", "", true);
    }
  }, [tokenKey])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  const walletCreditModalHandle = () => {
    getBankListHandle();
    setWalletCreditModal(true)
  }

  const getBankListHandle = () => {
    getBankListApi()
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.success === true) {
          setBankListData(res.data)
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
  };

  const convertToBase64 = (data) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(data);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        console.log(error)
        reject(error);
      };
    });
  };

  const uploadReceiptChange = async (e) => {
    const isLt2M = e.target.files[0].size / 1024 / 1024 < 5;
    if (!e.target.files || e.target.files.length === 0) {
      setUploadReceiptData("")
      return
    }
    if (!isLt2M) {
      message.error('Image must smaller than 5MB!');
      return
    }
    setUploadReceiptFileName(e.target.files[0].name)
    const splitType = e.target.files[0].type?.split("/")
    setUploadReceiptImageType(splitType[1])
    const passportPhotoBase64 = await convertToBase64(e.target.files[0]);
    const splitUrl = passportPhotoBase64?.split(";base64,")
    setUploadReceiptData(splitUrl[1]);
  }

  const walletCreditHandle = (values) => {
    values.paymentReceipt = uploadReceiptData;
    values.imageFormat = uploadReceiptImageType;
    values.imageName = uploadReceiptFileName;
    values.paymentDate = moment(values.paymentDate).format("YYYY-MM-DD")
    values.paymentAmount = values?.paymentAmount?.replaceAll(",", "")
    setAllLoading(true)
    walletCreditApi(tokenKey, values, toggleBtn)
      .then((res) => {
        setAllLoading(false);
        if (res.responseCode === "200") {
          getWalletSoaHandle();
          getProfileHandle();
          setWalletCreditModalStatus({ value: res.message, response: true, error: false })
        } else {
          setWalletCreditModalStatus({ value: res.message, response: true, error: true })
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

  const paymentModeOnChange = (value) => {
    if(value == 104) {
      setBankPaymentMode(true)
    } else {
      setBankPaymentMode(false)
    }
  }

  const getProfileHandle = () => {
    getProfileData({ "email": userId })
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

  const handleCancel = () => {
    walletCreditForm.resetFields();
    setWalletCreditModal(false);
    setBankPaymentMode(false);
    setWalletCreditModalStatus({ value: null, response: false, error: false })
  };

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    if (accessName == "") {
      getWalletSoaApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
                obj["Created_On"] = moment(item["CREATED_ON"]).format('DD-MM-YYYY hh:mm:ss A');
                obj["Txn_Id"] = item["txn_id"];
                obj["Txn_Number"] = item["TXN_NUMBER"];
                obj["Amount"] = item["CR_DR"] === "D" ? Number(item["AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") : Number(item["AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") + " CR";
                obj["Ledger_Balance"] = Number(item["LEDGER_BALANCE"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
              Sheets: { [`SOA List`]: ws },
              SheetNames: [`SOA List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `SOA-List-${datestring}${fileExtension}`);
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
      getWalletSoaAllProductApi(tokenKey, 1, 5535, "", "", false, toggleBtn, accessName, danaSoa)
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
                obj["Created_On"] = moment(item["CREATED_ON"]).format('DD-MM-YYYY hh:mm:ss A');
                obj["Txn_Id"] = item["txn_id"];
                obj["Txn_Number"] = item["TXN_NUMBER"];
                obj["Amount"] = item["CR_DR"] === "D" ? Number(item["AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") : Number(item["AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ") + " CR";
                obj["Ledger_Balance"] = Number(item["LEDGER_BALANCE"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
              Sheets: { [`SOA List`]: ws },
              SheetNames: [`SOA List`],
            };
            const excelBuffer = XLSX.write(wb, {
              bookType: 'csv',
              type: 'array'
            });
            const data1 = new Blob([excelBuffer], { type: fileType });
            FileSaver.saveAs(data1, `SOA-List-${datestring}${fileExtension}`);
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
        <div className="wallet-main-section" onClick={outSideClick}>
          {accessName == "" ?
            <div className="wallet-summary">
              <h6>Account  Summary</h6>
              <ul>
                <li><span>Opening Balance</span><span>Payment/Credits</span><span>Purchase/Debits</span><span>Total Dues</span></li>
                <li><span>{Number(cardStatsData?.openingBalance ? cardStatsData?.openingBalance : 0)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.replace(/\₦/g, "₦ ")}</span><span>{Number(cardStatsData?.totalCredit ? cardStatsData?.totalCredit : 0)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.replace(/\₦/g, "₦ ")}</span><span>{Number(cardStatsData?.totalDebit ? cardStatsData?.totalDebit : 0)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.replace(/\₦/g, "₦ ")}</span><span>{Number(cardStatsData?.totalOutstanding ? cardStatsData?.totalOutstanding : 0)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })?.replace(/\₦/g, "₦ ")} <em>{cardStatsData?.totalOutstanding > 0 ? "CR" : ""}</em></span></li>
              </ul>
            </div>
            :
            <></>
          }
          <div className="wallet-data">
            <div className="wallet-card-header">
              <h6>SOA History</h6>
              <ul>
                {walletData.length ? <li onClick={handleCSVDownload}>CSV Download</li> : <></>}
                {accessName == "" ? <li onClick={walletCreditModalHandle}>Credit</li> : <></>}
              </ul>
            </div>
            <div className="wallet-card-body">
              {isDataStatus ?
                <div className="wallet-no-data">
                  <img src={noData} alt="" />
                  <h6>There is presently no user data available</h6>
                </div>
                :
                <>
                  <Table
                    columns={columns}
                    dataSource={walletData}
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
        </div>
      </div>

      <Modal width={600} centered title="Wallet Credit" className="wallet-credit-modal" visible={walletCreditModal} onCancel={handleCancel}>
        {walletCreditModalStatus.response === false ?
          <Form
            form={walletCreditForm}
            name="basic"
            onFinish={walletCreditHandle}
            autoComplete="off"
          >
            <Form.Item
              label="Txn. Ref. No."
              name="transactionRefNumber"
              rules={[
                {
                  required: true,
                  message: 'Enter your Txn. Ref. No.!',
                },
              ]}
            >
              <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={30} />
            </Form.Item>
            <Form.Item
              label="Amount"
              name="paymentAmount"
              rules={[
                {
                  required: true,
                  message: 'Enter your Amount!',
                },
              ]}
            >
              {/* <Input onKeyDown={numbricKeyDownHandle} maxLength={20} /> */}
              <CurrencyFormat thousandSeparator={true} onKeyDown={numbricKeyDownHandle} maxLength={20} className="amountInput" allowNegative={false} />
            </Form.Item>
            <Form.Item
              label="Date"
              name="paymentDate"
              rules={[
                {
                  required: true,
                  message: 'Enter date!',
                },
              ]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              label="Mode of Payment"
              name="paymentMode"
              rules={[
                {
                  required: true,
                  message: 'Select Mode of Payment!',
                },
              ]}
            >
              <Select
                onChange={(value) => { paymentModeOnChange(value) }}
              >
                <Option value={103}>Online Payment</Option>
                <Option value={104}>Bank</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Bank"
              name="bankId"
              rules={[
                {
                  required: bankPaymentMode,
                  message: 'Select Bank!',
                },
              ]}
            >
              <Select disabled={bankPaymentMode ? false : true}>
                {
                  bankListData.map((item,index)=>{
                    return (
                      <Option value={item?.CODE}>{item?.BANK_NAME}</Option>
                    )
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item
              label="Upload Receipt"
              name="paymentReceipt"
              rules={[
                {
                  required: true,
                  message: 'Upload Receipt!',
                },
              ]}
            >
              <Input 
                type="file"
                accept=".png, .jpg, .jpeg, .pdf"
                onChange={uploadReceiptChange}
              />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
          :
          <h6>{walletCreditModalStatus?.value}</h6>
        }
      </Modal>

    </>
  );
}

WalletSoa.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  walletSoa: makeSelectWalletSoa()
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
)(WalletSoa);
