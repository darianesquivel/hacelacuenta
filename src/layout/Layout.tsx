import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Flex } from "@radix-ui/themes";
import { useThemeStatus } from "../hooks/useThemeStore";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useThemeStatus();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-dvh">
        <SidebarTrigger />
        <Flex
          direction="column"
          justify="center"
          align="center"
          className="p-4"
        >
          {children}
        </Flex>
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
        theme={currentTheme}
      />
    </SidebarProvider>
  );
};

export default Layout;
