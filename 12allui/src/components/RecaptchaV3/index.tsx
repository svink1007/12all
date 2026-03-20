import React, { FC } from "react"
import ReCAPTCHA from "react-google-recaptcha";
import { AuthService } from "../../services";

interface RecaptchaProps {
  setIsRecaptchaVerified: Function;
  setRecaptchaToken: Function;
  setIsResendButtonDisabled?: Function
}

const GoogleRecaptchaV3: FC<RecaptchaProps> = ({setIsRecaptchaVerified, setRecaptchaToken, setIsResendButtonDisabled}) => {

  const siteKey = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY

  const verifyRecaptchaFunc = (recaptchaToken: string) => {
    AuthService.verifyRecaptcha({ token: recaptchaToken }).then((response) => {
      const { data } = response
      if (data?.result.success) {
        setIsRecaptchaVerified(data?.result.success)
        setIsResendButtonDisabled && setIsResendButtonDisabled(false)
      } else {
        setIsRecaptchaVerified(false)
      }
    })
  }

    const updateRecaptchaToken = (token: any) => {
    if (token === null) {
      setIsRecaptchaVerified(false)
      return;
    }
    if (token) {
      setRecaptchaToken(token)
      verifyRecaptchaFunc(token)
    }
  }

  return (
    <>
      {siteKey && <ReCAPTCHA
        sitekey={siteKey}
        onChange={(token) => updateRecaptchaToken(token)}
        size="normal"
      />}
    </>
  )
}

export default GoogleRecaptchaV3