import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[400px] max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute top-2 right-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20 rounded-full bg-black/40 backdrop-blur-md"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="aspect-[9/16] w-full max-h-[90vh] flex items-center justify-center">
          <video 
            src={videoUrl} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          >
            Browser Anda tidak mendukung tag video.
          </video>
        </div>
      </div>
    </div>
  );
}
