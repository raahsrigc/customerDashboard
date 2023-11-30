/**
 *
 * Quotation
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import './style.scss';


import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectQuotation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import noData from "../../images/no-data.svg";
import BackArrow from '../../images/back-arrow.svg';
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Tooltip from "antd/es/tooltip";
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import Modal from 'antd/es/modal';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import { ConsoleSqlOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { summaryDataApi, getUnderwritingQuotationsApi, getMotorQuotationByIdApi, countryData, stateData, cityData, generatePolicyApi, makeApi, modelApi, getMotorQuotationInsuredDetailsApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";
import { sample } from "lodash";


export function Quotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "quotation", reducer });
  useInjectSaga({ key: "quotation", saga });

  const title = "Motor Quotation";
  const [steps, setSteps] = useState("1");
  const [allLoading, setAllLoading] = useState(false);
  const [cardStatsData, setCardStatsData] = useState({});
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [directQuotationColumns, setDirectQuotationColumns] = useState([]);
  const [directQuotationData, setDirectQuotationData] = useState([]);
  const [quotationByIdData, setQuotationByIdData] = useState([]);
  const [isDataStatus, setIsDataStatus] = useState(false);

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const { Option } = Select;
  const [kycForm] = Form.useForm();
  const [isKYCFormModalOpen, setIsKYCFormModalOpen] = useState(false);
  const [isKYCForm2ModalOpen, setIsKYCForm2ModalOpen] = useState(false);
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
  const [kycStatusValue, setkycStatusValue] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [genderDisabled, setGenderDisabled] = useState(false);
  const [makeOption, setMakeOption] = useState([]);
  const [modelOption, setModelOption] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [registrationStartDate, setregistrationStartDate] = useState("");
  const [registrationEndDate, setregistrationEndDate] = useState("");

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
  }

  function disabledDate(current) {
    const yesterday = moment(startDate, "YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current < moment().subtract(1, 'months');
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

  function alphaHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z ]+$");
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


  const selectCountry = (value, reKycData) => {
    stateData(tokenKey, value, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setStateOption(res.data)
          kycForm.setFieldsValue({
            state: reKycData ? reKycData.STATE : "",
            city: reKycData ? reKycData.CITY : ""
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
      getUnderwritingQuotationsHandle(1, perPage);
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])

  const paginationHandle = (pageNumber, pageCount) => {
    getUnderwritingQuotationsHandle(pageNumber, pageCount);
  }

  /* Quotation Table */
  const getUnderwritingQuotationsHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {

    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }

    colValue = colValue?.toString();
    setAllLoading(true)
    getUnderwritingQuotationsApi(tokenKey, pageNumber, pageCount, 1, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Quote_#!"] = data["Quote_#"];
            data["Email!"] = data["EMAIL"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Plan!"] = data["Plan"];
            data["Created_On!"] = data["Created_On"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["Quote_#"]
            delete data["AGENT/BROKER_NAME"]
            delete data["Mobile_#"]
            delete data["EMAIL"]
            delete data["Insured_Name"]
            delete data["Plan"]
            delete data["Sum_Insured"]
            delete data["Premium"]
            delete data["ACTION"]
            delete data["CURRENCY"]
            delete data["VEHICLE_MAKE_NAME"]
            delete data["VEHICLE_MODEL_NAME"]
            delete data["Created_On"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "Status" && key !== "VEHICLE_REGISTRATION_NUMBER" && key !== "VEHICLE_MAKE_CODE" && key !== "VEHICLE_MODEL_CODE" && key !== "IS_KYC_COMPLETE") {
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
                        records?.IS_KYC_COMPLETE == 0 ?
                          <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span>
                          : records?.IS_KYC_COMPLETE == 101 ?
                            <span className="re-status" onClick={() => buyPolicyHandle(records)}>Re KYC</span>
                            : records?.IS_KYC_COMPLETE == 102 ?
                              <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Pending</span>
                              :
                              ""
                      }
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setDirectQuotationColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              return { key: index++, ...responseData }
            })

            setDirectQuotationData(tableData);
          }
        } else {
          setDirectQuotationData([])
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

  const getQuotationByIdHandle = (data) => {
    setAllLoading(true);
    getMotorQuotationByIdApi(tokenKey, data?.ID, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setQuotationByIdData(res.data)
          setSteps("2")
        } else {
          setQuotationByIdData([])
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
      cardStats();
      getUnderwritingQuotationsHandle("", "", "", "", "", true);
    }
  }, [tokenKey])

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }
  const backToPolicyList = () => {
    setSteps("1");
  }

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    getUnderwritingQuotationsApi(tokenKey, 1, tablePagination, "", "", false, toggleBtn)
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
              obj["Insured_Name!"] = item["Insured_Name"];
              obj["Quote_#"] = item["Quote_#"];
              obj["Email"] = item["EMAIL"];
              obj["Mobile_#"] = item["Mobile_#"];
              obj["Plan!"] = item["Plan"];
              obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
              obj["Sum_Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
              obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
            Sheets: { [`Quotation List`]: ws },
            SheetNames: [`Quotation List`],
          };
          const excelBuffer = XLSX.write(wb, {
            bookType: 'csv',
            type: 'array'
          });
          const data1 = new Blob([excelBuffer], { type: fileType });
          FileSaver.saveAs(data1, `Quotation-List-${datestring}${fileExtension}`);
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
  };


  const buyPolicyHandle = (data) => {
    setkycStatusValue(data?.IS_KYC_COMPLETE)
    setAllLoading(true);
    if (data?.IS_KYC_COMPLETE == 101 || data?.IS_KYC_COMPLETE == 102) {
      getMotorQuotationInsuredDetailsApi(tokenKey, data?.ID, toggleBtn)
        .then((res) => {
          res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
          setAllLoading(false);
          if (res.status === true) {
            selectCountry(res.data.COUNTRY, res.data)
            selectState(res.data.STATE, res.data)
            setIdType(res.data.idTpye)
            setregistrationStartDate(res.data && res.data.regisrtrationDate)
            setregistrationEndDate(res.data && res.data.regisrtrationEndDate)
            setStartDate(res.data && res.data.FROM_DATE)
            setDateOfBirth(res.data && res.data.dob)
            setpvcNumber({ value: res.data.idNumber, error: false })
            setDrivingNumber({ value: res.data.idNumber, error: false })
            setPassportNumber({ value: res.data.idNumber, error: false })
            setBvnNumber({ value: res.data.idNumber, error: false })

            kycForm.setFieldsValue({
              title: res.data.TITLE,
              gender: res.data.GENDER,
              firstName: res.data.firstName,
              middleName: res.data.MIDDLE_NAME,
              lastName: res.data.lastName,
              emailId: res.data.EMAIL_ID,
              mobileNumber: res.data.mobileNumber,
              dob: moment(res.data && res.data.dob),
              idType: res.data.idTpye,
              permanentVotersCard: res.data.idNumber,
              passport: res.data.idNumber,
              driverLicence: res.data.idNumber,
              bvn: res.data.idNumber,
              address: res.data.address,
              country: res.data.COUNTRY,
              state: res.data.STATE,
              city: res.data.CITY,
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
    }

    kycForm.resetFields();
    setIsKYCFormModalOpen(true);
    setQuotationId(data?.ID)
    kycForm.setFieldsValue({
      firstName: data["Insured_Name!"],
      mobileNumber: data["Mobile_#!"] == null ? "" : data["Mobile_#!"],
      emailId: data["Email!"] == null ? "" : data["Email!"],
      registrationNumber: data?.VEHICLE_REGISTRATION_NUMBER == null ? "" : data?.VEHICLE_REGISTRATION_NUMBER,
      make: data?.VEHICLE_MAKE_CODE == null ? "" : data?.VEHICLE_MAKE_CODE,
    });

    setEmail({ value: data["Email!"], error: false })
    setMobileNo({ value: data["Mobile_#!"], error: false });

    countryData(tokenKey, toggleBtn)
      .then(async (res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setCountryOption(res.data.DATA)
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

    modelApi(tokenKey, data?.VEHICLE_MAKE_CODE, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setModelOption(res.data)
          kycForm.setFieldsValue({
            model: data?.VEHICLE_MODEL_CODE == null ? "" : data?.VEHICLE_MODEL_CODE
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

  const kycFormSubmitHandle = (values) => {
    delete values.dob;
    delete values.fromDate;
    delete values.toDate;
    delete values.registrationFromDate;
    delete values.registrationToDate;

    values = { ...values, dob: dateOfBirth, fromDate: startDate, toDate: endDate, registrationDate: registrationStartDate, registrationEndDate: registrationEndDate, quotationId: quotationId?.toString(), idNumber: values.permanentVotersCard ? values.permanentVotersCard : values.passport ? values.passport : values.driverLicence ? values.driverLicence : values.bvn ? values.bvn : "" }
    delete values.permanentVotersCard
    delete values.passport
    delete values.driverLicence
    delete values.bvn
    setAllLoading(true);
    generatePolicyApi(tokenKey, values, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          kycForm.resetFields();
          setIsKYCFormModalOpen(false);
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: "Your Policy has been generated successfully with Policy Number " + res?.data?.POLICY_NUMBER, response: true, error: false })
          cardStats();
          getUnderwritingQuotationsHandle("", "", "", "", "", true);
        } else {
          if (res.responseCode == "KYC-8001") {
            kycForm.resetFields();
            setIsKYCFormModalOpen(false);
            setIsKYCForm2ModalOpen(true);
            setKYCStatusResponse({ value: res.message, response: true, error: true })
            cardStats();
            getUnderwritingQuotationsHandle("", "", "", "", "", true);
          } else {
            setIsKYCForm2ModalOpen(true);
            setKYCStatusResponse({ value: res.message, response: true, error: true })
            getUnderwritingQuotationsHandle("", "", "", "", "", true);
          }

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

  const handleCancel = () => {
    setIsKYCFormModalOpen(false);
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
        <div className="quotation-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="quotation-card-inner">
                <div className="quotation-card">
                  <p>Total Quotation</p>
                  <h2>{cardStatsData && cardStatsData[0]?.NO_OF_QUOTATION ? cardStatsData[0]?.NO_OF_QUOTATION : 0}</h2>
                </div>
                <div className="quotation-card">
                  <p>Quotation MTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.MTD_QUOT ? cardStatsData[0]?.MTD_QUOT : 0}</h2>
                </div>
                <div className="quotation-card">
                  <p>Quotation YTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.YTD_QUOT ? cardStatsData[0]?.YTD_QUOT : 0}</h2>
                </div>
              </div>
              <div className="quotation-data">
                <div className="quotation-card-header">
                  <h6>Quotation List</h6>
                  {!directQuotationData.length ?
                    <></> :
                    <ul>
                      <li onClick={handleCSVDownload}>CSV Download</li>
                    </ul>
                  }
                </div>
                <div className="quotation-card-body">
                  {isDataStatus ?
                    <div className="quotation-no-data">
                      <img src={noData} alt="" />
                      <h6>There is presently no user data available</h6>
                    </div>
                    :
                    <>
                      <Table
                        columns={directQuotationColumns}
                        dataSource={directQuotationData}
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
              <div className="underwriting-quotation-header">
                <span onClick={backToPolicyList}><img src={BackArrow} /></span>
                <em>Motor Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">
                  <h6>
                    <span className="insured-name">{quotationByIdData?.INSURED_NAME && quotationByIdData?.INSURED_NAME[0]}</span>
                    <em className="policyTitle">
                      <span>{quotationByIdData?.INSURED_NAME}</span>
                      <em>Quotation No. : <strong className="policyNumber">{quotationByIdData?.QUOTATION_NUMBER}</strong></em>
                    </em>
                  </h6>
                </div>
                <div className="underwriting-insurance-body">
                  <div className="underwriting-insurance-details">
                    <ul>
                      {/* <li><strong>Insured Code :</strong><span>{quotationByIdData?.INSURED_CODE}</span></li> */}
                      <li><strong>Insured Name :</strong><span>{quotationByIdData?.INSURED_NAME === null ? "-" : quotationByIdData?.INSURED_NAME}</span></li>
                      <li><strong>Quotation No :</strong><span>{quotationByIdData?.QUOTATION_NUMBER}</span></li>
                      <li><strong>Vehicle Registration No.  :</strong><span>{quotationByIdData?.Vehicle_Details?.Vehicle_Registration_Number === "" || quotationByIdData?.Vehicle_Details?.Vehicle_Registration_Number === null ? "-" : quotationByIdData?.Vehicle_Details?.Vehicle_Registration_Number}</span></li>
                      <li><strong>Vehicle Make :</strong><span>{quotationByIdData?.Vehicle_Details?.VEHICLE_MAKE === "" || quotationByIdData?.Vehicle_Details?.VEHICLE_MAKE === null ? "-" : quotationByIdData?.Vehicle_Details?.VEHICLE_MAKE}</span></li>
                      <li><strong>Vehicle Model :</strong><span>{quotationByIdData?.Vehicle_Details?.VEHICLE_MODEL === "" || quotationByIdData?.Vehicle_Details?.VEHICLE_MODEL === null ? "-" : quotationByIdData?.Vehicle_Details?.VEHICLE_MODEL}</span></li>
                      <li><strong>Quotation Date :</strong><span>{moment(quotationByIdData.START_DATE).format('DD-MM-YYYY hh:mm:ss A')}</span></li>
                      <li><strong>Mobile :</strong><span>{quotationByIdData?.INSURED_MOBILE_NUMBER}</span></li>
                      <li><strong>Email :</strong><span>{quotationByIdData?.INSURED_EMAIL_ID}</span></li>
                      {/* <li><strong>Date of Birth :</strong><span>{quotationByIdData?.INSURED_DOB === null || quotationByIdData?.INSURED_DOB === "" ? "-" : moment(quotationByIdData?.INSURED_DOB).format('DD-MM-YYYY')}</span></li> */}
                      {/* <li><strong>ID Type :</strong><span>{quotationByIdData?.INSURED_ID_TYPE === null || quotationByIdData?.INSURED_ID_TYPE === "" ? "-" : quotationByIdData?.INSURED_ID_TYPE}</span></li>
                      <li><strong>ID Number :</strong><span>{quotationByIdData?.INSURED_ID_NUMBER === null || quotationByIdData?.INSURED_ID_NUMBER === "" ? "-" : quotationByIdData?.INSURED_ID_NUMBER}</span></li> */}
                      <li><strong>Plan :</strong><span>{quotationByIdData?.PLAN_NAME}</span></li>
                      <li><strong>Product Name :</strong><span>{quotationByIdData?.PRODUCT_NAME}</span></li>
                      {/* <li><strong>Product Code :</strong><span>{quotationByIdData?.PRODUCT_CODE}</span></li> */}
                      <li><strong>Premium Type :</strong><span>{quotationByIdData?.PREMIUM_PREIOD_TYPE == 1 ? "Annual" : quotationByIdData?.PREMIUM_PREIOD_TYPE == 2 ? "Half Yearly" : quotationByIdData?.PREMIUM_PREIOD_TYPE == 3 ? "Quarterly" : quotationByIdData?.PREMIUM_PREIOD_TYPE == 4 ? "Monthly" : quotationByIdData?.PREMIUM_PREIOD_TYPE == 5 ? "Day" : ""}</span></li>
                      {quotationByIdData?.PREMIUM_PREIOD_TYPE == 5 ? <li><strong>Number Of Days :</strong><span>{quotationByIdData?.NUMBER_OF_DAYS}</span></li> : <></>}
                      <li><strong>Sum Insured Amount :</strong><span>{Number(quotationByIdData?.SUM_INSURED_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                      <li><strong>Premium Amount :</strong><span>{Number(quotationByIdData?.TOTAL_PREMIUM_AMOUNT).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          }
        </div>
      </div>


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
              rules={[{ required: true, message: 'Please Select Title' }]}
            >
              <Select
                onChange={titleHandle}
                disabled={kycStatusValue == 102 ? true : false}
              >
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
              <Select disabled={genderDisabled || kycStatusValue == 102 ? true : false}>
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
              <Input onKeyDown={companyHandleKeyDown} maxLength={40} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Middle Name"
              name="middleName"
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={40} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: 'Enter your Last Name!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={40} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="emailId"
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
              <Input className={email.error === true ? "error" : ""} onChange={emailHandleKeyDown} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Phone Number"
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
                maxLength='13'
                onChange={testMobileNo}
                onKeyDown={mobileHandleKeyDown}
                disabled={kycStatusValue == 102 ? true : false}
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
                disabled={kycStatusValue == 102 ? true : false}
              />
            </Form.Item>
            <Form.Item
              label="Select ID type"
              name="idType"
              rules={[{ required: true, message: 'Select your ID Type!' }]}
            >
              <Select onChange={idTypeHandle} disabled={kycStatusValue == 102 ? true : false}>
                <Option value="PVC">Permanent Voters Card</Option>
                <Option value="International Passport">International Passport</Option>
                <Option value="Driver's Licence">Driver's Licence</Option>
                <Option value="BVN">BVN</Option>
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
                <Input className={pvcNumber.error === true ? "error" : ""} onChange={pvcHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={19} disabled={kycStatusValue == 102 ? true : false} />
              </Form.Item>
              : idType === "International Passport" ?
                <Form.Item
                  label="Passport Number"
                  name="passport"
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
                  <Input className={passportNumber.error === true ? "error" : ""} onChange={passportHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={9} disabled={kycStatusValue == 102 ? true : false} />
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
                    <Input className={drivingNumber.error === true ? "error" : ""} onChange={drivingHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={11} disabled={kycStatusValue == 102 ? true : false} />
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
                        disabled={kycStatusValue == 102 ? true : false}
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
              <Input onKeyDown={addressHandleKeyDown} maxLength={200} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
              rules={[{ required: true, message: 'Please Select Country' }]}
            >
              <Select
                placeholder="Select Country"
                onChange={selectCountry}
                disabled={kycStatusValue == 102 ? true : false}
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
                disabled={kycStatusValue == 102 ? true : false}
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
                disabled={kycStatusValue == 102 ? true : false}
              >
                {cityOption?.map((item, index) => {
                  return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                })}
              </Select>
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
                disabled={kycStatusValue == 102 ? true : false}
                onChange={(a, b) => {
                  setStartDate(b.split("/").join("-"));
                  kycForm.setFieldsValue({
                    toDate: moment(b).add(1, 'years').subtract(1, 'days'),
                    // toDate: moment("19-09-2023", "DD-MM-YYYY").add(1, 'years').format('YYYY-MM-DD'),
                  });
                }}
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              label="Policy End Date"
              name="toDate"
            // rules={[{ required: true, message: 'Select Policy End Date!' }]}
            >
              <DatePicker
                // disabled={!startDate ? true : false}
                disabled={true}
              // defaultValue={moment(startDate)}
              // onChange={(a, b) => {
              //   setEndDate(b.split("/").join("-"));
              // }}
              // disabledDate={disabledDate}
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
              <Input onKeyDown={alphaNumericHandleKeyDown} maxLength={10} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="Make"
              name="make"
              rules={[{ required: true, message: 'Please Select Make' }]}
            >
              <Select
                placeholder="Select Make"
                onChange={selectMake}
                disabled={kycStatusValue == 102 ? true : false}
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
                disabled={kycStatusValue == 102 ? true : false}
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
                disabled={kycStatusValue == 102 ? true : false}
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
              <Input onKeyDown={numbricKeyDownHandle} maxLength={20} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>
            <Form.Item
              label="AutoType"
              name="autoType"
              rules={[{ required: true, message: 'Enter your auto type!' }]}
            >
              {/* <Input onKeyDown={alphaHandleKeyDown} maxLength={20} /> */}
              <Select disabled={kycStatusValue == 102 ? true : false}>
                <Option value="Car">Car</Option>
                <Option value="Truck">Truck</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Year Of Make"
              name="yearOfMake"
              rules={[{ required: true, message: 'Enter your year of make!' }]}
            >
              <Input onKeyDown={numbricKeyDownHandle} maxLength={4} disabled={kycStatusValue == 102 ? true : false} />
            </Form.Item>

            <div className="tooltip-input-item">
              <Tooltip title="I and O char(Char. Not accepted by the NAICOM)" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                <span><InfoCircleOutlined /></span>
              </Tooltip>
              <Form.Item
                label="Chassis No"
                name="chassisNo"
                rules={[{ required: true, message: 'Enter your chassis no!' }]}
              >
                <Input onKeyDown={chassisHandleKeyDown} maxLength={20} disabled={kycStatusValue == 102 ? true : false} />
              </Form.Item>
            </div>

            <div className="tooltip-input-item">
              <Tooltip title="Please provide the Vehicle category, eg. SUV, Sedan etc." className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
                <span><InfoCircleOutlined /></span>
              </Tooltip>
              <Form.Item
                label="Vehicle Category"
                name="vehicleCategory"
                rules={[{ required: true, message: 'Enter your vehicle category!' }]}
              >
                <Input onKeyDown={alphaHandleKeyDown} maxLength={20} disabled={kycStatusValue == 102 ? true : false} />
              </Form.Item>
            </div>

          </div>

          {
            kycStatusValue == 102 ?
              <></>
              :
              <>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Submit</Button>
                </Form.Item>
              </>
          }

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

Quotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  quotation: makeSelectQuotation()
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
)(Quotation);
