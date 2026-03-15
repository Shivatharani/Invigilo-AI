export default function RiskMeter({ risk }) {
  return (
    <div className="mt-6 w-full">
      <div className="flex justify-between">
        <span>Risk Score</span>
        <span className="font-bold">{risk}</span>
      </div>

      <div className="w-full bg-gray-700 h-5 rounded-full mt-2 overflow-hidden">
        <div
          className={`h-5 transition-all duration-500 ${
            risk > 60 ? "bg-red-500" :
            risk > 30 ? "bg-yellow-400" :
            "bg-green-500"
          }`}
          style={{ width: `${risk}%` }}
        />
      </div>
    </div>
  );
}
