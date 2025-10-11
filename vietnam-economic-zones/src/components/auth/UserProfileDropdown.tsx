import React, { Fragment, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faChevronDown, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/stores/authStore';
import { useMapStore } from '@/stores/mapStore';
import { useUIStore } from '@/stores/uiStore';

interface UserProfileDropdownProps {
  isCollapsed?: boolean;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuthStore();
  const { resetMapState } = useMapStore();
  const { language } = useUIStore();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate menu position when menu opens
  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.top,
        left: rect.left
      });
    }
  };

  // Update position when collapsed state changes
  useEffect(() => {
    if (isMenuOpen) {
      updateMenuPosition();
    }
  }, [isCollapsed, isMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Reset map store to clear persisted data
      resetMapState();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // If user is not logged in, show login button
  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center ${
          isCollapsed ? 'justify-center w-10 h-10' : 'gap-2 px-4 py-2 w-full'
        }`}
        title={language === 'vi' ? 'Đăng nhập' : 'Login'}
      >
        <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4" />
        {!isCollapsed && (language === 'vi' ? 'Đăng nhập' : 'Login')}
      </button>
    );
  }

  // Get user email or username
  const displayName = user?.user_metadata?.username || user?.email || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Menu as="div" className="relative">
      {({ open }) => {
        // Track menu open state and update position
        if (open !== isMenuOpen) {
          setIsMenuOpen(open);
          if (open) {
            requestAnimationFrame(updateMenuPosition);
          }
        }

        return (
          <>
            <Menu.Button
              ref={buttonRef}
              className={`flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1 ${isCollapsed ? 'justify-center' : 'space-x-2'}`}
            >
              {/* User Avatar */}
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
                {userInitial}
              </div>
              {/* Dropdown Icon */}
              {!isCollapsed && <FontAwesomeIcon icon={faChevronDown} className="w-4 h-4 text-gray-600" />}
            </Menu.Button>

            {/* Render dropdown menu in a portal to escape sidebar container */}
            {createPortal(
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className="absolute w-56 origin-bottom-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[6000]"
                  style={{
                    bottom: `${window.innerHeight - menuPosition.top}px`,
                    left: `${menuPosition.left}px`
                  }}
                >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            {isAdmin && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => navigate('/admin')}
                    className={`${
                      active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      className={`${
                        active ? 'text-indigo-600' : 'text-gray-500'
                      } mr-3 h-5 w-5`}
                    />
                    Admin Dashboard
                  </button>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                  } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className={`${
                      active ? 'text-red-600' : 'text-gray-500'
                    } mr-3 h-5 w-5`}
                  />
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>,
              document.body
            )}
          </>
        );
      }}
    </Menu>
  );
};

export default UserProfileDropdown;
