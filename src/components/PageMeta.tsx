import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TREATMENTS, PRACTITIONERS } from '../data';
import { CLINIC } from '../data/clinic';

/**
 * The practice's trading name. The template shipped with the shorthand "CT6
 * Wellbeing", which is not what the practice is called and not what anyone
 * searches for. The town is in the title deliberately — local searches are
 * nearly always "osteopath in <town>".
 */
const SITE_NAME = CLINIC.name;
const DEFAULT_TITLE = `${SITE_NAME} | Osteopath in Herne Bay, Kent`;
const DEFAULT_DESCRIPTION =
  'Osteopathy, massage, acupuncture, foot care and hypnotherapy in Herne Bay, Kent. Osteopaths registered with the General Osteopathic Council.';

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
      'Osteopathy, massage, acupuncture, foot care and hypnotherapy. What each treatment involves, what it helps with, and how to book.',
  },
  '/practitioners': {
    /* Only the osteopaths are GOsC-registered; the title used to say
       "Registered Osteopaths & Therapists", which claimed it for everyone.
       The description below names who is registered, and with whom. */
    title: `Our Practitioners — Osteopaths & Therapists | ${SITE_NAME}`,
    description:
      'Meet the practitioners: their training, their interests and what they treat. Our osteopaths are registered with the General Osteopathic Council.',
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
    description: `The clinic at ${CLINIC.address.line1}, ${CLINIC.address.town}: opening times and how to reach us.`,
  },
  /*
   * Descriptions say what each page actually holds. /resources promised
   * "movement, posture, recovery and what to do when symptoms flare" and
   * "self-care guides" it has never had; /gallery promised "a look inside the
   * clinic", which was a still picture and a stock photo; /dashboard promised
   * to "track your progress", and it saves nothing.
   */
  '/resources': {
    title: `Patient Resources — Films, a Guide & Answers | ${SITE_NAME}`,
    description:
      'Short films from the clinic, a patient guide to sciatica, straight answers to common questions, and who to call in an emergency.',
  },
  '/gallery': {
    title: `Patient Guides & a Film from the Clinic | ${SITE_NAME}`,
    description:
      "Illustrated guides to sciatica, neck-related headaches, joint pain and posture, plus a short film from the clinic's own YouTube channel.",
  },
  '/dashboard': {
    title: `Recovery Tools (preview) | ${SITE_NAME}`,
    description:
      'A preview of self-help tools: try the sliders and checklist, and print a summary to bring to your appointment.',
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
      title: `${treatment.title} in Herne Bay, Kent | ${SITE_NAME}`,
      description: `${treatment.desc} What the treatment involves and how to book at the Herne Bay clinic.`.slice(0, 300),
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
  const { pathname: rawPathname } = useLocation();
  /*
   * "/practitioners/" and "/practitioners" are the same page, and the
   * clinic's old website used the trailing-slash form, so links to it are
   * everywhere. Without this, "/practitioners/" showed the team but told
   * search engines it was "Page not found" and not to index it.
   */
  const pathname = rawPathname.length > 1 ? rawPathname.replace(/\/+$/, '') || '/' : rawPathname;

  useEffect(() => {
    const meta = resolve(pathname);
    /*
     * THE ONE ADDRESS, NOT WHICHEVER ADDRESS THIS WAS OPENED ON.
     *
     * This used window.location.origin, so every page named the host it
     * happened to be served from as its official copy: the temporary
     * hostingersite.com address, a www or http variant, even localhost. Once
     * the noindex guard comes off, any of those would compete with the
     * clinic's own domain in search. index.html's canonical is CLINIC.website;
     * so is this.
     */
    const url = `${CLINIC.website}${pathname}`;

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
        dashboard: 'Recovery Tools',
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
        item: `${CLINIC.website}${c.path}`,
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

    /*
     * THE STAGING GUARD IS NOT OURS TO TOUCH.
     *
     * index.html carries <meta name="robots" content="noindex"
     * data-staging-guard> so a temporary host cannot be indexed and compete
     * with the clinic in search. The else-branch below used to flip ANY
     * existing robots tag to "index, follow" on every ordinary page — which
     * undid that guard the moment a crawler ran the page's JavaScript, and
     * Google runs it. The comment in index.html already promised this check
     * existed; now it does.
     */
    if (robots?.hasAttribute('data-staging-guard')) return;
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
