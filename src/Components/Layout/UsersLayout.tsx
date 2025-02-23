// components/UsersLayout.tsx

import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface NavItem {
  name: string;
  href: string;
}

interface UsersLayoutProps {
  children: ReactNode;
}

const NAV: NavItem[] = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Users",
    href: "/Users",
  },
  {
    name: "Static",
    href: "/Users/UsersGetStaticProps",
  },
  {
    name: "Local",
    href: "/Users/UsersLocalStorage",
  },
  {
    name: "Admin",
    href: "/Users/UsersAdminPage",
  },
];

const UsersLayout = ({ children }: UsersLayoutProps) => {
  const { pathname } = useRouter();

  return (
    <>
      <header className="bg-red-500 text-white h-fit min-h-[60px] w-[95%] lg:w-[80%] text-sm md:text-base m-auto my-[10px] rounded-lg flex justify-center items-center px-3">
        <nav>
          <ul className="flex gap-4 ">
            {NAV.map((nav) => (
              <Link
                href={nav.href}
                key={nav.href}
                className={`${
                  pathname === nav.href ? "border-b-2" : "opacity-50"
                } hover:opacity-80 !h-[60px] leading-[60px]`}
              >
                {nav.name}
              </Link>
            ))}
          </ul>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="bg-red-500 text-white h-[60px] flex justify-center items-center">
        <h1>
          This page is Created by Amirreza Azarioun
        </h1>
      </footer>
    </>
  );
};

export default UsersLayout;
