import React, { useEffect, useState } from "react";
import pb from "../pocketbase";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const records = await pb.collection("blog_posts").getFullList();
      setPosts(records);
    }
    fetchPosts();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Blog</h2>
      {posts.map((post) => (
        <div key={post.id} className="mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">{post.title}</h3>
          <p className="text-gray-700">{post.content}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
