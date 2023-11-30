/**
 *
 * ProfileCard
 *
 */

import React, { memo } from "react";
import { NavLink } from 'react-router-dom';
import userImage from '../../images/user.png';
import './style.scss';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

function ProfileCard({data}) {
  return (
    <div className="profile-main-left">
      <div className="profile-maine-image">
        <span className="profile-image">
          <img src={data.profileImage === "null" ? `${userImage}` : `${data.profileImage}`} alt="" />
        </span>
        <i>{data.profileData.firstName}</i>
      </div>
      <ul className="list-email">
        <li><span>Email:</span> <i>{data.profileData.email}</i></li>
        <li><span>Phone:</span> <i>{data.profileData.phoneNumber}</i></li>
      </ul>
      <ul>
        <li><NavLink to="/registration/profile-information"><UserOutlined /> <i>Profile Information</i></NavLink></li>
        <li><NavLink to="/registration/change-password"><LockOutlined /> <i>Change Password</i></NavLink></li>
      </ul>
    </div>
  );
}

ProfileCard.propTypes = {};

export default memo(ProfileCard);
