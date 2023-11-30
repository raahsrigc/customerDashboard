/**
 *
 * GetStarted
 *
 */

import React, { memo, useEffect, useState } from "react";
// import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import copy from "copy-to-clipboard";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectGetStarted from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import notification from 'antd/es/notification';
import Button from 'antd/es/button';
import Tooltip from 'antd/es/tooltip';
import TopBar from '../../components/TopBar/Loadable';
import AccessDenied from '../../components/AccessDenied/Loadable';
import activateAccountImage from '../../images/activate-account-image.png';
import ActivateAccount from "../../components/ActivateAccount/Loadable"
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { rcVerifyData, activateAccountData } from './actions';
import { getProfileData } from "../../services/AuthService";

export function GetStarted({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn, setAccountActivation, activateAccountDataContent, rcVerifyDataContent, getStarted }) {
  useInjectReducer({ key: "getStarted", reducer });
  useInjectSaga({ key: "getStarted", saga });
  

  const title = "Get Started";
  const [visible, setVisible] = useState(false);
  const [activateActive, setActivateActive] = useState(false);
  const [steps, setSteps] = useState(1);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false)
  const [activateAccountStep1, setActivateAccountStep1] = useState(null);
  const [activateAccountStep2, setActivateAccountStep2] = useState(null);
  const [activateAccountStep3, setActivateAccountStep3] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [registrationDate, setRegistrationDate] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [seconddateOfBirth, setSecondDateOfBirth] = useState("");

  const [activatedAccountData, setActivatedAccountData] = useState(sessionStorage.getItem("activatedAccount"));
  const [secretKey, setSecretKey] = useState("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
  const [companyDetails, setCompanyDetails] = useState({})
  const activeAccount = sessionStorage.getItem("activatedAccount");
  const secretKeyData = toggleBtn === true && activeAccount === "ACTIVE" ? userData?.productionKey : userData.token;
  const email = sessionStorage.getItem("email")
  const [passportSizePhoto, setPassportSizePhoto] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const generateUniqueId = require('generate-unique-id');


  const inVisibleKeyHandle = () => {
    setVisible(!visible);
    setSecretKey(secretKeyData);
  }
  const visibleKeyHandle = () => {
    setVisible(!visible);
    setSecretKey("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
  }
  const secretKeyCopyClipboard = () => {
    copy(secretKeyData)
  }

  useEffect(() => {
    if (toggleBtn === true && visible === true) {
      setSecretKey(userData.productionKey);
    } else {
      setSecretKey("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
      if (toggleBtn === false && visible === true) {
        setSecretKey(userData.token);
      }
    }
  }, [toggleBtn])

  const activateHanlde = () => {
    setActivateActive(true)
  }
  const closeaAtivateHanlde = () => {
    setActivateActive(false)
  }
  const activateAccountStep1Handle = (value) => {
    setActivateAccountStep1(value);
    setSteps(2);
    setLoading(true);
    let businessType = value.businessType;
    let rcNumber = value.rcNumber
    rcVerifyDataContent({ businessType, rcNumber, "email": email, "environment": "Test" })
  }

  const activateAccountStep2Handle = (value) => {

    let id = value.permanentVotersCard || value.nationalIdentityCard || value.driverLicence || value.passport || value.bvn
    value.clientId = userData.customerId;
    delete value.permanentVotersCard;
    delete value.nationalIdentityCard;
    delete value.driverLicence;
    delete value.bvn;
    delete value.dob;

    value = { ...value, idNumber: id, dob: dateOfBirth, "environment":"Test", "country": "50001", "insuredCode": "" }
    setActivateAccountStep2(value);
    setActive(true)
    
  }

  const backHandle = () => {
    setActive(false)
  }

  const activateAccountStep3Handle = async (value) => {
    let id = value.permanentVotersCard || value.nationalIdentityCard || value.driverLicence || value.passport || value.bvn
    delete value.permanentVotersCard;
    delete value.nationalIdentityCard;
    delete value.driverLicence;
    delete value.bvn;
    delete value.DOB;

    value = { ...value, secondDirectorIdNumber: id, secondDirectorDOB: seconddateOfBirth }
    setActivateAccountStep3(value);
    setLoading(true);
  }

  useEffect(() => {
    setLoading(false)
    if (getStarted.rcVerifyResponse === undefined) {
      notification.info({
        duration: 3,
        message: 'Notification',
        description: "Please try again",
      });
    }
    if (getStarted && getStarted.rcVerifyResponse && getStarted.rcVerifyResponse.success === true) {
      setCompanyDetails(getStarted.rcVerifyResponse.data)
      setSteps(1);
    }
  }, [getStarted.rcVerifyResponse])

  useEffect(() => {
    if (activateAccountStep2 !== null) {
      activateAccountDataContent({ ...activateAccountStep1, ...activateAccountStep2, token: userData?.productionKey });
    }
  }, [activateAccountStep2])

  useEffect(() => {
    setLoading(false)
    if (getStarted.activateAccountResponse.success === true) {
      setSteps(2)
      setSuccessMsg(getStarted.activateAccountResponse.message)
      setAccountActivation(true);
      getProfile();
      setTimeout(() => {
        setActivateActive(false)
      }, [1500])
    }
  }, [getStarted.activateAccountResponse])

  const getProfile = () => {
    getProfileData(toggleBtn, { "email": email })
      .then((res) => {
        if (res.success === true) {
          setActivatedAccountData(res.data.isValidated)
          sessionStorage.setItem("activatedAccount", res.data.isValidated);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  return (
    <>
      <div className="sidebar-tab-content">
        {userData.accessId === "1" ?
          <>
            <AccessDenied userData={userData} />
          </>
          : userData.accessId === "0" ?
            <>
              <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
              <div onClick={outSideClick}>
                <div className="get-started-section">
                  <h2>Welcome To CoverQ Dashboard🌤</h2>
                  {activatedAccountData === "NOT_ACTIVE" ? <p>Activate your business to have access to various services that will support your business financial needs and support your various transactions needs. Complete the 2-step activation process to activate!</p> : <></>}
                </div>

                <div className="activate-account">
                  <div className="activate-account-content">
                    {activatedAccountData === "ACTIVE" ?
                      <>
                        <h2 className="activate-account-title"><span>Your account activation has been Successfully Completed.</span></h2>
                      </>
                      : activatedAccountData === "PENDING" || activatedAccountData === "1" ?
                        <>
                          <p>Your account activation has been initiated. We will get back to you once activation is done.</p>
                          <Button>Account Activation is Pending!</Button>
                        </>
                        :
                        <>
                          <h2>Activate your account</h2>
                          <p>To activate your account, Please reach out to your relationship manager.</p>
                          <Button onClick={activateHanlde}>Activate your account</Button>
                        </>
                    }
                  </div>
                  <div className="activate-account-image">
                    <img src={activateAccountImage} alt="" />
                  </div>
                </div>

                <div className="secret-key">
                  <div className="activate-account-content">
                    <h6>{toggleBtn === true ? "Live Secret Key:" : "Test Secret Key:"}</h6>
                    <p>{secretKey}</p>
                  </div>
                  <div className="secret-key-right">
                    {visible ? <EyeOutlined onClick={visibleKeyHandle} /> : <EyeInvisibleOutlined onClick={inVisibleKeyHandle} />}
                    <Tooltip title="Copy"><span className="copy-icon" onClick={secretKeyCopyClipboard}><CopyOutlined /></span></Tooltip>
                  </div>
                </div>
              </div>
            </>
            :
            <></>
        }
      </div>

      <ActivateAccount
        activateActive={activateActive}
        steps={steps}
        active={active}
        loading={loading}
        companyDetails={companyDetails}
        successMsg={successMsg}
        setDateOfBirth={setDateOfBirth}
        setSecondDateOfBirth={setSecondDateOfBirth}
        passportSizePhoto={passportSizePhoto}
        setPassportSizePhoto={setPassportSizePhoto}
        signatureUrl={signatureUrl}
        setSignatureUrl={setSignatureUrl}
        setRegistrationDate={setRegistrationDate}
        activateAccountStep1Handle={activateAccountStep1Handle}
        activateAccountStep2Handle={activateAccountStep2Handle}
        activateAccountStep3Handle={activateAccountStep3Handle}
        closeaAtivateHanlde={closeaAtivateHanlde}
        backHandle={backHandle}
        userData={userData}
        toggleBtn={toggleBtn}
      />
    </>
  );
}


// GetStarted.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  getStarted: makeSelectGetStarted()
});

function mapDispatchToProps(dispatch) {
  return {
    rcVerifyDataContent: (value) => {
      dispatch(rcVerifyData(value))
    },
    activateAccountDataContent: (value) => {
      dispatch(activateAccountData(value))
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose(
  withConnect,
  memo
)(GetStarted);
