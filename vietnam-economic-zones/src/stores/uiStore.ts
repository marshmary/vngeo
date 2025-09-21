import { create } from 'zustand';

interface UIState {
  // Modal states
  isDocumentModalOpen: boolean;
  isQAModalOpen: boolean;
  isAdminModalOpen: boolean;

  // Loading states
  isGlobalLoading: boolean;
  loadingMessage: string;

  // Notification state
  notification: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  } | null;

  // Theme and accessibility
  isDarkMode: boolean;
  isHighContrast: boolean;
  language: 'vi' | 'en';

  // Mobile responsive
  isMobileMenuOpen: boolean;
}

interface UIActions {
  // Modal actions
  openDocumentModal: () => void;
  closeDocumentModal: () => void;
  openQAModal: () => void;
  closeQAModal: () => void;
  openAdminModal: () => void;
  closeAdminModal: () => void;

  // Loading actions
  setGlobalLoading: (isLoading: boolean, message?: string) => void;

  // Notification actions
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  hideNotification: () => void;

  // Theme actions
  toggleDarkMode: () => void;
  toggleHighContrast: () => void;
  setLanguage: (language: 'vi' | 'en') => void;

  // Mobile actions
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  // State
  isDocumentModalOpen: false,
  isQAModalOpen: false,
  isAdminModalOpen: false,
  isGlobalLoading: false,
  loadingMessage: '',
  notification: null,
  isDarkMode: false,
  isHighContrast: false,
  language: 'vi',
  isMobileMenuOpen: false,

  // Actions
  openDocumentModal: () => set({ isDocumentModalOpen: true }),
  closeDocumentModal: () => set({ isDocumentModalOpen: false }),
  openQAModal: () => set({ isQAModalOpen: true }),
  closeQAModal: () => set({ isQAModalOpen: false }),
  openAdminModal: () => set({ isAdminModalOpen: true }),
  closeAdminModal: () => set({ isAdminModalOpen: false }),

  setGlobalLoading: (isLoading, message = '') => set({
    isGlobalLoading: isLoading,
    loadingMessage: message
  }),

  showNotification: (message, type) => {
    set({
      notification: {
        message,
        type,
        isVisible: true
      }
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      if (get().notification?.isVisible) {
        get().hideNotification();
      }
    }, 5000);
  },

  hideNotification: () => set({
    notification: null
  }),

  toggleDarkMode: () => set((state) => ({
    isDarkMode: !state.isDarkMode
  })),

  toggleHighContrast: () => set((state) => ({
    isHighContrast: !state.isHighContrast
  })),

  setLanguage: (language) => set({ language }),

  toggleMobileMenu: () => set((state) => ({
    isMobileMenuOpen: !state.isMobileMenuOpen
  })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false })
}));