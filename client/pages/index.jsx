import { useRouteContext } from '/:core.jsx';
import { fetcher } from '../fetch';
import SurgeryTable from '../surgeries/SurgeryTable';
import { useState } from 'react';
import { getAge } from '../utils/age';

const SURGERY_TYPES = {
  MASTOPEXY: 'Mastopexy',
  NASAL_SURGERY: 'Nasal Surgery',
  SCAR_REVISION: 'Scar Revision'
};

const defaultAddSurgeryForm = {
  surgeon: '',
  patient: '',
  patient_dob: '',
  type: '',
  scheduled_for: ''
};

export const getData = async () => {
  const surgeries = await fetcher('http://localhost:3000/api/surgeries', { method: 'GET' });

  return {
    surgeries
  };
};

export default function Index(props) {
  const [drawer, setDrawer] = useState(false);
  const [surgery, setAddSurgery] = useState(defaultAddSurgeryForm);

  const handleDrawerClose = () => {
    if (drawer) {
      setAddSurgery(defaultAddSurgeryForm);
    }

    setDrawer(!drawer);
  };

  const scheduleSurgery = async () => {
    console.log({
      upcomingSurgery: surgery
    });

    const surgeries = await fetcher('http://localhost:3000/api/surgeries/schedule', {
      method: 'POST',
      json: {
        ...surgery
      }
    });

    window.location.href = '/';
  };

  const { data } = useRouteContext();
  return (
    <>
      <div className="flex justify-between items-center px-4">
        <h2 className="font-bold"> Surgery Manager </h2>
        <h2 className="font-bold">
          <a
            href="#"
            onClick={() => handleDrawerClose()}
            className="inline-block rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-500 text-lg"
          >
            {drawer ? 'Cancel' : 'Schedule New Surgery'}
          </a>
        </h2>
      </div>
      {drawer && (
        <div className="mx-4 p-4 text-xl border-solid border-0 border-b border-accent">
          <div className="p-4">
            <h2>Add a Surgery</h2>
          </div>
          <div className="flex">
            <form className="flex-col space-y-2">
              <input
                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="inline-full-name"
                type="text"
                placeholder="Surgeon"
                onChange={(e) => setAddSurgery({ ...surgery, surgeon: e.target.value })}
              />
              <input
                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                id="inline-full-name"
                type="select"
                placeholder="Patient"
                onChange={(e) => setAddSurgery({ ...surgery, patient: e.target.value })}
              />
              <select
                onChange={(e) => setAddSurgery({ ...surgery, type: e.target.value })}
                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                id="grid-state"
              >
                <option defaultValue="">Please select a type of Surgery</option>
                {Object.values(SURGERY_TYPES).map((surgeryType) => {
                  return <option key={surgeryType}>{surgeryType}</option>;
                })}
              </select>
              <div>
                <span className="text-sm mr-4">Patient DOB:</span>
                <input
                  onChange={(e) => setAddSurgery({ ...surgery, patient_dob: e.target.value })}
                  type="date"
                  placeholder="Patient DOB"
                />
                {surgery.patient_dob && (
                  <span className="text-sm font-semibold ml-4">Age: {getAge(surgery.patient_dob) || ''}</span>
                )}
              </div>
              <span className="text-sm mr-4">Schedule for:</span>
              <input
                onChange={(e) => setAddSurgery({ ...surgery, scheduled_for: new Date(e.target.value).toISOString() })}
                type="datetime-local"
              />
              <div>
                <a
                  href="#"
                  onClick={() => scheduleSurgery()}
                  className="inline-block rounded bg-gray-600 px-4 py-2 font-bold text-white hover:bg-gray-500 text-lg"
                >
                  Create Surgery
                </a>
              </div>
            </form>
          </div>
        </div>
      )}
      <SurgeryTable data={data.surgeries} />
    </>
  );
}
