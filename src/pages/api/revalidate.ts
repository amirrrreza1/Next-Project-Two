// /pages/api/revalidate.ts
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests for revalidation
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  console.log("Revalidate request received"); // Check if this prints in the server logs

  try {
    // Trigger page revalidation
    await res.revalidate("/Users"); // Replace with your page path
    return res.json({ message: "Page revalidated" });
  } catch (error) {
    console.error("Revalidation error:", error); // Log any error
    return res.status(500).json({ message: "Error revalidating", error });
  }
}
