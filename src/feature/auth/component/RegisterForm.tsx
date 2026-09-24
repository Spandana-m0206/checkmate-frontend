import { useState, useRef, type FormEvent } from "react";
import Button from "../../../component/ui/Button";
import Input from "../../../component/ui/Input";
import { register } from "../service";
import { useAuthStore } from "../../../store/useAuthStore";
import { ApiError } from "../../../services/api";
import { scheduleProactiveRefresh } from "../../../services/tokenManager";

interface RegisterFormProps {
  email: string;
  onEmailExpired: () => void;
}

export default function RegisterForm({
  email,
  onEmailExpired,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    selectedFile.current = file;
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!name.trim()) newErrors.name = "Name is required";
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("username", username.trim().toLowerCase());
    formData.append("name", name.trim());
    formData.append("dateOfBirth", dateOfBirth);
    if (selectedFile.current) {
      formData.append("profileImage", selectedFile.current);
    }

    try {
      const res = await register(formData);
      setAuth(res.data.accessToken, res.data.user);
      scheduleProactiveRefresh(res.data.accessToken, handleRefreshed);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          onEmailExpired();
          return;
        }
        if (err.message.toLowerCase().includes("username")) {
          setErrors({ username: err.message });
        } else if (err.message.toLowerCase().includes("email")) {
          onEmailExpired();
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: "Registration failed. Try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-content">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-content-muted">
          Set up your profile to start playing
        </p>
      </div>

      {/* Profile image */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-edge-strong transition-colors hover:border-accent"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <svg
              className="h-8 w-8 text-content-subtle"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          )}
        </button>
        <span className="text-xs text-content-subtle">
          Profile photo (optional)
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Input
        label="Username"
        placeholder="magnus"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        autoFocus
      />

      <Input
        label="Full Name"
        placeholder="Magnus Carlsen"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <Input
        type="date"
        label="Date of Birth"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        error={errors.dateOfBirth}
      />

      {errors.form && (
        <p className="text-sm text-danger-hover">{errors.form}</p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
}

function handleRefreshed(newToken: string) {
  useAuthStore.getState().setToken(newToken);
  scheduleProactiveRefresh(newToken, handleRefreshed);
}
