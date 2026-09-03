import { redirect } from "next/navigation";

// The Contact page has been merged into About Us — static company content
// followed by the requirement form on one page. This route is kept so
// existing links/bookmarks/CTAs still resolve.
export default function ContactPage() {
  redirect("/about#contact");
}
