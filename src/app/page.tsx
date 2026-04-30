import { redirect } from "next/navigation";

export default function Home() {
  // Redirect thẳng vào trang login của Vici Checkin
  redirect("/vici-checkin/login");
}
