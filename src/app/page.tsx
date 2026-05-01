import { redirect } from "next/navigation";

export default function Home() {
  // Redirect directly to Vici Checkin login page
  redirect("/vici-checkin/login");
}
