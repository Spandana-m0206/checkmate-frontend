import { useState, type FormEvent } from "react";
import Button from "../../../component/ui/Button";
import Input from "../../../component/ui/Input";
import { sendOtp } from "../service";
import { ApiError } from "../../../services/api";
import logo from "../../../assets/checkmate-logo.svg";

interface OtpSendFormProps {
  onSuccess: (email: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OtpSendForm({ onSuccess }: OtpSendFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(trimmed);
      onSuccess(trimmed);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to send OTP. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <img src={logo} alt="" className="h-14 w-14" />
        <h1 className="mt-3 text-2xl font-bold text-content">
          Welcome to Checkmate
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          Enter your email to get started
        </p>
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        autoFocus
      />

      <Button type="submit" loading={loading} className="w-full">
        Send OTP
      </Button>
    </form>
  );
}
