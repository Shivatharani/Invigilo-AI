export default function EventTable({ events }) {
  return (
    <div className="mt-6 bg-black/30 p-6 rounded-xl">
      <h3 className="text-xl mb-4">Event History</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-cyan-400">
            <th>Status</th>
            <th>Risk</th>
            <th>Face Count</th>
            <th>Gaze</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id} className="border-t border-gray-700">
              <td className={e.status === "Suspicious" ? "text-red-400" : "text-green-400"}>
                {e.status}
              </td>
              <td>{e.risk_score}</td>
              <td>{e.face_count}</td>
              <td>{e.gaze_direction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
