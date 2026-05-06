import React, { useEffect, useRef, useState } from 'react';
import { ServerContext } from '@/state/server';
import routes from '@/routers/routes';
import { ApplicationStore } from '@/state';
import Can from '@/components/elements/Can';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { useStoreState } from 'easy-peasy';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import PermissionRoute from '@/components/elements/PermissionRoute';
import Spinner from '@/components/elements/Spinner';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

interface Props {
  route: any;
}

const addonRouteSettingMap: Record<string, string> = {
  'plugin-installer': 'addon_plugin_installer_enabled',
  'mod-installer': 'addon_mod_installer_enabled',
  'modpack-installer': 'addon_modpack_installer_enabled',
  'subdomain-manager': 'addon_subdomain_enabled',
  'split-server': 'addon_split_enabled',
  'version-changer': 'addon_version_changer_enabled',
};

const addonRouteEggFilterMap: Record<string, string> = {
  'plugin-installer': 'addon_plugin_installer_eggs',
  'mod-installer': 'addon_mod_installer_eggs',
  'modpack-installer': 'addon_modpack_installer_eggs',
  'subdomain-manager': 'addon_subdomain_eggs',
  'split-server': 'addon_split_eggs',
  'version-changer': 'addon_version_changer_eggs',
};

const isAddonRoute = (name?: string): boolean => !!name && Object.prototype.hasOwnProperty.call(addonRouteSettingMap, name);

const parseEggFilter = (value: unknown): number[] => {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => !Number.isNaN(entry) && entry > 0);
};

const isAddonAllowedForEgg = (name: string | undefined, flash: Record<string, unknown>, eggId?: number): boolean => {
  if (!name || !isAddonRoute(name)) {
    return true;
  }

  const filterKey = addonRouteEggFilterMap[name];
  if (!filterKey) {
    return true;
  }

  const filters = parseEggFilter(flash[filterKey]);
  if (filters.length === 0 || !eggId) {
    return true;
  }

  return filters.includes(eggId);
};

const isAddonEnabled = (name: string | undefined, flash: Record<string, unknown>, eggId?: number): boolean => {
  if (!name || !isAddonRoute(name)) {
    return true;
  }

  const settingKey = addonRouteSettingMap[name];

  return String(flash[settingKey]) === 'true' && isAddonAllowedForEgg(name, flash, eggId);
};

const NavItem = ({ route }: Props) => {
  const { t } = useTranslation('flash/navigation');
  const match = useRouteMatch<{ id: string }>();

  const flash = useStoreState((state: ApplicationStore) => state.settings.data!.flash as unknown as Record<string, unknown>);
  const nestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
  const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

  const to = (value: string, url = false) => {
    return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
  };

  if (route.name && !isAddonEnabled(route.name, flash, eggId ?? undefined)) {
    return null;
  }

  return (
    ((route.nestIds && route.nestIds.includes(nestId ?? 0)) ||
      (route.eggIds && route.eggIds.includes(eggId ?? 0)) ||
      (route.nestId && route.nestId === nestId) ||
      (route.eggId && route.eggId === eggId) ||
      (!route.eggIds && !route.nestIds && !route.nestId && !route.eggId)) && (
      <NavLink to={to(route.path, true)} exact={route.exact}>
        {route.icon && <route.icon className={`w-5`}/> }
        <span>{t(route.name)}</span>
      </NavLink>
    )
  );
};

const renderNavItem = (route: any) => (
  route.permission ? (
    <Can key={route.path} action={route.permission} matchAny>
      <NavItem route={route} />
    </Can>
  ) : (
    <React.Fragment key={route.path}>
      <NavItem route={route} />
    </React.Fragment>
  )
);

interface NavigationDropdownProps {
  label: string;
  children: React.ReactNode;
}

const NavigationDropdown = ({ label, children }: NavigationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="dropdown" data-open={isOpen} ref={containerRef}>
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <span>{label}</span>
        <ChevronDownIcon className="w-3" />
      </button>
      <div className="dropdown-body" onClick={() => setIsOpen(false)}>
        {children}
      </div>
    </div>
  );
};

export const SubNavigationLinks = () => {
  const { t } = useTranslation('flash/navigation');
  const flash = useStoreState((state: ApplicationStore) => state.settings.data!.flash as unknown as Record<string, unknown>);
  const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

  const addonRoutes = routes.server.management
    .filter((route) => !!route.name)
    .filter((route) => isAddonRoute(route.name))
    .filter((route) => isAddonEnabled(route.name, flash, eggId ?? undefined));
  
  return (
    <>
      {routes.server.general
        .filter((route) => !!route.name)
        .map((route) =>
          renderNavItem(route)
        )}
      <NavigationDropdown label={t('management')}>
          {routes.server.management
            .filter((route) => !!route.name)
            .filter((route) => !isAddonRoute(route.name))
            .map((route) =>
              renderNavItem(route)
            )}
      </NavigationDropdown>
      {addonRoutes.length > 0 && (
        <NavigationDropdown label={`${t('addons')} ...`}>
            {addonRoutes.map((route) => renderNavItem(route))}
        </NavigationDropdown>
      )}
      <NavigationDropdown label={t('configuration')}>
          {routes.server.configuration
            .filter((route) => !!route.name)
            .map((route) =>
              renderNavItem(route)
            )}
      </NavigationDropdown>
    </>
  );
};

export const Navigation = () => {
  const { t } = useTranslation('flash/navigation');
  const flash = useStoreState((state: ApplicationStore) => state.settings.data!.flash as unknown as Record<string, unknown>);
  const eggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

  const addonRoutes = routes.server.management
    .filter((route) => !!route.name)
    .filter((route) => isAddonRoute(route.name))
    .filter((route) => isAddonEnabled(route.name, flash, eggId ?? undefined));
  
  return (
    <>
      <div>
        <span>{t('general')}</span>
        {routes.server.general
          .filter((route) => !!route.name)
          .map((route) =>
            renderNavItem(route)
          )}
      </div>
      <div>
        <span>{t('management')}</span>
        {routes.server.management
          .filter((route) => !!route.name)
          .filter((route) => !isAddonRoute(route.name))
          .map((route) =>
            renderNavItem(route)
          )}
      </div>
      {addonRoutes.length > 0 && (
        <div>
          <span>{t('addons')}</span>
          {addonRoutes.map((route) => renderNavItem(route))}
        </div>
      )}
      <div>
        <span>{t('configuration')}</span>
        {routes.server.configuration
          .filter((route) => !!route.name)
          .map((route) =>
            renderNavItem(route)
          )}
      </div>
    </>
  );
};

export const ComponentLoader = () => {
  const match = useRouteMatch<{ id: string }>();
  const location = useLocation();
  const flash = useStoreState((state: ApplicationStore) => state.settings.data!.flash as unknown as Record<string, unknown>);

  const serverNestId = ServerContext.useStoreState((state) => state.server.data?.nestId);
  const serverEggId = ServerContext.useStoreState((state) => state.server.data?.eggId);

  const to = (value: string, url = false) => {
    return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
  };

  return (
    <>
      <TransitionRouter>
        <Switch location={location}>
          {routes.server.general.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId, name }) => {
            return (
              isAddonEnabled(name, flash, serverEggId ?? undefined) &&
              ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                (nestId && serverNestId === nestId) ||
                (eggId && serverEggId === eggId) ||
                (!eggIds && !nestIds && !nestId && !eggId)) && (
                <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                  <Spinner.Suspense>
                    <Component />
                  </Spinner.Suspense>
                </PermissionRoute>
              )
            );
          })}
          {routes.server.management.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId, name }) => {
            return (
              isAddonEnabled(name, flash, serverEggId ?? undefined) &&
              ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                (nestId && serverNestId === nestId) ||
                (eggId && serverEggId === eggId) ||
                (!eggIds && !nestIds && !nestId && !eggId)) && (
                <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                  <Spinner.Suspense>
                    <Component />
                  </Spinner.Suspense>
                </PermissionRoute>
              )
            );
          })}
          {routes.server.configuration.map(({ path, permission, component: Component, nestIds, eggIds, nestId, eggId, name }) => {
            return (
              isAddonEnabled(name, flash, serverEggId ?? undefined) &&
              ((nestIds && nestIds.includes(serverNestId ?? 0)) ||
                (eggIds && eggIds.includes(serverEggId ?? 0)) ||
                (nestId && serverNestId === nestId) ||
                (eggId && serverEggId === eggId) ||
                (!eggIds && !nestIds && !nestId && !eggId)) && (
                <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                  <Spinner.Suspense>
                    <Component />
                  </Spinner.Suspense>
                </PermissionRoute>
              )
            );
          })}
          <Route path={'*'} component={NotFound} />
        </Switch>
      </TransitionRouter>
    </>
  );
};
