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
  const [isUsersFetched, setIsUsersFetched] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else if (data) {
        setUsers(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        setIsUsersFetched(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    const cachedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedUsers) {
      setUsers(JSON.parse(cachedUsers));
      setIsUsersFetched(true);
    } else {
      fetchUsers();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("Please enter name and email.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ name, email }])
        .select();
      if (error) {
        console.error("❌ Error adding user:", error);
        alert("Error while adding user");
      } else if (data && data.length > 0) {
        const newUser = data[0];
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUsers));
        setName("");
        setEmail("");
        alert("Added user successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error while adding user");
    }
  };

  const handleRefresh = async () => {
    await fetchUsers();
    alert("Refreshed the list of users successfully!");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">User Management</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 border p-4 rounded-lg shadow"
      >
        <div>
          <label className="block font-medium">نام:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User Name"
          />
        </div>
        <div>
          <label className="block font-medium">Email:</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User Email"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Add User
        </button>
      </form>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">User List</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>

        {isUsersFetched && users.length > 0 ? (
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
          <p>User not found. Click "Refresh" to fetch the list.</p>
        )}
      </div>
    </div>
  );
};

export default UsersLocalStorage;
