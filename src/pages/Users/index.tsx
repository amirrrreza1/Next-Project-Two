import { GetStaticProps } from "next";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export const getStaticProps: GetStaticProps = async () => {
  const { data: approvedUsers, error } = await supabase
    .from("users")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("❌ خطا در دریافت کاربران تایید شده:", error);
    return { props: { initialApprovedUsers: [] } };
  }

  return {
    props: { initialApprovedUsers: approvedUsers || [] },
    revalidate: 60 * 60 * 24, // بازسازی صفحه هر ۲۴ ساعت در صورت عدم فراخوانی دستی
  };
};



type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  initialApprovedUsers: User[];
};

const HomePage = ({ initialApprovedUsers }: Props) => {
  const [approvedUsers, setApprovedUsers] =
    useState<User[]>(initialApprovedUsers);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        لیست کاربران تایید شده
      </h1>
      <Link
        href="/admin"
        className="block text-center mb-6 text-blue-600 hover:underline"
      >
        رفتن به صفحه ادمین
      </Link>

      {approvedUsers.length > 0 ? (
        <ul className="space-y-4">
          {approvedUsers.map((user) => (
            <li
              key={user.id}
              className="p-4 border rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>نام:</strong> {user.name}
                </p>
                <p>
                  <strong>ایمیل:</strong> {user.email}
                </p>
                <p className="text-green-600 font-medium">
                  وضعیت: تایید شده ✅
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center">هیچ کاربری تایید نشده است.</p>
      )}
    </div>
  );
};

export default HomePage;
