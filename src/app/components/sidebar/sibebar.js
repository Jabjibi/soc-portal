'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiHome, FiSend, FiStar, FiTrash2, FiMessageSquare, FiUser } from 'react-icons/fi';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: 'Inbox', icon: <FiMessageSquare /> },
    { label: 'Starred', icon: <FiStar /> },
    { label: 'Sent', icon: <FiSend /> },
    { label: 'Trash', icon: <FiTrash2 /> },
    { label: 'Profile', icon: <FiUser /> }
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'w-52' : 'w-16'
        } bg-black border-r transition-all duration-300 min-h-screen flex flex-col justify-between z-50`}
      >
        <div>
          <div className="p-4 flex items-center justify-between">
            <span className="font-bold text-lg text-white truncate">
              {isOpen ? 'Lincoln Botosh' : 'LB'}
            </span>
            <button onClick={toggleSidebar} className="ml-2 text-white hover:text-gray-200">
              ☰
            </button>
          </div>
          <nav className="mt-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                href="#"
                key={item.label}
                className="flex items-center space-x-3 text-white hover:text-red-700 hover:bg-gray-900 px-4 py-2"
              >
                <span>{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
