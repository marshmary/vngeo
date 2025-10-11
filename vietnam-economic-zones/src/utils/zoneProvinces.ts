// Economic zone to province mapping based on Vietnam's official regional classification
export const ZONE_PROVINCES: Record<string, string[]> = {
  'zone-1': [
    'HàGiang',
    'CaoBằng',
    'LạngSơn',
    'BắcGiang',
    'PhúThọ',
    'TháiNguyên',
    'BắcKạn',
    'TuyênQuang',
    'LàoCai',
    'YênBái',
    'LaiChâu',
    'SơnLa',
    'ĐiệnBiên',
    'HoàBình'
  ],
  'zone-2': [
    'HàNội',
    'HảiPhòng',
    'HàNam',
    'NinhBình',
    'BắcNinh',
    'HảiDương',
    'HưngYên',
    'NamĐịnh',
    'TháiBình',
    'VĩnhPhúc',
    'QuảngNinh'
  ],
  'zone-3': [
    'ThanhHóa',
    'NghệAn',
    'HàTĩnh',
    'QuảngBình',
    'QuảngTrị',
    'ThừaThiênHuế',
    'ĐàNẵng',
    'QuảngNam',
    'QuảngNgãi',
    'BìnhĐịnh',
    'PhúYên',
    'KhánhHòa',
    'NinhThuận',
    'BìnhThuận'
  ],
  'zone-4': [
    'KonTum',
    'GiaLai',
    'ĐắkLắk',
    'ĐắkNông',
    'LâmĐồng'
  ],
  'zone-5': [
    'HồChíMinh',
    'BàRịa-VũngTàu',
    'BìnhDương',
    'BìnhPhước',
    'ĐồngNai',
    'TâyNinh'
  ],
  'zone-6': [
    'CầnThơ',
    'LongAn',
    'TiềnGiang',
    'BếnTre',
    'VĩnhLong',
    'TràVinh',
    'AnGiang',
    'ĐồngTháp',
    'KiênGiang',
    'HậuGiang',
    'SócTrăng',
    'BạcLiêu',
    'CàMau'
  ]
};

export const ZONE_METADATA: Record<string, { name: string; nameVi: string; color: string }> = {
  'zone-1': {
    name: 'Northern Mountains and Midlands',
    nameVi: 'Trung du và miền núi phía Bắc',
    color: '#ef4444'
  },
  'zone-2': {
    name: 'Red River Delta',
    nameVi: 'Đồng bằng sông Hồng',
    color: '#f97316'
  },
  'zone-3': {
    name: 'Central Coast',
    nameVi: 'Duyên hải miền Trung',
    color: '#eab308'
  },
  'zone-4': {
    name: 'Central Highlands',
    nameVi: 'Tây Nguyên',
    color: '#22c55e'
  },
  'zone-5': {
    name: 'Southeast',
    nameVi: 'Đông Nam Bộ',
    color: '#3b82f6'
  },
  'zone-6': {
    name: 'Mekong Delta',
    nameVi: 'Đồng bằng sông Cửu Long',
    color: '#8b5cf6'
  }
};

export type ZoneId = 'zone-1' | 'zone-2' | 'zone-3' | 'zone-4' | 'zone-5' | 'zone-6';