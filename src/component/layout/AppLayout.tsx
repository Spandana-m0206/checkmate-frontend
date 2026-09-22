import { Outlet } from "react-router";
import TopBar from "./TopBar";
import { useSocket } from "../../hooks/useSocket";

export default function AppLayout() {
  useSocket();

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <TopBar />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
