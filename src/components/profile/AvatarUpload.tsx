import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { profileService } from '@/services/profileService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast'; // We need to create this hook next, standard shadcn

interface AvatarUploadProps {
  url?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ url, name, size = 'lg' }) => {
  const { user, setUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32"
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    if (!user) return;

    const file = event.target.files[0];
    setIsUploading(true);

    try {
      const publicUrl = await profileService.uploadAvatar(user.id, file);
      
      // Update local state immediately
      setUser({ ...user, avatar_url: publicUrl });
      
    } catch (error) {
      console.error(error);
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer">
      <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
        <AvatarImage src={url} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
          {name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Upload Overlay */}
      <label 
        htmlFor="avatar-upload" 
        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </label>
      <input 
        id="avatar-upload" 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};