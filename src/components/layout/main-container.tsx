interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className = "" }: MainContainerProps) {
  return (
    <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      {children}
    </main>
  );
}