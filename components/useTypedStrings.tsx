// lib/useTypedStrings.ts

// Static strings - no need to fetch from API
const TYPED_STRINGS = ["Fast.", "Secure.", "Simple."];

export const useTypedStrings = () => {
  return {
    strings: TYPED_STRINGS,
    isLoading: false,
    isError: false,
  };
};
