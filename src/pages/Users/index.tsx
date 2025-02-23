import { GetStaticProps } from "next";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

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
    <div
      className="overflow-y-scroll"
      style={{ height: `calc(100vh - 140px)` }}
    >
      <div className="p-6 max-w-3xl mx-auto ">
        <h1 className="text-3xl font-bold text-center mb-8">Users List</h1>

        {approvedUsers.length > 0 ? (
          <ul className="space-y-4">
            {approvedUsers.map((user) => (
              <li
                key={user.id}
                className="p-4 border rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center">هیچ کاربری تایید نشده است.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;

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
