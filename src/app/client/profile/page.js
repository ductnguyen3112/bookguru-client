'use client'
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { fetchUserData } from '@/app/redux/slices/authSlice';
import moment from 'moment';

const months = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
];

function ProfileEditModal({ open, onClose, initial, onSaved }) {
  if (!open) return null;

  const [firstName, setFirstName] = useState(initial.firstName || '');
  const [lastName, setLastName] = useState(initial.lastName || '');
  const [countryCode, setCountryCode] = useState(initial.countryCode || '+1');
  const [phoneLocal, setPhoneLocal] = useState(initial.phoneLocal || '');
  const [email, setEmail] = useState(initial.email || '');
  const [dobDay, setDobDay] = useState(initial.dobDay || '');
  const [dobMonth, setDobMonth] = useState(initial.dobMonth || '');
  const [dobYear, setDobYear] = useState(initial.dobYear || '');
  const [gender, setGender] = useState(initial.gender || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        firstName,
        lastName,
        countryCode,
        phoneLocal,
        clientEmail: email,
        dobDay,
        dobMonth,
        dobYear,
        gender,
      };
      const { data } = await axios.put('/api/client/update', payload);
      if (data?.status === 200) {
        onSaved?.(data.data.client);
        onClose();
      } else {
        setError(data?.error || data?.message || 'Failed to update');
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-stretch justify-center ">
      <div className="relative bg-white w-full h-screen md:max-w-lg md:h-[90vh] slide-up md:mt-8 md:mb-10 md:rounded-2xl rounded-none shadow-xl overflow-y-auto ">
        {/* Close */}
        <button
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold text-gray-900">Edit profile details</h2>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {/* First name */}
          <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">First name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last name */}
          <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">Last name</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Mobile number */}
          <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">Mobile number</label>
            <div className="flex gap-3">
              <select
                className="w-28 rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
              >
                <option value="+1">+1</option>
                <option value="+33">+33</option>
                <option value="+44">+44</option>
                <option value="+84">+84</option>
              </select>
              <input
                type="tel"
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={phoneLocal}
                onChange={(e) => setPhoneLocal(e.target.value)}
                placeholder="438 630 1668"
              />
            </div>
          </div>

          {/* Email */}
          <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">Email address</label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* DOB */}
          <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">Date of birth</label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                min="1"
                max="31"
                className="rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                placeholder="31"
              />
              <select
                className="rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
              >
                <option value="">Month</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                className="rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                placeholder="1994"
              />
            </div>
          </div>

          {/* Gender */}
      <div className="mt-6">
            <label className="block text-gray-900 font-medium mb-2">Gender</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
        <option value="">Select</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
            </select>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const formatPhone = (raw) => {
  if (!raw) return '—';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    const area = digits.slice(1, 4);
    const mid = digits.slice(4, 7);
    const last = digits.slice(7);
    return `+1 ${area}-${mid}-${last}`;
  }
  return raw;
};

const splitName = (full) => {
  if (!full) return { first: '—', last: '' };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [openEdit, setOpenEdit] = useState(false);
   const router = useRouter();
 
   const { first, last } = splitName(user?.clientName);
   const phone = formatPhone(user?.clientPhone);
  // derive simple phone parts for the modal
  const hasPlus1 = String(user?.clientPhone || '').startsWith('1') || String(user?.clientPhone || '').startsWith('+1');
  const initialCountry = '+1';
  const localPart = hasPlus1 ? String(user?.clientPhone || '').replace(/^\+?1/, '') : String(user?.clientPhone || '');
   const email = user?.clientEmail || '—';
   // Format clientDOB (Date) -> "Dec 31, 1994"
   const dobDate = user?.clientDOB ? new Date(user.clientDOB) : null;
   // use moment to convert to "MMM D, YYYY"
   const dob = dobDate ? moment(dobDate).format('MMM D, YYYY') : '—';
   // Prefill modal DOB fields from clientDOB
   const initDobDay = dobDate ? String(dobDate.getUTCDate()) : '';
   const initDobMonth = dobDate ? months[dobDate.getUTCMonth()] : '';
  const initDobYear = dobDate ? String(dobDate.getUTCFullYear()) : '';
   const gender = user?.gender || '—';
   const genderLabel = (gender && gender !== '—') ? (gender[0].toUpperCase() + gender.slice(1)) : '—';
    const avatarUrl = user?.avatar;
    const initials = (user?.clientName || 'U N')
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('');
 
   return (
     <div className="min-h-screen bg-gray-50 relative">
       {/* Close to client */}
       <button
         onClick={() => router.push('/client')}
         className="absolute right-4 top-4 z-10 rounded-full p-2 bg-white shadow-md hover:bg-gray-100"
         aria-label="Close"
       >
         <XMarkIcon className="h-6 w-6 text-gray-700" />
       </button>
 
       <div className="mx-auto max-w-3xl px-4 pt-14 pb-6">
         <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
 
         {/* Card */}
         <div className="relative bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
           <button
             className="absolute right-6 top-6 text-purple-600 hover:text-purple-700 font-medium"
             onClick={() => setOpenEdit(true)}
           >
             Edit
           </button>
 
           {/* Avatar + name */}
           <div className="flex flex-col items-center text-center">
             <div className="relative">
               {avatarUrl ? (
                 <img
                   src={avatarUrl}
                   alt={user?.clientName || 'Avatar'}
                   className="h-28 w-28 rounded-full object-cover shadow"
                 />
               ) : (
                 <div className="h-28 w-28 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                   {initials}
                 </div>
               )}
               <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white shadow flex items-center justify-center">
                 <PencilIcon className="h-5 w-5 text-gray-700" />
               </span>
             </div>
 
             <h2 className="mt-5 text-2xl font-bold text-gray-900">{user?.clientName || '—'}</h2>
           </div>
 
           <hr className="my-6 border-gray-200" />
 
           {/* Details */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
             <div>
               <p className="text-gray-900 font-medium">First name</p>
               <p className="text-gray-500">{first || '—'}</p>
             </div>
             <div>
               <p className="text-gray-900 font-medium">Last name</p>
               <p className="text-gray-500">{last || '—'}</p>
             </div>
             <div>
               <p className="text-gray-900 font-medium">Mobile number</p>
               <p className="text-gray-500">{phone}</p>
             </div>
             <div>
               <p className="text-gray-900 font-medium">Email</p>
               <p className="text-gray-500 break-all">{email}</p>
             </div>
             <div>
               <p className="text-gray-900 font-medium">Date of birth</p>
               <p className="text-gray-500">{dob}</p>
             </div>
             <div>
               <p className="text-gray-900 font-medium">Gender</p>
               <p className="text-gray-500">{genderLabel}</p>
             </div>
           </div>
         </div>
 
         {/* Optional: My addresses heading */}
        {/* <h3 className="mt-8 text-2xl font-semibold text-gray-900">My addresses</h3> */}
      </div>
 
      <ProfileEditModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSaved={async () => {
            // Refresh Redux user instead of full reload for smoother UX
            try { await dispatch(fetchUserData()).unwrap(); } catch {}
          }}
          initial={{
            firstName: first,
            lastName: last,
            countryCode: initialCountry,
            phoneLocal: localPart.trim(),
            email: user?.clientEmail || '',
            dobDay: initDobDay,
            dobMonth: initDobMonth,
            dobYear: initDobYear,
            gender: user?.gender || ''
          }}
        />
     </div>
   );
 }
