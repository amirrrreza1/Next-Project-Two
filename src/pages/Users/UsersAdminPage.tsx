import { GetServerSideProps, GetStaticProps } from "next";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Swal from "sweetalert2"; // Import SweetAlert2

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
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddOrEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      return Swal.fire("Error", "Please enter both name and email.", "error");
    }
    try {
      if (editingUserId) {
        const isTempUser = tempUsers.some((user) => user.id === editingUserId);
        const tableName = isTempUser ? "TemporaryUsers" : "users";
        const setState = isTempUser ? setTempUsers : setApprovedUsers;

        const { error } = await supabase
          .from(tableName)
          .update({ name, email })
          .eq("id", editingUserId);

        if (error) {
          console.error("Update error:", error);
          Swal.fire("Error", "Failed to update user.", "error");
        } else {
          setState((prev) =>
            prev.map((user) =>
              user.id === editingUserId ? { ...user, name, email } : user
            )
          );
          setEditingUserId(null);
          Swal.fire("Success", "User updated successfully!", "success");
        }
      } else {
        const emailExists =
          tempUsers.some((user) => user.email === email) ||
          approvedUsers.some((user) => user.email === email);

        if (emailExists) {
          Swal.fire("Error", "This email is already in use.", "error");
          return;
        }

        const { data, error } = await supabase
          .from("TemporaryUsers")
          .insert([{ name, email }])
          .select()
          .single();

        if (error) {
          console.error("Insertion error:", error);
          Swal.fire("Error", "Failed to add user.", "error");
        } else if (data) {
          setTempUsers((prev) => [data, ...prev]);
          Swal.fire("Success", "User added successfully!", "success");
        }
      }

      setName("");
      setEmail("");
    } catch (err) {
      console.error("Unexpected error:", err);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  const handleRevalidate = async () => {
    try {
      const response = await fetch("/api/revalidate", { method: "POST" });
      const data = await response.json();

      if (data.revalidated) {
        Swal.fire("Success", "Rebuilded successfully.", "success");
      } else {
        Swal.fire("Error", "Failed to Rebuild.", "error");
      }
    } catch (error) {
      console.error("Revalidation failed:", error);
      Swal.fire("Error", "Error while Rebuilding.", "error");
    }
  };

  const handleApproveUser = async (id: number) => {
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
  };

  const handleApproveAll = async () => {
    const usersToApprove = tempUsers;
    if (usersToApprove.length === 0)
      return Swal.fire("Info", "No users to approve.", "info");

    try {
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

        // رفرش و بازسازی بعد از تایید
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
      } else {
        Swal.fire("Error", "Error occurred during approval.", "error");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Swal.fire("Error", "An unexpected error occurred.", "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const { error } = await supabase
      .from("TemporaryUsers")
      .delete()
      .eq("id", id);
    if (!error) setTempUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const startEditing = (user: User) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUserId(user.id);
  };

  const handleDeleteApprovedUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this approved user?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error)
      setApprovedUsers((prev) => prev.filter((user) => user.id !== id));
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
          className="w-full py-2 rounded text-white bg-green-500 hover:bg-green-600"
        >
          {editingUserId ? "Submit" : "Add"}
        </button>
      </form>

      {/* لیست کاربران موقت */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="md:text-2xl font-semibold">Not Approved Users</h2>
          <button
            onClick={handleApproveAll}
            className="py-2 px-4 text-sm md:text-base rounded text-white bg-blue-500 hover:bg-blue-600"
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
                    className="py-1 px-3 rounded text-white bg-blue-500 hover:bg-blue-600"
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
          <p>No User in Temporary Users List.</p>
        )}
      </div>

      {/* لیست کاربران تایید شده */}
      <div className="mt-16">
        <div className="flex justify-between items-center">
          <h2 className="md:text-2xl font-semibold mb-4">Approved Users</h2>
          <button
            onClick={handleRevalidate}
            className="py-2 text-sm md:text-base px-4 rounded text-white bg-purple-500 hover:bg-purple-600"
          >
            Rebuild
          </button>
        </div>

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
                  className="p-4 border rounded-lg flex flex-wrap justify-between items-center gap-3"
                >
                  <div>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>
                  <div className="space-x-2 w-[400px] sm:w-auto">
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
