import React, { useState, useEffect }from "react";
import { Auth } from "aws-amplify";
import "./Home.css";
import AWS from 'aws-sdk'
import { onError } from "../libs/errorLib";
import QRCode from 'qrcode.react';


export default function Profile() {
  const [user, setUser] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [qrCode, setQrcode] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

  useEffect(() => {
    getUser();
    getToken();

    console.log(user);
    console.log(accessToken);

    getMFAsettings();
  }, [])

  async function getUser(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await Auth.currentAuthenticatedUser().then(user => setUser(user));
      userHasAuthenticated(true);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  async function getToken(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await Auth.signIn(fields.email, fields.password);
      userHasAuthenticated(true);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }


  async function getMFAsettings() {
    const mfaEnabled = await new Promise((resolve) => {
      cognito.getUser(
        {
          AccessToken: accessToken,
        },
        (err, data) => {
          if (err) resolve(false)
          else
            resolve(
              data.UserMFASettingList &&
                data.UserMFASettingList.includes('SOFTWARE_TOKEN_MFA')
            )
        }
      )
    })
    setEnabled(mfaEnabled);
    console.log(mfaEnabled);
    console.log(enabled);
  }

  const getQRCode = (event) => {
    event.preventDefault()
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

    try {
      Auth.verifyTotpToken(user, userCode).then(() => {
        Auth.setPreferredMFA(user, 'TOTP');
      });
      setEnabled(true)
      const settings = {
        PreferredMfa: true,
        Enabled: true,
      }
      user.setUserMfaPreference(null, settings, () => {})
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
