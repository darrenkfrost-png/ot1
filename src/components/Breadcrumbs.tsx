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

  /*
   * Only addresses the site really has get a trail. An unknown address used
   * to be title-cased into invented crumbs - /services/osteopathy showed
   * "Home / Services / osteopathy", and "Services" was itself a link to
   * another missing page. Visitors from the clinic's old Google links will
   * arrive on addresses like that, so they get Home and a plain
   * "Page not found" instead.
   */
  const SECTIONS = ['treatments', 'practitioners', 'gallery', 'resources', 'locations', 'contact', 'dashboard', 'faq'];
  // Lower-cased because the router matches addresses regardless of case.
  const first = (pathParts[0] || '').toLowerCase();
  const isRealAddress =
    (pathParts.length === 1 && SECTIONS.includes(first)) ||
    (pathParts.length === 2 && (first === 'treatments' || first === 'practitioners'));

  const getBreadcrumbLabel = (path: string, index: number, parts: string[]) => {
    if (index === 0) {
      // First level categories
      switch (path) {
        case 'treatments': return 'Treatments';
        case 'practitioners': return 'Our Team';
        // The page is headed "Patient guides"; it holds the illustrated
        // guides, not photographs of the clinic.
        case 'gallery': return 'Patient Guides';
        case 'resources': return 'Patient Resources';
        case 'locations': return 'Locations';
        case 'contact': return 'Contact Us';
        case 'dashboard': return 'Recovery Tools';
        // Without this the fallback title-cases the path into "Faq", which is
        // not what the page is called anywhere else in the interface.
        case 'faq': return 'Questions';
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
      {/* A list that scrolls sideways clips anything drawn outside it, and the
          focus indicator is drawn 7px outside each link - so the first crumb
          showed no focus at all. 8px of inner room, cancelled by an equal
          negative margin, lets it fit without moving anything. */}
      <ol className="flex items-center space-x-2 text-sm text-slate-300 overflow-x-auto whitespace-nowrap custom-scrollbar px-2 pt-2 pb-2 -mx-2 -mt-2">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center gap-1.5 hover:text-teal-300 transition-colors focus-visible:outline-teal-500 rounded p-1"
          >
            <Home size={14} />
            <span className="font-medium">Home</span>
          </Link>
        </li>
        
        {!isRealAddress && (
          <li className="flex items-center">
            <ChevronRight size={14} className="mx-1 text-slate-400 shrink-0" />
            <span className="font-semibold text-white ml-1 px-1" aria-current="page">
              Page not found
            </span>
          </li>
        )}

        {isRealAddress && pathParts.map((part, index) => {
          const isLast = index === pathParts.length - 1;
          const href = `/${pathParts.slice(0, index + 1).join('/')}`;
          
          return (
            <li key={href} className="flex items-center">
              <ChevronRight size={14} className="mx-1 text-slate-400 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-white ml-1 truncate max-w-[200px] sm:max-w-xs px-1" aria-current="page">
                  {getBreadcrumbLabel(part, index, pathParts)}
                </span>
              ) : (
                <Link 
                  to={href}
                  className="ml-1 hover:text-teal-300 font-medium transition-colors focus-visible:outline-teal-500 rounded p-1 truncate max-w-[150px] sm:max-w-xs"
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
