import Head from "next/head";
import Link from "next/link";

const Posts = ({ post }) => {
  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <h1 className="text-3xl text-center my-10">Posts</h1>
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {post.map((item) => {
          return (
            <Link
              href={`/Posts/${item.id}`}
              key={item.id}
              className="w-[95%] md:w-[45%] lg:w-[20%] border-2 p-3 rounded-md"
            >
              <h1 className="font-bold text-xl line-clamp-1 leading-8">{item.title}</h1>
              <p className="text-sm line-clamp-3 leading-5">{item.body}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default Posts;

export async function getStaticProps() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();  // اضافه کردن await برای گرفتن داده‌ها

    return { props: { post: data } };
  } catch (error) {
    return { props: { error: "ERRRRr" } };
  }
}
