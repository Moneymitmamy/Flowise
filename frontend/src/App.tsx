import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectCreate from "./pages/ProjectCreate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projekte" element={<Dashboard />} />
            <Route path="/projekte/neu" element={<ProjectCreate />} />
            <Route path="/projekte/:id" element={<ProjectDetail />} />
          </Route>
        </Routes>
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
