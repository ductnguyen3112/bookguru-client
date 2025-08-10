// Route-specific layout for /user-flow with metadata

export const metadata = {
  title: "Sign up / Log in - BookGuru",
  description:
    "Sign in or create an account to book salons and spas with BookGuru.",
  keywords: [
    "BookGuru",
    "login",
    "sign up",
    "customer account",
    "salon booking",
    "spa booking",
  ],
  openGraph: {
    title: "Sign up / Log in - BookGuru",
    description:
      "Sign in or create an account to book salons and spas with BookGuru.",
    type: "website",
  },
};

export default function Layout({ children }) {
  return <main className="flex-grow">{children}</main>;
}
