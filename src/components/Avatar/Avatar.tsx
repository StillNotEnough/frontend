import { useMemo } from 'react';
import './Avatar.css';

interface AvatarProps {
  name: string;
  size?: number;
}

const Avatar = ({ name, size = 40 }: AvatarProps) => {
  // Получаем первую букву (или первый символ)
  const firstLetter = name.charAt(0).toUpperCase();

  // Генерируем цвет на основе имени
  const backgroundColor = useMemo(() => {
    // Простой хеш для генерации консистентного цвета
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Конвертируем хеш в HSL цвет для красивых оттенков
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  }, [name]);

  return (
    <div
      className="avatar"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        fontSize: `${size * 0.45}px`,
      }}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;