/**
 * LinkedIn Geographic Region Codes
 * Used for facetGeoRegion parameter in LinkedIn People Search URLs
 */

export const LINKEDIN_GEO_REGIONS = {
    // EUROPE
    'paris': '104246759',
    'lyon': '90009674', 
    'marseille': '90009703',
    'london': '90009496',
    'berlin': '103035651',
    'munich': '90009735',
    'frankfurt': '90009714',
    'madrid': '90009790',
    'barcelona': '90009761',
    'rome': '102334534',
    'milan': '90009936',
    'amsterdam': '90010383',
    'copenhagen': '90009617',
    'stockholm': '90010409',
    'oslo': '90010069',
    'dublin': '90009824',
    'brussels': '90009604',
    'lisbon': '90010352',
    'zurich': '90009888',
    'warsaw': '90009828',
    'vienna': '107144641',
  
    // NORTH AMERICA
    'new york': '90000070',
    'san francisco': '90000084',
    'los angeles': '90000049',
    'boston': '90000007',
    'chicago': '90000014',
    'austin': '90000064',
    'seattle': '90000091',
    'atlanta': '90000052',
    'miami': '90000056',
    'washington dc': '90000097',
    'toronto': '90009551',
    'vancouver': '90009553',
    'montreal': '90009540',
  
    // SOUTH AMERICA
    'sao paulo': '90009574',
    'mexico city': '90010045',
    'buenos aires': '90009870',
    'bogota': '90010133',
  
    // ASIA
    'bengaluru': '90009633',
    'singapore': '102454443',
    'sydney': '90009524',
    'tokyo': '90009987',
    'hong kong': '103291313',
    'seoul': '103588929',
    'shanghai': '102772228',
    'beijing': '103873152',
    'jakarta': '90010101',
    'manila': '90010076',
    'bangkok': '90010335',
  
    // AFRICA AND MIDDLE EAST
    'dubai': '106204383',
    'casablanca': '90010262',
    'lagos': '104197452',
    'johannesburg': '90010098',
    'tel aviv': '104243116',
    'tel-aviv': '104243116', // Alternative spelling
  } as const;
  
  /**
   * Helper function to find LinkedIn region code for a given location
   * @param location - Location string (e.g., "Paris", "San Francisco, CA", "London, UK")
   * @returns LinkedIn region code or null if not found
   */
  export function getLinkedInRegionCode(location?: string): string | null {
    if (!location) return null;
    
    // Normalize the location string
    const normalizedLocation = location.toLowerCase().trim();
    
    // Direct match first
    if (normalizedLocation in LINKEDIN_GEO_REGIONS) {
      return LINKEDIN_GEO_REGIONS[normalizedLocation as keyof typeof LINKEDIN_GEO_REGIONS];
    }
    
    // Try to match city name from location string
    // Handle formats like "Paris, France", "San Francisco, CA", "New York, NY, USA"
    const locationParts = normalizedLocation.split(',').map(part => part.trim());
    
    for (const part of locationParts) {
      if (part in LINKEDIN_GEO_REGIONS) {
        return LINKEDIN_GEO_REGIONS[part as keyof typeof LINKEDIN_GEO_REGIONS];
      }
    }
    
    // Try partial matches for common variations
    const cityMappings: Record<string, string> = {
      'nyc': 'new york',
      'sf': 'san francisco',
      'la': 'los angeles',
      'dc': 'washington dc',
      'washington': 'washington dc',
      'bangalore': 'bengaluru',
      'mumbai': 'mumbai', // Not in our list but common
      'delhi': 'delhi', // Not in our list but common
    };
    
    for (const [alias, city] of Object.entries(cityMappings)) {
      if (normalizedLocation.includes(alias) && city in LINKEDIN_GEO_REGIONS) {
        return LINKEDIN_GEO_REGIONS[city as keyof typeof LINKEDIN_GEO_REGIONS];
      }
    }
    
    return null;
  }
  
  /**
   * Get all supported cities for display purposes
   */
  export function getSupportedCities(): string[] {
    return Object.keys(LINKEDIN_GEO_REGIONS).map(city => 
      city.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    );
  }