// pages/api/refreshUsers.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log({req , res});
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await res.revalidate("/Users/UsersGetStaticProps");
    return res.json({ revalidated: true });
  } catch (err) {
    console.error("Revalidation error:", err);
    return res.status(500).json({ revalidated: false, error: err });
  }
}
