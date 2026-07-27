import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import { Skeleton } from "@/components/ui/skeleton";

const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const AgentsPage = lazy(() => import("@/pages/AgentsPage"));
const CreateAgentPage = lazy(() => import("@/pages/CreateAgentPage"));
const KnowledgeBasePage = lazy(() => import("@/pages/KnowledgeBasePage"));
const TrainingCenterPage = lazy(() => import("@/pages/TrainingCenterPage"));
const PromptStudioPage = lazy(() => import("@/pages/PromptStudioPage"));
const DeploymentPage = lazy(() => import("@/pages/DeploymentPage"));
const EmbedWidgetPage = lazy(() => import("@/pages/EmbedWidgetPage"));
const ConversationsPage = lazy(() => import("@/pages/ConversationsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ApiKeysPage = lazy(() => import("@/pages/ApiKeysPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const BillingPage = lazy(() => import("@/pages/BillingPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));

function PageLoader() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={
            <Suspense fallback={<PageLoader />}>
              <RegisterPage />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<PageLoader />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route element={<AppLayout />}>
          {[
            { path: "/dashboard", Component: DashboardPage },
            { path: "/agents", Component: AgentsPage },
            { path: "/agents/new", Component: CreateAgentPage },
            { path: "/knowledge", Component: KnowledgeBasePage },
            { path: "/training", Component: TrainingCenterPage },
            { path: "/prompts", Component: PromptStudioPage },
            { path: "/deployment", Component: DeploymentPage },
            { path: "/embed", Component: EmbedWidgetPage },
            { path: "/conversations", Component: ConversationsPage },
            { path: "/analytics", Component: AnalyticsPage },
            { path: "/api-keys", Component: ApiKeysPage },
            { path: "/settings", Component: SettingsPage },
            { path: "/billing", Component: BillingPage },
            { path: "/profile", Component: ProfilePage },
          ].map(({ path, Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Component />
                </Suspense>
              }
            />
          ))}
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
