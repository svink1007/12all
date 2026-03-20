import React, { useState } from "react";
import { IonPage } from "@ionic/react";

import './styles.scss';
import LoginWithPhone from "./LoginWithPhone";
import LoginWithNickname from "./LoginWithNickname";
import SignUp from "./SignUp";
import {useLocation} from "react-router-dom";

const Login_V3 = () => {

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const action = searchParams.get('action');

  const [isLoginOrSignUp, setIsLoginorSignUp] = useState(action === null || action !== 'register');
  const [isLoginWithPhone, setIsLoginWithPhone] = useState(true);

  return (
    <IonPage>
      <div className="w-full h-full flex justify-center items-center login_v3_container">
        <div className="flex flex-col w-[420px] h-[70%]">
          <div className="flex w-full mb-5">
            {
                action !== 'register' && (
                    <div
                        className={`w-1/2 text-center text-xl leading-6 ${
                            isLoginOrSignUp ? "text-white" : "text-[#E0007A]"
                        } uppercase font-bold cursor-pointer`}
                        onClick={() => {
                          setIsLoginorSignUp(true);
                        }}
                    >
                      LOGIN
                    </div>
                )
            }
            <div
                className={`${action === 'register' ? 'w-full' : 'w-1/2'} text-center text-xl leading-6 ${
                    !isLoginOrSignUp ? "text-white" : "text-[#E0007A]"
                } uppercase font-bold cursor-pointer`}
                onClick={() => {
                  setIsLoginorSignUp(false);
                }}
            >
            Sign Up
            </div>
          </div>
          {isLoginOrSignUp && (
            <div className="flex">
              <div
                className={`w-1/2 text-center rounded-tl-lg rounded-tr-lg ${
                  isLoginWithPhone
                    ? "bg-[#662c4b] border-b-0"
                    : "bg-transparent"
                } py-2 border border-[#D4D4D4] cursor-pointer`}
                onClick={() => setIsLoginWithPhone(true)}
              >
                Login with Phone
              </div>
              <div
                className={`w-1/2 text-center rounded-tl-lg rounded-tr-lg ${
                  !isLoginWithPhone
                    ? "bg-[#662c4b] border-b-0"
                    : "bg-transparent"
                } py-2 border border-[#D4D4D4] cursor-pointer`}
                onClick={() => setIsLoginWithPhone(false)}
              >
                Login with NickName
              </div>
            </div>
          )}
          {isLoginOrSignUp && isLoginWithPhone ? <LoginWithPhone setIsLoginorSignUp={setIsLoginorSignUp} /> : isLoginOrSignUp && !isLoginWithPhone ? <LoginWithNickname setIsLoginorSignUp={setIsLoginorSignUp} /> : <SignUp />}
        </div>
      </div>
    </IonPage>
  );
};

export default Login_V3;
