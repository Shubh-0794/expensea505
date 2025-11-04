export const getInitials = (name: string): string => {
  if (!name) return '';
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (
    names[0].charAt(0) + names[names.length - 1].charAt(0)
  ).toUpperCase();
};

// FIX: Added utility function to generate a color from a string hash.
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const intToRGB = (i: number) => {
  const c = (i & 0x00ffffff).toString(16).toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
};

export const getColorFromName = (name: string): string => {
  if (!name) return '#000000';
  return `#${intToRGB(hashCode(name))}`;
};
