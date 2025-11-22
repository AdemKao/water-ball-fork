interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6">
        {children}
      </div>
    </main>
  );
}
