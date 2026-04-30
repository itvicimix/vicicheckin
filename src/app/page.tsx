import { redirect } from "next/navigation";

export default function Home() {
  // Tạm thời redirect thẳng vào trang quản trị của Vici Checkin
  redirect("/vici-checkin/admin");
}
