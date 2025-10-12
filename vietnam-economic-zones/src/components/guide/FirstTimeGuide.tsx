import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

interface GuideStep {
  target: string; // CSS selector or position identifier
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightArea?: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

const GUIDE_STEPS: GuideStep[] = [
  {
    target: 'sidebar-logo',
    title: 'Welcome to Vietnam Economic Zones',
    titleVi: 'Chào mừng đến với Vùng Kinh Tế Việt Nam',
    description: 'This tutorial will guide you through all the features of the application. Let\'s get started!',
    descriptionVi: 'Hướng dẫn này sẽ giới thiệu các tính năng của ứng dụng. Hãy bắt đầu!',
    position: 'center',
  },
  {
    target: 'sidebar-collapse',
    title: 'Collapse Sidebar',
    titleVi: 'Thu gọn thanh bên',
    description: 'Click here to collapse or expand the sidebar for more screen space.',
    descriptionVi: 'Nhấp vào đây để thu gọn hoặc mở rộng thanh bên để có nhiều không gian hơn.',
    position: 'right',
  },
  {
    target: 'nav-map',
    title: 'Interactive Map',
    titleVi: 'Bản đồ tương tác',
    description: 'View the interactive map of Vietnam\'s economic zones. Click zones to explore detailed information.',
    descriptionVi: 'Xem bản đồ tương tác các vùng kinh tế Việt Nam. Nhấp vào các vùng để khám phá thông tin chi tiết.',
    position: 'right',
  },
  {
    target: 'nav-documents',
    title: 'Documents Library',
    titleVi: 'Thư viện tài liệu',
    description: 'Access educational documents, PDFs, and resources about economic zones.',
    descriptionVi: 'Truy cập tài liệu giáo dục, PDF và tài nguyên về các vùng kinh tế.',
    position: 'right',
  },
  {
    target: 'nav-drawing',
    title: 'Map Drawing Tutorial',
    titleVi: 'Hướng dẫn vẽ bản đồ',
    description: 'Learn how to draw Vietnam\'s map with step-by-step video tutorials.',
    descriptionVi: 'Học cách vẽ bản đồ Việt Nam với hướng dẫn video từng bước.',
    position: 'right',
  },
  {
    target: 'nav-feedback',
    title: 'Share Your Feedback',
    titleVi: 'Chia sẻ phản hồi',
    description: 'Help us improve by sharing your feedback and suggestions.',
    descriptionVi: 'Giúp chúng tôi cải thiện bằng cách chia sẻ phản hồi và đề xuất của bạn.',
    position: 'right',
  },
  {
    target: 'nav-quiz',
    title: 'Test Your Knowledge',
    titleVi: 'Kiểm tra kiến thức',
    description: 'Take quizzes to test your knowledge about Vietnam\'s economic zones.',
    descriptionVi: 'Làm bài kiểm tra để kiểm tra kiến thức của bạn về các vùng kinh tế Việt Nam.',
    position: 'right',
  },
  {
    target: 'sidebar-language',
    title: 'Change Language',
    titleVi: 'Đổi ngôn ngữ',
    description: 'Switch between Vietnamese and English languages.',
    descriptionVi: 'Chuyển đổi giữa tiếng Việt và tiếng Anh.',
    position: 'right',
  },
  {
    target: 'sidebar-profile',
    title: 'User Profile',
    titleVi: 'Hồ sơ người dùng',
    description: 'Access your profile, settings, and sign in/out here.',
    descriptionVi: 'Truy cập hồ sơ, cài đặt và đăng nhập/đăng xuất tại đây.',
    position: 'right',
  },
  {
    target: 'map-controls',
    title: 'Map Controls',
    titleVi: 'Điều khiển bản đồ',
    description: 'Use these controls to zoom in, zoom out, and reset the map view.',
    descriptionVi: 'Sử dụng các nút này để phóng to, thu nhỏ và đặt lại chế độ xem bản đồ.',
    position: 'right',
  },
  {
    target: 'map-legend',
    title: 'Economic Zones Legend',
    titleVi: 'Chú giải vùng kinh tế',
    description: 'Click on any zone in the legend to quickly navigate to it on the map.',
    descriptionVi: 'Nhấp vào bất kỳ vùng nào trong chú giải để điều hướng nhanh đến vùng đó trên bản đồ.',
    position: 'left',
  },
  {
    target: 'map-container',
    title: 'Interactive Map Features',
    titleVi: 'Tính năng bản đồ tương tác',
    description: 'Hover over zones for quick info, click to select, and scroll to zoom. Try it now!',
    descriptionVi: 'Di chuột qua các vùng để xem thông tin nhanh, nhấp để chọn và cuộn để phóng to. Hãy thử ngay!',
    position: 'center',
  },
  {
    target: 'complete',
    title: 'You\'re All Set!',
    titleVi: 'Hoàn tất!',
    description: 'You can restart this tutorial anytime from your profile menu. Enjoy exploring Vietnam\'s economic zones!',
    descriptionVi: 'Bạn có thể khởi động lại hướng dẫn này bất cứ lúc nào từ menu hồ sơ. Chúc bạn khám phá các vùng kinh tế Việt Nam vui vẻ!',
    position: 'center',
  },
];

const GUIDE_STORAGE_KEY = 'vn-economic-zones-guide-completed';

const FirstTimeGuide: React.FC = () => {
  const { language } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Check if user has completed the guide
    const hasCompletedGuide = localStorage.getItem(GUIDE_STORAGE_KEY);

    if (!hasCompletedGuide) {
      // Show guide after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const step = GUIDE_STEPS[currentStep];

    // Update target position for highlighting
    if (step.target && step.target !== 'complete') {
      const element = document.querySelector(`[data-guide="${step.target}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetPosition(rect);
      } else {
        setTargetPosition(null);
      }
    } else {
      setTargetPosition(null);
    }
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeGuide();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeGuide();
  };

  const completeGuide = () => {
    localStorage.setItem(GUIDE_STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = GUIDE_STEPS[currentStep];
  const isCenter = step.position === 'center';

  // Calculate if guide card would overflow viewport
  const getAdjustedPosition = () => {
    if (isCenter || !targetPosition) return undefined;

    const cardHeight = 300; // Approximate card height
    const cardWidth = 448; // max-w-md = 28rem = 448px
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 20;

    let top = targetPosition.top;
    let left = targetPosition.left;
    let transform = 'none';

    // Determine horizontal position
    if (step.position === 'right') {
      left = targetPosition.right + margin;
      // Check if card would overflow right edge
      if (left + cardWidth > viewportWidth) {
        left = targetPosition.left - cardWidth - margin;
        transform = 'none';
      }
    } else if (step.position === 'left') {
      left = targetPosition.left - cardWidth - margin;
      // Check if card would overflow left edge
      if (left < margin) {
        // Place to the right instead
        left = targetPosition.right + margin;
        transform = 'none';
      }
    }

    // Determine vertical position - ALWAYS place above if element is in bottom half
    const isInBottomHalf = targetPosition.top > viewportHeight / 2;

    if (isInBottomHalf || step.position === 'top') {
      // Place above the element
      top = targetPosition.top - margin;
      transform = transform === 'none' ? 'translateY(-100%)' : `${transform} translateY(-100%)`;
    } else if (step.position === 'bottom') {
      top = targetPosition.bottom + margin;
    }

    // Ensure card stays within viewport vertically
    if (top < margin) {
      top = margin;
      transform = 'none';
    } else if (top + cardHeight > viewportHeight - margin) {
      top = viewportHeight - cardHeight - margin;
      transform = 'none';
    }

    return { top, left, transform };
  };

  const adjustedPosition = getAdjustedPosition();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998] transition-opacity" />

      {/* Highlight area */}
      {targetPosition && (
        <div
          className="fixed z-[9999] rounded-lg"
          style={{
            top: targetPosition.top - 8,
            left: targetPosition.left - 8,
            width: targetPosition.width + 16,
            height: targetPosition.height + 16,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Guide card */}
      <div
        className={`fixed z-[10000] bg-white rounded-xl shadow-2xl max-w-md w-full transition-all ${
          isCenter ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
        style={adjustedPosition}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold opacity-90">
              {language === 'vi' ? 'Hướng dẫn' : 'Tutorial'} {currentStep + 1}/{GUIDE_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-white hover:text-gray-200 text-sm font-medium"
            >
              {language === 'vi' ? 'Bỏ qua' : 'Skip'}
            </button>
          </div>
          <h2 className="text-xl font-bold">
            {language === 'vi' ? step.titleVi : step.title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {language === 'vi' ? step.descriptionVi : step.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
          >
            {language === 'vi' ? 'Quay lại' : 'Previous'}
          </button>

          <div className="flex gap-1">
            {GUIDE_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-indigo-600 w-4'
                    : index < currentStep
                    ? 'bg-indigo-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {currentStep === GUIDE_STEPS.length - 1
              ? language === 'vi'
                ? 'Hoàn tất'
                : 'Finish'
              : language === 'vi'
              ? 'Tiếp theo'
              : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
};

export default FirstTimeGuide;
