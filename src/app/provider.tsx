import type { ReactNode } from 'react';
import { KitchenProvider } from '@/features/kitchen/context/KitchenContext';

/** Top-level provider composition (room for more providers as the app grows). */
export const AppProvider = ({ children }: { children: ReactNode }) => (
  <KitchenProvider>{children}</KitchenProvider>
);
