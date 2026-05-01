import FavIcon from './layout/Fav Icon.png';

export const StackedLogo = ({ size = 16 }: { size?: number; color?: string }) => (
  <img src={FavIcon} alt="ARIANO Logo" width={size} height={size} style={{ display: 'inline-block' }} />
);
