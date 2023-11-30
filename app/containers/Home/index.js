/**
 *
 * Home
 *
 */

import React, { memo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import history from 'utils/history';

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectHome from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import Spin from 'antd/es/spin';
import TopBar from '../../components/TopBar/Loadable';
import './style.scss';
import moment from "moment";
import copy from "copy-to-clipboard";
import Tooltip from 'antd/es/tooltip';
import { EyeOutlined, EyeInvisibleOutlined, CopyOutlined } from '@ant-design/icons';
import { getCardsApi } from "../../services/AuthService";
import aes256 from "../../services/aes256";

// images
import iconMotor from '../../images/icon-motor.png';
import iconQuotation from '../../images/icon-quotation.png';
import iconPolicy from '../../images/icon-policy.png';
import iconClaim from '../../images/icon-claim.png';

export function Home({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setAccessData, setUserData }) {
  useInjectReducer({ key: "home", reducer });
  useInjectSaga({ key: "home", saga });
  const title = "Insurance Client";
  const activeAccount = sessionStorage.getItem("activatedAccount");
  const [cardStatsData, setCardStatsData] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [secretKey, setSecretKey] = useState("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
  const [visible, setVisible] = useState(false);
  const secretKeyData = toggleBtn === true && activeAccount === "ACTIVE" ? userData.productionKey : userData.token;

  const tokenKey = toggleBtn == true ? userData.productionKey : userData.token;

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


  const getCards = () => {
    setAllLoading(true)
    getCardsApi(tokenKey, toggleBtn)
      .then((res) => {
        setAllLoading(false)
        res.data = res.data == null ? res.data : JSON.parse(aes256.decrypt(res.data));
        setCardStatsData(res.data)
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
  };

  const getClientAutoRequestDetailsById = (data) => {
    setAccessData(data?.LOB_ID)
    sessionStorage.setItem("access", data?.LOB_ID);
    sessionStorage.setItem("accessName", data?.CARD_NAME);
    if (data?.LOB_ID == 1) {
      history.push("/registration/motor/generate-quotation");
    } else if (data?.LOB_ID == 31) {
      history.push("/registration/device/generate-quotation");
    } else if (data?.LOB_ID == 6) {
      history.push("/registration/personal-accident/generate-quotation");
    } else if (data?.LOB_ID == 10005) {
      history.push("/registration/credit-life/generate-policy");
    }
    else {
      if (data?.LOB_ID == 33) {
        if (data?.CARD_NAME === "Domestic Travel Insurance") {
          history.push("/registration/domestic-travel/generate-quotation");
        } else if (data?.CARD_NAME === "Dana Air Travel Insurance") {
          history.push("/registration/domestic-travel/dana/policy");
        } else {
          history.push("/registration/international-travel/generate-quotation");
        }
      }
    }
  }

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  useEffect(() => {
    getCards();
    sessionStorage.setItem("access", 0);
    sessionStorage.setItem("accessName", "");
  }, [tokenKey && toggleBtn])

  return (
    <div className="sidebar-tab-content">
      {allLoading ? <div className="page-loader"><div className="page-loader-inner"><Spin /><em>Please wait...</em></div></div> : <></>}
      <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />

      <div className="access-main" onClick={outSideClick}>
        <div className="access-grid">
          {cardStatsData?.map((item, index) => {
            return (
              <div className="access-card" key={index} onClick={() => { getClientAutoRequestDetailsById(item) }}>
                <div className="access-card-header">
                  <div className="access-card-image">
                    <img src={item?.LOB_ICON_IMAGE} alt="" />
                  </div>
                  <div className="access-card-content">
                    <h6>{item?.CARD_NAME}</h6>
                    <p>{item?.BENEFIT_TYPE}</p>
                  </div>
                  <div className="access-card-body">
                    <ul>
                      {
                        item?.LOB_ID == 10005 ?
                          <></>
                          :
                          <>
                            {item?.QUOTATION_VIEW == 1 ? <li><span># of Quotation : </span> <b className="total-policy">{item?.NO_OF_QUOTATION}</b></li> : <></>}
                          </>
                      }
                      <li><span># of Policy : </span> <b className="total-policy">{item?.NO_OF_POLICY}</b></li>
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}

          {/* New Card */}
          {/* <div class="access-card">
            <div class="access-card-header">
              <div class="access-card-image"><img src={iconMotor} alt="" /></div>
              <div class="access-card-body">
                <ul>
                  <li>
                    <span>
                      <img src={iconQuotation} alt="" />
                    </span>
                    <strong>
                      Quotation
                      <i>3</i>
                    </strong>
                  </li>
                  <li>
                    <span>
                      <img src={iconPolicy} alt="" />
                    </span>
                    <strong>
                      Policy
                      <i>10</i>
                    </strong>
                  </li>
                  <li>
                    <span>
                      <img src={iconClaim} alt="" />
                    </span>
                    <strong>
                      Claim
                      <i>5</i>
                    </strong>
                  </li>
                </ul>
              </div>
              <div class="access-card-content">
                <h6>Motor Insurance</h6>
              </div>

            </div>
          </div> */}
        </div>

        {/* <div className="secret-key">
          <div className="activate-account-content">
            <h6>{toggleBtn === true ? "Live Secret Key:" : "Test Secret Key:"}</h6>
            <p>{secretKey}</p>
          </div>
          <div className="secret-key-right">
            {visible ? <EyeOutlined onClick={visibleKeyHandle} /> : <EyeInvisibleOutlined onClick={inVisibleKeyHandle} />}
            <Tooltip title="Copy"><span className="copy-icon" onClick={secretKeyCopyClipboard}><CopyOutlined /></span></Tooltip>
          </div>
        </div> */}
      </div>
    </div>

  );
}

Home.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  home: makeSelectHome()
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
)(Home);
