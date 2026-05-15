// import React, { useState } from "react";

// const Settings = () => {
//   const [settings, setSettings] = useState({
//     language: "English",
//     timezone: "IST",
//     currency: "INR",

//     emailNotify: true,
//     smsNotify: false,
//     whatsappNotify: true,
//     orderUpdates: true,
//     promoAlerts: false,

//     profileVisible: true,
//     showContact: false,

//     twoFactor: false,
//     loginAlerts: true,
//     deviceVerification: true,
//   });

//   const handleToggle = (key) => {
//     setSettings({ ...settings, [key]: !settings[key] });
//   };

//   const handleChange = (e) => {
//     setSettings({ ...settings, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log("Settings Saved:", settings);
//     alert("Settings saved successfully ✅");
//   };

//   return (
//     <div className="profile-card">
//       <h3 className="profile-title">Account Settings</h3>

//       <form onSubmit={handleSubmit}>

//         <h4 className="section-title">Preferences</h4>

//         <div className="form-row">

//           <div className="form-group">
//             <label>Language</label>
//             <select name="language" value={settings.language} onChange={handleChange}>
//               <option>English</option>
//               <option>Arabic</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Timezone</label>
//             <select name="timezone" value={settings.timezone} onChange={handleChange}>
//               <option>IST</option>
//               <option>GST</option>
//               <option>UTC</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <label>Currency</label>
//             <select name="currency" value={settings.currency} onChange={handleChange}>
//               <option>INR</option>
//               <option>AED</option>
//               <option>USD</option>
//             </select>
//           </div>

//         </div>

//         <h4 className="section-title">Notifications</h4>

//         <div className="form-row">

//           <Toggle
//             label="Email Notifications"
//             checked={settings.emailNotify}
//             onChange={() => handleToggle("emailNotify")}
//           />

//           <Toggle
//             label="SMS Notifications"
//             checked={settings.smsNotify}
//             onChange={() => handleToggle("smsNotify")}
//           />

//           <Toggle
//             label="WhatsApp Notifications"
//             checked={settings.whatsappNotify}
//             onChange={() => handleToggle("whatsappNotify")}
//           />

//         </div>

//         <div className="form-row">

//           <Toggle
//             label="Order Status Updates"
//             checked={settings.orderUpdates}
//             onChange={() => handleToggle("orderUpdates")}
//           />

//           <Toggle
//             label="Promotional Alerts"
//             checked={settings.promoAlerts}
//             onChange={() => handleToggle("promoAlerts")}
//           />

//         </div>

//         <h4 className="section-title">Profile Visibility</h4>

//         <div className="form-row">

//           <Toggle
//             label="Public Supplier Profile"
//             checked={settings.profileVisible}
//             onChange={() => handleToggle("profileVisible")}
//           />

//           <Toggle
//             label="Show Contact Details"
//             checked={settings.showContact}
//             onChange={() => handleToggle("showContact")}
//           />

//         </div>

//         <h4 className="section-title">Security</h4>

//         <div className="form-row">

//           <Toggle
//             label="Two-Factor Authentication (2FA)"
//             checked={settings.twoFactor}
//             onChange={() => handleToggle("twoFactor")}
//           />

//           <Toggle
//             label="Login Alerts"
//             checked={settings.loginAlerts}
//             onChange={() => handleToggle("loginAlerts")}
//           />

//           <Toggle
//             label="New Device Verification"
//             checked={settings.deviceVerification}
//             onChange={() => handleToggle("deviceVerification")}
//           />

//         </div>

//         <div className="form-actions">
//           <button type="submit" className="btn-primary">
//             Save Settings
//           </button>
//         </div>

//       </form>
//     </div>
//   );
// };

// const Toggle = ({ label, checked, onChange }) => {
//   return (
//     <div className="toggle-group">
//       <label>{label}</label>
//       <label className="switch">
//         <input type="checkbox" checked={checked} onChange={onChange} />
//         <span className="slider"></span>
//       </label>
//     </div>
//   );
// };

// export default Settings;


import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t, i18n } = useTranslation();

  const [settings, setSettings] = useState({
    language: "en",
    timezone: "IST",
    currency: "INR",

    emailNotify: true,
    smsNotify: false,
    whatsappNotify: true,
    orderUpdates: true,
    promoAlerts: false,

    profileVisible: true,
    showContact: false,

    twoFactor: false,
    loginAlerts: true,
    deviceVerification: true,
  });

  // ✅ DB DATA LOAD
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // API call here
        // const res = await axios.get("/api/settings");
        // setSettings(res.data);

        // Example mock:
        const dbData = null;

        if (dbData) {
          setSettings(dbData);
          i18n.changeLanguage(dbData.language);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSettings();
  }, []);

  const CURRENCIES = [
    { code: "QAR", symbol: "ر.ق", name_en: "Qatari Riyal", name_ar: "ريال قطري" },
    { code: "SAR", symbol: "ر.س", name_en: "Saudi Riyal", name_ar: "ريال سعودي" },
    { code: "AED", symbol: "د.إ", name_en: "UAE Dirham", name_ar: "درهم إماراتي" },
    { code: "KWD", symbol: "د.ك", name_en: "Kuwaiti Dinar", name_ar: "دينار كويتي" },
    { code: "BHD", symbol: "د.ب", name_en: "Bahraini Dinar", name_ar: "دينار بحريني" },
    { code: "OMR", symbol: "ر.ع", name_en: "Omani Rial", name_ar: "ريال عماني" },
    { code: "JOD", symbol: "د.ا", name_en: "Jordanian Dinar", name_ar: "دينار أردني" },
    { code: "INR", symbol: "₹", name_en: "Indian Rupee", name_ar: "روبية هندية" },
    { code: "USD", symbol: "$", name_en: "US Dollar", name_ar: "دولار أمريكي" }
  ];

  const TIMEZONES = [
    { value: "IST", label_en: "India (IST)", label_ar: "الهند" },
    { value: "GST", label_en: "Gulf (GST)", label_ar: "الخليج" },
    // { value: "IST", label_en: "India (IST)", label_ar: "الهند (IST)" },
    // { value: "GST", label_en: "Gulf (GST)", label_ar: "الخليج (GST)" },
    { value: "UTC", label_en: "UTC", label_ar: "التوقيت العالمي" },
    { value: "AST", label_en: "Arab Standard Time", label_ar: "توقيت العرب" }
  ];

  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" }
  ];

  const Toggle = ({ label, checked, onChange }) => {
    return (
      <div className="toggle-group">
        <label>{label}</label>
        <label className="switch">
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span className="slider"></span>
        </label>
      </div>
    );
  };

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings({ ...settings, [name]: value });

    // 🌍 Language switch
    if (name === "language") {
      i18n.changeLanguage(value);
      localStorage.setItem("lang", value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!settings) {
      alert(t("alerts.no_data"));
      return;
    }

    console.log(settings);

    alert(t("alerts.saved"));
  };

  return (
    <div className="profile-card">
      <h3 className="profile-title">{t("settings.title")}</h3>

      <form onSubmit={handleSubmit}>

        {/* Preferences */}
        <h4 className="section-title">{t("settings.preferences")}</h4>

        <div className="form-row">

          <div className="form-group">
            <label>{t("settings.language")}</label>
            <select name="language" value={settings.language} onChange={handleChange}>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t("settings.timezone")}</label>
            <select name="timezone" value={settings.timezone} onChange={handleChange}>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {i18n.language === "ar" ? tz.label_ar : tz.label_en}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t("settings.currency")}</label>
            <select name="currency" value={settings.currency} onChange={handleChange}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {i18n.language === "ar"
                    ? `${c.name_ar} (${c.symbol})`
                    : `${c.name_en} (${c.symbol})`}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Notifications */}
        <h4 className="section-title">{t("settings.notifications")}</h4>

        <div className="form-row">
          <Toggle label={t("settings.email_notify")} checked={settings.emailNotify} onChange={() => handleToggle("emailNotify")} />
          <Toggle label={t("settings.sms_notify")} checked={settings.smsNotify} onChange={() => handleToggle("smsNotify")} />
          <Toggle label={t("settings.whatsapp_notify")} checked={settings.whatsappNotify} onChange={() => handleToggle("whatsappNotify")} />
        </div>

        <div className="form-row">
          <Toggle label={t("settings.order_updates")} checked={settings.orderUpdates} onChange={() => handleToggle("orderUpdates")} />
          <Toggle label={t("settings.promo_alerts")} checked={settings.promoAlerts} onChange={() => handleToggle("promoAlerts")} />
        </div>

        {/* Profile */}
        <h4 className="section-title">{t("settings.profile")}</h4>

        <div className="form-row">
          <Toggle label={t("settings.profile_visible")} checked={settings.profileVisible} onChange={() => handleToggle("profileVisible")} />
          <Toggle label={t("settings.show_contact")} checked={settings.showContact} onChange={() => handleToggle("showContact")} />
        </div>

        {/* Security */}
        <h4 className="section-title">{t("settings.security")}</h4>

        <div className="form-row">
          <Toggle label={t("settings.two_factor")} checked={settings.twoFactor} onChange={() => handleToggle("twoFactor")} />
          <Toggle label={t("settings.login_alerts")} checked={settings.loginAlerts} onChange={() => handleToggle("loginAlerts")} />
          <Toggle label={t("settings.device_verification")} checked={settings.deviceVerification} onChange={() => handleToggle("deviceVerification")} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {t("settings.save")}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;