/* tslint:disable */
/* eslint-disable */

export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji';

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  blocks: {};
  collections: {
    users: User;
    media: Media;
    industries: Industry;
    infrastructure: Infrastructure;
    workloads: Workload;
    applications: Application;
    'case-studies': CaseStudy;
    posts: Post;
    authors: Author;
    faqs: Faq;
    testimonials: Testimonial;
    partners: Partner;
    leads: Lead;
    'payload-kv': PayloadKv;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    industries: IndustriesSelect<false> | IndustriesSelect<true>;
    infrastructure: InfrastructureSelect<false> | InfrastructureSelect<true>;
    workloads: WorkloadsSelect<false> | WorkloadsSelect<true>;
    applications: ApplicationsSelect<false> | ApplicationsSelect<true>;
    'case-studies': CaseStudiesSelect<false> | CaseStudiesSelect<true>;
    posts: PostsSelect<false> | PostsSelect<true>;
    authors: AuthorsSelect<false> | AuthorsSelect<true>;
    faqs: FaqsSelect<false> | FaqsSelect<true>;
    testimonials: TestimonialsSelect<false> | TestimonialsSelect<true>;
    partners: PartnersSelect<false> | PartnersSelect<true>;
    leads: LeadsSelect<false> | LeadsSelect<true>;
    'payload-kv': PayloadKvSelect<false> | PayloadKvSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: number;
  };
  fallbackLocale: null;
  globals: {
    'site-settings': SiteSetting;
    navigation: Navigation;
    'cta-blocks': CtaBlock;
  };
  globalsSelect: {
    'site-settings': SiteSettingsSelect<false> | SiteSettingsSelect<true>;
    navigation: NavigationSelect<false> | NavigationSelect<true>;
    'cta-blocks': CtaBlocksSelect<false> | CtaBlocksSelect<true>;
  };
  locale: null;
  widgets: {
    collections: CollectionsWidget;
  };
  user: User;
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
export interface User {
  id: number;
  name?: string | null;
  role?: ('admin' | 'editor' | 'sales' | 'service') | null;
  updatedAt: string;
  createdAt: string;
  enableAPIKey?: boolean | null;
  apiKey?: string | null;
  apiKeyIndex?: string | null;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  sessions?:
    | {
        id: string;
        createdAt?: string | null;
        expiresAt: string;
      }[]
    | null;
  password?: string | null;
  collection: 'users';
}
export interface Media {
  id: number;
  alt: string;
  caption?: string | null;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
  sizes?: {
    thumbnail?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    card?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
    hero?: {
      url?: string | null;
      width?: number | null;
      height?: number | null;
      mimeType?: string | null;
      filesize?: number | null;
      filename?: string | null;
    };
  };
}
export interface Industry {
  id: number;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  heroImage?: (number | null) | Media;
  heroCopy?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  challenges?:
    | {
        title: string;
        description?: string | null;
        id?: string | null;
      }[]
    | null;
  workloads?: (number | Workload)[] | null;
  featuredApplications?: (number | Application)[] | null;
  requirementsNarrative?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  recommendedInfrastructure?: (number | Infrastructure)[] | null;
  possibleArchitecture?: {
    description?: {
      root: {
        type: string;
        children: {
          type: any;
          version: number;
          [k: string]: unknown;
        }[];
        direction: ('ltr' | 'rtl') | null;
        format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
        indent: number;
        version: number;
      };
      [k: string]: unknown;
    } | null;
    diagram?: (number | null) | Media;
  };
  caseStudies?: (number | CaseStudy)[] | null;
  faqs?: (number | Faq)[] | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    image?: (number | null) | Media;
    noIndex?: boolean | null;
  };
  updatedAt: string;
  createdAt: string;
}
export interface Workload {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  applications?: (number | Application)[] | null;
  requirementProfile?: {
    cpuIntensity?: ('low' | 'medium' | 'high' | 'extreme') | null;
    gpuIntensity?: ('none' | 'low' | 'medium' | 'high' | 'extreme') | null;
    vramMinGB?: number | null;
    ramMinGB?: number | null;
    storageType?: ('hdd' | 'sata-ssd' | 'nvme-ssd' | 'nvme-raid' | 'parallel-fs') | null;
    storageThroughput?: string | null;
    networkMin?: ('1gbe' | '10gbe' | '25gbe' | '100gbe' | 'infiniband') | null;
    scalingPattern?: ('single-workstation' | 'scale-up' | 'scale-out-cluster' | 'hybrid-cloud-burst') | null;
  };
  recommendedInfrastructure?: (number | Infrastructure)[] | null;
  industries?: (number | Industry)[] | null;
  updatedAt: string;
  createdAt: string;
}
export interface Application {
  id: number;
  name: string;
  slug?: string | null;
  vendor?: string | null;
  category?:
    | (
        | '3d-rendering'
        | 'simulation'
        | 'compositing-vfx'
        | 'cad-bim'
        | 'ai-ml'
        | 'trading-quant'
        | 'media-editing'
        | 'other'
      )
    | null;
  logo?: (number | null) | Media;
  workloads?: (number | Workload)[] | null;
  optimisationNotes?: string | null;
  certifiedHardware?: (number | Infrastructure)[] | null;
  updatedAt: string;
  createdAt: string;
}
export interface Infrastructure {
  id: number;
  name: string;
  slug?: string | null;
  category: 'compute' | 'storage' | 'networking' | 'data-protection';
  parent?: (number | null) | Infrastructure;
  summary?: string | null;
  overview?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  useCases?:
    | {
        title: string;
        description?: string | null;
        id?: string | null;
      }[]
    | null;
  capabilities?:
    | {
        text: string;
        id?: string | null;
      }[]
    | null;
  businessValue?:
    | {
        text: string;
        id?: string | null;
      }[]
    | null;
  suitedWorkloads?: (number | Workload)[] | null;
  relatedIndustries?: (number | Industry)[] | null;
  heroImage?: (number | null) | Media;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    image?: (number | null) | Media;
    noIndex?: boolean | null;
  };
  updatedAt: string;
  createdAt: string;
}
export interface CaseStudy {
  id: number;
  title: string;
  slug?: string | null;
  clientName?: string | null;
  clientAnonymous?: boolean | null;
  industry?: (number | null) | Industry;
  coverImage?: (number | null) | Media;
  summary?: string | null;
  challenge?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  approach?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  infrastructureDeployed?: (number | Infrastructure)[] | null;
  results?:
    | {
        metric: string;
        before?: string | null;
        after?: string | null;
        id?: string | null;
      }[]
    | null;
  quote?: {
    text?: string | null;
    person?: string | null;
    role?: string | null;
  };
  publishedAt?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    image?: (number | null) | Media;
    noIndex?: boolean | null;
  };
  updatedAt: string;
  createdAt: string;
}
export interface Faq {
  id: number;
  question: string;
  answer: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  };
  scope?: ('global' | 'industry' | 'infrastructure') | null;
  updatedAt: string;
  createdAt: string;
}
export interface Post {
  id: number;
  title: string;
  slug?: string | null;
  type: 'blog' | 'insight';
  excerpt?: string | null;
  coverImage?: (number | null) | Media;
  body?: {
    root: {
      type: string;
      children: {
        type: any;
        version: number;
        [k: string]: unknown;
      }[];
      direction: ('ltr' | 'rtl') | null;
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | '';
      indent: number;
      version: number;
    };
    [k: string]: unknown;
  } | null;
  author?: (number | null) | Author;
  tags?:
    | {
        tag: string;
        id?: string | null;
      }[]
    | null;
  relatedIndustries?: (number | Industry)[] | null;
  relatedInfrastructure?: (number | Infrastructure)[] | null;
  publishedAt?: string | null;
  bodyMarkdown?: string | null;
  readingMinutes?: number | null;
  faqs?:
    | {
        question: string;
        answer: string;
        id?: string | null;
      }[]
    | null;
  schemaJson?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string | null;
    image?: (number | null) | Media;
    noIndex?: boolean | null;
  };
  updatedAt: string;
  createdAt: string;
}
export interface Author {
  id: number;
  name: string;
  role?: string | null;
  bio?: string | null;
  photo?: (number | null) | Media;
  linkedin?: string | null;
  updatedAt: string;
  createdAt: string;
}
export interface Testimonial {
  id: number;
  quote: string;
  person: string;
  role?: string | null;
  company?: string | null;
  logo?: (number | null) | Media;
  industry?: (number | null) | Industry;
  updatedAt: string;
  createdAt: string;
}
export interface Partner {
  id: number;
  name: string;
  logo: number | Media;
  tier?: ('oem' | 'partner' | 'distributor') | null;
  categories?: (number | Infrastructure)[] | null;
  updatedAt: string;
  createdAt: string;
}
export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  industry?: (number | null) | Industry;
  interestedInfrastructure?: (number | Infrastructure)[] | null;
  workloadDescription?: string | null;
  applicationsUsed?: string | null;
  companySize?: ('1-10' | '11-50' | '51-200' | '201-500' | '500+') | null;
  message?: string | null;
  source?: {
    sourceUrl?: string | null;
    referrer?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmTerm?: string | null;
  };
  status?: ('new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost') | null;
  assignedTo?: (number | null) | User;
  internalNotes?:
    | {
        note: string;
        author?: (number | null) | User;
        date?: string | null;
        id?: string | null;
      }[]
    | null;
  updatedAt: string;
  createdAt: string;
}
export interface PayloadKv {
  id: number;
  key: string;
  data:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
}
export interface PayloadLockedDocument {
  id: number;
  document?:
    | ({
        relationTo: 'users';
        value: number | User;
      } | null)
    | ({
        relationTo: 'media';
        value: number | Media;
      } | null)
    | ({
        relationTo: 'industries';
        value: number | Industry;
      } | null)
    | ({
        relationTo: 'infrastructure';
        value: number | Infrastructure;
      } | null)
    | ({
        relationTo: 'workloads';
        value: number | Workload;
      } | null)
    | ({
        relationTo: 'applications';
        value: number | Application;
      } | null)
    | ({
        relationTo: 'case-studies';
        value: number | CaseStudy;
      } | null)
    | ({
        relationTo: 'posts';
        value: number | Post;
      } | null)
    | ({
        relationTo: 'authors';
        value: number | Author;
      } | null)
    | ({
        relationTo: 'faqs';
        value: number | Faq;
      } | null)
    | ({
        relationTo: 'testimonials';
        value: number | Testimonial;
      } | null)
    | ({
        relationTo: 'partners';
        value: number | Partner;
      } | null)
    | ({
        relationTo: 'leads';
        value: number | Lead;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  updatedAt: string;
  createdAt: string;
}
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
export interface UsersSelect<T extends boolean = true> {
  name?: T;
  role?: T;
  updatedAt?: T;
  createdAt?: T;
  enableAPIKey?: T;
  apiKey?: T;
  apiKeyIndex?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
  sessions?:
    | T
    | {
        id?: T;
        createdAt?: T;
        expiresAt?: T;
      };
}
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  caption?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        card?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
        hero?:
          | T
          | {
              url?: T;
              width?: T;
              height?: T;
              mimeType?: T;
              filesize?: T;
              filename?: T;
            };
      };
}
export interface IndustriesSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  tagline?: T;
  heroImage?: T;
  heroCopy?: T;
  challenges?:
    | T
    | {
        title?: T;
        description?: T;
        id?: T;
      };
  workloads?: T;
  featuredApplications?: T;
  requirementsNarrative?: T;
  recommendedInfrastructure?: T;
  possibleArchitecture?:
    | T
    | {
        description?: T;
        diagram?: T;
      };
  caseStudies?: T;
  faqs?: T;
  seo?:
    | T
    | {
        title?: T;
        description?: T;
        image?: T;
        noIndex?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
export interface InfrastructureSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  category?: T;
  parent?: T;
  summary?: T;
  overview?: T;
  useCases?:
    | T
    | {
        title?: T;
        description?: T;
        id?: T;
      };
  capabilities?:
    | T
    | {
        text?: T;
        id?: T;
      };
  businessValue?:
    | T
    | {
        text?: T;
        id?: T;
      };
  suitedWorkloads?: T;
  relatedIndustries?: T;
  heroImage?: T;
  seo?:
    | T
    | {
        title?: T;
        description?: T;
        image?: T;
        noIndex?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
export interface WorkloadsSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  description?: T;
  applications?: T;
  requirementProfile?:
    | T
    | {
        cpuIntensity?: T;
        gpuIntensity?: T;
        vramMinGB?: T;
        ramMinGB?: T;
        storageType?: T;
        storageThroughput?: T;
        networkMin?: T;
        scalingPattern?: T;
      };
  recommendedInfrastructure?: T;
  industries?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface ApplicationsSelect<T extends boolean = true> {
  name?: T;
  slug?: T;
  vendor?: T;
  category?: T;
  logo?: T;
  workloads?: T;
  optimisationNotes?: T;
  certifiedHardware?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface CaseStudiesSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  clientName?: T;
  clientAnonymous?: T;
  industry?: T;
  coverImage?: T;
  summary?: T;
  challenge?: T;
  approach?: T;
  infrastructureDeployed?: T;
  results?:
    | T
    | {
        metric?: T;
        before?: T;
        after?: T;
        id?: T;
      };
  quote?:
    | T
    | {
        text?: T;
        person?: T;
        role?: T;
      };
  publishedAt?: T;
  seo?:
    | T
    | {
        title?: T;
        description?: T;
        image?: T;
        noIndex?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
export interface PostsSelect<T extends boolean = true> {
  title?: T;
  slug?: T;
  type?: T;
  excerpt?: T;
  coverImage?: T;
  body?: T;
  author?: T;
  tags?:
    | T
    | {
        tag?: T;
        id?: T;
      };
  relatedIndustries?: T;
  relatedInfrastructure?: T;
  publishedAt?: T;
  seo?:
    | T
    | {
        title?: T;
        description?: T;
        image?: T;
        noIndex?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
export interface AuthorsSelect<T extends boolean = true> {
  name?: T;
  role?: T;
  bio?: T;
  photo?: T;
  linkedin?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface FaqsSelect<T extends boolean = true> {
  question?: T;
  answer?: T;
  scope?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface TestimonialsSelect<T extends boolean = true> {
  quote?: T;
  person?: T;
  role?: T;
  company?: T;
  logo?: T;
  industry?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface PartnersSelect<T extends boolean = true> {
  name?: T;
  logo?: T;
  tier?: T;
  categories?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface LeadsSelect<T extends boolean = true> {
  name?: T;
  company?: T;
  email?: T;
  phone?: T;
  industry?: T;
  interestedInfrastructure?: T;
  workloadDescription?: T;
  applicationsUsed?: T;
  companySize?: T;
  message?: T;
  source?:
    | T
    | {
        sourceUrl?: T;
        referrer?: T;
        utmSource?: T;
        utmMedium?: T;
        utmCampaign?: T;
        utmTerm?: T;
      };
  status?: T;
  assignedTo?: T;
  internalNotes?:
    | T
    | {
        note?: T;
        author?: T;
        date?: T;
        id?: T;
      };
  updatedAt?: T;
  createdAt?: T;
}
export interface PayloadKvSelect<T extends boolean = true> {
  key?: T;
  data?: T;
}
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
export interface SiteSetting {
  id: number;
  siteName?: string | null;
  tagline?: string | null;
  logo?: (number | null) | Media;
  logoDark?: (number | null) | Media;
  contact?: {
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  social?:
    | {
        platform?: ('linkedin' | 'twitter' | 'youtube' | 'instagram') | null;
        url?: string | null;
        id?: string | null;
      }[]
    | null;
  defaultSeo?: {
    title?: string | null;
    description?: string | null;
    image?: (number | null) | Media;
  };
  updatedAt?: string | null;
  createdAt?: string | null;
}
export interface Navigation {
  id: number;
  footerColumns?:
    | {
        heading: string;
        links?:
          | {
              label: string;
              href: string;
              id?: string | null;
            }[]
          | null;
        id?: string | null;
      }[]
    | null;
  footerNote?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
export interface CtaBlock {
  id: number;
  blocks?:
    | {
        key: string;
        heading: string;
        subtext?: string | null;
        primaryLabel?: string | null;
        primaryHref?: string | null;
        secondaryLabel?: string | null;
        secondaryHref?: string | null;
        id?: string | null;
      }[]
    | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}
export interface SiteSettingsSelect<T extends boolean = true> {
  siteName?: T;
  tagline?: T;
  logo?: T;
  logoDark?: T;
  contact?:
    | T
    | {
        email?: T;
        phone?: T;
        address?: T;
      };
  social?:
    | T
    | {
        platform?: T;
        url?: T;
        id?: T;
      };
  defaultSeo?:
    | T
    | {
        title?: T;
        description?: T;
        image?: T;
      };
  updatedAt?: T;
  createdAt?: T;
  globalType?: T;
}
export interface NavigationSelect<T extends boolean = true> {
  footerColumns?:
    | T
    | {
        heading?: T;
        links?:
          | T
          | {
              label?: T;
              href?: T;
              id?: T;
            };
        id?: T;
      };
  footerNote?: T;
  updatedAt?: T;
  createdAt?: T;
  globalType?: T;
}
export interface CtaBlocksSelect<T extends boolean = true> {
  blocks?:
    | T
    | {
        key?: T;
        heading?: T;
        subtext?: T;
        primaryLabel?: T;
        primaryHref?: T;
        secondaryLabel?: T;
        secondaryHref?: T;
        id?: T;
      };
  updatedAt?: T;
  createdAt?: T;
  globalType?: T;
}
export interface CollectionsWidget {
  data?: {
    [k: string]: unknown;
  };
  width: 'full';
}
export interface Auth {
  [k: string]: unknown;
}

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}