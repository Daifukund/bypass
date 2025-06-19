export const createSafeJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    try {
      const item = getStorage().getItem(name);
      if (item === null || item === 'undefined') {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to parse stored item "${name}":`, error);
      // Clear corrupted item
      getStorage().removeItem(name);
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    try {
      getStorage().setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to store item "${name}":`, error);
    }
  },
  removeItem: (name: string) => {
    try {
      getStorage().removeItem(name);
    } catch (error) {
      console.error(`Failed to remove item "${name}":`, error);
    }
  },
}); 