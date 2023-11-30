/**
 *
 * DanaPolicy
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectDanaPolicy from "./selectors";
import reducer from "./reducer";
import saga from "./saga";

import noData from "../../images/no-data.svg";
import BackArrow from '../../images/back-arrow.svg';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import notification from 'antd/es/notification';
import Space from 'antd/es/space';
import Input from 'antd/es/input';
import Modal from 'antd/es/modal';
import Divider from 'antd/es/divider';
import Pagination from 'antd/es/pagination';
import Spin from 'antd/es/spin';
import moment from "moment";
import { SearchOutlined, FilePdfOutlined, MinusCircleOutlined, PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Highlighter from "react-highlight-words";
/* file download import */
import jsPDF from 'jspdf';
import * as autoTable from 'jspdf-autotable'
const XLSX = require('xlsx');
var FileSaver = require('file-saver');
import { danaSummaryDataApi, getAllDanaPolicyApi, getAllDanaPolicyByIdApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

export function DanaPolicy({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "danaPolicy", reducer });
  useInjectSaga({ key: "danaPolicy", saga });

  const title = "Domestic Policy";
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
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isStatus, setIsStatus] = useState("");
  let searchInput1;
  const [colNameArr, setColNameArr] = useState([]);
  const [colValueArr, setColValueArr] = useState([]);
  const [searchTableHandle, setSearchTableHandle] = useState(false);
  const [kycForm] = Form.useForm();
  const [isKYCFormModalOpen, setIsKYCFormModalOpen] = useState(false);

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
    getAllDanaPolicyApi(tokenKey, pageNumber, pageCount, colNameArr[colNameArr.length - 1], colValueArr[colValueArr.length - 1], isSearch, toggleBtn)
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
            data["Created_On!"] = data["CREATED_ON"];
            data["Premium_Amount!"] = data["PREMIUM_AMOUNT"];

            delete data["CLIENT_NAME"]
            delete data["CUSTOMER_TYPE"]
            delete data["MOBILE_#"]
            delete data["POLICY_#"]
            delete data["POLICY_TYPE"]
            delete data["PNR_#"]
            delete data["PREMIUM_AMOUNT"]
            delete data["CREATED_ON"]
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
                key: 'status',
                sorter: (a, b) => {
                  return a?.Status?.props?.children.localeCompare(b?.Status?.props?.children, 'en', { numeric: true })
                },
                render: (x, records) => {
                  return (
                    <span className="success-status">Success</span>
                  )
                },
              }
            ]

            dataColumn.push(...object3);

            setDirectAllPolicyColumns(dataColumn);
            const tableData = object1.map((item, index) => {
              let responseData = { ...item } || {};
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
    getAllDanaPolicyByIdApi(tokenKey, data?.ID, toggleBtn)
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
    getAllDanaPolicyApi(tokenKey, 1, 5535, "", "", false, toggleBtn)
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
              obj["Created On"] = moment(item["CREATED_ON"]).format("DD-MM-YYYY");
              obj["Premium Amount"] = Number(item["PREMIUM_AMOUNT"])?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ");
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
  };

  const travellerDetailsHandle = (item) => {
    setIsKYCFormModalOpen(true);
    kycForm.setFieldsValue({
      title: item?.TITLE,
      gender: item?.GENDER,
      firstName: item?.FIRST_NAME,
      middleName: item?.MIDDLE_NAME,
      surname: item?.SURNAME,
      dob: moment(item?.DOB)?.format("DD-MM-YYYY"),
      email: item?.EMAIL,
      phoneNumber: item?.MOBILE_NUMBER,
      occupation: item?.OCCUPATION,
      address: item?.ADDRESS,
      country: item?.COUNTRY,
      state: item?.STATE_NAME,
      city: item?.CITY_NAME,
      idType: item?.ID_TYPE,
      idNumber: item?.ID_NUMBER,
      relationshipWithNextOfKin: item?.KIN_DETAILS?.RELATIONSHIP_WITH_NEXT_KIN,
      kinTitle: item?.KIN_DETAILS?.KIN_TITLE,
      kinGender: item?.KIN_DETAILS?.KIN_GENDER,
      kinFirstName: item?.KIN_DETAILS?.KIN_FIRST_NAME,
      kinMiddleName: item?.KIN_DETAILS?.KIN_MIDDLE_NAME,
      kinLastName: item?.KIN_DETAILS?.KIN_LAST_NAME,
      kinDateOfBirth: moment(item?.KIN_DETAILS?.KIN_DOB)?.format("DD-MM-YYYY"),
      kinEmail: item?.KIN_DETAILS?.KIN_EMAIL,
      kinPhoneNumber: item?.KIN_DETAILS?.KIN_MOBILE_NUMBER,
      kinAddress: item?.KIN_DETAILS?.KIN_ADDRESS
    });
  }

  const handleCancel = () => {
    setIsKYCFormModalOpen(false);
    kycForm.resetFields();
    setIsKYCModalOpen(false);
  }


  const kycHandle = (data) => {
    setIsKYCModalOpen(true);
    setIsStatus(data)
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="policy-main-section" onClick={outSideClick}>
          {steps == "1" ?
            <>
              <div className="policy-card-inner">
                <div className="policy-card">
                  <p>Total Policy</p>
                  <h2>{cardStatsData && cardStatsData[0]?.totalpolicy ? cardStatsData[0]?.totalpolicy : 0}</h2>
                </div>
                <div className="policy-card">
                  <p># Policy YTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.thisYearpolicy ? cardStatsData[0]?.thisYearpolicy : 0}</h2>
                </div>
                <div className="policy-card">
                  <p># Policy MTD</p>
                  <h2>{cardStatsData && cardStatsData[0]?.currentMonthpolicy ? cardStatsData[0]?.currentMonthpolicy : 0}</h2>
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
                <em>Travel Insurance</em>
              </div>
              <div className="underwriting-insurance-data">
                <div className="underwriting-insurance-header">
                  <h6>
                    <span className="insured-name">{policyIdData?.value?.GENERAL_POLICY?.insuredName && policyIdData?.value?.GENERAL_POLICY?.insuredName[0]}</span>
                    <em className="policyTitle">
                      <span>{policyIdData?.value?.GENERAL_POLICY?.insuredName}</span>
                      <em>Policy No. : <strong className="policyNumber">{policyIdData?.value?.GENERAL_POLICY?.policyNumber}</strong></em>
                    </em>
                  </h6>
                </div>
                <div className="underwriting-insurance-body">
                  <div className="underwriting-insurance-details">
                    <ul>
                      <>
                        <li><b>Policy Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.policyNumber}</span></li>
                        <li><b>Insured Name :</b><span>{policyIdData?.value?.GENERAL_POLICY?.insuredName}</span></li>
                        <li><b>Email Id :</b><span>{policyIdData?.value?.GENERAL_POLICY?.emailId}</span></li>
                        <li><b>Mobile Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.mobileNumber}</span></li>
                        <li><b>Date Of Birth :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.dob).format("DD-MM-YYYY")}</span></li>
                        {/* <li><b>Client Name :</b><span>{policyIdData?.value?.GENERAL_POLICY?.cleintName}</span></li> */}
                        <li><b>Package :</b><span>{policyIdData?.value?.GENERAL_POLICY?.package_name ? policyIdData?.value?.GENERAL_POLICY?.package_name : <span className="pending-status">N/A</span>}</span></li>
                        {/* <li><b>Certificate Number :</b><span>{policyIdData?.value?.GENERAL_POLICY?.certificateNumber}</span></li> */}
                        <li><b>Policy Valid From :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.fromDate).format("DD-MM-YYYY")}</span></li>
                        {/* <li><b>Multicity :</b><span>{policyIdData?.value?.GENERAL_POLICY?.isMulticity == "1" ? "True" : "False"}</span></li> */}
                        {/* <li><b>Return :</b><span>{policyIdData?.value?.GENERAL_POLICY?.isReturn == "1" ? "True" : "False"}</span></li> */}
                        <li><b>Source  :</b><span>{policyIdData?.value?.GENERAL_POLICY?.SECTOR_FROM}</span></li>
                        <li><b>Destination :</b><span>{policyIdData?.value?.GENERAL_POLICY?.SECTOR_TO}</span></li>
                        <li><b>Departure Date :</b><span>{moment(policyIdData?.value?.GENERAL_POLICY?.fromDate).format("DD-MM-YYYY")}</span></li>
                        <li><b>Return Date :</b><span>{policyIdData?.value?.GENERAL_POLICY?.toDate == null ? "N/A" : moment(policyIdData?.value?.GENERAL_POLICY?.toDate).format("DD-MM-YYYY")}</span></li>
                        <li><b>Premium Amount :</b><span>{policyIdData?.value?.GENERAL_POLICY?.premiumAmount?.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</span></li>
                        {policyIdData?.value?.GENERAL_POLICY?.IS_KYC == 1 ? <li><b>Policy Certificate :</b><span><a href={policyIdData?.value?.GENERAL_POLICY?.idurl_GI} target="_blank" rel="noopener noreferrer" download><FilePdfOutlined /></a></span></li> : <></>}
                        <li><b>NAICOM Status : </b><span>{policyIdData?.value?.GENERAL_POLICY?.Naicom_Status == "Pending" ? <em className='pending blink-animation'>Pending</em> : policyIdData?.value?.GENERAL_POLICY?.Naicom_Status == "Success" ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("NAICOM")} /></>}</span></li>
                        <li><b>KYC Status : </b><span>{policyIdData?.value?.GENERAL_POLICY?.IS_KYC == 0 ? <em className='pending blink-animation'>Pending</em> : policyIdData?.value?.GENERAL_POLICY?.IS_KYC == 1 ? <><em className='approved'>Success</em></> : <><em className='rejected'>Failed</em> <InfoCircleOutlined onClick={() => kycHandle("KYC")} /></>}</span></li>
                        <li><b>Status :</b><span>{policyIdData?.value?.GENERAL_POLICY?.status == "1" ? <span className="success-status">Success</span> : <span className="pending-status">N/A</span>}</span></li>
                        <li className="traveller-details"><b>Traveller Details :</b>
                          <span>
                            <span>#</span>
                            <span>Title</span>
                            <span>Gender</span>
                            <span>First Name</span>
                            <span>Surname</span>
                            <span>DOB</span>
                            <span>Action</span>
                          </span>
                          {policyIdData?.value?.GENERAL_POLICY?.TRAVELLER_DETAILS?.map((item, index) => {
                            return (
                              <span key={index}>
                                <span>{index + 1}.</span>
                                <span>{item?.TITLE}</span>
                                <span>{item?.GENDER}</span>
                                <span>{item?.FIRST_NAME}</span>
                                <span>{item?.SURNAME}</span>
                                <span>{moment(item?.DOB).format("DD-MM-YYYY")}</span>
                                <span className="view-details"><em onClick={() => travellerDetailsHandle(item)}>View Details</em></span>
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
                    </ul>
                  </div>
                </div>
              </div>
            </>
          }
        </div>
      </div>


      <Modal width={1370} className="kyc-form-policy-modal" title="Traveller Details" centered visible={isKYCFormModalOpen} onCancel={handleCancel}>
        <Form
          name="basic"
          autoComplete="off"
          form={kycForm}
        >
          <Form.Item
            label="Tilte"
            name='title'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Gender"
            name='gender'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="First Name"
            name='firstName'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Middle Name"
            name='middleName'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Surname"
            name='surname'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="DOB"
            name='dob'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Email"
            name='email'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Phone Number"
            name='phoneNumber'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Occupation"
            name='occupation'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Address"
            name='address'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Country"
            name='country'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="State"
            name='state'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="LGA"
            name='city'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="ID Type"
            name='idType'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="ID Number"
            name='idNumber'
          >
            <Input disabled={true} />
          </Form.Item>

          <Divider />

          <Form.Item
            label="Relationship With Kin"
            name='relationshipWithNextOfKin'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Title"
            name='kinTitle'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Gender"
            name='kinGender'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin First Name"
            name='kinFirstName'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Middle Name"
            name='kinMiddleName'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Last Name"
            name='kinLastName'
          >
            <Input disabled={true} />
          </Form.Item>

          <Form.Item
            label="Kin DOB"
            name='kinDateOfBirth'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Email"
            name='kinEmail'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Phone Number"
            name='kinPhoneNumber'
          >
            <Input disabled={true} />
          </Form.Item>
          <Form.Item
            label="Kin Address"
            name='kinAddress'
          >
            <Input disabled={true} />
          </Form.Item>

        </Form>
      </Modal>


      <Modal width={400} className="kyc-status-modal" title={isStatus == "NAICOM" ? "NAICOM Status" : "KYC Status"} centered visible={isKYCModalOpen} onCancel={handleCancel}>
        <p>{isStatus == "NAICOM" ? Array.isArray(policyIdData?.value?.GENERAL_POLICY?.NAICOM_Response_Remark) ? policyIdData?.value?.GENERAL_POLICY?.NAICOM_Response_Remark.length ? policyIdData?.value?.GENERAL_POLICY?.NAICOM_Response_Remark[0] : "Failed" : policyIdData?.value?.GENERAL_POLICY?.NAICOM_Response_Remark == "" ? "Failed" : policyIdData?.value?.GENERAL_POLICY?.NAICOM_Response_Remark : policyIdData?.value?.GENERAL_POLICY?.KYC_FAILURE_REMARKS}</p>
      </Modal>
    </>
  );
}

DanaPolicy.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  danaPolicy: makeSelectDanaPolicy()
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
)(DanaPolicy);
