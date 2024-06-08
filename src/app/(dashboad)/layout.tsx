import { PropsWithChildren } from "react";
import { Header } from "@/components/header";

const DashboardLayout = ({ children }: Readonly<PropsWithChildren>) => (
  <>
    <Header />
    <main className="px-3 lg:px-14">{children}</main>
  </>
);

export default DashboardLayout;
