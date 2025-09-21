import type { EconomicZone } from '@/types/zone.types';

// Vietnam map configuration
export const VIETNAM_MAP_CENTER: [number, number] = [16.0471, 108.2068];
export const DEFAULT_ZOOM_LEVEL = 6;
export const MAX_ZOOM_LEVEL = 18;
export const MIN_ZOOM_LEVEL = 5;

// Economic zones data
export const VIETNAM_ECONOMIC_ZONES: EconomicZone[] = [
  {
    id: 'zone-1',
    name: 'Northern Mountains and Midlands',
    nameVi: 'Trung du và miền núi phía Bắc',
    region: 'Northern Vietnam',
    color: '#ef4444',
    coordinates: [21.5, 105.0],
    industries: ['Mining', 'Agriculture', 'Tourism', 'Forestry'],
    population: 12500000,
    gdp: 42000000000,
    area: 95000,
    keyFacts: [
      'Mountainous terrain with diverse ethnic groups',
      'Rich mineral resources including coal and iron',
      'Border trade with China',
      'Traditional agriculture and forestry'
    ],
    description: 'The northern mountainous region characterized by diverse economic activities, ethnic diversity, and cross-border trade.',
    descriptionVi: 'Vùng miền núi phía Bắc có địa hình núi đa dạng, nhiều dân tộc và hoạt động kinh tế xuyên biên giới.',
    establishedYear: 1986,
    majorCities: ['Ha Giang', 'Cao Bang', 'Lang Son', 'Lao Cai'],
    economicActivities: {
      agriculture: 35,
      industry: 45,
      services: 20
    }
  },
  {
    id: 'zone-2',
    name: 'Red River Delta',
    nameVi: 'Đồng bằng sông Hồng',
    region: 'Northern Vietnam',
    color: '#f97316',
    coordinates: [21.0285, 105.8542],
    industries: ['Manufacturing', 'Technology', 'Finance', 'Education'],
    population: 23000000,
    gdp: 85000000000,
    area: 15000,
    keyFacts: [
      'Economic and political center of Vietnam',
      'Highest population density in the country',
      'Major industrial and technology hub',
      'Home to capital city Hanoi'
    ],
    description: 'The economic heartland of Vietnam, featuring advanced manufacturing, technology sectors, and the capital city.',
    descriptionVi: 'Trung tâm kinh tế của Việt Nam với công nghiệp phát triển, công nghệ cao và thủ đô Hà Nội.',
    establishedYear: 1986,
    majorCities: ['Hanoi', 'Hai Phong', 'Nam Dinh', 'Thai Binh'],
    economicActivities: {
      agriculture: 15,
      industry: 40,
      services: 45
    }
  },
  {
    id: 'zone-3',
    name: 'Central Coast',
    nameVi: 'Duyên hải miền Trung',
    region: 'Central Vietnam',
    color: '#eab308',
    coordinates: [16.0, 107.5],
    industries: ['Heavy Industry', 'Tourism', 'Steel', 'Fishing', 'Textiles'],
    population: 20800000,
    gdp: 60000000000,
    area: 95000,
    keyFacts: [
      'Combined coastal region from Thanh Hoa to Binh Thuan',
      'Major heavy industrial and tourism center',
      'Historic imperial capital in Hue',
      'Beautiful beaches and cultural heritage sites'
    ],
    description: 'Combined central coastal region featuring heavy industry, tourism, steel production, and rich cultural heritage from Thanh Hoa to Binh Thuan.',
    descriptionVi: 'Vùng duyên hải miền Trung từ Thanh Hóa đến Bình Thuận với công nghiệp nặng, du lịch và di sản văn hóa phong phú.',
    establishedYear: 1986,
    majorCities: ['Da Nang', 'Hue', 'Vinh', 'Nha Trang', 'Thanh Hoa'],
    economicActivities: {
      agriculture: 28,
      industry: 42,
      services: 30
    }
  },
  {
    id: 'zone-4',
    name: 'Central Highlands',
    nameVi: 'Tây Nguyên',
    region: 'Central Vietnam',
    color: '#22c55e',
    coordinates: [13.0, 108.0],
    industries: ['Coffee', 'Agriculture', 'Hydropower', 'Forestry'],
    population: 5800000,
    gdp: 18000000000,
    area: 54000,
    keyFacts: [
      'Major coffee producing region',
      'Rich agricultural land',
      'Important hydropower generation',
      'Ethnic minority communities'
    ],
    description: 'Agricultural heartland famous for coffee production, hydropower generation, and ethnic cultural diversity.',
    descriptionVi: 'Vùng nông nghiệp nổi tiếng với cà phê, thủy điện và đa dạng văn hóa các dân tộc thiểu số.',
    establishedYear: 1986,
    majorCities: ['Buon Ma Thuot', 'Pleiku', 'Kon Tum', 'Da Lat'],
    economicActivities: {
      agriculture: 55,
      industry: 25,
      services: 20
    }
  },
  {
    id: 'zone-5',
    name: 'Southeast',
    nameVi: 'Đông Nam Bộ',
    region: 'Southern Vietnam',
    color: '#3b82f6',
    coordinates: [10.8, 106.7],
    industries: ['Manufacturing', 'Technology', 'Finance', 'Services'],
    population: 17500000,
    gdp: 125000000000,
    area: 23000,
    keyFacts: [
      'Economic powerhouse of Vietnam',
      'Major manufacturing and technology hub',
      'Home to Ho Chi Minh City',
      'Highest GDP per capita in the country'
    ],
    description: 'The economic engine of Vietnam, featuring advanced manufacturing, technology, finance, and services sectors centered around Ho Chi Minh City.',
    descriptionVi: 'Động lực kinh tế của Việt Nam với sản xuất, công nghệ, tài chính và dịch vụ phát triển quanh TP. Hồ Chí Minh.',
    establishedYear: 1986,
    majorCities: ['Ho Chi Minh City', 'Bien Hoa', 'Thu Dau Mot', 'Vung Tau'],
    economicActivities: {
      agriculture: 8,
      industry: 45,
      services: 47
    }
  },
  {
    id: 'zone-6',
    name: 'Mekong Delta',
    nameVi: 'Đồng bằng sông Cửu Long',
    region: 'Southern Vietnam',
    color: '#8b5cf6',
    coordinates: [10.0, 105.5],
    industries: ['Rice Production', 'Aquaculture', 'Food Processing', 'Agriculture'],
    population: 17200000,
    gdp: 45000000000,
    area: 40000,
    keyFacts: [
      'Rice bowl of Vietnam',
      'Largest aquaculture region',
      'Major food processing center',
      'Complex river system and floating markets'
    ],
    description: 'Agricultural powerhouse known as the rice bowl of Vietnam, with extensive aquaculture and food processing.',
    descriptionVi: 'Vựa lúa của Việt Nam với nông nghiệp phát triển, nuôi trồng thủy sản và chế biến thực phẩm.',
    establishedYear: 1986,
    majorCities: ['Can Tho', 'Long Xuyen', 'Cao Lanh', 'Soc Trang'],
    economicActivities: {
      agriculture: 60,
      industry: 20,
      services: 20
    }
  }
];

// File upload configuration
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];

// Admin configuration
export const DEFAULT_ADMIN_PASSWORD = 'vietnam-zones-admin';