import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

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

// Get initial language from localStorage or default to Vietnamese
const getInitialLanguage = (): 'vi' | 'en' => {
  const stored = localStorage.getItem('app-language');
  if (stored === 'vi' || stored === 'en') {
    return stored;
  }
  return 'vi'; // Default to Vietnamese
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // State
      isDocumentModalOpen: false,
      isQAModalOpen: false,
      isAdminModalOpen: false,
      isGlobalLoading: false,
      loadingMessage: '',
      notification: null,
      isDarkMode: false,
      isHighContrast: false,
      language: getInitialLanguage(),
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

      setLanguage: (language) => {
        // Sync with i18n
        i18n.changeLanguage(language);
        // Save to localStorage
        localStorage.setItem('app-language', language);
        set({ language });
      },

      toggleMobileMenu: () => set((state) => ({
        isMobileMenuOpen: !state.isMobileMenuOpen
      })),

      closeMobileMenu: () => set({ isMobileMenuOpen: false })
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        language: state.language,
        isDarkMode: state.isDarkMode,
        isHighContrast: state.isHighContrast
      }),
    }
  )
);

// Listen to i18n language changes and sync with store
i18n.on('languageChanged', (lng) => {
  const language = lng.startsWith('vi') ? 'vi' : 'en';
  if (useUIStore.getState().language !== language) {
    useUIStore.setState({ language });
  }
});