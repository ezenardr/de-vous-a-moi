// "rodolphezenard@gmail.com" -> "rodol****ard@gmail.com" (Figma "Please check your email").
// Short local parts keep fewer characters so the mask still hides most of them.
export default function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, Math.min(5, Math.ceil(local.length / 3)));
  const tail = local.length > 8 ? local.slice(-3) : "";
  return `${head}****${tail}@${domain}`;
}
