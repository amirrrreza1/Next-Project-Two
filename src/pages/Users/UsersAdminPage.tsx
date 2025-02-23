import { GetServerSideProps, GetStaticProps } from "next";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  initialTempUsers: User[];
  initialApprovedUsers: User[];
};

const AdminUsers = ({ initialTempUsers, initialApprovedUsers }: Props) => {
  const [tempUsers, setTempUsers] = useState<User[]>(initialTempUsers);
  const [approvedUsers, setApprovedUsers] =
    useState<User[]>(initialApprovedUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddOrEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim())
      return alert("Please enter both name and email.");
    setLoading(true);

    try {
      setLoading(true);

      if (editingUserId) {
        // تشخیص اینکه کاربر در کدام لیست است
        const isTempUser = tempUsers.some((user) => user.id === editingUserId);
        const tableName = isTempUser ? "TemporaryUsers" : "users";
        const setState = isTempUser ? setTempUsers : setApprovedUsers;

        // ویرایش کاربر در دیتابیس
        const { error } = await supabase
          .from(tableName)
          .update({ name, email })
          .eq("id", editingUserId);

        if (error) {
          console.error("Update error:", error);
          alert("Failed to update user.");
        } else {
          // آپدیت کاربر در استیت
          setState((prev) =>
            prev.map((user) =>
              user.id === editingUserId ? { ...user, name, email } : user
            )
          );
          setEditingUserId(null);
          alert("User updated successfully!");
        }
      } else {
        // افزودن کاربر جدید
        const emailExists =
          tempUsers.some((user) => user.email === email) ||
          approvedUsers.some((user) => user.email === email);

        if (emailExists) {
          alert("This email is already in use.");
          return;
        }

        const { data, error } = await supabase
          .from("TemporaryUsers")
          .insert([{ name, email }])
          .select()
          .single();

        if (error) {
          console.error("Insertion error:", error);
          alert("Failed to add user.");
        } else if (data) {
          setTempUsers((prev) => [data, ...prev]);
          alert("User added successfully!");
        }
      }

      // پاک کردن فیلدهای ورودی پس از عملیات موفق
      setName("");
      setEmail("");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/revalidate", { method: "POST" });
      const data = await response.json();

      if (data.revalidated) {
        alert("بیلد مجدد با موفقیت انجام شد.");
      } else {
        alert("بیلد ناموفق بود. دوباره تلاش کنید.");
      }
    } catch (error) {
      console.error("Revalidation failed:", error);
      alert("خطا در انجام بیلد.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (id: number) => {
    setLoading(true);
    const { data: tempUser, error: fetchError } = await supabase
      .from("TemporaryUsers")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError) return;

    const { error: insertError, data: approvedUser } = await supabase
      .from("users")
      .insert([{ name: tempUser.name, email: tempUser.email }])
      .select()
      .single();

    if (!insertError && approvedUser) {
      await supabase.from("TemporaryUsers").delete().eq("id", id);
      setTempUsers((prev) => prev.filter((user) => user.id !== id));
      setApprovedUsers((prev) => [approvedUser, ...prev]);

      // Trigger page revalidation
      await fetch("/api/revalidate", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Revalidation successful", data);
        })
        .catch((error) => {
          console.error("Revalidation failed", error); // خطای احتمالی را نشان دهید
        });
    }
    setLoading(false);
  };

  const handleApproveAll = async () => {
    setLoading(true);
    const usersToApprove = tempUsers;
    if (usersToApprove.length === 0) return alert("No users to approve.");

    const { data: approvedData, error: insertError } = await supabase
      .from("users")
      .insert(usersToApprove.map(({ name, email }) => ({ name, email })))
      .select();

    if (!insertError && approvedData) {
      await supabase
        .from("TemporaryUsers")
        .delete()
        .in(
          "id",
          usersToApprove.map((u) => u.id)
        );
      setApprovedUsers((prev) => [...approvedData, ...prev]);
      setTempUsers([]);

      // Trigger page revalidation
      await fetch("/api/revalidate", {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Revalidation successful", data);
        })
        .catch((error) => {
          console.error("Revalidation failed", error);
        });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("TemporaryUsers")
      .delete()
      .eq("id", id);
    if (!error) setTempUsers((prev) => prev.filter((user) => user.id !== id));
    setLoading(false);
  };

  const startEditing = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUserId(user.id);
  };

  const handleDeleteApprovedUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this approved user?")) return;
    setLoading(true);
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error)
      setApprovedUsers((prev) => prev.filter((user) => user.id !== id));
    setLoading(false);
  };

  const startEditingApprovedUser = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUserId(user.id);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      <form
        onSubmit={handleAddOrEditUser}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {editingUserId ? "Submit" : "Add"}
        </button>
      </form>

      {/* لیست کاربران موقت */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Not Approved Users</h2>
          <button
            onClick={handleApproveAll}
            disabled={loading}
            className={`py-2 px-4 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            Approve All
          </button>
        </div>

        {tempUsers.length > 0 ? (
          <ul className="space-y-4">
            {tempUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Status:</strong> Pending Approval
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    disabled={loading}
                    className={`py-1 px-3 rounded text-white ${
                      loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => startEditing(user)}
                    className="py-1 px-3 rounded text-white bg-yellow-500 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="py-1 px-3 rounded text-white bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No User in Temprary Users List.</p>
        )}
      </div>

      {/* لیست کاربران تایید شده */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">Approved Users</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search approved users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        {approvedUsers.length > 0 ? (
          <ul className="space-y-4">
            {approvedUsers
              .filter(
                (user) =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <li
                  key={user.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Status:</strong> Approved
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEditingApprovedUser(user)}
                      className="py-1 px-3 rounded text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteApprovedUser(user.id)}
                      className="py-1 px-3 rounded text-white bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p>No Approved Users.</p>
        )}
      </div>
      <button
        onClick={handleRevalidate}
        disabled={loading}
        className={`w-full py-2 mt-6 rounded text-white ${
          loading ? "bg-gray-400" : "bg-purple-500 hover:bg-purple-600"
        }`}
      >
        تأیید تغییرات و بیلد مجدد
      </button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data: tempData, error: tempError } = await supabase
    .from("TemporaryUsers")
    .select("*")
    .order("id", { ascending: false });
  const { data: approvedData, error: approvedError } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (tempError || approvedError) {
    console.error("Error fetching users:", tempError || approvedError);
    return { props: { initialTempUsers: [], initialApprovedUsers: [] } };
  }

  return {
    props: {
      initialTempUsers: tempData || [],
      initialApprovedUsers: approvedData || [],
    },
  };
};

export default AdminUsers;
