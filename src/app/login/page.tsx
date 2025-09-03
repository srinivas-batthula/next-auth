import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";

export default function LoginPage() {
    return (
        <main style={{width:'30%'}}>
            <h2>Login (Manual)</h2>
            <SignInForm />
            <h2>SignUp/Register (Manual)</h2>
            <SignUpForm />
        </main>
    );
}
