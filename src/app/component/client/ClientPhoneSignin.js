
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css"; // Import CSS

import { useDispatch, useSelector } from "react-redux";
import { setPhone } from "@/app/redux/slices/dataSlice";



const ClientPhoneSignin = ({ phoneSignin }) => {
  const dispatch = useDispatch();
  const phoneNumber = useSelector((state) => state.data.client.phone) || "";
  
  const loading = useSelector((state) => state.data.client.loading);

  const handleOnChange = (value) => {
  
    dispatch(setPhone(value));
  };

  return (
    <div>
      <div className="mt-3 text-center w-80">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Log in or sign up
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-gray-500">
            Log in or sign up to complete your booking
          </p>

          <div className="my-5 border-b border-[#9ca3af]"> </div>

          <PhoneInput
            international
            defaultCountry="CA"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={handleOnChange}
            style={{
              width: "100%", // Full width of the container
              height: "50px", // Taller for more space
              fontSize: "18px", // Bigger font for readability
              padding: "10px", // Add some padding
            }}
            className="w-full py-4 px-6 border border-[#9ca3af] rounded-md shadow-sm focus-outline-none"
          />

          <button
            onClick={phoneSignin}
            className="mt-5 py-4 px-5 w-full flex justify-center border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-opacity-90"
            disabled={loading} // Disable the button while loading
          >
            {loading ? "Sending..." : "Continue"}
          </button>

          <div className=" mt-2 w-full ">
            <p className="text-xs text-gray-500">
              By entering your phone number, you consent to receiving SMS
              messages and accepting our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPhoneSignin;
