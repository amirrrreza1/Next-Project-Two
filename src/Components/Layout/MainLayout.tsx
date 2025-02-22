// components/MainLayout.tsx

import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface NavItem {
  name: string;
  href: string;
}

interface MainLayoutProps {
  children: ReactNode;
}

const NAV: NavItem[] = [
  { name: "Home", href: "/" },
    { name: "Posts", href: "/Posts" },
    { name: "Users", href: "/Users" },
];

const MainLayout = ({ children }: MainLayoutProps) => {
  const { pathname } = useRouter();

  return (
    <>
      <header className="bg-blue-500 text-white h-[60px] flex justify-between items-center px-3">
        <h1 className="text-xl font-bold">Main Layout</h1>
        <nav>
          <ul className="flex gap-4">
            {NAV.map((nav) => (
              <li key={nav.href}>
                <Link
                  href={nav.href}
                  className={`${
                    pathname === nav.href
                      ? "text-yellow-300 font-semibold"
                      : "text-white"
                  } hover:text-yellow-200 transition-colors`}
                >
                  {nav.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="p-4">{children}</main>

      <footer className="bg-blue-500 text-white h-[60px] flex justify-center items-center">
        <h1 className="text-lg font-medium">Footer</h1>
      </footer>
    </>
  );
};

export default MainLayout;
