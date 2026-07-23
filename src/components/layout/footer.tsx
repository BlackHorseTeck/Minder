export const Footer = () => {
  return (
    <footer className="border-t">
      <div className="max-w-5xl mx-auto py-6 px-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 21st century developmet. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
};
