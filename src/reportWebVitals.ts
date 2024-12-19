import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

type ReportHandler = (metric: { name: string, value: number }) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    onCLS((metric) => onPerfEntry({ name: 'CLS', value: metric.value }));
    onFCP((metric) => onPerfEntry({ name: 'FCP', value: metric.value }));
    onLCP((metric) => onPerfEntry({ name: 'LCP', value: metric.value }));
    onTTFB((metric) => onPerfEntry({ name: 'TTFB', value: metric.value }));
    // Assuming onINP is available and is the new way to handle input delays.
    onINP && onINP((metric) => onPerfEntry({ name: 'INP', value: metric.value }));
  }
};

export default reportWebVitals;
