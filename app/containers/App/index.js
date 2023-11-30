/**
 *
 * App
 *
 */

import React, { memo, useState, useEffect, createContext } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectApp from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import SideBar from '../../components/SideBar/Loadable';
import Login from 'containers/Login/Loadable';
import SignUp from 'containers/SignUp/Loadable';
import ForgotPassword from 'containers/ForgotPassword/Loadable';
import EmailVerify from 'containers/EmailVerify/Loadable';
import Home from 'containers/Home/Loadable';
import GetStarted from 'containers/GetStarted/Loadable';
import ProfileInformation from 'containers/ProfileInformation/Loadable';
import ChangePassword from 'containers/ChangePassword/Loadable';
import Quotation from 'containers/Quotation/Loadable';
import Claim from 'containers/Claim/Loadable';
import MotorGenerateQuotation from 'containers/MotorGenerateQuotation/Loadable';
import Policy from 'containers/Policy/Loadable';
import DeviceQuotation from 'containers/DeviceQuotation/Loadable';
import DeviceBuyPolicy from 'containers/DeviceBuyPolicy/Loadable';
import DevicePolicy from 'containers/DevicePolicy/Loadable';
import DeviceClaim from 'containers/DeviceClaim/Loadable';
import DomesticGenerateQuotation from 'containers/DomesticGenerateQuotation/Loadable';
import DanaQuotation from 'containers/DanaQuotation/Loadable';
import DanaPolicy from 'containers/DanaPolicy/Loadable';
import InternationalGenerateQuotation from 'containers/InternationalGenerateQuotation/Loadable';
import InternationalTravelQuotation from 'containers/InternationalTravelQuotation/Loadable';
import InternationalTravelPolicy from 'containers/InternationalTravelPolicy/Loadable';
import PersonalAccidentGenerateQuotation from 'containers/PersonalAccidentGenerateQuotation/Loadable';
import PersonalAccidentQuotation from 'containers/PersonalAccidentQuotation/Loadable';
import PersonalAccidentPolicy from 'containers/PersonalAccidentPolicy/Loadable';
import PersonalAccidentClaim from 'containers/PersonalAccidentClaim/Loadable';
import CreditLifeGeneratePolicy from "containers/CreditLifeGeneratePolicy/Loadable";
import CreditLifePolicy from "containers/CreditLifePolicy/Loadable";
import CreditLifeClaim from "containers/CreditLifeClaim/Loadable";

import DomesticDanaPolicy from 'containers/DomesticDanaPolicy/Loadable';

import WalletSoa from 'containers/WalletSoa/Loadable';
import SessionExpired from 'containers/SessionExpired/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import GlobalStyle from '../../global-styles';

export const profileContext = createContext();

const AuthenticatedRoute = ({ component: Component, data, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      sessionStorage.getItem('sessionRefNo') ? (
        <Component {...props} {...data} />
      ) : (
        <Redirect to="/registration/login" />
      )
    }
  />
);

AuthenticatedRoute.propTypes = {
  component: PropTypes.func,
  user: PropTypes.object,
};

const UnauthenticatedRoute = ({ component: Component, data, user, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      sessionStorage.getItem('sessionRefNo') ? (
        <Redirect to="/registration/get-started" />
      ) : (
        <Component {...props} {...data} />
      )
    }
  />
);

UnauthenticatedRoute.propTypes = {
  component: PropTypes.func,
  user: PropTypes.object,
};

const BaseRoute = () => (
  sessionStorage.getItem('sessionRefNo') ? (
    <Redirect to="/registration/get-started" />
  ) : (
    <Redirect to="/registration/login" />
  )
);

export function App(props) {
  useInjectReducer({ key: "app", reducer });
  useInjectSaga({ key: "app", saga });

  const access = sessionStorage.getItem("access");
  const accessName = sessionStorage.getItem("accessName");
  const [pathname, setPathname] = useState("/registration");
  const [sideBarToggle, setSideBarToggle] = useState(false);
  const [sideBarMobileToggle, setSideBarMobileToggle] = useState(false);
  const [userData, setUserData] = useState({});
  const [accountActivation, setAccountActivation] = useState(false);
  const [servicesActivation, setServicesActivation] = useState(false);
  const [accessData, setAccessData] = useState("");


  const sessionExpiredData = "Session Expired. Please login again";
  const invalidSessionData = "Invalid Session";
  const invalidAgentData = "Invalid Agent";
  const [profileImageUpdate, setProfileImageUpdate] = useState("");

  // for default test mode on
  const [toggleBtn, setToggleBtn] = useState(false); 

  // for default live mode on
  // const [toggleBtn, setToggleBtn] = useState(sessionStorage?.getItem("activatedAccount") === "ACTIVE" ? true : false);

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [window.location.pathname])


  return (
    <profileContext.Provider value={{ profileImageUpdate, setProfileImageUpdate }}>
      <section className={sideBarToggle ? "main-section active" : sideBarMobileToggle ? "main-section mobileMenu" : "main-section"}>
        {!['/registration/signup', '/registration/login', '/registration/forgot-password', '/registration/email-verify', '/registration/session-expired', '/registration/invalid-session' , '/registration/invalid-agent'].includes(
          pathname,
        ) && <SideBar sideBarData={{ sideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, profileImageUpdate, accountActivation, servicesActivation, setAccessData }} />}

        <Switch>
          <Route exact path="/" render={BaseRoute} />
          <Route exact path="/registration" render={BaseRoute} />
          <UnauthenticatedRoute exact path="/registration/login" component={Login} />
          <UnauthenticatedRoute exact path="/registration/signup" component={SignUp} />
          <UnauthenticatedRoute exact path="/registration/forgot-password" component={ForgotPassword} />
          <UnauthenticatedRoute exact path="/registration/email-verify" component={EmailVerify} />
          <AuthenticatedRoute exact path="/registration/get-started" component={GetStarted} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn, setAccountActivation, setAccessData }} />
          <AuthenticatedRoute exact path="/registration/home" component={Home} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn, setAccountActivation, setAccessData }} />
          <AuthenticatedRoute exact path="/registration/profile-information" component={ProfileInformation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
          <AuthenticatedRoute exact path="/registration/change-password" component={ChangePassword} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />

          {access == 1 ?
            <>
              <AuthenticatedRoute exact path="/registration/motor/generate-quotation" component={MotorGenerateQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
              <AuthenticatedRoute exact path="/registration/motor/quotation" component={Quotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
              <AuthenticatedRoute exact path="/registration/motor/policy" component={Policy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
              <AuthenticatedRoute exact path="/registration/motor/claim" component={Claim} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
              <AuthenticatedRoute exact path="/registration/motor/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
              {/* <UnauthenticatedRoute exact path="/registration/motor/session-expired" component={SessionExpired} data={{ sessionExpiredData }} />
              <UnauthenticatedRoute exact path="/registration/motor/invalid-session" component={SessionExpired} data={{ invalidSessionData }} /> */}
            </>
            :
            access == 31 ?
              <>
                <AuthenticatedRoute exact path="/registration/device/generate-quotation" component={DeviceQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                <AuthenticatedRoute exact path="/registration/device/quotation" component={DeviceBuyPolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                <AuthenticatedRoute exact path="/registration/device/policy" component={DevicePolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                <AuthenticatedRoute exact path="/registration/device/claim" component={DeviceClaim} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                <AuthenticatedRoute exact path="/registration/device/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                {/* <UnauthenticatedRoute exact path="/registration/device/session-expired" component={SessionExpired} data={{ sessionExpiredData }} />
                <UnauthenticatedRoute exact path="/registration/device/invalid-session" component={SessionExpired} data={{ invalidSessionData }} /> */}
              </>
              :
              access == 6 ?
                <>
                  <AuthenticatedRoute exact path="/registration/personal-accident/generate-quotation" component={PersonalAccidentGenerateQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/personal-accident/quotation" component={PersonalAccidentQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/personal-accident/policy" component={PersonalAccidentPolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/personal-accident/claim" component={PersonalAccidentClaim} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/personal-accident/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                </>
                : 
                access == 10005 ?
                <>
                  <AuthenticatedRoute exact path="/registration/credit-life/generate-policy" component={CreditLifeGeneratePolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/credit-life/policy" component={CreditLifePolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                  <AuthenticatedRoute exact path="/registration/credit-life/claim" component={CreditLifeClaim} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                </>
                :
                access == 33 ?
                  <>
                    {accessName == "Domestic Travel Insurance" ?
                      <>
                        <AuthenticatedRoute exact path="/registration/domestic-travel/generate-quotation" component={DomesticGenerateQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/domestic-travel/quotation" component={DanaQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/domestic-travel/policy" component={DanaPolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/domestic-travel/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                      </>
                      :
                      accessName == "Dana Air Travel Insurance" ?
                      <>
                        <AuthenticatedRoute exact path="/registration/domestic-travel/dana/policy" component={DomesticDanaPolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/domestic-travel/dana/life/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/domestic-travel/dana/travel/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                      </>
                      :
                      <>
                        <AuthenticatedRoute exact path="/registration/international-travel/generate-quotation" component={InternationalGenerateQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/international-travel/quotation" component={InternationalTravelQuotation} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/international-travel/policy" component={InternationalTravelPolicy} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                        <AuthenticatedRoute exact path="/registration/international-travel/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                      </>
                    }

                  </>
                  :
                  <>
                    <AuthenticatedRoute exact path="/registration/soa" component={WalletSoa} data={{ sideBarToggle, setSideBarToggle, sideBarMobileToggle, setSideBarMobileToggle, userData, setUserData, toggleBtn, setToggleBtn }} />
                    <UnauthenticatedRoute exact path="/registration/session-expired" component={SessionExpired} data={{ sessionExpiredData }} />
                    <UnauthenticatedRoute exact path="/registration/invalid-session" component={SessionExpired} data={{ invalidSessionData }} />
                    <UnauthenticatedRoute exact path="/registration/invalid-agent" component={SessionExpired} data={{ invalidAgentData }} />
                  </>
          }

          <UnauthenticatedRoute component={NotFoundPage} />

        </Switch>
        <GlobalStyle />
      </section>
    </profileContext.Provider>
  );
}

// App.propTypes = {
//   dispatch: PropTypes.func.isRequired
// };

const mapStateToProps = createStructuredSelector({
  app: makeSelectApp()
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
)(App);
