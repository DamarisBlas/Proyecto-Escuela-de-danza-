// src/app/routes.tsx
import { createBrowserRouter, Outlet, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from '@/routing/PublicLayout'
import PrivateLayout from '@/routing/PrivateLayout'
import DirectorLayout from '@/routing/DirectorLayout'
import ProfesorLayout from '@/routing/ProfesorLayout'

// Guards
import ProtectedRoute from '@/routing/ProtectedRoute'
import RoleGuard from '@/routing/RoleGuard'

// Páginas públicas
import HomePage from '@/features/home/pages/HomePage'
import AboutPage from '@/features/about/pages/AboutPage'
import CoursesPage from '@/features/cursos/pages/CoursesPage'
import CourseDetailPage from '@/features/cursos/pages/CourseDetailPage'
import PromotionsPage from '@/features/promociones/pages/PromotionsPage'
import PromotionDetailPage from '@/features/promociones/pages/PromotionDetailPage'
import CartPage from '@/features/carrito/pages/CartPage'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import InstructorDetailPage from '@/features/profesores/pages/InstructorDetailPage'

// Cuenta (alumno/FEMME)
import AccountLayout from '@/features/cuenta/pages/AccountLayout'
import ProfilePage from '@/features/cuenta/pages/ProfilePage'
import NotificationsPage from '@/features/cuenta/pages/NotificationsPage'
import EnrollmentsPage from '@/features/cuenta/pages/EnrollmentsPage'
import AttendancePage from '@/features/cuenta/pages/AttendancePage'
import PermissionsPage from '@/features/cuenta/pages/PermissionsPage'
import PaymentsPage from '@/features/cuenta/pages/PaymentsPage'

// Profesor
import ProfessorAttendancePage from '@/features/profesor/pages/ProfessorAttendancePage'
import MyCoursesPage from '@/features/profesor/pages/MyCoursesPage'

// Director
import DashboardPage from '@/features/director/pages/DashboardPage'
import AccountStatusPage from '@/features/director/pages/AccountStatusPage'
import PaymentsAdminPage from '@/features/director/pages/PaymentsAdminPage'
import EnrollmentsAdminPage from '@/features/director/pages/EnrollmentsAdminPage'
import ProgramsAndCoursesPage from '@/features/director/pages/ProgramsAndCoursesPage'
import CancellationsPage from '@/features/director/pages/CancellationsPage'
import RafflesPage from '@/features/director/pages/RafflesPage'
import PromotionsAdminPage from '@/features/director/pages/PromotionsAdminPage'
import UsersAdminPage from '@/features/director/pages/UsersAdminPage'
import PermissionsAdminPage from '@/features/director/pages/PermissionsAdminPage'
import SchoolInfoPage from '@/features/director/pages/SchoolInfoPage'
import DiscountsPage from '@/features/director/pages/Discounts'
import PagoExitosoPage from '@/features/carrito/pages/PagoExitosoPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />, // Header/Footer SIEMPRE visibles
    children: [
      // ——— Públicas
      { index: true, element: <HomePage /> },
      { path: 'sobre-nosotros', element: <AboutPage /> },
      { path: 'cursos', element: <CoursesPage /> },
      { path: 'cursos/:id', element: <CourseDetailPage /> },
      { path: 'profesores/:id', element: <InstructorDetailPage /> },
      { path: 'promociones', element: <PromotionsPage /> },
    
      { path: 'carrito', element: <CartPage /> },
      { path: 'pago-exitoso', element: <PagoExitosoPage /> },
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },

      // ——— Área privada DENTRO del layout público (mantiene header/footer)
      {
        // Usa el ProtectedRoute en "modo Outlet".
        // Si tu componente acepta 'redirectTo', úsalo; si acepta 'redirect', también sirve.
        element: <ProtectedRoute redirectTo="/auth/login" />, // o redirect="/auth/login"
        children: [
          {
            path: 'cuenta',
            element: <PrivateLayout />, // aquí van las pestañas/opciones de cuenta
            children: [
              // Redirige el índice a /cuenta/perfil para evitar la página vacía
              { index: true, element: <Navigate to="perfil" replace /> },

              // Opciones de cuenta
              { path: 'perfil', element: <ProfilePage /> },
              { path: 'notificaciones', element: <NotificationsPage /> },
              { path: 'inscripciones', element: <EnrollmentsPage /> },
              { path: 'asistencias', element: <AttendancePage /> },

              // Permisos: ALUMNO + FEMME
              {
                path: 'permisos',
                element: (
                  <RoleGuard roles={['ALUMNO', 'FEMME']}>
                    <Outlet />
                  </RoleGuard>
                ),
                children: [{ index: true, element: <PermissionsPage /> }],
              },

              // Pagos: ALUMNO + FEMME
              {
                path: 'pagos',
                element: (
                  <RoleGuard roles={['ALUMNO', 'FEMME']}>
                    <Outlet />
                  </RoleGuard>
                ),
                children: [{ index: true, element: <PaymentsPage /> }],
              },

              // PROFESOR dentro de /cuenta (mantiene el mismo layout)
              {
                path: 'profesor',
                element: (
                  <RoleGuard roles={['PROFESOR']}>
                    <Outlet />
                  </RoleGuard>
                ),
                children: [
                  { index: true, element: <MyCoursesPage /> },
                  { path: 'asistencias', element: <ProfessorAttendancePage /> },
                ],
              },

              // DIRECTOR dentro de /cuenta (mantiene el mismo layout)
              {
                path: 'admin',
                element: (
                  <RoleGuard roles={['DIRECTOR']}>
                    <Outlet />
                  </RoleGuard>
                ),
                children: [
                  { index: true, element: <DashboardPage /> },
                  { path: 'estado-cuentas', element: <AccountStatusPage /> },
                  { path: 'pagos', element: <PaymentsAdminPage /> },
                  { path: 'inscripciones', element: <EnrollmentsAdminPage /> },
                  { path: 'programas-y-cursos', element: <ProgramsAndCoursesPage /> },
                  { path: 'cancelaciones', element: <CancellationsPage /> },
                  { path: 'sorteos', element: <RafflesPage /> },
                  { path: 'promociones', element: <PromotionsAdminPage /> },
                  { path: 'usuarios', element: <UsersAdminPage /> },
                  { path: 'permisos', element: <PermissionsAdminPage /> },
                  { path: 'info-escuela', element: <SchoolInfoPage /> },
                  { path: 'descuentos', element: <DiscountsPage /> },
                ],
              },
            ],
          },
        ],
      },

      // 404 → home
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
