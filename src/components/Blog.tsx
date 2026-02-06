import React from "react";

const staticPosts = [
  {
    id: "welcome",
    title: "Welcome to My Paradise English",
    content: "We are excited to share updates, class highlights, and learning tips with you!",
    date: "2026-02-06",
  },
  {
    id: "news",
    title: "New Classes Open",
    content: "New group classes are now available. Contact us to reserve a seat.",
    date: "2026-02-05",
  },
];

export default function Blog() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Blog</h2>
      {staticPosts.map((post) => (
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
