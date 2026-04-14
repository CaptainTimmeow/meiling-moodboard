import { AuthForm } from "@/components/auth/auth-form";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-6 py-12">
      {/* Vibrant hero gradient background */}
      <div className="absolute inset-0 hero-gradient" />

      {/* Language switcher */}
      <div className="absolute right-6 top-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
}
