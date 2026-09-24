import { useState, type FormEvent } from "react";
import Modal from "../../../component/ui/Modal";
import Button from "../../../component/ui/Button";
import Input from "../../../component/ui/Input";
import { updateProfile } from "../service";
import { useAuthStore } from "../../../store/useAuthStore";
import { ApiError } from "../../../services/api";
import type { User } from "../../auth/type";

interface EditProfileFormProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export default function EditProfileForm({
  user,
  open,
  onClose,
}: EditProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth.slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (!dateOfBirth) {
      setError("Date of birth is required");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ name: trimmedName, dateOfBirth });
      if (token) {
        setAuth(token, res.data.user);
      }
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-content">Edit Profile</h2>

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />

        <Input
          type="date"
          label="Date of Birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <p className="text-xs text-content-subtle">
          Username and email cannot be changed.
        </p>

        {error && <p className="text-sm text-danger-hover">{error}</p>}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
