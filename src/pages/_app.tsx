// pages/_app.tsx
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import MainLayout from "@/Components/Layout/MainLayout";
import UsersLayout from "@/Components/Layout/UsersLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const specialRoutes = ["/Users" , "/Users/UsersLocalStorage" , "/Users/UsersGetStaticProps" , "/Users/UsersAdminPage"];

  const isSpecialRoute = specialRoutes.includes(router.pathname);

  return isSpecialRoute ? (
    <UsersLayout>
      <Component {...pageProps} />
    </UsersLayout>
  ) : (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
