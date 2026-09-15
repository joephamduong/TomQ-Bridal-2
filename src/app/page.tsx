import Link from "next/link";
import { getHomeContent } from "@/lib/repo/settings";
import { listProductsWithPrimaryImage } from "@/lib/repo/catalog";
import { listBlogPosts } from "@/lib/repo/blog";
import HomeClient from "@/components/site/HomeClient";

export default async function HomePage() {
  const content = getHomeContent();
  const brideProducts = listProductsWithPrimaryImage({ type: "BRIDE", featuredOnly: true, limit: 4 });
  const groomProducts = listProductsWithPrimaryImage({ type: "GROOM", featuredOnly: true, limit: 4 });
  const posts = listBlogPosts({ limit: 3 });

  return (
    <HomeClient
      content={content}
      brideProducts={brideProducts.items}
      groomProducts={groomProducts.items}
      posts={posts.items}
    />
  );
}
