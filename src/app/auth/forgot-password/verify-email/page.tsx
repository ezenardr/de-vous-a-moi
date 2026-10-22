import { permanentRedirect } from "next/navigation";

// The "check your email" step now lives on the form page itself (no address in the URL).
export default function Page() {
  permanentRedirect("/auth/forgot-password");
}
