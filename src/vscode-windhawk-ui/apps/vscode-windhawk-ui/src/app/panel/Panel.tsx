import React, { useEffect } from 'react';
import { createHashRouter, Outlet, RouterProvider, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { readLocalUISettings } from '../appUISettings';
import About from './About';
import AppHeader from './AppHeader';
import CreateNewModButton from './CreateNewModButton';
import ModPreview from './ModPreview';
import ModsBrowserLocal from './ModsBrowserLocal';
import ModsBrowserOnline from './ModsBrowserOnline';
import SafeModeIndicator from './SafeModeIndicator';
import Settings from './Settings';

const PanelContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, rgba(23, 125, 220, 0.15) 0%, transparent 40%),
    radial-gradient(circle at bottom right, rgba(162, 89, 255, 0.12) 0%, transparent 40%),
    radial-gradient(circle at center, rgba(25, 25, 25, 0.95), var(--app-background-color) 120%);
  background-attachment: fixed;
`;

const ContentContainerScroll = styled.div<{ $hidden?: boolean }>`
  ${({ $hidden }) => css`
    display: ${$hidden ? 'none' : 'flex'};
  `}
  position: relative; // needed by nested elements that use position: absolute
  flex: 1;
  overflow: overlay;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  max-width: var(--app-max-width);
  margin: 0 auto;
  padding: 0 var(--app-horizontal-padding) var(--app-section-gap);

  // Disable margin-collapsing: https://stackoverflow.com/a/47351270
  display: flex;
  flex-direction: column;
`;

function ContentWrapper({
  ref,
  ...props
}: React.ComponentProps<'div'> & { $hidden?: boolean }) {
  return (
    <ContentContainerScroll ref={ref} {...props}>
      <ContentContainer>{props.children}</ContentContainer>
    </ContentContainerScroll>
  );
}

function ContentWrapperWithOutlet() {
  return (
    <ContentWrapper>
      <Outlet />
    </ContentWrapper>
  );
}

function KeyboardNavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+Left for back navigation
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        navigate(-1);
      }
      // Alt+Right for forward navigation
      else if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        navigate(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function Layout() {
  return (
    <>
      <KeyboardNavigationHandler />
      <SafeModeIndicator />
      <AppHeader />
      <Outlet />
    </>
  );
}

// Must be done before creating the router to ensure the initial route is
// correct.
const bodyParams = document.querySelector('body')?.getAttribute('data-params');
const previewModId = bodyParams && JSON.parse(bodyParams).previewModId;
if (previewModId) {
  const url = new URL(window.location.href);
  url.hash = '#/mod-preview/' + previewModId;
  window.history.replaceState(null, '', url);
} else {
  const startupPage = readLocalUISettings().startupPage;
  const startupRouteMap = {
    home: '#/',
    explore: '#/mods-browser',
    settings: '#/settings',
    about: '#/about',
  } as const;

  if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
    const preferredHash = startupRouteMap[startupPage];
    if (preferredHash !== '#/') {
      const url = new URL(window.location.href);
      url.hash = preferredHash;
      window.history.replaceState(null, '', url);
    }
  }
}

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <>
            <ModsBrowserLocal ContentWrapper={ContentWrapper} />
            <CreateNewModButton />
          </>
        ),
        children: [
          {
            path: 'mods/:modType/:modId',
            element: null,
          },
        ],
      },
      {
        path: '/mod-preview/:modId',
        element: <ModPreview ContentWrapper={ContentWrapper} />,
      },
      {
        path: '/mods-browser',
        element: (
          <>
            <ModsBrowserOnline ContentWrapper={ContentWrapper} />
            <CreateNewModButton />
          </>
        ),
        children: [
          {
            path: ':modId',
            element: null,
          },
        ],
      },
      {
        path: '/settings',
        element: <ContentWrapperWithOutlet key="settings" />,
        children: [
          {
            index: true,
            element: <Settings />,
          },
        ],
      },
      {
        path: '/about',
        element: <ContentWrapperWithOutlet key="about" />,
        children: [
          {
            index: true,
            element: <About />,
          },
        ],
      },
    ],
  },
]);

function Panel() {
  return (
    <PanelContainer>
      <RouterProvider router={router} />
    </PanelContainer>
  );
}

export default Panel;
