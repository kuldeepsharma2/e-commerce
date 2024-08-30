// src/components/Footer.js
import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white text-center py-4 fixed bottom-0 w-full mt-5">
      <p className="text-sm">All copyright reserved to Kuldeep Sharma &copy; {currentYear}</p>
    </footer>
  );
}

export default Footer;
