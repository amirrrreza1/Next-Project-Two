import { GetStaticProps } from "next";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  initialApprovedUsers: User[];
};

const HomePage = ({ initialApprovedUsers }: Props) => {
  const [approvedUsers] =
    useState<User[]>(initialApprovedUsers);

  return (

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
          <p className="text-center">No users found.</p>
        )}
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
    console.error("Error fetching users:", error);
    return { props: { initialApprovedUsers: [] } };
  }

  return {
    props: { initialApprovedUsers: approvedUsers || [] },
    revalidate: false
  };
};
