/**
 *
 * SideBar
 *
 */

import React, { memo, useEffect, useState } from "react";
import './style.scss';
import { NavLink, Link } from 'react-router-dom';
import logo from '../../images/logo.png';
import logo2 from '../../images/favicon.png';
import Menu from 'antd/es/menu';
import notification from 'antd/es/notification';
import { HomeOutlined, FormOutlined, FileDoneOutlined, SnippetsOutlined, HddOutlined, ApiOutlined, LogoutOutlined, LoginOutlined, WalletOutlined } from '@ant-design/icons';
import { logout, getProfileData } from "../../services/AuthService";
import history from 'utils/history';

function SideBar({ sideBarData }) {

  const { SubMenu } = Menu;
  const email = sessionStorage.getItem('email');
  const access = sessionStorage.getItem("access");
  const accessName = sessionStorage.getItem("accessName");
  const [profileData, setProfileData] = useState({});
  const [profileImage, setProfileImage] = useState();
  const rootSubmenuKeys = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub6'];
  const [openKeys, setOpenKeys] = useState([]);

  const UATApiUrl = `https://docs.coverq.io/apidocs/developer/api-references/general-insurance/?status=true&session=UAT`
  const LiveApiUrl = `https://docs.coverq.io/apidocs/developer/api-references/general-insurance/?status=true&session=${sideBarData?.userData?.sessionKey}`

  const onOpenChange = keys => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  const handleLogout = () => {
    logout({ "email": email })
      .then((res) => {
        if (res.success === true) {
          sessionStorage.clear();
          localStorage.clear();
          window.location.href = "/registration/login";
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

  const getProfile = () => {
    getProfileData(sideBarData?.toggleBtn, { "email": email })
      .then((res) => {
        if (res.success === true) {
          setProfileData(res.data)
          setProfileImage(res.data.profilePic);
          sideBarData && sideBarData.setUserData(res.data)
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

  useEffect(() => {
    getProfile();
  }, [sideBarData.accountActivation || sideBarData.servicesActivation])

  useEffect(() => {
    setProfileImage(sideBarData && sideBarData.profileImage)
  }, [sideBarData && sideBarData.profileImage])

  const handleClick = () => {
    sideBarData.setSideBarMobileToggle(false)
  };

  const homePage = () => {
    history.push("/registration/home");
    sessionStorage.setItem("access", 0);
    sessionStorage.setItem("accessName", "");
    sideBarData && sideBarData.setAccessData(0)
  }


  return (
    <div className="side-bar" onClick={handleClick}>
      <div className="logo" onClick={homePage}>
        <Link to="/">
          <img src={sideBarData && sideBarData.sideBarToggle ? logo2 : logo} alt="" />
          <img src={logo} className="mobile-logo" alt="" />
        </Link>
      </div>

      <div className={(sideBarData && sideBarData.toggleBtn) || (sideBarData && sideBarData.userData.accessId === "1") ? "navigation" : "navigation in-visible"}>
        <Menu
          mode="inline"
          onOpenChange={onOpenChange}
          openKeys={openKeys}
        >
          <Menu.Item key="4"><NavLink to="/registration/get-started"><LoginOutlined /> <i>Get Started</i></NavLink></Menu.Item>
          <Menu.Item key="5" onClick={homePage}><NavLink to="/registration/home"><HomeOutlined /> <i>Home</i></NavLink></Menu.Item>
          {access == 1 ?
            <>
              <Menu.Item key="16"><NavLink to="/registration/motor/generate-quotation"><FormOutlined /> <i>Generate Quotation</i></NavLink></Menu.Item>
              <Menu.Item key="6"><NavLink to="/registration/motor/quotation"><FormOutlined /> <i>Quotation</i></NavLink></Menu.Item>
              <Menu.Item key="7"><NavLink to="/registration/motor/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
              <Menu.Item key="8"><NavLink to="/registration/motor/claim"><SnippetsOutlined /> <i>Claim</i></NavLink></Menu.Item>
              <Menu.Item key="9"><NavLink to="/registration/motor/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
            </>
            :
            access == 31 ?
              <>
                <Menu.Item key="10"><NavLink to="/registration/device/generate-quotation"><FormOutlined /> <i>Generate Quotation</i></NavLink></Menu.Item>
                <Menu.Item key="11"><NavLink to="/registration/device/quotation"><FileDoneOutlined /> <i>Quotation</i></NavLink></Menu.Item>
                <Menu.Item key="12"><NavLink to="/registration/device/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                <Menu.Item key="25"><NavLink to="/registration/device/claim"><SnippetsOutlined /> <i>Claim</i></NavLink></Menu.Item>
                <Menu.Item key="9"><NavLink to="/registration/device/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
              </>
              :
              access == 6 ?
                <>
                  <Menu.Item key="18"><NavLink to="/registration/personal-accident/generate-quotation"><FormOutlined /> <i>Generate Quotation</i></NavLink></Menu.Item>
                  <Menu.Item key="19"><NavLink to="/registration/personal-accident/quotation"><FileDoneOutlined /> <i>Quotation</i></NavLink></Menu.Item>
                  <Menu.Item key="20"><NavLink to="/registration/personal-accident/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                  <Menu.Item key="21"><NavLink to="/registration/personal-accident/claim"><SnippetsOutlined /> <i>Claim</i></NavLink></Menu.Item>
                  <Menu.Item key="9"><NavLink to="/registration/personal-accident/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
                </>
                :
                access == 10005 ?
                  <>
                    <Menu.Item key="22"><NavLink to="/registration/credit-life/generate-policy"><FormOutlined /> <i>Generate Policy</i></NavLink></Menu.Item>
                    <Menu.Item key="23"><NavLink to="/registration/credit-life/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                    <Menu.Item key="24"><NavLink to="/registration/credit-life/claim"><SnippetsOutlined /> <i>Claim</i></NavLink></Menu.Item>
                  </>
                  :
                  access == 33 ?
                    <>
                      {accessName == "Domestic Travel Insurance" ?
                        <>
                          <Menu.Item key="17"><NavLink to="/registration/domestic-travel/generate-quotation"><FormOutlined /> <i>Generate Quotation</i></NavLink></Menu.Item>
                          <Menu.Item key="13"><NavLink to="/registration/domestic-travel/quotation"><FormOutlined /> <i>Quotation</i></NavLink></Menu.Item>
                          <Menu.Item key="14"><NavLink to="/registration/domestic-travel/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                          <Menu.Item key="9"><NavLink to="/registration/domestic-travel/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
                        </>
                        :
                        accessName == "Dana Air Travel Insurance" ?
                          <>
                            <Menu.Item key="14"><NavLink to="/registration/domestic-travel/dana/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                            <Menu.Item key="9"><NavLink to="/registration/domestic-travel/dana/life/soa"><HddOutlined /> <i>Life SOA</i></NavLink></Menu.Item>
                            <Menu.Item key="9"><NavLink to="/registration/domestic-travel/dana/travel/soa"><HddOutlined /> <i>Travel SOA</i></NavLink></Menu.Item>
                          </>
                          :
                          <>
                            <Menu.Item key="16"><NavLink to="/registration/international-travel/generate-quotation"><FormOutlined /> <i>Generate Quotation</i></NavLink></Menu.Item>
                            <Menu.Item key="15"><NavLink to="/registration/international-travel/quotation"><FormOutlined /> <i>Quotation</i></NavLink></Menu.Item>
                            <Menu.Item key="14"><NavLink to="/registration/international-travel/policy"><FileDoneOutlined /> <i>Policy</i></NavLink></Menu.Item>
                            <Menu.Item key="9"><NavLink to="/registration/international-travel/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
                          </>
                      }
                    </>
                    :
                    <>
                      <Menu.Item key="9"><NavLink to="/registration/soa"><HddOutlined /> <i>SOA</i></NavLink></Menu.Item>
                    </>
          }


          {sideBarData?.toggleBtn == true ?
            <Menu.Item key="20"><a href={LiveApiUrl} target="_blank" rel="noopener noreferrer" ><ApiOutlined /> <i>Live API's</i></a></Menu.Item>
            :
            <Menu.Item key="20"><a href={UATApiUrl} target="_blank" rel="noopener noreferrer" ><ApiOutlined /> <i>UAT API's</i></a></Menu.Item>
          }

          <Menu.Item key="21"><a onClick={handleLogout}><LogoutOutlined /> <i>Logout</i></a></Menu.Item>
        </Menu>
      </div>

      <div className="menu-profile">
        <Link className="sidebar-wallet">
          <WalletOutlined />
          <i>{Number(sideBarData && sideBarData.userData && sideBarData.userData.wallet).toLocaleString('en-NG', { style: 'currency', currency: 'NGN', country: 'Nigeria' }).replace(/\₦/g, "₦ ")}</i>
        </Link>
        <Link to="/registration/profile-information">
          <span>{profileImage && profileImage !== 'null' ? <img src={sideBarData.profileImageUpdate ? sideBarData.profileImageUpdate : profileImage} alt="" /> : `${profileData.firstName && profileData.firstName[0]}`}</span>
          <i>{profileData && profileData.firstName}</i>
        </Link>
      </div>
    </div>
  );
}

SideBar.propTypes = {};

export default memo(SideBar);
