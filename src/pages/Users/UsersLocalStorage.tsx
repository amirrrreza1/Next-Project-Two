// pages/users.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

type User = {
  id: number;
  name: string;
  email: string;
};

const LOCAL_STORAGE_KEY = "usersData";

const UsersLocalStorage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // ✅ Fetch users on initial load and cache them in localStorage
  useEffect(() => {
    const cachedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cachedUsers) {
      setUsers(JSON.parse(cachedUsers));
    } else {
      const fetchUsers = async () => {
        const { data, error } = await supabase.from("users").select("*");
        if (error) {
          console.error("❌ Error fetching users:", error);
        } else {
          setUsers(data ?? []);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
      };

      fetchUsers();
    }
  }, []);

  // 🛠️ Add a new user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please enter both name and email.");
      return;
    }

    const { error } = await supabase.from("users").insert([{ name, email }]);
    if (error) {
      console.error("❌ Error adding user:", error);
    } else {
      alert("✅ User added! Click refresh to see the updated list.");
      setName("");
      setEmail("");
    }
  };

  // 🔄 Refresh user list and update localStorage
  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/refreshUsers");
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } else {
        console.error("❌ Error refreshing users:", data.error);
      }
    } catch (err) {
      console.error("❌ Error connecting to the server:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>

      {/* 📝 Add User Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-lg shadow"
      >
        <div>
          <label className="block font-medium">Name:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User name"
          />
        </div>
        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Add User
        </button>
      </form>

      {/* 📃 User List */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">User List</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Refresh List
          </button>
        </div>

        {users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="p-4 border rounded-lg">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UsersLocalStorage;
