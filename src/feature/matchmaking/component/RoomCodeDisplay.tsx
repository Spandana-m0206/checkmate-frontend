import { useState } from "react";
import Spinner from "../../../component/ui/Spinner";

interface RoomCodeDisplayProps {
  code: string;
}

export default function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Share this code with your opponent
      </p>
      <div className="flex items-center gap-3">
        <span className="rounded-lg bg-gray-100 px-4 py-2 font-mono text-2xl font-bold tracking-widest text-gray-900 dark:bg-gray-700 dark:text-gray-100">
          {code}
        </span>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          aria-label="Copy code"
        >
          {copied ? (
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner size="sm" />
        Waiting for opponent to join...
      </div>
    </div>
  );
}
