import { GetServerSideProps } from "next";

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

interface PostsProps {
  data: Post[];
}

const Posts = ({ data }: PostsProps) => {
  return (
    <>
      <h1 className="text-center text-3xl my-4">Posts</h1>
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {data.length > 0 ? (
          data.map((post) => (
            <div
              key={post.id}
              className="border border-gray-300 shadow-md p-4 w-[80%] md:w-[40%] lg:w-[30%] xl:w-[25%] 2xl:w-[20%] rounded-lg"
            >
              <h2 className="text-xl line-clamp-1 text-center">{post.title}</h2>
              <p className="text-gray-500 line-clamp-3">{post.body}</p>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </>
  );
};

export default Posts;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!res.ok) {
      throw new Error(`Failed to fetch, status: ${res.status}`);
    }
      const data: Post[] = await res.json();
    return {
      props: { data },
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      props: { data: [] },
    };
  }
};
