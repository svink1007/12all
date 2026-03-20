import React, { FC, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { UserManagementService } from "../../services/UserManagementService";
import { useHistory } from "react-router";

interface RecaptchaProps {
  setIsRecaptchaVerified: Function;
  setRecaptchaToken: Function;
  setIsResendButtonDisabled?: Function;
}

const GoogleRecaptchaV3: FC<RecaptchaProps> = ({
  setIsRecaptchaVerified,
  setRecaptchaToken,
  setIsResendButtonDisabled,
}) => {
  const history = useHistory();
  const siteKey = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;
  const recaptchaRef = useRef<any>(null); // Reference to the ReCAPTCHA widget

  useEffect(() => {
    setIsRecaptchaVerified(false); // Reset the reCAPTCHA status
    setRecaptchaToken(""); // Clear the previous token
    if (recaptchaRef.current) {
      recaptchaRef.current.reset(); // Reset the reCAPTCHA widget
    }
  }, [history.location.pathname]);

  const verifyRecaptchaFunc = (recaptchaToken: string) => {
    UserManagementService.verifyRecaptcha({ token: recaptchaToken }).then(
      (response) => {
        const { data } = response;
        if (data?.result.success) {
          setIsRecaptchaVerified(data?.result.success);
          setIsResendButtonDisabled && setIsResendButtonDisabled(false);
        } else {
          setIsRecaptchaVerified(false);
        }
      }
    );
  };

  const updateRecaptchaToken = (token: any) => {
    if (token === null) {
      setIsRecaptchaVerified(false);
      return;
    }
    if (token) {
      setRecaptchaToken(token);
      verifyRecaptchaFunc(token);
    }
  };

  return (
    <>
      {siteKey && (
        <ReCAPTCHA
          sitekey={siteKey}
          onChange={(token) => updateRecaptchaToken(token)}
          size="normal"
          ref={recaptchaRef}
        />
      )}
    </>
  );
};

export default GoogleRecaptchaV3;
