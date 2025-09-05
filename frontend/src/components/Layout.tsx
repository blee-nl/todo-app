import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {children}
    </div>
  );
};

export default Layout;
