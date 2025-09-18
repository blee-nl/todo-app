import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  'data-testid'?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, 'data-testid': testId }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50" data-testid={testId}>
      {children}
    </div>
  );
};

export default Layout;
