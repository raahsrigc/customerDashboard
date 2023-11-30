/**
 *
 * DanaQuotation
 *
 */
import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDanaQuotation from "./selectors";
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
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import Modal from 'antd/es/modal';
import Select from 'antd/es/select';
import DatePicker from 'antd/es/date-picker';
import Divider from 'antd/es/divider';
import { SearchOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { danaSummaryDataApi, getAllDanaQuotationApi, getAllDanaQuotationByIdApi, getAllDanaBuyPolicyApi, countryData, stateData, cityData } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function DanaQuotation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "danaQuotation", reducer });
  useInjectSaga({ key: "danaQuotation", saga });

  const title = "Domestic Quotation";
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

  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);

  const { Option } = Select;
  const [kycForm] = Form.useForm();
  const [isKYCFormModalOpen, setIsKYCFormModalOpen] = useState(false);
  const [email, setEmail] = useState({ value: null, error: false });
  const [mobileNo, setMobileNo] = useState({ value: null, error: false });
  const [email2, setEmail2] = useState({ value: null, error: false });
  const [mobileNo2, setMobileNo2] = useState({ value: null, error: false });
  const [idType, setIdType] = useState("");
  const [pvcNumber, setpvcNumber] = useState({ value: null, error: false });
  const [drivingNumber, setDrivingNumber] = useState({ value: null, error: false });
  const [passportNumber, setPassportNumber] = useState({ value: null, error: false });
  const [bvnNumber, setBvnNumber] = useState({ value: null, error: false });
  const [countryOption, setCountryOption] = useState([]);
  const [stateOption, setStateOption] = useState([]);
  const [cityOption, setCityOption] = useState([]);
  const [kycStatusResponse, setKYCStatusResponse] = useState({ value: null, response: false, error: false });
  const [isKYCForm2ModalOpen, setIsKYCForm2ModalOpen] = useState(false);
  const [quotationId, setQuotationId] = useState("");
  const [genderDisabled, setGenderDisabled] = useState(false);

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token ? userData.token : "";

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

  const emailHandleKeyDown2 = (e) => {
    const validRegex = /^(([a-zA-Z0-9._]{1,50})|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]{2,50}\.)+[a-zA-Z]{2,20}))$/;
    if (e.target.value.match(validRegex)) {
      setEmail2({ value: e.target.value, error: false })
      return true;
    } else {
      setEmail2({ value: "", error: true })
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
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setMobileNo({ value: e.target.value, error: false });
      return true;
    } else {
      setMobileNo({ value: "", error: true })
      return false;
    }
  }

  function testMobileNo2(e) {
    const alpha = /((^091)([0-9]{8}$))|((^090)([0-9]{8}$))|((^070)([0-9]{8}))|((^080)([0-9]{8}$))|((^081)([0-9]{8}$))|((^234)([0-9]{10}$))/;
    if (alpha.test(e.target.value)) {
      setMobileNo2({ value: e.target.value, error: false });
      return true;
    } else {
      setMobileNo2({ value: "", error: true })
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

  function companyHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9& ]+$");
    const key = e.key;
    if (!regex.test(key) || e.key === " " && e.target.value.length === 0) {
      e.preventDefault();
      return false;
    }
  }

  function alphaHandleKeyDown(e) {
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

  function alphaNumericHandleKeyDown(e) {
    const regex = new RegExp("^[a-zA-Z0-9]+$");
    const key = e.key;
    if (!regex.test(key)) {
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
    danaSummaryDataApi(tokenKey, toggleBtn)
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
      getUnderwritingPolicyHandle(1, perPage);
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    getUnderwritingPolicyHandle(pageNumber, pageCount);
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
    getAllDanaQuotationApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Quote_#!!"] = data["QUOTE_#"];
            data["Email_Id!"] = data["EMAIL_ID"];
            data["Mobile_#!"] = data["MOBILE_#"];
            data["Created_On!"] = data["CREATED_ON"];
            delete data["QUOTE_#"]
            delete data["EMAIL_ID"]
            delete data["MOBILE_#"]
            delete data["CREATED_ON"]
            return data;
          })

          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS" && key !== "REQUEST_ID") {
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
                key: 'status',
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <span className="pending-status" onClick={() => buyPolicyHandle(records)}>Complete KYC</span>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setDirectAllPolicyColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On!"] = moment(responseData["Created_On!"]).format("DD-MM-YYYY");
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
    getAllDanaQuotationByIdApi(tokenKey, data?.ID, toggleBtn)
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
    if (tokenKey !== "") {
      getUnderwritingPolicyHandle("", "", "", "", "", true);
    }
  }, [tokenKey])

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
    getAllDanaQuotationApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
              obj["Quotation #"] = item["QUOTE_#"];
              obj["Email Id"] = item["EMAIL_ID"];
              obj["Mobile #"] = item["MOBILE_#"];
              obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
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
          FileSaver.saveAs(data1, `quotation-List-${datestring}${fileExtension}`);
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

  const buyPolicyHandle = (data) => {
    setKYCStatusResponse({ value: null, response: false, error: false })
    setIsKYCFormModalOpen(true);
    setQuotationId(data)
    setAllLoading(true)
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

  const kycFormSubmitHandle = async (values) => {
    for (let i = 0; i < values.travellerDetails.length; i++) {
      values.travellerDetails[i].travellerType = i + 1
      values.travellerDetails[i].age = moment(new Date()).diff(moment(values?.travellerDetails[i]?.dob, "MM/DD/YYYY"), 'years')
      values.travellerDetails[i].dob = moment(values?.travellerDetails[i]?.dob)?.format("YYYY-MM-DD");
      values.travellerDetails[i].idNumber = values.travellerDetails[i]?.permanentVotersCard ? values.travellerDetails[i]?.permanentVotersCard : values.travellerDetails[i]?.passport ? values.travellerDetails[i]?.passport : values.travellerDetails[i]?.driverLicence ? values.travellerDetails[i]?.driverLicence : values.travellerDetails[i]?.bvn ? values.travellerDetails[i]?.bvn : "";
      values.travellerDetails[i].kinDateOfBirth = moment(values?.travellerDetails[i]?.kinDateOfBirth)?.format("YYYY-MM-DD");
      values.travellerDetails[i].kinCity = null;
      values.travellerDetails[i].kinCountry = null;
      values.travellerDetails[i].kinNationality = null;
      values.travellerDetails[i].kinIdType = null;
      values.travellerDetails[i].kinIdNumber = null;
      values.travellerDetails[i].kinBeneficiaryName = null;
      values.travellerDetails[i].kinBeneficiaryRelationshipToApplicant = null;
      values.travellerDetails[i].kinCorrespondenceStreetLine = null;
      values.travellerDetails[i].kinCorrespondenceCityOrTown = null;
      delete values.travellerDetails[i].permanentVotersCard
      delete values.travellerDetails[i].passport
      delete values.travellerDetails[i].driverLicence
      delete values.travellerDetails[i].bvn
    }

    const data = {
      quotationId: quotationId.ID,
      requestId: quotationId.REQUEST_ID,
      ...values
    }
    setAllLoading(true);
    getAllDanaBuyPolicyApi(tokenKey, data, toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.success === true) {
          kycForm.resetFields();
          setIsKYCFormModalOpen(false);
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: res.message, response: true, error: false })
          cardStats();
          getUnderwritingPolicyHandle("", "", "", "", "", true);
        } else {
          setIsKYCForm2ModalOpen(true);
          setKYCStatusResponse({ value: res.message, response: true, error: true })
          getUnderwritingPolicyHandle("", "", "", "", "", true);
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
                  <h2>{cardStatsData && cardStatsData[0]?.totalquote ? cardStatsData[0]?.totalquote : 0}</h2>
                </div>
                <div className="quotation-card">
                  <p># Quotation YTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.thisyearquote ? cardStatsData[0]?.thisyearquote : 0}</h2>
                </div>
                <div className="quotation-card">
                  <p># Quotation MTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.currentmonthquote ? cardStatsData[0]?.currentmonthquote : 0}</h2>
                </div>
              </div>
              <div className="quotation-data">
                <div className="quotation-card-header">
                  <h6>Quotation List</h6>
                  {!directAllPolicyData.length ?
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
              <div className="underwriting-quotation-header">
                <span onClick={backToPolicyList}><img src={BackArrow} /></span>
                <em>Travel Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">
                  <h6>
                    <span className="insured-name">{policyIdData?.value?.INSURED_NAME && policyIdData?.value?.INSURED_NAME[0]}</span>
                    <em className="policyTitle">
                      <span>{policyIdData?.value?.INSURED_NAME}</span>
                      <em>Quotation No. : <strong className="policyNumber">{policyIdData?.value?.QUATATION_NUMBER}</strong></em>
                    </em>
                  </h6>
                </div>
                <div className="underwriting-insurance-body">
                  <div className="underwriting-insurance-details">
                    <ul>
                      <>
                        <li><b>Quotation Number :</b><span>{policyIdData?.value?.QUATATION_NUMBER}</span></li>
                        <li><b>Insured Name :</b><span>{policyIdData?.value?.INSURED_NAME}</span></li>
                        <li><b>Email Id :</b><span>{policyIdData?.value?.EMAIL_ID}</span></li>
                        <li><b>Mobile Number :</b><span>{policyIdData?.value?.MOBILE}</span></li>
                        <li><b>Package :</b><span>{policyIdData?.value?.PACKAGE_NAME ? policyIdData?.value?.PACKAGE_NAME : <span className="pending-status">N/A</span>}</span></li>
                        <li><b>No. Of Days :</b><span>{policyIdData?.value?.NO_OF_DAYS}</span></li>
                        <li><b>No. Of Adults :</b><span>{policyIdData?.value?.NO_OF_ADULTS}</span></li>
                        <li><b>No. Of Minors :</b><span>{policyIdData?.value?.NO_OF_MINOR}</span></li>
                        {/* <li><b>Return :</b><span>{policyIdData?.value?.IS_RETURN == "1" ? "True" : "False"}</span></li> */}
                        <li><b>Source :</b><span>{policyIdData?.value?.SECTOR_FROM}</span></li>
                        <li><b>Destination :</b><span>{policyIdData?.value?.SECTOR_TO}</span></li>
                        <li><b>Departure Date :</b><span>{moment(policyIdData?.value?.DEPARTURE_DATE).format("DD-MM-YYYY")}</span></li>
                        <li><b>Return Date :</b><span>{policyIdData?.value?.RETURN_DATE == null ? "N/A" : moment(policyIdData?.value?.RETURN_DATE).format("DD-MM-YYYY")}</span></li>
                        <li><b>Premium Amount :</b><span>{policyIdData?.value?.REQUESTED_SI_PREMIUM?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        <li><b>Status :</b><span><span className="success-status">Success</span></span></li>

                        <li className="cover-details"><b>Cover Details :</b>
                          <span>
                            <span>#</span>
                            <span>Cover Description</span>
                            <span>Cover Amount</span>
                          </span>
                          {policyIdData?.value?.travelInsurancePlan?.map((item, index) => {
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
                    </ul>
                  </div>
                </div>
              </div>
            </>
          }
        </div>
      </div>

      <Modal width={1370} className="kyc-form-modal" title="Complete KYC" centered visible={isKYCFormModalOpen} onCancel={handleCancel}>
        <Form
          name="basic"
          onFinish={kycFormSubmitHandle}
          autoComplete="off"
          form={kycForm}
        >
          <Form.List name="travellerDetails"
            initialValue={[
              { title: "", gender: "", firstName: "", surname: "", dob: "", address: "", country: "", state: "", city: "", },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }} align="baseline">

                    <Form.Item
                      {...restField}
                      label="Tilte"
                      name={[name, 'title']}
                      rules={[{ required: true, message: 'Please Select Title' }]}
                    >
                      <Select>
                        <Option value="Mr." attr-gender="Male">Mr.</Option>
                        <Option value="Mrs." attr-gender="Female">Mrs.</Option>
                        <Option value="Miss." attr-gender="Female">Miss.</Option>
                        <Option value="Dr." attr-gender="Unisex">Dr.</Option>
                        {/* <Option value="Mr. and Mrs." attr-gender="Unisex">Mr. and Mrs.</Option> */}
                        {/* <Option value="Mr. and Ms" attr-gender="Unisex">Mr. and Ms</Option> */}
                        {/* <Option value="Mrs. and Ms" attr-gender="Female">Mrs. and Ms</Option> */}
                        {/* <Option value="Mr. and Miss" attr-gender="Unisex">Mr. and Miss</Option> */}
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
                      {...restField}
                      label="Gender"
                      name={[name, 'gender']}
                      rules={[{ required: true, message: 'Please Select Gender' }]}
                    >
                      <Select disabled={genderDisabled ? true : false}>
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="First Name"
                      name={[name, 'firstName']}
                      rules={[{ required: true, message: 'Missing First Name' }]}
                    >
                      <Input
                        onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Middle Name"
                      name={[name, 'middleName']}
                    >
                      <Input onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Last Name"
                      name={[name, 'surname']}
                      rules={[{ required: true, message: 'Missing Last Name' }]}
                    >
                      <Input onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="DOB"
                      name={[name, 'dob']}
                      valuePropName={'date'}
                      rules={[{ required: true, message: 'Enter your Date of Birth!' }]}
                    >
                      <DatePicker
                        disabledDate={dateBirthdisabled}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Email"
                      name={[name, 'emailId']}
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (email2.value !== null) {
                              if (email2.error === true) {
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
                      <Input onChange={emailHandleKeyDown2} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Phone Number"
                      name={[name, 'phoneNumber']}
                      rules={[
                        {
                          required: true,
                          validator(_, value) {
                            let error;
                            if (mobileNo2.value !== null) {
                              if (mobileNo2.error === true) {
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
                        maxLength='13'
                        onChange={testMobileNo2}
                        onKeyDown={mobileHandleKeyDown}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Occupation"
                      name={[name, 'occupation']}
                      rules={[{ required: true, message: 'Missing Occupation' }]}
                    >
                      <Input onKeyDown={companyHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Address"
                      name={[name, 'address']}
                      rules={[{ required: true, message: 'Enter your Address!' }]}
                    >
                      <Input onKeyDown={addressHandleKeyDown} minLength={5} maxLength={500} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Country"
                      name={[name, 'country']}
                      rules={[{ required: true, message: 'Please Select Country' }]}
                    >
                      <Select
                        onChange={selectCountry}
                      >
                        {countryOption?.map((item, index) => {
                          return <Option value={item.Code} key={index}>{item.Description}</Option>
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="State"
                      name={[name, 'state']}
                      rules={[{ required: true, message: 'Please Select State' }]}
                    >
                      <Select
                        onChange={selectState}
                      >
                        {stateOption?.map((item, index) => {
                          return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="LGA"
                      name={[name, 'city']}
                      rules={[{ required: true, message: 'Please Select LGA!' }]}
                    >
                      <Select>
                        {cityOption?.map((item, index) => {
                          return <Option value={item.CODE} key={index}>{item.NAME}</Option>
                        })}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="ID Type"
                      name={[name, 'idType']}
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
                        {...restField}
                        label="Permanent Voters ID"
                        name={[name, 'permanentVotersCard']}
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
                        <Input onChange={pvcHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={19} />
                      </Form.Item>
                      : idType === "International Passport" ?
                        <Form.Item
                          {...restField}
                          label="Passport"
                          name={[name, 'passport']}
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
                          <Input onChange={passportHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={9} />
                        </Form.Item>
                        : idType === "Driver's Licence" ?
                          <Form.Item
                            {...restField}
                            label="Driver's Licence Number"
                            name={[name, 'driverLicence']}
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
                            <Input onChange={drivingHandle} onKeyDown={alphaNumericHandleKeyDown} maxLength={11} />
                          </Form.Item>
                          : idType === "BVN" ?
                            <Form.Item
                              {...restField}
                              label="BVN Number"
                              name={[name, 'bvn']}
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

                    <Divider />

                    <Form.Item
                      {...restField}
                      label="Relationship With Kin"
                      name={[name, 'relationshipWithNextOfKin']}
                      rules={[{ required: true, message: 'Please Select Relationship With Kin' }]}
                    >
                      <Select disabled={genderDisabled ? true : false}>
                        <Option value="brother">Brother</Option>
                        <Option value="father">Father</Option>
                        <Option value="mother">Mother</Option>
                        <Option value="sister">Sister</Option>
                        <Option value="wife">Wife</Option>
                        <Option value="husband">Husband</Option>
                        <Option value="son">Son</Option>
                        <Option value="daughter">Daughter</Option>
                        <Option value="others">Others</Option>

                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Title"
                      name={[name, 'kinTitle']}
                      rules={[{ required: true, message: 'Please Select Kin Title' }]}
                    >
                      <Select>
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
                      {...restField}
                      label="Kin Gender"
                      name={[name, 'kinGender']}
                      rules={[{ required: true, message: 'Please Select Kin Gender' }]}
                    >
                      <Select disabled={genderDisabled ? true : false}>
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                        <Option value="Other">Other</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin First Name"
                      name={[name, 'kinFirstName']}
                      rules={[{ required: true, message: 'Missing Kin First Name' }]}
                    >
                      <Input onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Middle Name"
                      name={[name, 'kinMiddleName']}
                    >
                      <Input onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Last Name"
                      name={[name, 'kinLastName']}
                      rules={[{ required: true, message: 'Missing Kin Last Name' }]}
                    >
                      <Input onKeyPress={alphaHandleKeyDown} minLength={3} maxLength={20} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Kin DOB"
                      name={[name, 'kinDateOfBirth']}
                      valuePropName={'date'}
                      rules={[{ required: true, message: 'Enter your Kin Date of Birth!' }]}
                    >
                      <DatePicker
                        disabledDate={dateBirthdisabled}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Email"
                      name={[name, 'kinEmail']}
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
                      <Input onChange={emailHandleKeyDown} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Phone Number"
                      name={[name, 'kinPhoneNumber']}
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
                        maxLength='13'
                        onChange={testMobileNo}
                        onKeyDown={mobileHandleKeyDown}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Kin Address"
                      name={[name, 'kinAddress']}
                      rules={[{ required: true, message: 'Enter your Kin Address!' }]}
                    >
                      <Input onKeyDown={addressHandleKeyDown} minLength={5} maxLength={500} />
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add field
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

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

DanaQuotation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  danaQuotation: makeSelectDanaQuotation()
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
)(DanaQuotation);
