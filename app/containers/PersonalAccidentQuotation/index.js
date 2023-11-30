/**
 *
 * PersonalAccidentQuotation
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
import makeSelectPersonalAccidentQuotation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import noData from "../../images/no-data.svg";
import SucessIcon from '../../images/successful-icon.svg';
import ErrorIcon from '../../images/error-icon.svg';
import logo from '../../images/logo.png';
import iconPhone from '../../images/icon-phone.png';
import iconEmail from '../../images/icon-mail.png';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import { Radio } from 'antd';
import Checkbox from 'antd/es/checkbox';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import { Tooltip } from 'antd';
import moment from "moment";
import Modal from 'antd/es/modal';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import { SearchOutlined, WalletOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { personalAccidentSummaryDataApi, getPersonalAccidentQuotationsApi, countryData, stateData, cityData, generatePersonalAccidentPolicyApi, makeApi, modelApi, getProfileData } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function PersonalAccidentQuotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "personalAccidentQuotation", reducer });
  useInjectSaga({ key: "personalAccidentQuotation", saga });

  const title = "Personal Accident Quotation";
  const [allLoading, setAllLoading] = useState(false);
  const [cardStatsData, setCardStatsData] = useState({});
  const [tablePagination, setTablePagination] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [perPage, setPerPage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchColumn] = useState("");
  const [directQuotationColumns, setDirectQuotationColumns] = useState([]);
  const [directQuotationData, setDirectQuotationData] = useState([]);
  const [isDataStatus, setIsDataStatus] = useState(false);
  const userId = sessionStorage.getItem('email');

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const { Option } = Select;
  const [kycForm] = Form.useForm();
  const [personalAccidentFormPay] = Form.useForm();
  const [isKYCFormModalOpen, setIsKYCFormModalOpen] = useState(false);
  const [isKYCForm2ModalOpen, setIsKYCForm2ModalOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [nokMobileNo, setNokMobileNo] = useState({ value: null, error: false });
  const [idType, setIdType] = useState("");
  const [pvcNumber, setpvcNumber] = useState({ value: null, error: false });
  const [drivingNumber, setDrivingNumber] = useState({ value: null, error: false });
  const [passportNumber, setPassportNumber] = useState({ value: null, error: false });
  const [bvnNumber, setBvnNumber] = useState({ value: null, error: false });
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [cityOption, setCityOption] = useState([]);
  const [kycStatusResponse, setKYCStatusResponse] = useState({ value: null, response: false, error: false });
  const [quotationId, setQuotationId] = useState("");
  const [genderDisabled, setGenderDisabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentCardData, setPaymentCardData] = useState();
  const [kycFormDataForPayment, setKycFormDataForPayment] = useState();
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [deviceBuyPolicyTermCheck, setDeviceBuyPolicyTermCheck] = useState();

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
  }

  function disabledDate(current) {
    const yesterday = moment(startDate, "YYYY-MM-DD")
    return (current && current < moment(yesterday, "YYYY-MM-DD")) || current < moment().subtract(1, 'months') || current > moment().add(1, 'months');
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

  function nokMobileHandle(e) {
    // const alpha = /^([0]{1})(?!\1+$)([7-9]{1})(?!\1+$)([0-1]{1})(?!\1+$)([0-9]{8})/;
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setNokMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setNokMobileNo({ value: "", error: true })
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
    stateData(tokenKey, value)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setStateOption(res.data)
          kycForm.setFieldsValue({
            state: "",
            city: "",
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

  const selectState = (value) => {
    cityData(tokenKey, value)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        if (res.status === true) {
          setCityOption(res.data)
          kycForm.setFieldsValue({
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
    getPersonalAccidentQuotationsApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Quote_#!"] = data["Quote_#"];
            data["Email!"] = data["Email"];
            data["Mobile_#!"] = data["Mobile_#"];
            data["Created_On!"] = data["Created_On"];
            data["Premium_Period_Type!"] = data["Premium_Period_Type"];
            data["Sum_Insured!"] = data["Sum_Insured"];
            data["Premium!"] = data["Premium"];

            delete data["Quote_#"]
            delete data["CURRENCY"]
            delete data["Mobile_#"]
            delete data["Email"]
            delete data["Sum_Insured"]
            delete data["Created_On"]
            delete data["Premium_Period_Type"]
            delete data["Premium"]
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
                  // onCell: (record, rowIndex) => {
                  //   return {
                  //     onClick: () => {
                  //       getQuotationByIdHandle(record);
                  //     },
                  //   };
                  // },
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
                      <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span>
                    </>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setDirectQuotationColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY")
              responseData["Sum_Insured!"] = Number(responseData["Sum_Insured!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium!"] = Number(responseData["Premium!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium_Period_Type!"] = responseData["Premium_Period_Type!"] == 0 ? "Annual" : responseData["Premium_Period_Type!"] == 4 ? "Monthly" : ""
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

  /* CSV download */
  const handleCSVDownload = async type => {
    setAllLoading(true)
    getPersonalAccidentQuotationsApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
              obj["Quote #"] = item["Quote_#"];
              obj["Email"] = item["Email"];
              obj["Mobile #"] = item["Mobile_#"];
              obj["Created On"] = moment(item["Created_On"]).format("DD-MM-YYYY");
              obj["Premium Type"] = item["Premium_Period_Type"] == 0 ? "Annual" : item["Premium_Period_Type"] == 4 ? "Monthly" : "";
              obj["Sum Insured"] = Number(item["Sum_Insured"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦");
              obj["Premium"] = Number(item["Premium"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦");
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
    setPaymentCardData(data)
    setIsKYCFormModalOpen(true);
    setQuotationId(data?.ID)
    kycForm.setFieldsValue({
      mobileNumber: data["Mobile_#!"] == null ? "" : data["Mobile_#!"],
      email: data["Email!"] == null ? "" : data["Email!"],
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

    values.estimateWages = values?.estimateWages?.replaceAll(",", "")
    values.estimateEarning = values?.estimateEarning?.replaceAll(",", "")
    delete values.dob;
    values = { ...values, dob: dateOfBirth, startDate: startDate, endDate: moment(values.toDate).format('YYYY-MM-DD'), coverType: "comprehensive", quotationId: quotationId?.toString(), idNumber: values.permanentVotersCard ? values.permanentVotersCard : values.passport ? values.passport : values.driverLicence ? values.driverLicence : values.bvn ? values.bvn : "" }

    delete values.fromDate;
    delete values.toDate;
    delete values.permanentVotersCard
    delete values.passport
    delete values.driverLicence
    delete values.bvn

    setKycFormDataForPayment(values);

    setIsKYCFormModalOpen(false);
    setPaymentMethodModal(true);

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

  const paymentMethodHandle = () => {
    console.log("payment method got hit", kycFormDataForPayment)
    setAllLoading(true);
    generatePersonalAccidentPolicyApi(tokenKey, kycFormDataForPayment, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          kycForm.resetFields();
          setIsKYCFormModalOpen(false);
          setIsKYCForm2ModalOpen(true);
          setPaymentMethodModal(false);
          getProfileHandle();
          setKYCStatusResponse({ value: "Your Policy has been generated successfully with Policy Number " + res?.data?.POLICY_NUMBER, response: true, error: false })
          cardStats();
          getUnderwritingQuotationsHandle("", "", "", "", "", true);
        } else {
          // kycForm.resetFields();
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: res.message, response: true, error: true })
          getUnderwritingQuotationsHandle("", "", "", "", "", true);
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

  const deviceBuyPolicyTermOnChange = (e) => {
    setDeviceBuyPolicyTermCheck(e.target.checked)
  }

  const handleCancel = () => {
    setIsKYCFormModalOpen(false);
    kycForm.resetFields();
    setKYCStatusResponse({ value: null, response: false, error: false })
    setPaymentMethodModal(false)
  }

  const handleCancel2 = () => {
    setIsKYCForm2ModalOpen(false);
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData }} />
        <div className="personal-accident-quotation-main-section" onClick={outSideClick}>
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
        </div>
      </div>


      <Modal width={900} className="kyc-form-modal" title="Complete KYC" centered visible={isKYCFormModalOpen} onCancel={handleCancel}>
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
            label="City"
            name="city"
            rules={[{ required: true, message: 'Please Select City!' }]}
          >
            <Select
              placeholder="Select City"
            >
              {cityOption?.map((item, index) => {
                return <Option value={item.CODE} key={index}>{item.NAME}</Option>
              })}
            </Select>
          </Form.Item>
          <Form.Item
            label="Policy Start Date"
            name="fromDate"
            rules={[{ required: true, message: 'Select Policy Start Date!' }]}
          >
            <DatePicker
              onChange={(a, b) => {
                setStartDate(b.split("/").join("-"));
                kycForm.setFieldsValue({
                  toDate: b == "" ? "" : moment(b).add(1, 'years').subtract(1, 'days'),
                });
              }}
              disabledDate={disabledDate}
            />
          </Form.Item>
          <Form.Item
            label="Policy End Date"
            name="toDate"
          >
            <DatePicker
              disabled={true}
            />
          </Form.Item>

          <div className="tooltip-input-item">
            <Tooltip title="Please provide the office building Name" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Building Name"
              name="premiseName"
              rules={[{ required: true, message: 'Enter your Building Name!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>

          <div className="tooltip-input-item">
            <Tooltip title="Location of Insurer Office" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Insurer Location"
              name="premiseLocation"
              rules={[{ required: true, message: 'Enter your Insurer Location!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>

          <div className="tooltip-input-item">
            <Tooltip title="What is the nature of Business Insurer does" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Insurer Occupation"
              name="premiseOccupation"
              rules={[{ required: true, message: 'Enter your Insurer Occupation!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Please provide the industry type" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Insurer Business type"
              name="premiseBusinessType"
              rules={[{ required: true, message: 'Enter your Insurer Business type!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>

          <div className="tooltip-input-item">
            <Tooltip title="Please provide as how many hours in a week Business works from this Premise" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Work Hour Range"
              name="workHourRange"
              rules={[{ required: true, message: 'Enter your Work Hour Range!' }]}
            >
              <Input onKeyDown={numbricKeyDownHandle} maxLength={3} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Please provide the individual specialisation" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Personal Specialisation"
              name="personalSpecialisation"
              rules={[{ required: true, message: 'Enter your Personal Specialisation!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Estimate wages per year, Provide an approx. number" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Estimate Wages"
              name="estimateWages"
              rules={[{ required: true, message: 'Enter your Estimate Wages!' }]}
            >
              {/* <Input onKeyDown={numbricKeyDownHandle} maxLength={12} /> */}
              <CurrencyFormat thousandSeparator={true} maxLength={12} className="amountInput" allowNegative={false} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Estimate Earnings per year, Provide an approx. number" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Estimate Earning"
              name="estimateEarning"
              rules={[{ required: true, message: 'Enter your Estimate Earning!' }]}
            >
              {/* <Input onKeyDown={numbricKeyDownHandle} maxLength={12} /> */}
              <CurrencyFormat thousandSeparator={true} maxLength={12} className="amountInput" allowNegative={false} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Name of Kin or Nominee for this Insurer" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Next To Kin"
              name="nextToKin"
              rules={[{ required: true, message: 'Enter your Next To Kin!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Relationship of Kin with Insurer" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Nok Relationship"
              name="nokRelationship"
              rules={[{ required: true, message: 'Enter your Nok Relationship!' }]}
            >
              <Input onKeyDown={companyHandleKeyDown} maxLength={100} />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Kin Phone number" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Nok Phone Number"
              name="nokPhoneNumber"
              rules={[
                {
                  required: true,
                  validator(_, value) {
                    let error;
                    if (nokMobileNo.value !== null) {
                      if (nokMobileNo.error === true) {
                        error = "Enter valid  Nok Phone Number!"
                      }
                    } else {
                      error = "Enter your Nok Phone Number!"
                    }
                    return error ? Promise.reject(error) : Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                className={nokMobileNo.error === true ? "error" : ""}
                maxLength='13'
                onChange={nokMobileHandle}
                onKeyDown={mobileHandleKeyDown}
              />
            </Form.Item>
          </div>
          <div className="tooltip-input-item">
            <Tooltip title="Address of kin" className="input-tooltip" overlayStyle={{ fontSize: "11px" }}>
              <span><InfoCircleOutlined /></span>
            </Tooltip>
            <Form.Item
              label="Nok Address"
              name="nokAddress"
              rules={[{ required: true, message: 'Enter your Nok Address!' }]}
            >
              <Input onKeyDown={addressHandleKeyDown} maxLength={200} />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">Next</Button>
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


      <Modal width={700} centered title="Pay Quote" className="payment-method-modal" visible={paymentMethodModal} onCancel={handleCancel}>
        <div className="buy-policy-payment-card">
          <div className="policy-payment-card-header">
            <div className="product-name">
              <Button>Personal Accident Insurance</Button>
            </div>
            <div className="payment-card-logo">
              <img src={logo} />
            </div>
          </div>
          <div className="card-premium">
            {/* <img src={buyPolicyPaymentImage} /> */}
            <div className="card-premium-amount">
              <span>Premium</span>
              <h4>{paymentCardData && paymentCardData["Premium!"]}</h4>
            </div>
          </div>
          <div className="card-info">
            <div className="card-info-col">
              <p>
                <span><img src={iconPhone} />{paymentCardData && paymentCardData["Mobile_#!"]}</span>
                <span><img src={iconEmail} />{paymentCardData && paymentCardData["Email!"]}</span>
              </p>
            </div>
            <div className="card-info-col">
              <h3>{paymentCardData && paymentCardData["Sum_Insured!"]}</h3>
              <p>Total sum insured</p>
            </div>
            {/* <div className="card-info-col">
              <h3>{loanDisbursementPremiumData?.RATE}%</h3>
              <p>
                Insurance Rate
              </p>
            </div> */}
          </div>
          {/* <div className="card-validity">
            <p>Invoice Validity</p>
            <p>
              <span>From: {}</span>
              <span>To: {}</span>
            </p>
          </div> */}
        </div>
        <h4>Payment Method</h4>
        <Form
          className="bulk-payment-form"
          onFinish={paymentMethodHandle}
          form={personalAccidentFormPay}
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
              {
                userData.wallet > 0 ?
                  <>
                    <Radio value="Wallet">
                      <div className="payment-radio">
                        <WalletOutlined />
                        Wallet ({Number(userData?.wallet)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })})
                      </div>
                    </Radio>
                  </>
                  :
                  <>
                  </>
              }
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="terms"
            valuePropName="checked"
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
      </Modal>
    </>
  );
}

PersonalAccidentQuotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  personalAccidentQuotation: makeSelectPersonalAccidentQuotation()
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
)(PersonalAccidentQuotation);
