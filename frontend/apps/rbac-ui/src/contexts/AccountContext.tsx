import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type AccountContextType = {
  accountId?: string;
  setAccountId?: (id: string) => void;
  permissions?: string[];
  setPermissions?: (permissions: string[]) => void;
};

type AccountProviderProps = {
  initialAccountId: string;
  children: ReactNode;
  initialPermissions: string[];
};

const AccountContext = createContext<AccountContextType>({
  accountId: '',
  permissions: [],
});

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ initialAccountId, initialPermissions, children }: AccountProviderProps) => {
  const [accountId, setAccountId] = useState<string>(initialAccountId);
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);

  useEffect(() => {
    if (initialAccountId) {
      setAccountId(initialAccountId);
    }
    if (initialPermissions) {
      setPermissions(initialPermissions);
    }
  }, [initialAccountId, initialPermissions]);

  return (
    <AccountContext.Provider value={{ accountId, setAccountId, permissions, setPermissions }}>
      {children}
    </AccountContext.Provider>
  );
};
