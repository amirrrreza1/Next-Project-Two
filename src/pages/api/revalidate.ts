import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    await res.revalidate("/Users");
    return res.json({ message: "Page revalidated" });
  } catch (error) {
    console.error("Revalidation error:", error);
    return res.status(500).json({ message: "Error revalidating", error });
  }
}
