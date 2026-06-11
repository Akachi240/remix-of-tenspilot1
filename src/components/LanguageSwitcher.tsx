import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-[var(--ink-muted)]" />
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-transparent text-[var(--ink-base)] text-sm font-medium focus:outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="pidgin">Pidgin</option>
        <option value="yo">Yorùbá</option>
        <option value="ig">Igbo</option>
        <option value="ha">Hausa</option>
      </select>
    </div>
  );
};
