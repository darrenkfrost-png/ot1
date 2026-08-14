import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export interface PageContextData {
  route: string;
  moduleTitle: string;
  moduleDescription: string;
  category: string;
  availableActions: string[];
  selectedItemId: string | null;
  timestamp: string;
}

interface PageContextValue {
  pageContext: PageContextData;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

export const usePageContext = (): PageContextValue => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageContextBridgeProvider');
  }
  return context;
};

// Module Registry to resolve metadata based on route
const resolveModuleMetadata = (pathname: string): Partial<PageContextData> => {
  const pathParts = pathname.split('/').filter(Boolean);
  const path = pathParts[0] || '';
  const selectedItemId = pathParts.length > 1 ? pathParts[1] : null;
  
  switch (path) {
    case '':
      return {
        moduleTitle: 'Dashboard / Home',
        moduleDescription: 'The main dashboard and overview of the CT6 Clinic.',
        category: 'Dashboard',
        selectedItemId: null,
        availableActions: ['view_treatments', 'book_appointment', 'open_ai_consultant']
      };
    case 'treatments':
      return {
        moduleTitle: selectedItemId ? 'Treatment Details' : 'Treatments Library',
        moduleDescription: selectedItemId ? `Viewing detailed clinical information for treatment ID: ${selectedItemId}.` : 'A library of osteopathic and wellbeing treatments offered at the clinic.',
        category: 'Services',
        selectedItemId,
        availableActions: selectedItemId ? ['book_treatment', 'go_back_to_treatments'] : ['view_treatment_details', 'search_treatments', 'book_treatment']
      };
    case 'practitioners':
      return {
        moduleTitle: selectedItemId ? 'Practitioner Profile' : 'Our Practitioners',
        moduleDescription: selectedItemId ? `Viewing clinical profile for practitioner ID: ${selectedItemId}.` : 'Information about the clinic\'s clinical team and specialists.',
        category: 'Team',
        selectedItemId,
        availableActions: selectedItemId ? ['book_with_practitioner'] : ['view_practitioner_details', 'book_with_practitioner']
      };
    case 'gallery':
      return {
        moduleTitle: 'Clinic Gallery',
        moduleDescription: 'Visual gallery of the clinic facilities and therapy rooms.',
        category: 'Media',
        selectedItemId: null,
        availableActions: ['view_images', 'start_slideshow']
      };
    case 'resources':
      return {
        moduleTitle: 'Patient Resources',
        moduleDescription: 'Educational materials, healing guides, and post-treatment advice.',
        category: 'Education',
        selectedItemId: null,
        availableActions: ['read_articles', 'download_guides']
      };
    case 'locations':
      return {
        moduleTitle: 'Clinic Locations',
        moduleDescription: 'Maps, addresses, and contact details for our clinic branches.',
        category: 'Information',
        selectedItemId: null,
        availableActions: ['view_map', 'get_directions']
      };
    case 'contact':
      return {
        moduleTitle: 'Contact Us',
        moduleDescription: 'Contact forms and direct communication channels for the clinic.',
        category: 'Communication',
        selectedItemId: null,
        availableActions: ['send_message', 'call_clinic']
      };
    case 'dashboard':
      return {
        moduleTitle: 'Progress Board',
        moduleDescription: 'Patient personal progress, treatment history, and upcoming appointments.',
        category: 'Patient Portal',
        selectedItemId: null,
        availableActions: ['view_progress', 'manage_appointments']
      };
    default:
      return {
        moduleTitle: 'Current View',
        moduleDescription: 'The user is viewing this section of the application.',
        category: 'General',
        selectedItemId: null,
        availableActions: []
      };
  }
};

export const PageContextBridgeProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [pageContext, setPageContext] = useState<PageContextData>({
    route: '/',
    moduleTitle: 'Dashboard',
    moduleDescription: 'Initializing...',
    category: 'System',
    availableActions: [],
    selectedItemId: null,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    const metadata = resolveModuleMetadata(location.pathname);
    
    setPageContext({
      route: location.pathname,
      moduleTitle: metadata.moduleTitle || 'Unknown view',
      moduleDescription: metadata.moduleDescription || '',
      category: metadata.category || 'General',
      availableActions: metadata.availableActions || [],
      selectedItemId: metadata.selectedItemId || null,
      timestamp: new Date().toISOString()
    });
    
  }, [location.pathname]);

  return (
    <PageContext.Provider value={{ pageContext }}>
      {children}
    </PageContext.Provider>
  );
};
