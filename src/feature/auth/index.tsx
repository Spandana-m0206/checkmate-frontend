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
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm rounded-lg border border-edge bg-surface p-6 shadow-raised">
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
