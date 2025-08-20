import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const AssignmentPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [editIndex, setEditIndex] = useState(null); // Track index for editing
  const [filter, setFilter] = useState("all"); // Track filter state
  const [error, setError] = useState(""); // Track error state

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !dueDate) {
      setError("Title and Due Date are required.");
      return;
    }
    setError(""); // Clear error if inputs are valid

    const newAssignment = { title, dueDate, status };
    const token = localStorage.getItem('token');

    if (token) {
      // authenticated: save to server
      const API_BASE = import.meta.env.VITE_API_URL || "";
      (async () => {
        try {
          const res = await axios.post(`${API_BASE}/api/assignments`, { title, dueDate }, { headers: { Authorization: `Bearer ${token}` } });
          const created = res.data.assignment;
          setAssignments(prev => [...prev, { ...created, status: created.status || status }]);
        } catch (err) {
          console.error('Failed to create assignment on server', err?.response?.data || err.message);
          toast.error('Failed to save assignment to server; saved locally');
          setAssignments(prev => [...prev, newAssignment]);
        }
      })();
    } else {
      // offline/unauthenticated: local-only
      if (editIndex !== null) {
        const updatedAssignments = [...assignments];
        updatedAssignments[editIndex] = newAssignment;
        setAssignments(updatedAssignments);
        setEditIndex(null);
      } else {
        setAssignments([...assignments, newAssignment]);
      }
    }

    // Reset form
    setTitle("");
    setDueDate("");
    setStatus("pending");
  };

  // Persist assignments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Load persisted assignments on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const API_BASE = import.meta.env.VITE_API_URL || "";
    if (token) {
      // load from server
      (async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/assignments`, { headers: { Authorization: `Bearer ${token}` } });
          setAssignments(res.data.assignments || []);
        } catch (err) {
          console.error('Failed to load assignments from server', err?.response?.data || err.message);
          // fallback to localStorage
          try {
            const saved = localStorage.getItem('assignments');
            if (saved) setAssignments(JSON.parse(saved));
          } catch (e) {
            console.warn('Failed to load saved assignments', e);
          }
        }
      })();
    } else {
      try {
        const saved = localStorage.getItem('assignments');
        if (saved) setAssignments(JSON.parse(saved));
      } catch (err) {
        console.warn('Failed to load saved assignments', err);
      }
    }
  }, []);

  const toggleStatus = (index) => {
    const token = localStorage.getItem('token');
    const a = assignments[index];
    if (!a) return;

    if (token && a._id) {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      (async () => {
        try {
          const res = await axios.put(`${API_BASE}/api/assignments/${a._id}/toggle`, {}, { headers: { Authorization: `Bearer ${token}` } });
          const updated = res.data.assignment;
          setAssignments(prev => prev.map(it => (it._id === updated._id ? updated : it)));
        } catch (err) {
          console.error('Failed toggle on server', err?.response?.data || err.message);
          // optimistic local toggle
          const updatedAssignments = [...assignments];
          updatedAssignments[index].status = updatedAssignments[index].status === "pending" ? "completed" : "pending";
          setAssignments(updatedAssignments);
        }
      })();
    } else {
      const updatedAssignments = [...assignments];
      updatedAssignments[index].status = updatedAssignments[index].status === "pending" ? "completed" : "pending";
      setAssignments(updatedAssignments);
    }
  };

  const editAssignment = (index) => {
    const assignmentToEdit = assignments[index];
    setTitle(assignmentToEdit.title);
    setDueDate(assignmentToEdit.dueDate);
    setStatus(assignmentToEdit.status);
    setEditIndex(index);
  };

  const deleteAssignment = (index) => {
    const a = assignments[index];
    const token = localStorage.getItem('token');
    if (token && a?._id) {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      (async () => {
        try {
          await axios.delete(`${API_BASE}/api/assignments/${a._id}`, { headers: { Authorization: `Bearer ${token}` } });
          setAssignments(prev => prev.filter((_, i) => i !== index));
        } catch (err) {
          console.error('Failed delete on server', err?.response?.data || err.message);
          toast.error('Failed to delete on server');
        }
      })();
    } else {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const filterAssignments = () => {
    if (filter === "all") return assignments;
    return assignments.filter((a) => a.status === filter);
  };

  // Calculate completion percentage
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.status === "completed").length;
  const completionPercentage = totalAssignments ? (completedAssignments / totalAssignments) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Your Assignments</h2>
        <p className="text-gray-400 mb-4">
          Keep track of your assignments and stay organized. Check them off as you complete them!
        </p>

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
          <input
            type="text"
            placeholder="Assignment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-100 mb-4"
            required
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-gray-100 mb-4"
            required
          />
          <button type="submit" className="w-full p-2 bg-purple-500 rounded hover:bg-purple-600">
            {editIndex !== null ? "Update Assignment" : "Add Assignment"}
          </button>
        </form>

        {/* Filter Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Filter Assignments</h3>
          <div className="flex space-x-4 mt-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded ${filter === "all" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded ${filter === "pending" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded ${filter === "completed" ? "bg-purple-600" : "bg-gray-700"}`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Assignments Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Assignments Summary</h3>
          <p className="text-gray-400">
            Total Assignments: {totalAssignments} | Completed: {completedAssignments}
          </p>
        </div>

        {/* Display Assignments */}
        <div className="space-y-4">
          {filterAssignments().map((assignment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium">{assignment.title}</h3>
                <p className="text-sm text-gray-400">Due: {assignment.dueDate}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={assignment.status === "completed"}
                  onChange={() => toggleStatus(index)}
                  className="mr-2"
                />
                <span className="text-gray-400 mr-4">
                  {assignment.status === "completed" ? "Completed" : "Pending"}
                </span>
                <button onClick={() => editAssignment(index)} className="text-blue-400 hover:underline mr-2">
                  Edit
                </button>
                <button onClick={() => deleteAssignment(index)} className="text-red-400 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <div className="relative w-full h-6 bg-gray-700 rounded">
            <div
              className="absolute top-0 left-0 h-full bg-purple-500 rounded"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 text-right">{completionPercentage.toFixed(0)}% Completed</p>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;