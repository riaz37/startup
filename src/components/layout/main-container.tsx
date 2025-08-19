interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function MainContainer({ 
  children, 
  className = "",
  maxWidth = 'xl'
}: MainContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-none'
  };

  return (
    <main className={`container-responsive ${maxWidthClasses[maxWidth]} py-8 sm:py-12 lg:py-16 ${className}`}>
      {children}
    </main>
  );
}