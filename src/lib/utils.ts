import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Comprehensive UTF-8 encoding fix function
 * Handles double-encoded UTF-8 characters that commonly occur with OpenAI API responses
 */
export function fixUTF8Encoding(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  let fixed = text;
  
  // Step 1: Fix common double-encoded UTF-8 sequences
  const encodingMap: Record<string, string> = {
    // French characters (most common)
    'Ã©': 'é', 'Ã¨': 'è', 'Ã ': 'à', 'Ã¢': 'â', 'Ã´': 'ô', 'Ã®': 'î',
    'Ã§': 'ç', 'Ã¹': 'ù', 'Ã»': 'û', 'Ã«': 'ë', 'Ã¯': 'ï', 'Ã¼': 'ü',
    'Ã¶': 'ö', 'Ã¤': 'ä',
    
    // French uppercase
    'Ã‰': 'É', 'Ã€': 'À', 'Ã‡': 'Ç', 'Ãˆ': 'È', 'ÃŠ': 'Ê', 'Ã‹': 'Ë',
    'ÃŽ': 'Î', 'Ã"': 'Ô', 'Ã™': 'Ù', 'Ã›': 'Û',
    
    // Spanish characters - using escaped unicode to avoid syntax errors
    'Ã±': 'ñ', 'Ã\u0091': 'Ñ', 'Ã³': 'ó', 'Ã­': 'í', 'Ãº': 'ú', 'Ã¡': 'á',
    
    // German characters
    'ÃŸ': 'ß', 'Ã„': 'Ä', 'Ãœ': 'Ü',
    
    // Portuguese characters
    'Ã£': 'ã', 'Ãµ': 'õ', 'Ã‚': 'Â', 'Ãƒ': 'Ã',
    
    // Italian characters
    'Ã¬': 'ì', 'Ã²': 'ò',
    
    // Common punctuation issues
    'â€™': "'", 'â€œ': '"', 'â€\u009d': '"', 'â€"': '–', 'â€"': '—',
    'â€¦': '…', 'â€¢': '•',
    
    // Additional problematic sequences
    'Ã\u0081': 'Á', 'Ã\u0090': 'Ð', 'Ã\u0095': 'Õ',
    'Ã¥': 'å', 'Ã†': 'Æ', 'Ã˜': 'Ø',
  };
  
  // Apply all mappings
  for (const [encoded, decoded] of Object.entries(encodingMap)) {
    fixed = fixed.replace(new RegExp(encoded, 'g'), decoded);
  }
  
  // Step 2: Handle specific common French words that get mangled
  const commonWordFixes: Record<string, string> = {
    'Ã©change': 'échange',
    'expÃ©rience': 'expérience',
    'CrÃ©dit': 'Crédit',
    'sociÃ©tÃ©': 'société',
    'universitÃ©': 'université',
    'qualitÃ©': 'qualité',
    'activitÃ©': 'activité',
    'spÃ©cialitÃ©': 'spécialité',
    'opportunitÃ©': 'opportunité',
    'stratÃ©gie': 'stratégie',
    'Ã©quipe': 'équipe',
    'Ã©tudiant': 'étudiant',
    'intÃ©ressÃ©': 'intéressé',
    'prÃ©sentation': 'présentation',
    'dÃ©veloppement': 'développement',
    'Ã©conomie': 'économie',
    'Ã©nergie': 'énergie',
    'Ã©cologie': 'écologie',
  };
  
  // Apply word fixes
  for (const [encoded, decoded] of Object.entries(commonWordFixes)) {
    fixed = fixed.replace(new RegExp(encoded, 'gi'), decoded);
  }
  
  // Step 3: Handle remaining sequences with a safer regex pattern
  // Fix sequences like Ã followed by extended ASCII characters (128-255)
  fixed = fixed.replace(/Ã([\u0080-\u00FF])/g, (match, char) => {
    const charCode = char.charCodeAt(0);
    // Convert back to proper UTF-8 for characters in the extended ASCII range
    if (charCode >= 128 && charCode <= 255) {
      // This is a simplified conversion - you might need to adjust based on your specific needs
      const correctedCode = charCode + 64;
      if (correctedCode <= 255) {
        return String.fromCharCode(correctedCode);
      }
    }
    return match;
  });
  
  // Step 4: Clean up any remaining artifacts
  fixed = fixed.replace(/â€/g, '"'); // Clean up quote artifacts
  fixed = fixed.replace(/Ã¢â‚¬/g, '"'); // Another quote pattern
  
  return fixed;
}

/**
 * Alternative encoding fix using TextDecoder (more robust)
 */
export function fixUTF8EncodingAdvanced(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  try {
    // First try the basic fix
    let fixed = fixUTF8Encoding(text);
    
    // If we still have problematic sequences, try more advanced fixing
    if (fixed.includes('Ã') || fixed.includes('â€')) {
      // Convert string to bytes and back with proper encoding
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8', { fatal: false });
      
      // Try to decode as if it was incorrectly encoded as latin1
      const bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i);
      }
      
      const reDecoded = decoder.decode(bytes);
      if (!reDecoded.includes('Ã') && reDecoded.length > 0) {
        fixed = reDecoded;
      }
    }
    
    return fixed;
  } catch (error) {
    console.warn('Advanced UTF-8 fix failed, using basic fix:', error);
    return fixUTF8Encoding(text);
  }
}

/**
 * Clean text for email content - removes encoding issues and normalizes
 */
export function cleanEmailContent(content: string): string {
  if (!content) return content;
  
  let cleaned = fixUTF8EncodingAdvanced(content);
  
  // Additional cleaning for email content
  cleaned = cleaned
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\s+\n/g, '\n')
    // Remove any remaining encoding artifacts
    .replace(/\uFFFD/g, '') // Remove replacement characters
    .trim();
  
  return cleaned;
}


