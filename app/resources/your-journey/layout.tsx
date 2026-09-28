export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#140f0c", color: "#f4f4f4", minHeight: "100vh" }}>
      {children}
    </div>
  );
}