/**
 *
 * TopBar
 *
 */

import React, { memo, useEffect, useState } from "react";
import './style.scss';
import { Link } from 'react-router-dom';
import notification from 'antd/es/notification';
import logo from '../../images/logo.png';
import morningSun from '../../images/morning-sun.png';
import afternoonSun from '../../images/afternoon-sun.png';
import eveningSun from '../../images/evening-sun.png';
import { LeftOutlined, RightOutlined, MenuOutlined } from '@ant-design/icons';
import { getProfileData } from '../../services/AuthService';

function TopBar({ data }) {

  const [activateAccount, setActivateAccount] = useState(false);
  const activeAccount = sessionStorage.getItem("activatedAccount");
  const time = new Date().getHours();
  const [timeData, setTimeData] = useState("")
  const userId = sessionStorage.getItem('email');

  const responseToggleHandle = () => {
    if (activeAccount === "ACTIVE") {
      data.setToggleBtn(data?.queryIsMode ? data?.queryIsMode : !data.toggleBtn);
      getProfileData(data?.queryIsMode ? data?.queryIsMode : !data.toggleBtn, { "email": userId })
        .then((res) => {
          if (res.success === true) {
            data?.setUserData(res.data)
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

        data && data?.setPolicyVerifyMsg && data?.setPolicyVerifyMsg(!data.toggleBtn)
    } else {
      data.setToggleBtn(!data.toggleBtn);
      setTimeout(() => {
        data.setToggleBtn(activateAccount);
        if (!activateAccount) {
          notification.info({
            duration: 2,
            message: 'Notification',
            description: 'You cannot switch to Live mode until your account is verified',
          });
        }
      }, 1000);
    }
  }

  const handleClick = () => {
    data.setSideBarToggle(!data.sideBarToggle)
  };

  const mobileHandleClick = () => {
    data.setSideBarMobileToggle(true)
  };

  useEffect(() => {
    if (time < 12) {
      setTimeData("morning");
    } else if (time < 16) {
      setTimeData("afternoon");
    } else {
      setTimeData("evening");
    }

  }, [])

  return (
    <div className="top-bar">
      {/* <p><b>Note:</b> Dashboard is under development, Please bear with us we are adding new functionalities everyday!</p> */}
      <p className="welcome-title">
        {timeData === "morning" ?
          <><img src={morningSun} alt="" /> Good Morning </>
          :
          timeData === "afternoon" ?
            <><img src={afternoonSun} alt="" /> Good Afternoon </>
            :
            <><img src={eveningSun} alt="" /> Good Evening </>
        }
        {data && data.userData && data.userData.firstName}! Welcome To CoverQ Dashboard.</p>
      <div className="top-bar-left">
        <i className="menu-icon" onClick={handleClick}>
          {!data.sideBarToggle ? <LeftOutlined /> : <RightOutlined />}
        </i>
        <b>{data && data.title}</b>
        <div className="mobile-logo">
          <MenuOutlined onClick={mobileHandleClick} />
          <Link to="/">
            <img src={logo} alt="" />
          </Link>
        </div>
      </div>
      {data && data.userData && data.userData.accessId === "1" ? <></> :
        <div className="top-bar-right">
          <ul>
            <li className={data.toggleBtn ? "" : "active"}>TEST MODE</li>
            <li className={data.toggleBtn ? "toggle-btn active" : "toggle-btn"} onClick={responseToggleHandle}><span></span></li>
            <li className={data.toggleBtn ? "active" : ""}>LIVE MODE</li>
          </ul>
        </div>
      }
    </div>
  );
}

TopBar.propTypes = {};

export default memo(TopBar);
