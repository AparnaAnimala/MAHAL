import React, { useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import "../../../styles/Profile.css";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const MyProfileLayout = ({ isAdmin = false }) => {

  const [serverFilePreview, setServerFilePreview] = useState({});
  const [localFilePreview, setLocalFilePreview] = useState({});
  const [fileNames, setFileNames] = useState({});

  const { role: paramRole, id: paramId } = useParams();

  const role = paramRole || localStorage.getItem("role");
  const id = paramId || localStorage.getItem("linked_id");

  const adminMode =
    Boolean(localStorage.getItem("admin_token")) ||
    window.location.pathname.startsWith("/admin/profile");

  const [masterData, setMasterData] = useState({
    street: [],
    zone: [],
    area: [],
    city: [],
    country: []
  }); 

  const [branchList, setBranchList] = useState([]);

  const [form, setForm] = useState({
    files: {}
  });

  return (
    <div className="profile-layout">

      <ProfileSidebar role={role}  id={id} adminMode={adminMode} />

      <div className="profile-main">
        <div className="profile-topbar">
          <LanguageSwitcher />
        </div>

        <main className="profile-content">
          <Outlet
            context={{
              form,
              setForm,
              masterData,
              setMasterData,
              role,
              id,
              adminMode,
              serverFilePreview,
              setServerFilePreview,
              localFilePreview,
              setLocalFilePreview,
              fileNames,
              setFileNames,
              branchList,
              setBranchList
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default MyProfileLayout;