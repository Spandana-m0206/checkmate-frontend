interface LegalMoveIndicatorProps {
  isCapture: boolean;
}

export default function LegalMoveIndicator({
  isCapture,
}: LegalMoveIndicatorProps) {
  if (isCapture) {
    return (
      <div className="pointer-events-none absolute inset-0 rounded-full border-[6%] border-black/25" />
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="h-[28%] w-[28%] rounded-full bg-black/25" />
    </div>
  );
}
