import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  type: 'page_view' | 'click' | 'interaction';
  page: string;
  target?: string;
  timestamp: Date;
}

interface AnalyticsContextType {
  history: AnalyticsEvent[];
  currentPage: string;
  lastInteraction: AnalyticsEvent | null;
  trackClick: (target: string) => void;
  getContextString: () => string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<AnalyticsEvent[]>([]);
  const [lastInteraction, setLastInteraction] = useState<AnalyticsEvent | null>(null);
  const location = useLocation();

  useEffect(() => {
    const event: AnalyticsEvent = {
      type: 'page_view',
      page: location.pathname,
      timestamp: new Date(),
    };
    setHistory(prev => [...prev.slice(-19), event]);
  }, [location.pathname]);

  const trackClick = useCallback((target: string) => {
    const event: AnalyticsEvent = {
      type: 'click',
      page: location.pathname,
      target,
      timestamp: new Date(),
    };
    setLastInteraction(event);
    setHistory(prev => [...prev.slice(-19), event]);
  }, [location.pathname]);

  const getContextString = useCallback(() => {
    const current = location.pathname;
    let context = `The user is currently on the "${current}" page. `;
    
    if (lastInteraction) {
      context += `Their last interaction was clicking on "${lastInteraction.target}" on the "${lastInteraction.page}" page. `;
    }
    
    // Extract ID from path if it's a detail page
    const treatmentMatch = current.match(/\/treatments\/(.+)/);
    if (treatmentMatch) {
      context += `They are specifically looking at the treatment details for "${treatmentMatch[1]}". `;
    }
    
    const practitionerMatch = current.match(/\/practitioners\/(.+)/);
    if (practitionerMatch) {
      context += `They are specifically looking at the practitioner profile for "${practitionerMatch[1]}". `;
    }

    return context;
  }, [location.pathname, lastInteraction]);

  return (
    <AnalyticsContext.Provider value={{ history, currentPage: location.pathname, lastInteraction, trackClick, getContextString }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return context;
};
