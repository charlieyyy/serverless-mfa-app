import React, { useState, useEffect }from "react";
import { Auth } from "aws-amplify";
import { onError } from "../libs/errorLib";
import QRCode from 'qrcode.react';
import "./css/Home.css";

export default function Profile() {
  const [userCode, setUserCode] = useState('');
  const [user, setUser] = useState(null);
  const [qrCode, setQrcode] = useState(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    getMFAsettings();
  }, []);

  async function getMFAsettings() {
    const user = await Auth.currentAuthenticatedUser();
    setUser(user);
    console.log(user.preferredMFA);
    console.log(user);
    if (user.preferredMFA === 'SMS_MFA' || user.preferredMFA === 'SOFTWARE_TOKEN_MFA') {
      setEnabled(true);
      console.log(enabled);
    }
  }

  const getQRCode = (event) => {
    event.preventDefault()
    console.log(user);
    try {
      Auth.setupTOTP(user).then((code) => {
        const authCode = "otpauth://totp/AWSCognito:"+ user.username + "?secret=" + code + "&issuer=AWSCognito";
        setQrcode(authCode);
      });
    } catch (e) {
      onError(e);
    }
  }

  const enableMFA = (event) => {
    event.preventDefault();

    console.log('USER CODE:', userCode);
    console.log(user);

    try {
      Auth.verifyTotpToken(user, userCode).then(() => {
        Auth.setPreferredMFA(user, 'TOTP');
      });
      setEnabled(true)
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div className="Home">
      <div className="lander">
      <h1>Multi-Factor Authentication</h1>
        {enabled ? (
          <div>
            <div>MFA is enabled</div>
          </div>
        ) : qrCode ? (
          <div>
            <h3>Scan this QR code:</h3>
            <QRCode value={qrCode}/>

            <form onSubmit={enableMFA}>
              <input
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                required
              />

              <button type="submit">Confirm Code</button>
            </form>
          </div>
        ) : (
          <button onClick={getQRCode}>Enable MFA</button>
        )}
    </div>
    </div>
  );
}
