import { GetStaticProps } from "next";

type User = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  users: User[];
};

const Users = ({ users }: Props) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="p-2 border rounded">
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
  );
};

export default Users;

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    const data = await res.json();

    return {
      props: {
        users: data.users,
      },
      revalidate: 60, // ⏳ بازسازی صفحه هر ۶۰ ثانیه (اختیاری)
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      props: {
        users: [],
      },
    };
  }
};
