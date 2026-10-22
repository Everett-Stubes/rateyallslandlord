import React, { createContext, useContext } from 'react';
import type { IApiService, IAuthService } from '../services/interfaces';

interface ServicesContextType {
  api: IApiService;
  auth: IAuthService;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const ServicesProvider: React.FC<{
  api: IApiService;
  auth: IAuthService;
  children: React.ReactNode;
}> = ({ api, auth, children }) => (
  <ServicesContext.Provider value={{ api, auth }}>
    {children}
  </ServicesContext.Provider>
);

export const useServices = (): ServicesContextType => {
  const context = useContext(ServicesContext);
  if (!context) throw new Error('useServices must be used within a ServicesProvider');
  return context;
};

export const useApiService = (): IApiService => useServices().api;
