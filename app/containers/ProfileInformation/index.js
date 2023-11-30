/**
 *
 * ProfileInformation
 *
 */

import React, { memo, useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
import { compose } from "redux";

import { useInjectSaga } from "utils/injectSaga";
import { useInjectReducer } from "utils/injectReducer";
import makeSelectProfileInformation from "./selectors";
import reducer from "./reducer";
import saga from "./saga";
import './style.scss';
import Modal from 'antd/es/modal';
import message from 'antd/es/message';
import notification from 'antd/es/notification';
import TopBar from '../../components/TopBar';
import userImage from '../../images/user.png';
import ProfileCard from '../../components/ProfileCard';
import { profileContext } from '../App';
import { EditOutlined } from '@ant-design/icons';
import { getProfileData, profileUploadData } from "../../services/AuthService";

export function ProfileInformation({ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, toggleBtn, setToggleBtn, userData, setUserData }) {
  useInjectReducer({ key: "profileInformation", reducer });
  useInjectSaga({ key: "profileInformation", saga });

  const title = "Profile Information";
  const email = sessionStorage.getItem("email");
  const [profileData, setProfileData] = useState({});
  const [profilePic, setProfilePic] = useState("");
  const [ profileImage, setProfileImage ] = useState("");
  const [conformModalVisible, setConformModalVisible] = useState(false);
  const { profileImageUpdate, setProfileImageUpdate } = useContext(profileContext)

  const getProfile = () => {
    getProfileData(toggleBtn, { "email": email })
      .then((res) => {
        if (res.success === true) {
          setProfileData(res.data)
          setProfileImage(res.data.profilePic)
          setProfileImageUpdate(res.data.profilePic)
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
  }, [])


  const convertToBase64 = (data) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(data);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const profileChange = async (e) => {
    const isLt2M = e.target.files[0].size / 1024 / 1024 < 2;
    if (!e.target.files || e.target.files.length === 0) {
      setProfilePic("")
      return
    }
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
      return
    }
    const profilePhotoBase64 = await convertToBase64(e.target.files[0]);
    setProfilePic(profilePhotoBase64);
    setConformModalVisible(true);
  }

  const handleOk = () => {
    profileUploadData({ "email": email, profilePic })
      .then((res) => {
        if (res.success === true) {
          setConformModalVisible(false);
          getProfile();
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

  const handleCancel = () => {
    setConformModalVisible(false);
  };

  const outSideClick = () => {
    setSideBarMobileToggle(false)
  }

  return (
    <>
      <div className="sidebar-tab-content">
        <TopBar data={{ sideBarToggle, setSideBarToggle, setSideBarMobileToggle, title, toggleBtn, setToggleBtn, userData, setUserData }} />
        <div className="profile-main-section" onClick={outSideClick}>
          <ProfileCard  data={{profileData, profileImage}}/>
          <div className="profile-main-right">
            <div className="profile-section">
              <h4>Basic Information</h4>
              <div className="basic-details">
                <div className="basic-card">
                  <label>Profile Image</label>
                  <span className="profile-image">
                    <img src={profileImage === "null" ? `${userImage}` : `${profileData.profilePic}`} alt="" />
                    <label>
                      <i><EditOutlined /></i>
                      <input type="file" accept=".png, .jpg, .jpeg" onChange={profileChange} />
                    </label>
                    <b>Allowed file types: png, jpg, jpeg.</b>
                  </span>
                </div>
                {/* <div className="basic-card">
                  <label>First Name</label>
                  <span>{profileData.firstName}</span>
                </div> */}
                {/* <div className="basic-card">
                  <label>Last Name</label>
                  <span>{profileData.lastName}</span>
                </div> */}
                <div className="basic-card">
                  <label>Name</label>
                  <span>{profileData.businessName}</span>
                </div>
              </div>
            </div>
            <div className="profile-section">
              <h4>Contact Information:</h4>
              <div className="basic-details">
                <div className="basic-card">
                  <label>Phone</label>
                  <span>{profileData.phoneNumber}</span>
                </div>
                <div className="basic-card">
                  <label>Email Address</label>
                  <span>{profileData.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal className="profile-image-confirmation" centered visible={conformModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <h2>Do you want to update the profile image?</h2>
        </Modal>
      </div>
    </>
  );
}

ProfileInformation.propTypes = {
  dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  profileInformation: makeSelectProfileInformation()
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
)(ProfileInformation);
