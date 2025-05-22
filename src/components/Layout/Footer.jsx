// src/components/Layout/Footer.jsx
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
      <div className="container mx-auto">
        <p className="text-sm">
          © {currentYear} Task Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
