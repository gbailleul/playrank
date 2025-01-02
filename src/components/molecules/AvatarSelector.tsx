import React, { useState, useRef } from 'react';
import GamingAvatar from '../atoms/GamingAvatar';

// Liste d'avatars prédéfinis
const PRESET_AVATARS = [
  { id: 1, url: '/avatars/warrior.png', frameType: 'epic' },
  { id: 2, url: '/avatars/mage.png', frameType: 'legendary' },
  { id: 3, url: '/avatars/rogue.png', frameType: 'rare' },
  { id: 4, url: '/avatars/archer.png', frameType: 'epic' },
  { id: 5, url: '/avatars/healer.png', frameType: 'legendary' },
  { id: 6, url: '/avatars/tank.png', frameType: 'rare' },
] as const;

interface AvatarSelectorProps {
  currentAvatar?: string;
  userName: string;
  onAvatarChange: (avatarData: string | File) => void;
  frameType?: 'common' | 'rare' | 'epic' | 'legendary';
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  userName,
  onAvatarChange,
  frameType = 'common'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAvatarChange(file);
      setIsOpen(false);
    }
  };

  const handlePresetAvatarSelect = async (avatarUrl: string) => {
    try {
      onAvatarChange(avatarUrl);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to select preset avatar:', error);
    }
  };

  return (
    <div className="relative">
      <GamingAvatar
        name={userName}
        imageUrl={currentAvatar}
        frameType={frameType}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      />

      {isOpen && (
        <div className="absolute top-full mt-2 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)] shadow-[var(--shadow-strong)] z-50">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handlePresetAvatarSelect(avatar.url)}
                  className="p-1 rounded-lg hover:bg-[var(--element-bg-hover)] transition-colors"
                >
                  <GamingAvatar
                    name={userName}
                    imageUrl={avatar.url}
                    size="sm"
                    frameType={avatar.frameType as any}
                  />
                </button>
              ))}
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--element-bg)] rounded-lg hover:bg-[var(--element-bg-hover)] transition-colors"
              >
                Upload Custom Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector; 