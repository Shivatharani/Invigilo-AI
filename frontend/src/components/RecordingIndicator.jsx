export default function RecordingIndicator() {
  return (
    <div className="flex items-center gap-2 text-red-400 font-semibold">
      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
      Recording Live
    </div>
  );
}
