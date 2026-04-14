import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-white px-4">
      <AuthForm />
    </div>
  );
}
