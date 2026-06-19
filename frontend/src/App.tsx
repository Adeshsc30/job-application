import { useState, useEffect, useCallback } from "react";
import type { Application, ApplicationFormData } from "./types";
import { getApplications, createApplication, updateApplication, deleteApplication } from "./services/api";
import ApplicationForm from "./components/ApplicationForm";
import StatusBadge from "./components/StatusBadge";

const STATUS_FILTERS = ["All", "Applied", "Interviewing", "Offer", "Rejected"];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApplications(
        activeFilter === "All" ? undefined : activeFilter,
        searchQuery || undefined
      );
      setApplications(data);
    } catch {
      setError("Failed to load. Is the backend running on port 5001?");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCreate = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      await createApplication(data);
      setIsAddOpen(false);
      fetchApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ApplicationFormData) => {
    if (!editingApp) return;
    setIsSubmitting(true);
    try {
      await updateApplication(editingApp.id, data);
      setEditingApp(null);
      fetchApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    setIsSubmitting(true);
    try {
      await deleteApplication(deletingApp.id);
      setDeletingApp(null);
      fetchApplications();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-sm text-gray-500">Track your job applications</p>
          </div>
          <button onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            + Add Application
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* FILTERS + SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}>{f}</button>
            ))}
          </div>
          <input type="text" placeholder="Search company or job title..."
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">⏳</p>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-600">
            <p>{error}</p>
            <button onClick={fetchApplications} className="mt-3 text-sm underline">Try again</button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-lg font-medium">No applications found</p>
            <p className="text-sm mt-1">Click "+ Add Application" to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Company", "Job Title", "Type", "Status", "Applied", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{app.company_name}</td>
                      <td className="px-4 py-3 text-gray-700">{app.job_title}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {app.job_type === "FullTime" ? "Full-time" : app.job_type === "PartTime" ? "Part-time" : "Internship"}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(app.applied_date).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setViewingApp(app)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium px-2 py-1 rounded hover:bg-green-50">
                            View
                          </button>
                          <button onClick={() => setEditingApp(app)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50">
                            Edit
                          </button>
                          <button onClick={() => setDeletingApp(app)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-400">
              {applications.length} application{applications.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </main>

      {/* ADD MODAL */}
      {isAddOpen && (
        <Modal title="Add Application" onClose={() => setIsAddOpen(false)}>
          <ApplicationForm onSubmit={handleCreate} onCancel={() => setIsAddOpen(false)} isLoading={isSubmitting} />
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewingApp && (
        <Modal title="Application Details" onClose={() => setViewingApp(null)}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Company</p>
                <p className="text-gray-900 font-semibold mt-0.5">{viewingApp.company_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Job Title</p>
                <p className="text-gray-900 font-semibold mt-0.5">{viewingApp.job_title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Job Type</p>
                <p className="text-gray-900 mt-0.5">
                  {viewingApp.job_type === "FullTime" ? "Full-time" : viewingApp.job_type === "PartTime" ? "Part-time" : "Internship"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Status</p>
                <div className="mt-0.5"><StatusBadge status={viewingApp.status} /></div>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Applied Date</p>
                <p className="text-gray-900 mt-0.5">
                  {new Date(viewingApp.applied_date).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Added On</p>
                <p className="text-gray-900 mt-0.5">
                  {new Date(viewingApp.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              </div>
            </div>
            {viewingApp.notes && (
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Notes</p>
                <p className="text-gray-900 mt-0.5 bg-gray-50 rounded-lg p-3">{viewingApp.notes}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setViewingApp(null); setEditingApp(viewingApp); }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit This Application
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editingApp && (
        <Modal title="Edit Application" onClose={() => setEditingApp(null)}>
          <ApplicationForm
            initialData={{ ...editingApp, notes: editingApp.notes ?? undefined }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingApp(null)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* DELETE MODAL */}
      {deletingApp && (
        <Modal title="Delete Application" onClose={() => setDeletingApp(null)}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deletingApp.job_title}</span> at{" "}
              <span className="font-semibold">{deletingApp.company_name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingApp(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default App;