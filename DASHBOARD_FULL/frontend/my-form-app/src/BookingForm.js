import React, { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "./BookingForm.css";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css"; // Import default styles
import SignatureCanvas from "react-signature-canvas";


const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  address: yup.string().required("Address is required"),
  email: yup
  .string()
  .required("Email is required")
  .matches(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Please enter a valid email address (e.g., example@domain.com)"
  ),
  arrivalDate: yup.date().required("Arrival date is required"),
  room: yup.string().required("Room selection is required"),
  rate: yup.number().positive().required("Rate is required"),
  travelAgency: yup.string().required("Travel agency is required"),
  confirmationNumber: yup.string().required("Confirmation number is required"),
  dateSignature: yup.date().required("Date and signature are required"),
});

const BookingForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const sigCanvas1 = useRef({});

  const onSubmit = (data) => {
    console.log("tested");
    const signature1 = sigCanvas1.current.toDataURL();
    console.log("Form Submitted!", data, signature1);
  };

  return (
    <div className="form-container"> {/* Add this wrapper */}
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName")} placeholder="First Name" />
      <p>{errors.firstName?.message}</p>

      <input {...register("lastName")} placeholder="Last Name" />
      <p>{errors.lastName?.message}</p>

      <input {...register("address")} placeholder="Address" />
      <p>{errors.address?.message}</p>

      <input {...register("email")} placeholder="Email" />
      <p>{errors.email?.message}</p>

      <input type="date" {...register("arrivalDate")} />
      <p>{errors.arrivalDate?.message}</p>

      <input {...register("room")} placeholder="Room" />
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <PhoneInput
            {...field}
            defaultCountry="US"
            placeholder="Enter phone number"
          />
        )}
      />
      <p>{errors.room?.message}</p>

      <input type="number" {...register("rate")} placeholder="Rate" />
      <p>{errors.rate?.message}</p>

      <input {...register("travelAgency")} placeholder="Travel Agency" />
      <p>{errors.travelAgency?.message}</p>

      <input {...register("confirmationNumber")} placeholder="Confirmation Number" />
      <p style={{ fontSize: "14px", marginTop: "1px", marginBottom: "1px" ,lineHeight: "1", color: "red" }}>
      
      $250 fine for smoking in the guest room or inside the property. $150 Fine for non-service animal anywhere in the property.
      Free limited parking on first come first serve basis. Street parking is free between 6pm-9am. Hotel is not reponsible for citations issued by parking reinforcement. 
      I confirm no extra people from what i declared online will be in the room. No visitors will be allowed in the room after 9 pm. 
      </p>
      
      <p>{errors.confirmationNumber?.message}</p>

      <label>Date & Signature (Guest)</label>
        <input type="date" {...register("dateSignatureGuest")} />
        <SignatureCanvas ref={sigCanvas1} penColor="black" canvasProps={{ width: 600, height: 150, className: "signature-pad" }} />
        
      <button type="submit" onClick={handleSubmit(onSubmit)}>Submit</button>
    </form>
    </div>
  );
};

export default BookingForm;
