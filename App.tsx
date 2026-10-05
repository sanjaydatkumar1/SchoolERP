import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Dashboard } from '@/pages/Dashboard';
import { Students } from '@/pages/Students';
import { StudentProfile } from '@/pages/StudentProfile';
import { Promotion } from '@/pages/Promotion';
import { Teachers } from '@/pages/Teachers';
import { Classes } from '@/pages/Classes';
import { Attendance } from '@/pages/Attendance';
import { Fees } from '@/pages/Fees';
import { DemandBills } from '@/pages/DemandBills';
import { FeeStructure } from '@/pages/FeeStructure';
import { Transport } from '@/pages/Transport';
import { Payroll } from '@/pages/Payroll';
import { Exams } from '@/pages/Exams';
import { Reports } from '@/pages/Reports';
import { Notifications } from '@/pages/Notifications';
import { Settings } from '@/pages/Settings';
import { BackupRestore } from '@/pages/BackupRestore';
import { ExcelTools } from '@/pages/ExcelTools';
import { DataIntegrity } from '@/pages/DataIntegrity';
import { UsersRoles } from '@/pages/UsersRoles';
import { ChangePassword } from '@/pages/ChangePassword';
import { Theme } from '@/pages/Theme';
import { Exit } from '@/pages/Exit';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getSettings } from '@/services/schoolApi';

const secure = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;
const router = createBrowserRouter([{ path:'/', element: secure(<AppLayout/>), children:[
  { index:true, element:<Dashboard/> }, { path:'students', element:<Students/> },
  { path:'student-profile', element:<StudentProfile/> }, { path:'promotion', element:<Promotion/> }, { path:'teachers', element:<Teachers/> }, { path:'classes', element:<Classes/> }, { path:'attendance', element:<Attendance/> }, { path:'fees', element:<Fees/> }, { path:'demand-bills', element:<DemandBills/> }, { path:'fee-structure', element:<FeeStructure/> }, { path:'transport', element:<Transport/> }, { path:'payroll', element:<Payroll/> }, { path:'exams', element:<Exams/> }, { path:'reports', element:<Reports/> }, { path:'notifications', element:<Notifications/> }, { path:'settings', element:<Settings/> }, { path:'backup', element:<BackupRestore/> }, { path:'excel-tools', element:<ExcelTools/> }, { path:'data-integrity', element:<DataIntegrity/> }, { path:'users-roles', element:<UsersRoles/> }, { path:'change-password', element:<ChangePassword/> }, { path:'theme', element:<Theme/> }, { path:'exit', element:<Exit/> }
] }]);
export default function App() { useEffect(() => { getSettings().catch(() => {}); }, []); return <ErrorBoundary><RouterProvider router={router}/><Toaster richColors position="top-right"/></ErrorBoundary>; }
