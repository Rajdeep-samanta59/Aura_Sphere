import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { decodeJwt } from '../utils/decodeJwt';
import Navbar from "./Navbar.jsx";
import toast from 'react-hot-toast';

function Goal({ goal, onToggleComplete }){
  return (
    <div
      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg cursor-pointer"
      onClick={() => {
        console.log(`Toggling goal: ${goal._id}`);
        onToggleComplete(goal);
      }}
    >
      <div>
  <h3 className="font-medium">{goal.goal}</h3>
  <p className="text-sm text-gray-400">Target Date: {goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0,10) : 'N/A'}</p>
      </div>
      <CheckCircle
        className={`w-6 h-6 ${
          goal.completed
            ? "text-green-400"
            : "text-gray-500 hover:text-green-400"
        }`}
      />
    </div>
  );
}

function GoalsSection() {
  const [goals, setGoals] = useState([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");

  const fetchGoals = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
  const { id } = decodeJwt(token);
        const API_BASE = import.meta.env.VITE_API_URL || "";
        const res = await axios.get(
          `${API_BASE}/api/userinfo/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  // Only show non-completed goals in the UI so completed goals disappear
  const allGoals = res.data.academicGoals || [];
  setGoals(allGoals.filter(g => !g.completed));
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error('You must be logged in to add a goal');
    const { id } = decodeJwt(token);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const goalDetails = { goal: newGoalText, targetDate: newTargetDate };
      await axios.post(`${API_BASE}/api/goals/user/${id}/goals`, { goalDetails }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setNewGoalText("");
      setNewTargetDate("");
      setShowAddForm(false);
      toast.success('Goal added');
      await fetchGoals();
    } catch (err) {
      console.error('Error adding goal:', err.response ? err.response.data : err.message);
      toast.error('Failed to add goal');
    }
  };

  const toggleGoalComplete = async (goal) => {
    const token = localStorage.getItem("token");
  const { id } = decodeJwt(token);

    try {
      if (goal.completed) {
        // If the goal is completed, delete it
        console.log(`Deleting goal with ID: ${goal._id}`);
        const API_BASE = import.meta.env.VITE_API_URL || "";
        await axios.delete(`${API_BASE}/api/goals/user/${id}/goals/${goal._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Refresh goals after deletion
        await fetchGoals();
      } else {
        // If the goal is not completed, mark it as completed
        console.log(`Marking goal as completed with ID: ${goal._id}`);
        const API_BASE = import.meta.env.VITE_API_URL || "";
  // Toggle the completed state on server
  await axios.put(`${API_BASE}/api/goals/user/${id}/goals/${goal._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
  await axios.patch(`${API_BASE}/api/user/points/${id}/add-aurapoints`, { points: 10 }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        // Show popup message
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3000);
  // Remove the completed goal locally so it disappears immediately
  setGoals(prev => prev.filter(g => g._id !== goal._id));
  // Still refresh from server in background to keep state consistent
  fetchGoals();

        // Refresh goals after updating
      }
    } catch (error) {
      console.error(
        "Error updating/deleting goal:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4">Your Goals</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Add New Goal</h3>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="text-sm text-indigo-400 hover:underline"
          >
            {showAddForm ? 'Cancel' : 'Add'}
          </button>
        </div>
        {showAddForm && (
          <form onSubmit={handleAddGoal} className="space-y-2 mb-4">
            <input
              required
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              placeholder="What do you want to achieve?"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
            <input
              type="date"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            />
            <div>
              <button className="px-4 py-2 bg-indigo-600 rounded text-white">Create Goal</button>
            </div>
          </form>
        )}
        {goals.map((goal) => (
          <Goal
            key={goal._id}
            goal={goal}
            onToggleComplete={toggleGoalComplete}
          />
        ))}
      </div>
      {popupVisible && (
        <div className="fixed place-self-center right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          You have been awarded 10 aura points!
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <GoalsSection />
      </div>
    </div>
  );
}

export default Dashboard;
