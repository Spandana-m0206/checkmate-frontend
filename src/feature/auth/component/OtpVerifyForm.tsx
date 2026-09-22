import { useState, type FormEvent } from "react";
import Button from "../../../component/ui/Button";
import Input from "../../../component/ui/Input";
import { verifyOtp } from "../service";
import { useAuthStore } from "../../../store/useAuthStore";
import { ApiError } from "../../../services/api";
import type { VerifyOtpData } from "../type";

interface OtpVerifyFormProps {
  email: string;
  onNewUser: (registrationToken: string) => void;
  onBack: () => void;
}

export default function OtpVerifyForm({
  email,
  onNewUser,
  onBack,
}: OtpVerifyFormProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = otp.trim();
    if (!trimmed || trimmed.length !== 4) {
      setError("Enter the 4-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, trimmed);
      const data: VerifyOtpData = res.data;

      if (data.isNewUser) {
        onNewUser(data.registrationToken);
      } else {
        setAuth(data.token, data.user);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Verification failed. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-content">
          Verify OTP
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          We sent a 4-digit code to{" "}
          <span className="font-medium text-content">
            {email}
          </span>
        </p>
      </div>

      <Input
        type="text"
        label="OTP Code"
        placeholder="1234"
        value={otp}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
          setOtp(val);
        }}
        error={error}
        maxLength={4}
        inputMode="numeric"
        autoFocus
      />

      <Button type="submit" loading={loading} className="w-full">
        Verify
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-content-muted transition-colors hover:text-content"
      >
        Use a different email
      </button>
    </form>
  );
}
