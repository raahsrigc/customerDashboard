/**
 *
 * CreditLifePolicy
 *
 */

import React, { memo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectCreditLifePolicy from "./selectors";
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
import { creditSummaryDataApi, getCreditLifePolicyApi, getCreditLifeMasterPolicyApi, getCreditLifePolicyByIdApi, getPolicyHistoryApi, getCommentsApi, insertCommentApi, getPaymentHistoryApi, makeApi, modelApi, getKYCDataApi, updateKYCDetailsApi, updateNIIDKYCDetailsApi, countryData, stateData, cityData, getMotorQuotationInsuredDetailsApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function CreditLifePolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "creditLifePolicy", reducer });
  useInjectSaga({ key: "creditLifePolicy", saga });

  const title = "Credit Life Policy";
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
  const [policyType, setPolicyType] = useState("All Master Policy");
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
  const [isKYCForm2ModalOpen, setIsKYCForm2ModalOpen] = useState(false);
  const [modelOption, setModelOption] = useState([]);
  const [paymentHistoryData, setPaymentHistoryData] = useState();

  const [kycStatusResponse, setKYCStatusResponse] = useState({ value: null, response: false, error: false });
  const [isStatus, setIsStatus] = useState("");
  const [isDataStatus, setIsDataStatus] = useState(false);

  let searchInput1;

  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);


  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

  const idTypeHandle = (value) => {
    setIdType(value)
  }

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
    creditSummaryDataApi(tokenKey, toggleBtn)
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
        getCreditLifePolicyHandle(1, perPage);
      }
      if (policyType == "All Master Policy") {
        getCreditLifeMasterPolicyHandle(1, perPage);
      }
      setSearchTableHandle(false)
    }
  }, [searchTableHandle])


  const paginationHandle = (pageNumber, pageCount) => {
    if (policyType == "All Policy") {
      getCreditLifePolicyHandle(pageNumber, pageCount);
    }
    if (policyType == "All Master Policy") {
      getCreditLifeMasterPolicyHandle(pageNumber, pageCount);
    }
  }

  /* Quotation Table */
  const getCreditLifePolicyHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();

    setAllLoading(true)
    getCreditLifePolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Policy_#!"] = data["POLICY_#"];
            data["Mobile_#"] = data["MOBILE_#"] == null ? "N/A" : data["MOBILE_#"];
            data["Loan_Amount"] = data["LOAN_AMOUNT"];
            data["Premium_Amount"] = data["PREMIUM_AMOUNT"];
            data["Created_On!"] = data["CREATED_ON"];

            delete data["INSURED_NAME"]
            delete data["POLICY_#"]
            delete data["MOBILE_#"]
            delete data["LOAN_AMOUNT"]
            delete data["PREMIUM_AMOUNT"]
            delete data["CREATED_ON"]
            delete data["LOAN_TENURE"]
            delete data["CUSTOMER_NAME"]


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
                        getCreditLifePolicyByIdHandle(record);
                      },
                    };
                  },
                  ...getColumnSearchProps(key)
                };
                dataColumn.push(object);
              }
            }

            let object3 = [
              // {
              //   title: "Frequency",
              //   dataIndex: 'frequency',
              //   key: 'frequency',
              //   render: (x, records) => {
              //     return (
              //       <>
              //         <ul className="claimStatusCol" style={{ listStyle: "none" }}>
              //           {records?.FREQUENCY == "1" ?
              //             <li className="">Annual</li>
              //             :
              //             <li className="">Monthly</li>
              //           }
              //         </ul>
              //       </>
              //     )
              //   }
              // },
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
              responseData["Loan_Amount"] = Number(responseData["Loan_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Premium_Amount"] = Number(responseData["Premium_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
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

  const getCreditLifeMasterPolicyHandle = (pageNumber, pageCount, colName, colValue, isSearch, dataStatus) => {
    if (colValueArr.length) {
      isSearch = true;
    } else {
      isSearch = false;
    }
    colValue = colValue?.toString();

    setAllLoading(true)
    getCreditLifeMasterPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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

            data["Client_Name"] = data["CLIENT_NAME"];
            data["Policy_#!"] = data["POLICY_#"];
            data["Min_Loan_Amount!"] = data["MIN_LOAN_AMOUNT"];
            data["Max_Loan_Amount"] = data["MAX_LOAN_AMOUNT"];
            data["Created_On"] = data["CREATED_ON"];

            delete data["CLIENT_NAME"]
            delete data["POLICY_#"]
            delete data["MIN_LOAN_AMOUNT"]
            delete data["MAX_LOAN_AMOUNT"]
            delete data["CREATED_ON"]

            return data;
          })
          if (object1 && object1.length) {
            let dataColumn = [];

            for (let key in object1[0]) {
              if (key !== "ID" && key !== "STATUS" && key !== "FREQUENCY") {
                let object = {
                  title: key.replaceAll("_", " ")?.replaceAll("!", ""),
                  dataIndex: key,
                  key: key,
                  onCell: (record, rowIndex) => {
                    return {
                      onClick: () => {
                        getCreditLifePolicyByIdHandle(record);
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
                title: "Frequency",
                dataIndex: 'frequency',
                key: 'frequency',
                render: (x, records) => {
                  return (
                    <>
                      <ul className="claimStatusCol" style={{ listStyle: "none" }}>
                        {records?.FREQUENCY == "1" ?
                          <li className="">Annual</li>
                          :
                          <li className="">Monthly</li>
                        }
                      </ul>
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object3);

            let object4 = [
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
                          :
                          <></>
                        }
                      </ul>
                    </>
                  )
                }
              },
            ]
            dataColumn.push(...object4);

            setDirectAllPolicyColumns(dataColumn);

            const tableData = object1?.map((item, index) => {
              let responseData = { ...item } || {};
              responseData["Created_On"] = moment(responseData["Created_On"]).format("DD-MM-YYYY");
              responseData["Min_Loan_Amount!"] = Number(responseData["Min_Loan_Amount!"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
              responseData["Max_Loan_Amount"] = Number(responseData["Max_Loan_Amount"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })
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

  const getCreditLifePolicyByIdHandle = (data) => {
    setAllLoading(true);
    getCreditLifePolicyByIdApi(tokenKey, data?.ID, "2", policyType == "All Policy" ? "Loan" : "Master", toggleBtn)
      .then((res) => {
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setAllLoading(false);
        if (res.status === true) {
          setPolicyByIdData(res.data)
          setSteps("2")
          // getPolicyHistoryHandle(res.data)
          // getCommentsHandle(res.data)
          // setCommentSubmitBtn(false);
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
    getPaymentHistoryApi(tokenKey, data?.ID, "CREDIT_LIFE", toggleBtn)
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
      getCreditLifePolicyHandle("", "", "", "", "", true);
    } else {
      getCreditLifeMasterPolicyHandle("", "", "", "", "", true);
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
          await modelApi(tokenKey, res.data.make)
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
          getCreditLifePolicyHandle("", "", "", "", "", true);
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
    if (policyType === "All Policy") {
      getCreditLifePolicyApi(tokenKey, 1, 5535, "", "", false, "2", toggleBtn)
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
                obj["Policy_#"] = item["POLICY_#"];
                obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
                obj["Sum_Insured"] = Number(item["LOAN_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Premium"] = Number(item["PREMIUM_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Frequency"] = item["FREQUENCY"] == "1" ? "Annual" : "Monthly"
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
      getCreditLifeMasterPolicyApi(tokenKey, 1, 5535, "", "", false, "2", toggleBtn)
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
                obj["Insured_Name"] = item["CLIENT_NAME"];
                obj["Policy_#"] = item["POLICY_#"];
                obj["Min_Loan_Amount"] = Number(item["MIN_LOAN_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Max_Loan_Amount"] = Number(item["MAX_LOAN_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
                obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
                obj["Frequency"] = item["FREQUENCY"] == "1" ? "Annual" : "Monthly"
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

  const getPolicyHistoryHandle = (data) => {
    getPolicyHistoryApi(tokenKey, data?.POLICY_MASTER_ID, toggleBtn)
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
    insertCommentApi(tokenKey, values.comment, policyByIdData?.ID, 112, toggleBtn)
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
    getCommentsApi(tokenKey, 112, data.ID, toggleBtn)
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
    kycForm.resetFields();
    setKYCStatusResponse({ value: null, response: false, error: false })
  }

  const handleCancel2 = () => {
    setIsKYCForm2ModalOpen(false);
  }

  return (
    <div className="sidebar-tab-content">
      {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
      <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
      <div className="credit-life-policy-main-section" onClick={outSideClick}>
        {steps == "1" ?
          <>
            <div className="policy-card-inner">
              <div className={policyType == "All Master Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Master Policy")}>
                <p>Total Master Policy</p>
                <h2>{cardStatsData && cardStatsData?.POLICY_MASTER_ISSUED ? cardStatsData?.POLICY_MASTER_ISSUED : 0}</h2>
              </div>
              <div className={policyType == "All Policy" ? "policy-card active" : "policy-card"} onClick={() => policyCardHandle("All Policy")}>
                <p>Total Loan Disbursement Policy</p>
                <h2>{cardStatsData && cardStatsData?.POLICY_ISSUED ? cardStatsData?.POLICY_ISSUED : 0}</h2>
              </div>
              <div className="policy-card">
                <p>Policy MTD</p>
                <h2>{cardStatsData && cardStatsData?.currentMonth ? cardStatsData?.currentMonth : 0}</h2>
              </div>
              <div className="policy-card">
                <p>Policy YTD</p>
                <h2>{cardStatsData && cardStatsData?.thisYear ? cardStatsData?.thisYear : 0}</h2>
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
              <em>Credit Life</em>
            </div>
            <div className="underwriting-insurance-data">
              <div className="underwriting-insurance-header">
                <h6>
                  <span className="insured-name">{policyByIdData?.CLIENT_NAME ? policyByIdData?.CLIENT_NAME && policyByIdData?.CLIENT_NAME[0] : policyByIdData?.FIRST_NAME && policyByIdData?.FIRST_NAME[0]}</span>
                  <em className="policyTitle">
                    <span>{policyByIdData?.CLIENT_NAME ? policyByIdData?.CLIENT_NAME : `${policyByIdData?.FIRST_NAME == null ? "" : policyByIdData?.FIRST_NAME}` + " " + `${policyByIdData?.MIDDLE_NAME == null ? "" : policyByIdData?.MIDDLE_NAME}` + " " + `${policyByIdData?.LAST_NAME == null ? "" : policyByIdData?.LAST_NAME}`}</span>
                    <em>
                      Policy No. :
                      {
                        policyType == "All Policy" ?
                          <strong className="policyNumber">{policyByIdData?.POLICY_NUMBER}</strong>
                          :
                          <strong className="policyNumber">{policyByIdData?.CLIENT_POLICY_NUMBER ? policyByIdData?.CLIENT_POLICY_NUMBER : policyByIdData?.POLICY_NUMBER}</strong>
                      }
                    </em>
                  </em>
                </h6>
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
              </div>
              <div className="underwriting-insurance-body">
                <div className="underwriting-insurance-details">
                  <ul>
                    {
                      policyType == "All Master Policy" ?
                        <>
                          <li><strong>Policy No :</strong><span>{policyByIdData?.CLIENT_POLICY_NUMBER}</span></li>
                          <li><strong>Min Age :</strong><span>{policyByIdData?.MIN_AGE} Years</span></li>
                          <li><strong>Max Age :</strong><span>{policyByIdData?.MAX_AGE} Years</span></li>
                          <li><strong>Loan Category :</strong><span>{policyByIdData?.LOAN_TYPE}</span></li>
                          <li><strong>Loan Type :</strong><span>{policyByIdData?.TYPE_OF_LOAN}</span></li>
                          <li><strong>Period in Credit Business :</strong><span>{policyByIdData?.CREDIT_BUYSINESS_PERIOD} Years</span></li>
                          <li><strong>Min. Loan Tenure :</strong><span>{policyByIdData?.MIN_TERM} Months</span></li>
                          <li><strong>Max. Loan Tenure :</strong><span>{policyByIdData?.MAX_TERM} Months</span></li>
                          <li><strong>Activate :</strong><span>{moment(policyByIdData?.ACTIVATE_DATE).format('DD-MM-YYYY')} </span></li>
                          <li><strong>Expiry :</strong><span>{moment(policyByIdData?.ACTIVATE_DATE).add(policyByIdData?.MAX_TERM, "months").subtract(1, 'days').format('DD-MM-YYYY')}</span></li>
                          <li><strong>Frequency :</strong><span>{policyByIdData?.FREQUENCY == 1 ? "Annual" : "Monthly"}</span></li>
                          <li><strong>Min Loan Amount :</strong><span>{Number(policyByIdData?.MIN_LOAN_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                          <li><strong>Max Loan Amount :</strong><span>{Number(policyByIdData?.MAX_LOAN_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                          <li><strong>Illness :</strong><span>{policyByIdData?.CRITICAL_ILLNESS == true ? "Yes" : "No"}</span></li>
                          <li><strong>Death Covered :</strong><span>{policyByIdData?.DEATH_ONLY == true ? "Yes" : "No"}</span></li>
                          <li><strong>Disability :</strong><span>{policyByIdData?.DISABILITY == true ? "Yes" : "No"}</span></li>
                          <li><strong>Job Loss :</strong><span>{policyByIdData?.JOB_LOSS == true ? "Yes" : "No"}</span></li>
                          <li><strong>Loss Of Business :</strong><span>{policyByIdData?.IS_LOSS_OF_BUSINESS == true ? "Yes" : "No"}</span></li>
                        </>
                        :
                        <>
                          <li><strong>Title :</strong><span>{policyByIdData?.TITLE}</span></li>
                          <li><strong>Insured Name :</strong><span>{policyByIdData?.FIRST_NAME == null ? "" : policyByIdData?.FIRST_NAME} {policyByIdData?.MIDDLE_NAME == null ? "" : policyByIdData?.MIDDLE_NAME} {policyByIdData?.LAST_NAME == null ? "" : policyByIdData?.LAST_NAME}</span></li>
                          <li><strong>Gender :</strong><span>{policyByIdData?.SEX}</span></li>
                          <li><strong>Email :</strong><span>{policyByIdData?.EMAIL == null ? "N/A" : policyByIdData?.EMAIL}</span></li>
                          <li><strong>Mobile :</strong><span>{policyByIdData?.PHONE_NUMBER == null ? "N/A" : policyByIdData?.PHONE_NUMBER}</span></li>
                          <li><strong>DOB :</strong><span>{moment(policyByIdData?.DOB).format('DD-MM-YYYY')}</span></li>
                          <li><strong>Master Policy No :</strong><span>{policyByIdData?.CLIENT_POLICY_NUMBER}</span></li>
                          <li><strong>Client Name :</strong><span>{policyByIdData?.CUSTOMER_NAME}</span></li>
                          <li><strong>Min Age :</strong><span>{policyByIdData?.MIN_AGE} Years</span></li>
                          <li><strong>Max Age :</strong><span>{policyByIdData?.MAX_AGE} Years</span></li>
                          <li><strong>Borrower Type :</strong><span>{policyByIdData?.CLASS_OF_BORROWER}</span></li>
                          <li><strong>Job Loss :</strong><span>{policyByIdData?.JOB_LOSS == true ? "Yes" : "No"}</span></li>
                          <li><strong>Critical Illness/Hospitalization :</strong><span>{policyByIdData?.CRITICAL_ILLNESS == true ? "Yes" : "No"}</span></li>
                          <li><strong>Death Covered :</strong><span>{policyByIdData?.DEATH_ONLY == true ? "Yes" : "No"}</span></li>
                          <li><strong>Permanent Disability :</strong><span>{policyByIdData?.DISABILITY == true ? "Yes" : "No"}</span></li>
                          <li><strong>Loss Of Business :</strong><span>{policyByIdData?.IS_LOSS_OF_BUSINESS == true ? "Yes" : "No"}</span></li>
                          <li><strong>Activate :</strong><span>{moment(policyByIdData?.LOAN_START_DATE).format('DD-MM-YYYY')}</span></li>
                          <li><strong>Expiry :</strong><span>{moment(policyByIdData?.LOAN_START_DATE).add(policyByIdData?.LOAN_TENURE, "months").subtract(1, 'days').format('DD-MM-YYYY')}</span></li>
                          <li><strong>Frequency :</strong><span>{policyByIdData?.FREQUENCY == 1 ? "Annual" : "Monthly"}</span></li>
                          <li><strong>Loan Tenure :</strong><span>{policyByIdData?.LOAN_TENURE} Months</span></li>
                          <li><strong>Loan Amount :</strong><span>{Number(policyByIdData?.LOAN_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                          <li><strong>Premium Amount :</strong><span>{Number(policyByIdData?.PREMIUM_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                          <li><strong>Commission Amount :</strong><span>{Number(policyByIdData?.COMMISION_AMOUNT)?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' })}</span></li>
                          <li><strong>Commission Rate :</strong><span>{policyByIdData?.COMMISSION_RATE}%</span></li>
                          <li><strong>Narration :</strong><span>{policyByIdData?.MESSAGE}</span></li>
                        </>
                    }

                  </ul>
                </div>
              </div>
            </div>

            <div className="underwriting-policy-steps3-bottom">
              <div className="underwriting-insurance-data">
                <span className="sorting"><i onClick={sortingHandle}>{sorting ? <>Oldest First <SortDescendingOutlined /> </> : <>Newest First <SortDescendingOutlined /> </>}</i></span>
                <Tabs defaultActiveKey="1" onChange={commentTabChange}>
                  <TabPane tab="Payment History" key="1">
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
                  {/* <TabPane tab="Comments" key="2">
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
                  </TabPane> */}
                </Tabs>
              </div>
            </div>
          </>
        }
      </div>
    </div>
  );
}

CreditLifePolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  creditLifePolicy: makeSelectCreditLifePolicy()
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
)(CreditLifePolicy);
