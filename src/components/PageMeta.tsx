import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TREATMENTS, PRACTITIONERS } from '../data';

/**
 * The practice's registered trading name. The template shipped with the
 * shorthand "CT6 Wellbeing", which is not what the practice is called and not
 * what anyone searches for. The town is in the title deliberately — local
 * searches are nearly always "osteopath in <town>".
 */
const SITE_NAME = 'Osteopathy & Wellbeing @CT6';
const DEFAULT_TITLE = 'Osteopathy & Wellbeing @CT6 | Osteopath in Herne Bay, Kent';
const DEFAULT_DESCRIPTION =
  'Osteopathy, sports massage, acupuncture and rehabilitation in Herne Bay, Kent. Osteopaths registered with the General Osteopathic Council.';

interface Meta {
  title: string;
  description: string;
  noindex?: boolean;
}

const STATIC_META: Record<string, Meta> = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/treatments': {
    title: `Treatments — Osteopathy, Massage & Acupuncture | ${SITE_NAME}`,
    description:
      'Osteopathy, sports and therapeutic massage, acupuncture, footcare and rehabilitation. What each treatment involves, what it helps with, and how to book.',
  },
  '/practitioners': {
    title: `Our Practitioners — Registered Osteopaths & Therapists | ${SITE_NAME}`,
    description:
      'Meet the practitioners: their training, clinical interests and the conditions they treat. Registered, insured and accountable.',
  },
  '/faq': {
    title: `Osteopathy Questions Answered — Before Your First Visit | ${SITE_NAME}`,
    description:
      'Do you need a GP referral? Will treatment hurt? What should you wear? Straight answers about osteopathy, appointments and UK regulation.',
  },
  '/contact': {
    title: `Contact & Book an Appointment | ${SITE_NAME}`,
    description:
      'Get in touch with the clinic or book an appointment online. Ask a question before you book — we would rather answer it than have you guess.',
  },
  '/locations': {
    title: `Where to Find Us | ${SITE_NAME}`,
    description: 'Clinic locations, opening times and how to reach us.',
  },
  '/resources': {
    title: `Patient Resources & Self-Care Guides | ${SITE_NAME}`,
    description:
      'Guidance you can use between appointments: movement, posture, recovery and what to do when symptoms flare.',
  },
  '/gallery': {
    title: `Patient Guides & Clinic Gallery | ${SITE_NAME}`,
    description:
      'Illustrated guides to sciatica, spinal anatomy and recovery, plus a look inside the clinic.',
  },
  '/ai-consultant': {
    title: `AI Symptom Guide | ${SITE_NAME}`,
    description:
      'Describe your symptoms and get a preliminary steer on which treatment may suit — never a diagnosis, and never a substitute for seeing a clinician.',
  },
  '/dashboard': {
    title: `Your Progress | ${SITE_NAME}`,
    description: 'Track your rehabilitation progress between appointments.',
    noindex: true,
  },
};

/** Write a meta/link tag, creating it if the document does not have one yet. */
function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function resolve(pathname: string): Meta {
  if (STATIC_META[pathname]) return STATIC_META[pathname];

  const treatment = pathname.startsWith('/treatments/')
    ? TREATMENTS.find((t) => t.id === pathname.split('/')[2])
    : undefined;
  if (treatment) {
    return {
      title: `${treatment.title} in Kent | ${SITE_NAME}`,
      description: `${treatment.desc} What the treatment involves and how to book with a registered practitioner.`.slice(0, 300),
    };
  }

  const practitioner = pathname.startsWith('/practitioners/')
    ? PRACTITIONERS.find((p) => p.id === pathname.split('/')[2])
    : undefined;
  if (practitioner) {
    return {
      title: `${practitioner.name} — ${practitioner.role} | ${SITE_NAME}`,
      description: `${practitioner.name}, ${practitioner.role} at ${SITE_NAME}. Training, clinical interests and how to book an appointment.`,
    };
  }

  return { title: `Page not found | ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, noindex: true };
}

/**
 * Gives every route its own title, description and canonical address.
 *
 * The whole site previously shared one title and one description, so a search
 * result for the treatments page was indistinguishable from the homepage, and
 * every browser tab and bookmark read the same.
 */
export default function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolve(pathname);
    const url = `${window.location.origin}${pathname}`;

    document.title = meta.title;

    setTag('meta[name="description"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('name', 'description');
      return el;
    }, 'content', meta.description);

    setTag('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    }, 'href', url);

    setTag('meta[property="og:title"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:title');
      return el;
    }, 'content', meta.title);

    setTag('meta[property="og:description"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:description');
      return el;
    }, 'content', meta.description);

    setTag('meta[property="og:url"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('property', 'og:url');
      return el;
    }, 'content', url);

    setTag('meta[name="twitter:title"]', () => {
      const el = document.createElement('meta');
      el.setAttribute('name', 'twitter:title');
      return el;
    }, 'content', meta.title);

    /*
     * Breadcrumb trail for search results. Google renders this as a path under
     * the link instead of a bare URL, and it gives crawlers the hierarchy of a
     * site that has no server-rendered navigation.
     */
    const crumbs: { name: string; path: string }[] = [{ name: 'Home', path: '/' }];
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length) {
      const sectionLabels: Record<string, string> = {
        treatments: 'Treatments',
        practitioners: 'Practitioners',
        gallery: 'Patient Guides',
        resources: 'Resources',
        locations: 'Locations',
        contact: 'Contact',
        faq: 'Questions',
        'ai-consultant': 'AI Symptom Guide',
        dashboard: 'Your Progress',
      };
      crumbs.push({
        name: sectionLabels[segments[0]] ?? segments[0],
        path: `/${segments[0]}`,
      });
      if (segments.length > 1) {
        // Leaf pages are named after the thing itself, not the id in the URL.
        const leaf =
          TREATMENTS.find((t) => t.id === segments[1])?.title ??
          PRACTITIONERS.find((p) => p.id === segments[1])?.name ??
          segments[1];
        crumbs.push({ name: leaf, path: pathname });
      }
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: `${window.location.origin}${c.path}`,
      })),
    };

    let crumbScript = document.head.querySelector('script[data-breadcrumb]') as HTMLScriptElement | null;
    if (!crumbScript) {
      crumbScript = document.createElement('script');
      crumbScript.type = 'application/ld+json';
      crumbScript.setAttribute('data-breadcrumb', '');
      document.head.appendChild(crumbScript);
    }
    crumbScript.textContent = JSON.stringify(breadcrumbSchema);

    // Keep private views out of search results.
    const robots = document.head.querySelector('meta[name="robots"]');
    if (meta.noindex) {
      setTag('meta[name="robots"]', () => {
        const el = document.createElement('meta');
        el.setAttribute('name', 'robots');
        return el;
      }, 'content', 'noindex, follow');
    } else if (robots) {
      robots.setAttribute('content', 'index, follow');
    }
  }, [pathname]);

  return null;
}
