import { redirect } from 'next/navigation';
import { localOpenAccess } from '@/server/local-access';
import LoginForm from './login-form';
export const dynamic = 'force-dynamic';
export default function Login() {
  if (localOpenAccess()) redirect('/');
  return <LoginForm />;
}
