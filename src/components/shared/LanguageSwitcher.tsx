import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Select value={i18n.language.split('-')[0]} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px] h-8 text-xs bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-gray-700">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="rw">Kinyarwanda</SelectItem>
          <SelectItem value="fr">Français</SelectItem>
          <SelectItem value="sw">Kiswahili</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};