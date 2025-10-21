import { Outlet } from "react-router-dom";
import NavHeader from "./NavHeader";

const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
