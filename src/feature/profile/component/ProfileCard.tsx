import { useRef, useState } from "react";
import Avatar from "../../../component/ui/Avatar";
import type { User } from "../../auth/type";
import { formatDate } from "../../../utils/format";
import { uploadProfileImage } from "../service";
import { useAuthStore } from "../../../store/useAuthStore";
import { ApiError } from "../../../services/api";

interface ProfileCardProps {
  user: User;
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const res = await uploadProfileImage(file);
      if (token) {
        setAuth(token, res.data.user);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to upload image",
      );
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex min-w-0 flex-1 items-start gap-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="group relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Change profile photo"
      >
        <Avatar src={user.profileImage} alt={user.name} size="xl" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/50">
          <svg
            className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold text-content">
          {user.username}
        </h1>
        <p className="truncate text-content-muted">{user.name}</p>

        <p className="mt-2 text-sm text-content-subtle">
          Joined {formatDate(user.createdAt)}
        </p>
        <p className="truncate text-sm text-content-subtle">
          {user.email} · Born {formatDate(user.dateOfBirth)}
        </p>
        {error && <p className="mt-1 text-sm text-danger-hover">{error}</p>}
      </div>
    </div>
  );
}
