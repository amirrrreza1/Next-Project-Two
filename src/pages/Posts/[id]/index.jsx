import { useRouter } from "next/router";

const ShowPosts = ({ post, error }) => {
    const router = useRouter();
  
    if (router.isFallback) {
      return <h1>Loading ...</h1>;
    }
  
    if (error) {
      return <h1>{error}</h1>;
    }
  
    return (
      <div>
        <h1 className="text-3xl text-center my-10">Post Number {post.id}</h1>
        <p className="text-center w-[95%] md:w-[45%] line-clamp-1 m-auto">{post.title}</p>
        <p className="text-center w-[95%] md:w-[60%] line-clamp-3 m-auto my-10">{post.body}</p>
      </div>
    );
  };
  
 
export default ShowPosts;

export async function getStaticPaths(params) {
 const res = await fetch ("https://jsonplaceholder.typicode.com/posts")
 const data = await res.json()

 const paths = data.slice(0,50).map((post)=> {
  return {params : {id : String(post.id)}}
 })
 return {
  paths , 
  fallback: true,
 }
}

export async function getStaticProps({ params }) {
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${params.id}`);
      if (!res.ok) {
        throw new Error("An error has occurred");
      }
      const post = await res.json();
      return { props: { post } };
    } catch (error) {
      return { props: { error: "ERRRRRR" } };
    }
  }
  