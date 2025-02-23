// import type { NextApiRequest, NextApiResponse } from "next";
// import { supabase } from "@/lib/supabaseClient";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { method } = req;

// if (method === "GET") {
//   const { data, error } = await supabase.from("users").select("*");
//   if (error) return res.status(400).json({ error });
//   return res.status(200).json({ users: data }); // ✅ داده‌ها در users
// }
//   if (method === "POST") {
//     const { name, email } = req.body;
//     const { data, error } = await supabase
//       .from("users")
//       .insert([{ name, email }]);
//     if (error) return res.status(400).json({ error });
//     return res.status(201).json(data);
//   }

//   res.setHeader("Allow", ["GET", "POST"]);
//   res.status(405).end(`Method ${method} Not Allowed`);
// }
