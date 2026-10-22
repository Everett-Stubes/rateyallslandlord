import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ServicesProvider } from '../../context/ServicesContext';
import { AuthProvider } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataContext';
import type { IApiService, IAuthService } from '../../services/interfaces';
import { createMockApiService, createMockAuthService } from './createMockServices';

interface RenderOptions {
  api?: IApiService;
  auth?: IAuthService;
  initialRoute?: string;
}

interface RenderPageResult extends RenderResult {
  api: IApiService;
  auth: IAuthService;
}

export function renderPage(
  ui: ReactElement,
  options: RenderOptions = {}
): RenderPageResult {
  const api = options.api ?? createMockApiService();
  const auth = options.auth ?? createMockAuthService();
  const initialRoute = options.initialRoute ?? '/';

  const result = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ServicesProvider api={api} auth={auth}>
        <AuthProvider>
          <DataProvider>
            {ui}
          </DataProvider>
        </AuthProvider>
      </ServicesProvider>
    </MemoryRouter>
  );

  return { ...result, api, auth };
}

interface RouteConfig {
  path: string;
  element: ReactElement;
}

interface RenderWithRoutesOptions {
  api?: IApiService;
  auth?: IAuthService;
  initialRoute?: string;
}

interface RenderWithRoutesResult extends RenderResult {
  api: IApiService;
  auth: IAuthService;
}

export function renderWithRoutes(
  routes: RouteConfig[],
  options: RenderWithRoutesOptions = {}
): RenderWithRoutesResult {
  const api = options.api ?? createMockApiService();
  const auth = options.auth ?? createMockAuthService();
  const initialRoute = options.initialRoute ?? '/';

  const result = render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ServicesProvider api={api} auth={auth}>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {routes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ServicesProvider>
    </MemoryRouter>
  );

  return { ...result, api, auth };
}
