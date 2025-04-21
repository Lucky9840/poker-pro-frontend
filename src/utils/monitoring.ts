1051995Td&
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { init as initApm } from '@elastic/apm-rum';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initializeMonitoring = () => {
  // Sentry pour le tracking des erreurs frontend
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV
  });

  // Elastic APM pour le monitoring des performances
  const apm = initApm({
    serviceName: 'poker-pro-frontend',
    serverUrl: process.env.REACT_APP_APM_SERVER_URL,
    environment: process.env.NODE_ENV
  });

  // Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', process.env.REACT_APP_GA_ID || '');

  return { sentry: Sentry, apm };
};
