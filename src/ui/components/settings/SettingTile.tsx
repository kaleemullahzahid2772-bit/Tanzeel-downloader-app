import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingTileProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick?: () => void;
  iconBg?: string;
  iconColor?: string;
}

export const SettingTile: React.FC<SettingTileProps> = ({
  icon: Icon,
  title,
  subtitle,
  rightElement,
  onClick,
  iconBg = 'bg-slate-800',
  iconColor = 'text-slate-300',
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:bg-slate-800/60 hover:border-slate-700' : ''
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{title}</h4>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {rightElement}
        {onClick && !rightElement && <ChevronRight className="w-4 h-4 text-slate-500" />}
      </div>
    </div>
  );
};
