import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SupportedLanguage } from '@/types/interview';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
}

const languages: { value: SupportedLanguage; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px] bg-secondary border-border">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        {languages.map((lang) => (
          <SelectItem
            key={lang.value}
            value={lang.value}
            className="cursor-pointer hover:bg-secondary"
          >
            <span className="flex items-center gap-2">
              <span>{lang.icon}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
