import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ResellerApplicationModal: React.FC<Props> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    business: "",
    experience: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const number = "917276626991";

    const text = `
Reseller Application 🚀

Name: ${form.name}
Phone: ${form.phone}
Email: ${form.email}
City: ${form.city}
Business: ${form.business}
Experience: ${form.experience}

Message:
${form.message}
    `;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">

        {/* TITLE */}
        <h2 className="text-lg font-bold text-yellow-600 mb-5 text-center">
          Reseller Application
        </h2>

        {/* FORM */}
        <div className="space-y-3">

          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

          <input
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

          <input
            name="city"
            placeholder="City"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

          <input
            name="business"
            placeholder="Business Name"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

          <select
            name="experience"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          >
            <option value="">Select Experience Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Pro</option>
          </select>

          <textarea
            name="message"
            placeholder="Why do you want to become a reseller?"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
          />

        </div>

        {/* BUTTONS */}
        <button
          onClick={handleSubmit}
          className="w-full bg-yellow-600 text-white py-3 rounded-lg font-medium hover:bg-yellow-700 transition mt-4"
        >
          Submit Application
        </button>

        <button
          onClick={onClose}
          className="w-full mt-2 text-gray-500 text-sm"
        >
          Close
        </button>

      </div>
    </div>
  );
};

export default ResellerApplicationModal;
