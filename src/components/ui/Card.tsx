import { radiusStyle } from '../../styles/utils';
import * as tokens from '../../styles/tokens';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-md p-6 ${className}`} style={radiusStyle('lg')}>
    {title && <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>}
    {children}
  </div>
);
