import { createContext, useContext, useState, ReactNode } from 'react';
import { PermissionStrategy } from '@/lib/Permission';

interface PermissionContextType {
  permissionStrategy: PermissionStrategy | null;
  setPermissionStrategy: (strategy: PermissionStrategy) => void;
  hasPermission: (permission: string) => boolean;
  getPermissions: () => string[];
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider = ({
  children,
  initialStrategy,
}: {
  children: ReactNode;
  initialStrategy: PermissionStrategy;
}) => {
  const [permissionStrategy, setPermissionStrategy] = useState<PermissionStrategy | null>(initialStrategy);

  const hasPermission = (permission: string) => {
    return permissionStrategy ? permissionStrategy.hasPermission(permission) : false;
  };

  const getPermissions = () => {
    return permissionStrategy ? permissionStrategy.getPermissions() : [];
  };

  return (
    <PermissionContext.Provider value={{ permissionStrategy, setPermissionStrategy, hasPermission, getPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};
