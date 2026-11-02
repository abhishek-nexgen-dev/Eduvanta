import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Template from "../features/template/v1/SideBar/Template";
import ProtectedRoute from "./ProtectedRoute";

// Lazy-loaded pages for optimal performance and chunk splitting
const DashboardPage = lazy(() => import("../features/dashboard/v1/DashboardPage"));
const PaymentPage = lazy(() => import("../features/payment/v1/PaymentPage"));
const LoginPage = lazy(() => import("../features/login/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../features/login/ForgotPasswordPage"));
const StudentPage = lazy(() => import("../features/Student/StudentPage"));
const StudentProfilePage = lazy(() => import("../features/Student/StudentProfilePage"));
const CreateCoursePage = lazy(() => import("../features/Course/v1/Page/CreateCoursePage"));
const ManageCoursePage = lazy(() => import("../features/Course/v1/Page/ManageCoursePage"));
const CourseDetailsPage = lazy(() => import("../features/CourseDetails/CourseDetailPage"));
const AdmissionsPage = lazy(() => import("../features/admissions/AdmissionsPage"));
const TeacherPage = lazy(() => import("../features/teacher/TeacherPage"));
const NoticesPage = lazy(() => import("../features/notices/NoticesPage"));
const InquiriesPage = lazy(() => import("../features/inquiries/InquiriesPage"));
const MediaPage = lazy(() => import("../features/media/MediaPage"));
const TestimonialsPage = lazy(() => import("../features/testimonials/TestimonialsPage"));
const SystemPage = lazy(() => import("../features/system/SystemPage"));
const SettingsPage = lazy(() => import("../features/settings/SettingsPage"));
const AdminPage = lazy(() => import("../features/admin/AdminPage"));

const PageFallback = () => (
  <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-3 text-zinc-400">
    <Loader2 className="animate-spin text-indigo-500" size={36} />
    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
      Loading interface...
    </p>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Template />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admissions" element={<AdmissionsPage />} />
          <Route path="status" element={<AdmissionsPage />} />
          <Route path="student" element={<StudentPage />} />
          <Route path="student/:studentId" element={<StudentProfilePage />} />
          <Route path="course-management" element={<ManageCoursePage />} />
          <Route path="create-course" element={<CreateCoursePage />} />
          <Route path="course-view" element={<CourseDetailsPage />} />
          <Route path="teacher" element={<TeacherPage />} />
          <Route path="payment" element={<PaymentPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
