import { useState, useEffect } from 'react';
import { Trophy, Book, Target, ChevronUp, ChevronDown, CheckCircle } from 'lucide-react';

import axios from 'axios';
import { decodeJwt } from '../utils/decodeJwt';
import Navbar from './Navbar.jsx';

const assignments = [
  { id: 1, title: "Algorithm Analysis", due: "Tomorrow", status: "pending", points: 100 },
  { id: 2, title: "Database Design", due: "In 2 days", status: "in-progress", points: 150 },
  { id: 3, title: "Network Security", due: "Next week", status: "completed", points: 200 }
];

// Leaderboard will be fetched live from the server

const GoalForm = () => {
  const [goalId, setGoalId] = useState("");
  const [goal, setGoal] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const goalData = {
      goalId,
      goalDetails: {
        goal,
        targetDate,
        completed
      }
    }
    const token = localStorage.getItem("token");
    const data = decodeJwt(token);
    const id = data.id;
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const res = await axios.post(`${API_BASE}/api/goals/user/${id}/goals`, goalData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  console.log('Goal submit response:', res.data);
    } catch (err) {
      console.error('Error submitting goal:', err?.response || err.message || err);
    }
    // Reset form
    setGoalId("");
    setGoal("");
    setTargetDate("");
    setCompleted(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4">Set a New Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-gray-100"
          required
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => setCompleted(!completed)}
            className="mr-2"
          />
          <label className="text-gray-400">Completed</label>
        </div>
        <button type="submit" className="w-full p-2 bg-purple-500 rounded hover:bg-purple-600">
          Submit Goal
        </button>
      </form>
    </div>
  );
};

function Dashboard() {
  const [leaderboardLive, setLeaderboardLive] = useState([]);

  useEffect(() => {
  let mounted = true;
  const loadLeaderboard = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "";
        const res = await axios.get(`${API_BASE}/api/leaderboard`);
        const users = res.data || [];
        users.sort((a, b) => (b.aurapoints || 0) - (a.aurapoints || 0));
    if (mounted) setLeaderboardLive(users.slice(0, 10));
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      }
    };
    loadLeaderboard();
  const interval = setInterval(loadLeaderboard, 15000); // refresh every 15s
  return () => { mounted = false; clearInterval(interval); };
  }, []);
  const handleGoalSubmit = (goalData) => {
    console.log("Goal Data Submitted:", goalData);
    // Here you would typically send the data to your API
  };
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const { id } = decodeJwt(token);
        // const res = await axios.get(`http://localhost:8000/userinfo/${id}`, {
  const API_BASE = import.meta.env.VITE_API_URL || "";
  const res = await axios.get(`${API_BASE}/api/userinfo/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("User Data Response:", res.data);
        setUser(res.data); 
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []); 

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <span className="text-sm text-gray-400">Rank #{user.rank}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">{user.aurapoints}</h3>
                  <p className="text-gray-400">Aura Points</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <Target className="w-8 h-8 text-green-400" />
                    <span className="text-sm text-gray-400">Daily Streak</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">{user.level} days</h3>
                  <p className="text-gray-400">Consistent Learning</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between">
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                    <span className="text-sm text-gray-400">Completion Rate</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">
                    {Math.round((user.completedAssignments / user.totalAssignments) * 100)}%
                  </h3>
                  <p className="text-gray-400">Assignment Progress</p>
                </div>
              </div>
            )}

            {/* Assignments */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Current Assignments</h2>
                <Book className="w-6 h-6 text-purple-400" />
              </div>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className={`p-4 rounded-md ${assignment.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm">{assignment.due}</p>
                    <p className="text-sm">Status: {assignment.status}</p>
                    <p className="text-sm">Points: {assignment.points}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
            <div className="space-y-4">
              {leaderboardLive.map((player, idx) => (
                <div key={player._id || player.id || idx} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                  <span>{idx + 1}. {player.username || player.name || player.username}</span>
                  <span className="font-bold">{player.aurapoints || 0} pts</span>
                  <span className={`text-${(player.aurapoints||0) >= (leaderboardLive[idx+1]?.aurapoints||0) ? 'green' : 'red'}-500`}>
                    {(player.aurapoints||0) >= (leaderboardLive[idx+1]?.aurapoints||0) ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal Setting */}
        <GoalForm onSubmit={handleGoalSubmit} />
      </div>
    </div>
  );
}

export default Dashboard;

