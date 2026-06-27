import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GrievanceContext } from "../../context/GrievanceContext";

const WB_CATEGORIES = [
  "Financial Fraud / Conflict of Interest",
  "Financial Misappropriation",
  "Data Privacy Breach",
  "Safety & Compliance Violation",
  "Retaliation / Workplace Ethics",
  "Other Ethical Violation"
];

const whistleblowerSchema = z.object({
  subject: z.string().trim().min(1, "Please enter a report title."),
  category: z.string().min(1, "Please select a whistleblower category."),
  description: z.string().trim().min(1, "Please enter report details.")
});

const NewWhistleblowerModal = ({ onClose }) => {
  const { addWhistleblowerReport } = useContext(GrievanceContext);
  const [success, setSuccess] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(whistleblowerSchema),
    defaultValues: {
      subject: "",
      category: "",
      description: ""
    }
  });

  const onSubmit = (data) => {
    const reference = addWhistleblowerReport({
      subject: data.subject,
      category: data.category,
      description: data.description
    });

    setRefNumber(reference);
    setSuccess(true);
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-[rgba(15,31,61,0.5)] backdrop-blur-[5px] flex items-center justify-center z-[1000] animate-fade-in">
      <div className="bg-white w-[90%] max-w-[540px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-scale-up">
        {/* Header */}
        <div className="py-5 px-6 border-b border-slate-200 flex justify-between items-center bg-[var(--color-navy)] text-white">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔒</span>
            <h2 className="text-base font-bold m-0 text-white">Secure Whistleblower Channel</h2>
          </div>
          <button
            onClick={onClose}
            className="background-none border-none cursor-pointer text-2xl text-slate-400 p-1 leading-none hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-10 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[hsl(142,70%,95%)] text-[hsl(142,70%,35%)] text-3xl flex items-center justify-center mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-lg font-bold text-[var(--color-navy-dark)] mb-2">
              Report Submitted Securely
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Your report has been successfully logged anonymously. Write down your Reference Number to track investigations:
            </p>
            
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg py-3 px-5 font-mono text-lg font-bold text-[var(--color-navy-dark)] inline-block tracking-wider mb-6">
              {refNumber}
            </div>

            <div>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg border-none bg-[var(--color-navy)] text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity"
              >
                Close Portal
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1">
            {/* Disclaimer Banner */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 px-3.5 text-xs leading-relaxed text-slate-700 mb-5 flex gap-2.5 items-start">
              <span className="text-base">🛡️</span>
              <div>
                <strong>Identity Protected:</strong> This report bypasses normal HR channels and is routed directly to the Ethics Committee. No login session metadata or IP addresses are linked.
              </div>
            </div>

            {/* Error Banner (if form validation errors exist) */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 px-3.5 text-xs text-[var(--color-red)] font-medium mb-4">
                ⚠️ {errors.subject?.message || errors.category?.message || errors.description?.message}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Report Subject / Title
              </label>
              <input
                type="text"
                placeholder="Briefly state the ethical concern..."
                {...register("subject")}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-xs outline-none focus:border-[var(--color-blue)] focus:ring-4 focus:ring-blue-100 box-border"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Violation Category
              </label>
              <select
                {...register("category")}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-xs bg-white outline-none focus:border-[var(--color-blue)] focus:ring-4 focus:ring-blue-100 box-border"
              >
                <option value="">Select Category</option>
                {WB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Detailed Description & Evidence Description
              </label>
              <textarea
                placeholder="Please provide specific names, dates, amounts, or events. Include details of any physical documents or evidence if available..."
                rows={5}
                {...register("description")}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-xs outline-none resize-y font-inherit box-border focus:border-[var(--color-blue)] focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-lg border border-slate-300 bg-white text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-lg border-none bg-slate-900 text-white text-xs font-semibold cursor-pointer shadow-[0_4px_10px_rgba(15,31,61,0.25)] hover:bg-slate-800 transition-colors"
              >
                File Secure Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NewWhistleblowerModal;
