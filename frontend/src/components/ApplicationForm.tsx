import { useState, useEffect } from "react";
import type { ApplicationFormData } from "../types";

interface Props {
  initialData?: Partial<ApplicationFormData>;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultForm: ApplicationFormData = {
  company_name: "",
  job_title: "",
  job_type: "Internship",
  status: "Applied",
  applied_date: new Date().toISOString().split("T")[0],
  notes: "",
};

const ApplicationForm = ({ initialData, onSubmit, onCancel, isLoading }: Props) => {
  const [form, setForm] = useState<ApplicationFormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({
        ...prev,
        ...initialData,
        applied_date: initialData.applied_date
          ? new Date(initialData.applied_date).toISOString().split("T")[0]
          : prev.applied_date,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ApplicationFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (!form.company_name || form.company_name.trim().length < 2)
      newErrors.company_name = "Company name must be at least 2 characters";
    if (!form.job_title || form.job_title.trim().length === 0)
      newErrors.job_title = "Job title is required";
    if (!form.applied_date)
      newErrors.applied_date = "Applied date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
        <input type="text" name="company_name" value={form.company_name} onChange={handleChange}
          placeholder="e.g. Google"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.company_name ? "border-red-400" : "border-gray-300"}`} />
        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
        <input type="text" name="job_title" value={form.job_title} onChange={handleChange}
          placeholder="e.g. Frontend Engineer Intern"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_title ? "border-red-400" : "border-gray-300"}`} />
        {errors.job_title && <p className="text-red-500 text-xs mt-1">{errors.job_title}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
          <select name="job_type" value={form.job_type} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Internship">Internship</option>
            <option value="FullTime">Full-time</option>
            <option value="PartTime">Part-time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date *</label>
        <input type="date" name="applied_date" value={form.applied_date} onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.applied_date ? "border-red-400" : "border-gray-300"}`} />
        {errors.applied_date && <p className="text-red-500 text-xs mt-1">{errors.applied_date}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea name="notes" value={form.notes || ""} onChange={handleChange}
          placeholder="Any extra info..." rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? "Saving..." : "Save Application"}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;