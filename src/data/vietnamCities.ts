/**
 * 🇻🇳 VIETNAM CITIES DATA
 * Danh sách các tỉnh thành Việt Nam để gợi ý trong Settings
 */

export interface CityData {
  value: string;
  label: string;
  region: string;
}

export const vietnamCities: CityData[] = [
  // 🌟 Thành phố lớn
  { value: "Ho Chi Minh City", label: "Thành phố Hồ Chí Minh", region: "Miền Nam" },
  { value: "Hanoi", label: "Hà Nội", region: "Miền Bắc" },
  { value: "Da Nang", label: "Đà Nẵng", region: "Miền Trung" },
  { value: "Hai Phong", label: "Hải Phòng", region: "Miền Bắc" },
  { value: "Can Tho", label: "Cần Thơ", region: "Miền Nam" },

  // 🏔️ Miền Bắc
  { value: "Ha Long", label: "Hạ Long", region: "Miền Bắc" },
  { value: "Thai Nguyen", label: "Thái Nguyên", region: "Miền Bắc" },
  { value: "Lang Son", label: "Lạng Sơn", region: "Miền Bắc" },
  { value: "Cao Bang", label: "Cao Bằng", region: "Miền Bắc" },
  { value: "Lao Cai", label: "Lào Cai", region: "Miền Bắc" },
  { value: "Yen Bai", label: "Yên Bái", region: "Miền Bắc" },
  { value: "Tuyen Quang", label: "Tuyên Quang", region: "Miền Bắc" },
  { value: "Ha Giang", label: "Hà Giang", region: "Miền Bắc" },
  { value: "Phu Tho", label: "Phú Thọ", region: "Miền Bắc" },
  { value: "Vinh Phuc", label: "Vĩnh Phúc", region: "Miền Bắc" },
  { value: "Bac Ninh", label: "Bắc Ninh", region: "Miền Bắc" },
  { value: "Bac Giang", label: "Bắc Giang", region: "Miền Bắc" },
  { value: "Quang Ninh", label: "Quảng Ninh", region: "Miền Bắc" },
  { value: "Hung Yen", label: "Hưng Yên", region: "Miền Bắc" },
  { value: "Hai Duong", label: "Hải Dương", region: "Miền Bắc" },
  { value: "Nam Dinh", label: "Nam Định", region: "Miền Bắc" },
  { value: "Ninh Binh", label: "Ninh Bình", region: "Miền Bắc" },
  { value: "Thai Binh", label: "Thái Bình", region: "Miền Bắc" },

  // 🏞️ Miền Trung
  { value: "Hue", label: "Huế", region: "Miền Trung" },
  { value: "Quang Tri", label: "Quảng Trị", region: "Miền Trung" },
  { value: "Quang Binh", label: "Quảng Bình", region: "Miền Trung" },
  { value: "Ha Tinh", label: "Hà Tĩnh", region: "Miền Trung" },
  { value: "Nghe An", label: "Nghệ An", region: "Miền Trung" },
  { value: "Thanh Hoa", label: "Thanh Hóa", region: "Miền Trung" },
  { value: "Quang Nam", label: "Quảng Nam", region: "Miền Trung" },
  { value: "Quang Ngai", label: "Quảng Ngãi", region: "Miền Trung" },
  { value: "Binh Dinh", label: "Bình Định", region: "Miền Trung" },
  { value: "Phu Yen", label: "Phú Yên", region: "Miền Trung" },
  { value: "Khanh Hoa", label: "Khánh Hòa", region: "Miền Trung" },
  { value: "Ninh Thuan", label: "Ninh Thuận", region: "Miền Trung" },
  { value: "Binh Thuan", label: "Bình Thuận", region: "Miền Trung" },

  // 🌴 Miền Nam  
  { value: "Vung Tau", label: "Vũng Tàu", region: "Miền Nam" },
  { value: "Dong Nai", label: "Đồng Nai", region: "Miền Nam" },
  { value: "Binh Duong", label: "Bình Dương", region: "Miền Nam" },
  { value: "Binh Phuoc", label: "Bình Phước", region: "Miền Nam" },
  { value: "Tay Ninh", label: "Tây Ninh", region: "Miền Nam" },
  { value: "Long An", label: "Long An", region: "Miền Nam" },
  { value: "Dong Thap", label: "Đồng Tháp", region: "Miền Nam" },
  { value: "Tien Giang", label: "Tiền Giang", region: "Miền Nam" },
  { value: "An Giang", label: "An Giang", region: "Miền Nam" },
  { value: "Ben Tre", label: "Bến Tre", region: "Miền Nam" },
  { value: "Vinh Long", label: "Vĩnh Long", region: "Miền Nam" },
  { value: "Tra Vinh", label: "Trà Vinh", region: "Miền Nam" },
  { value: "Hau Giang", label: "Hậu Giang", region: "Miền Nam" },
  { value: "Soc Trang", label: "Sóc Trăng", region: "Miền Nam" },
  { value: "Bac Lieu", label: "Bạc Liêu", region: "Miền Nam" },
  { value: "Ca Mau", label: "Cà Mau", region: "Miền Nam" },
  { value: "Kien Giang", label: "Kiên Giang", region: "Miền Nam" },

  // 🏔️ Tây Nguyên
  { value: "Da Lat", label: "Đà Lạt", region: "Tây Nguyên" },
  { value: "Buon Ma Thuot", label: "Buôn Ma Thuột", region: "Tây Nguyên" },
  { value: "Pleiku", label: "Pleiku", region: "Tây Nguyên" },
  { value: "Kon Tum", label: "Kon Tum", region: "Tây Nguyên" },

  // 🏖️ Các thành phố biển và du lịch
  { value: "Nha Trang", label: "Nha Trang", region: "Miền Trung" },
  { value: "Phan Thiet", label: "Phan Thiết", region: "Miền Trung" },
  { value: "Quy Nhon", label: "Quy Nhon", region: "Miền Trung" },
  { value: "Hoi An", label: "Hội An", region: "Miền Trung" },
  { value: "Sa Pa", label: "Sa Pa", region: "Miền Bắc" },
  { value: "Phu Quoc", label: "Phú Quốc", region: "Miền Nam" },
];

// Hàm helper để tìm thành phố
export function findCityByValue(value: string): CityData | undefined {
  return vietnamCities.find(city => city.value.toLowerCase() === value.toLowerCase());
}

// Hàm helper để search thành phố
export function searchCities(query: string): CityData[] {
  const searchTerm = query.toLowerCase();
  return vietnamCities.filter(city => 
    city.label.toLowerCase().includes(searchTerm) || 
    city.value.toLowerCase().includes(searchTerm)
  );
}

// Group cities by region
export function getCitiesByRegion(): Record<string, CityData[]> {
  return vietnamCities.reduce((acc, city) => {
    if (!acc[city.region]) {
      acc[city.region] = [];
    }
    acc[city.region].push(city);
    return acc;
  }, {} as Record<string, CityData[]>);
}
