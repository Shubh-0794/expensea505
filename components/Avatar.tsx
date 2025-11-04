import React from 'react';
import { getInitials, getColorFromName } from '../utils/getInitials';

interface AvatarProps {
  name: string;
}

const Avatar: React.FC<AvatarProps> = ({ name }) => {
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
      style={{ backgroundColor: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;