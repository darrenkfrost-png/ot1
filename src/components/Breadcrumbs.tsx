import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { usePageContext } from '../context/PageContextContext';
import { cn } from '../lib/utils';
import { TREATMENTS, PRACTITIONERS } from '../data';

export default function Breadcrumbs() {
  const location = useLocation();
  const { pageContext } = usePageContext();

  // Root path doesn't need breadcrumbs usually, but we can show it if we want.
  // Actually, standard practice is to hide breadcrumbs on the homepage, 
  // but let's show it if requested, or just hide on root.
  if (location.pathname === '/') {
    return null;
  }

  const pathParts = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbLabel = (path: string, index: number, parts: string[]) => {
    if (index === 0) {
      // First level categories
      switch (path) {
        case 'treatments': return 'Treatments';
        case 'practitioners': return 'Our Team';
        case 'gallery': return 'Clinic Gallery';
        case 'resources': return 'Patient Resources';
        case 'locations': return 'Locations';
        case 'contact': return 'Contact Us';
        case 'ai-consultant': return 'AI Voice Clinic';
        case 'dashboard': return 'Progress Board';
        default: return path.charAt(0).toUpperCase() + path.slice(1);
      }
    } else if (index === 1) {
      // Detail pages
      const parent = parts[0];
      if (parent === 'treatments') {
        const treatment = TREATMENTS.find(t => t.id === path);
        return treatment ? treatment.title : 'Unknown Treatment';
      }
      if (parent === 'practitioners') {
        const practitioner = PRACTITIONERS.find(p => p.id === path);
        return practitioner ? practitioner.name : 'Unknown Practitioner';
      }
    }
    return path;
  };

  return (
    <nav aria-label="Breadcrumb" className="mb-8 w-full">
      <ol className="flex items-center space-x-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap custom-scrollbar pb-2">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 hover:text-teal-600 transition-colors focus-visible:outline-teal-500 rounded p-1"
          >
            <Home size={14} />
            <span className="font-medium">Home</span>
          </Link>
        </li>
        
        {pathParts.map((part, index) => {
          const isLast = index === pathParts.length - 1;
          const href = `/${pathParts.slice(0, index + 1).join('/')}`;
          
          return (
            <li key={href} className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-slate-800 ml-1 truncate max-w-[200px] sm:max-w-xs px-1" aria-current="page">
                  {getBreadcrumbLabel(part, index, pathParts)}
                </span>
              ) : (
                <Link 
                  to={href}
                  className="ml-1 hover:text-teal-600 font-medium transition-colors focus-visible:outline-teal-500 rounded p-1 truncate max-w-[150px] sm:max-w-xs"
                >
                  {getBreadcrumbLabel(part, index, pathParts)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
