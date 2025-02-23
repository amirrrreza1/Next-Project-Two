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

  const handleAddOrEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim())
      return alert("لطفا نام و ایمیل معتبر وارد کنید.");
    setLoading(true);

    try {
      if (editingUserId) {
        const { error } = await supabase
          .from("TemporaryUsers")
          .update({ name, email })
          .eq("id", editingUserId);
        if (!error) {
          setTempUsers((prev) =>
            prev.map((user) =>
              user.id === editingUserId ? { ...user, name, email } : user
            )
          );
          setEditingUserId(null);
        }
      } else {
        const emailExists =
          tempUsers.some((user) => user.email === email) ||
          approvedUsers.some((user) => user.email === email);
        if (emailExists) return alert("این ایمیل قبلاً ثبت شده است.");

        const { data, error } = await supabase
          .from("TemporaryUsers")
          .insert([{ name, email }])
          .select()
          .single();
        if (!error && data) setTempUsers((prev) => [data, ...prev]);
      }
      setName("");
      setEmail("");
    } catch (err) {
      console.error("❌ خطا:", err);
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
          console.log("Revalidation successful", data); // بررسی اینکه پاسخ دریافتی چیست
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
    if (usersToApprove.length === 0)
      return alert("کاربری برای تایید وجود ندارد.");

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
          console.log("Revalidation successful", data); // بررسی اینکه پاسخ دریافتی چیست
        })
        .catch((error) => {
          console.error("Revalidation failed", error); // خطای احتمالی را نشان دهید
        });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        پنل ادمین - مدیریت کاربران
      </h1>

      {/* فرم افزودن یا ویرایش کاربر */}
      <form
        onSubmit={handleAddOrEditUser}
        className="space-y-4 border p-4 rounded-lg shadow"
      >
        <div>
          <label className="block font-medium">نام:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام کاربر"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium">ایمیل:</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل کاربر"
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
          {editingUserId ? "ویرایش کاربر" : "افزودن به کاربران موقت"}
        </button>
      </form>

      {/* لیست کاربران موقت */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">کاربران موقت</h2>
          <button
            onClick={handleApproveAll}
            disabled={loading}
            className={`py-2 px-4 rounded text-white ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            تایید همه کاربران
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
                    <strong>نام:</strong> {user.name}
                  </p>
                  <p>
                    <strong>ایمیل:</strong> {user.email}
                  </p>
                  <p>
                    <strong>وضعیت:</strong> در انتظار تایید
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
                    تایید
                  </button>
                  <button
                    onClick={() => startEditing(user)}
                    className="py-1 px-3 rounded text-white bg-yellow-500 hover:bg-yellow-600"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="py-1 px-3 rounded text-white bg-red-500 hover:bg-red-600"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>هیچ کاربری در لیست موقت نیست.</p>
        )}
      </div>

      {/* لیست کاربران تایید شده */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-4">کاربران تایید شده</h2>
        {approvedUsers.length > 0 ? (
          <ul className="space-y-4">
            {approvedUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>نام:</strong> {user.name}
                  </p>
                  <p>
                    <strong>ایمیل:</strong> {user.email}
                  </p>
                  <p>
                    <strong>وضعیت:</strong> تایید شده
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>هیچ کاربری تایید نشده است.</p>
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
    console.error("❌ خطا در دریافت کاربران:", tempError || approvedError);
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
