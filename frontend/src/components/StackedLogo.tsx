import FavIcon from './layout/favicon.png';

export const StackedLogo = ({ size = 16, className }: { size?: number; color?: string; className?: string }) => (
  <img src={FavIcon} alt="ARIANO Logo" width={size} height={size} className={className} style={{ display: 'inline-block' }} />
);
