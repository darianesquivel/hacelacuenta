import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import NavHeader from "./NavHeader";
import "react-toastify/dist/ReactToastify.css";

const RootLayout = () => {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main>
        <Outlet />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default RootLayout;
