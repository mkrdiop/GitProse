import GitQueryClient from "@/components/GitQueryClient";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 bg-background">
      <GitQueryClient />
    </main>
  );
}
