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

  // ✅ دریافت داده‌ها فقط در اولین بار لود با ذخیره در localStorage
  useEffect(() => {
    const cachedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (cachedUsers) {
      // اگر داده‌ها در localStorage ذخیره شده باشند، از آن‌ها استفاده کن
      setUsers(JSON.parse(cachedUsers));
    } else {
      // در غیر این صورت از سرور داده‌ها را دریافت کن و در localStorage ذخیره کن
      const fetchUsers = async () => {
        const { data, error } = await supabase.from("users").select("*");
        if (error) {
          console.error("❌ خطا در دریافت کاربران:", error);
        } else {
          setUsers(data ?? []);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        }
      };

      fetchUsers();
    }
  }, []);

  // 🛠️ افزودن کاربر جدید
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert("لطفا نام و ایمیل را وارد کنید.");
      return;
    }

    const { error } = await supabase.from("users").insert([{ name, email }]);
    if (error) {
      console.error("❌ خطا در افزودن کاربر:", error);
    } else {
      alert("✅ کاربر اضافه شد! برای مشاهده باید بازنشانی کنید.");
      setName("");
      setEmail("");
    }
  };

  // 🔄 بازنشانی لیست کاربران و به‌روزرسانی localStorage
  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/refreshUsers");
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); // داده‌ها را در localStorage به‌روزرسانی کن
      } else {
        console.error("❌ خطا در بازنشانی:", data.error);
      }
    } catch (err) {
      console.error("❌ خطا در ارتباط با سرور:", err);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">مدیریت کاربران</h1>

      {/* 📝 فرم افزودن کاربر */}
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
            placeholder="نام کاربر"
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
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          افزودن کاربر
        </button>
      </form>

      {/* 📃 لیست کاربران */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">لیست کاربران</h2>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            بازنشانی لیست
          </button>
        </div>

        {users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user.id} className="p-4 border rounded-lg">
                <p>
                  <strong>نام:</strong> {user.name}
                </p>
                <p>
                  <strong>ایمیل:</strong> {user.email}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>هیچ کاربری یافت نشد.</p>
        )}
      </div>
    </div>
  );
};

export default UsersLocalStorage;
