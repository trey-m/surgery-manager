import { fetcher } from '../fetch';

const STATUS_TEXT_COLOR = {
  completed: 'emerald',
  scheduled: 'yellow',
  cancelled: 'red'
};

export default function Table(props) {
  const onCancelHandler = async (surgery) => {
    const cancel = await fetcher(`http://localhost:3000/api/surgeries/cancel/${surgery.id}`, {
      method: 'POST',
      json: {}
    });
    window.location.href = '/';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y-2 text-white text-sm">
        <thead className="">
          <tr>
            <th className="text-left whitespace-nowrap px-4 py-2 font-medium font-bold"></th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Scheduled For</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Status</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Surgeon</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Type</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Patient</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Patient DOB</th>
            <th className="text-left whitespace-nowrap px-4 py-2 font-bold">Patient Age</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {props.data.map((surgery, index) => {
            const scheduledFor = new Date(surgery.scheduled_for).toLocaleString();
            const colors = 'text-red-600 text-emerald-600 text-yellow-600 bg-red-100 bg-emerald-100 bg-yellow-100';
            const badge = `inline-flex items-center rounded-md bg-${
              STATUS_TEXT_COLOR[surgery.status]
            }-100 px-2 py-1 text-xs font-bold text-${STATUS_TEXT_COLOR[surgery.status]}-600 ring-1 ring-inset ring-${
              STATUS_TEXT_COLOR[surgery.status]
            }-500/10`;
            return (
              <tr key={surgery.id}>
                <td className="whitespace-nowrap px-4 py-2 ">{index + 1}</td>
                <td className="whitespace-nowrap px-4 py-2 ">{scheduledFor}</td>
                <td className={`whitespace-nowrap px-4 py-2 mt-3 ` + `${badge}`}>{surgery.status}</td>
                <td className="whitespace-nowrap px-4 py-2">{surgery.surgeon}</td>
                <td className="whitespace-nowrap px-4 py-2 ">{surgery.type}</td>
                <td className="whitespace-nowrap px-4 py-2">{surgery.patient}</td>
                <td className="whitespace-nowrap px-4 py-2 ">{surgery.patient_dob}</td>
                <td className="whitespace-nowrap px-4 py-2 ">{surgery.patient_age}</td>
                {surgery.status !== 'cancelled' && (
                  <td className="whitespace-nowrap px-4 py-2">
                    <a
                      onClick={() => {
                        if (window.confirm('Are you sure you wish to cancel this surgery?')) onCancelHandler(surgery);
                      }}
                      className="inline-block rounded bg-gray-600 px-4 py-2 text-xs font-medium text-white hover:bg-gray-500 cursor-pointer"
                    >
                      Cancel
                    </a>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
