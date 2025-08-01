// app/page.tsx
import GoCodeWebsite from "@/components/GoCodeWebsite";

export default function Home() {
  // Remove session logic - it's already handled in layout
  return <GoCodeWebsite />;
}
