import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ResellerApplicationModal: React.FC<Props> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-xl">

        <h2 className="text-lg font-bold text-yellow-600 mb-4">
          Reseller Application
        </h2>

        <div className="space-y-3">
          <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="phone" placeholder="Phone Number" onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="city" placeholder="City" onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="business" placeholder="Business Name" onChange={handleChange} className="w-full border p-2 rounded" />

          <select name="experience" onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Experience</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Pro</option>
          </select>

          <textarea name="message" placeholder="Message" onChange={handleChange} className="w-full border p-2 rounded" />

          <button
            onClick={handleSubmit}
            className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700"
          >
            Submit via WhatsApp
          </button>

          <button onClick={onClose} className="w-full mt-2 text-gray-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResellerApplicationModal;