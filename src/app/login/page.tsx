import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";

export default function LoginPage() {
    return (
        <main>
            <h1>Login</h1>
            <SignInForm />
            <h2>Or Sign Up</h2>
            <SignUpForm />
        </main>
    );
}
