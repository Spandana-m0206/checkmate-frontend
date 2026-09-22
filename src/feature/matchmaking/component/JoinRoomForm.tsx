import { useState, type FormEvent } from "react";
import Button from "../../../component/ui/Button";
import Input from "../../../component/ui/Input";
import { getSocket } from "../../../services/socket";

export default function JoinRoomForm() {
  const [code, setCode] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) return;
    getSocket()?.emit("joinRoom", { code: trimmed });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Room code"
        value={code}
        onChange={(e) =>
          setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))
        }
        maxLength={6}
        className="font-mono tracking-widest"
      />
      <Button type="submit" disabled={code.trim().length !== 6}>
        Join
      </Button>
    </form>
  );
}
