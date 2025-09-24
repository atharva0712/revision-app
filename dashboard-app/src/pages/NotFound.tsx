import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-space-gradient">
      <div className="text-center">
        <div className="text-6xl mb-4 bg-neon-gradient bg-clip-text text-transparent font-bold">404</div>
        <h1 className="mb-4 text-2xl font-bold text-foreground">Oops! Page not found</h1>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist in our cyber realm.</p>
        <a 
          href="/dashboard" 
          className="inline-block px-6 py-3 bg-neon-gradient text-primary-foreground rounded-lg hover:shadow-glow-primary transition-all duration-300 font-medium"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
