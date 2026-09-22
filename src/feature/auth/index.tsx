import { useState } from "react";
import OtpSendForm from "./component/OtpSendForm";
import OtpVerifyForm from "./component/OtpVerifyForm";
import RegisterForm from "./component/RegisterForm";

type AuthStage = "send-otp" | "verify-otp" | "register";

export default function AuthPage() {
  const [stage, setStage] = useState<AuthStage>("send-otp");
  const [email, setEmail] = useState("");
  const [registrationToken, setRegistrationToken] = useState("");

  function handleOtpSent(sentEmail: string) {
    setEmail(sentEmail);
    setStage("verify-otp");
  }

  function handleNewUser(token: string) {
    setRegistrationToken(token);
    setStage("register");
  }

  function handleReset() {
    setStage("send-otp");
    setEmail("");
    setRegistrationToken("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
        {stage === "send-otp" && <OtpSendForm onSuccess={handleOtpSent} />}

        {stage === "verify-otp" && (
          <OtpVerifyForm
            email={email}
            onNewUser={handleNewUser}
            onBack={handleReset}
          />
        )}

        {stage === "register" && (
          <RegisterForm
            registrationToken={registrationToken}
            onTokenExpired={handleReset}
          />
        )}
      </div>
    </div>
  );
}
