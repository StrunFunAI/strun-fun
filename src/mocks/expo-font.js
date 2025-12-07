// Mock expo-font for web
module.exports = {
  isLoaded: () => true,
  isLoading: () => false,
  loadAsync: async () => {},
  unloadAsync: async () => {},
  unloadAllAsync: async () => {},
  Font: {
    isLoaded: () => true,
    isLoading: () => false,
  },
  useFonts: () => [true, null],
  FontDisplay: {
    AUTO: 'auto',
    BLOCK: 'block',
    SWAP: 'swap',
    FALLBACK: 'fallback',
    OPTIONAL: 'optional',
  },
};
