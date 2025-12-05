import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { BookOpen, ShieldCheck, Users } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-100",
    title: "Ditch the Notebook",
    desc: "Stop recording payments on paper. TillSave tracks every coin, calculates totals, and never gets lost."
  },
  {
    id: 2,
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-100",
    title: "Fair & Transparent",
    desc: "Members see their savings in real-time. Automated payout calculations mean no more math errors or disputes."
  },
  {
    id: 3,
    icon: ShieldCheck,
    color: "text-purple-600",
    bg: "bg-purple-100",
    title: "Secure & Private",
    desc: "Your data is encrypted. Use a PIN to lock the app instantly so your financial info stays safe."
  }
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      });
    }
  }, [emblaApi]);

  const handleNext = () => {
    if (selectedIndex === SLIDES.length - 1) {
      completeOnboarding();
    } else {
      emblaApi?.scrollNext();
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between p-6">
      
      {/* Skip Button */}
      <div className="flex justify-end">
        <button 
          onClick={completeOnboarding}
          className="text-sm font-medium text-gray-500 dark:text-gray-400"
        >
          Skip
        </button>
      </div>

      {/* Carousel */}
      <div className="flex-1 flex items-center overflow-hidden" ref={emblaRef}>
        <div className="flex w-full">
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 flex flex-col items-center text-center px-4">
              <div className={`h-40 w-40 rounded-full ${slide.bg} flex items-center justify-center mb-8 animate-in zoom-in duration-500`}>
                <slide.icon className={`h-20 w-20 ${slide.color}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {slide.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                {slide.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="space-y-8 mb-8">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === selectedIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button onClick={handleNext} className="w-full h-12 text-lg shadow-lg shadow-primary/20">
          {selectedIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
};