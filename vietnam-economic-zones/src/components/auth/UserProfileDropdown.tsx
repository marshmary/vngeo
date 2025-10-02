import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { useAuthStore } from '@/stores/authStore';

const UserProfileDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Get user email or username
  const displayName = user?.user_metadata?.username || user?.email || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
        {/* User Avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
          {userInitial}
        </div>
        {/* Dropdown Icon */}
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
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
                    <svg
                      className={`${
                        active ? 'text-indigo-600' : 'text-gray-500'
                      } mr-3 h-5 w-5`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
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
                  <svg
                    className={`${
                      active ? 'text-red-600' : 'text-gray-500'
                    } mr-3 h-5 w-5`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserProfileDropdown;
