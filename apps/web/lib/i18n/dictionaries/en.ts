/**
 * Textos en inglés. Es el idioma principal y también el molde: el tipo
 * `Dictionary` sale de aquí, así que al español le falta una clave, no compila.
 *
 * Sin `as const` a propósito: con él cada texto sería un tipo literal y la
 * traducción no podría diferir del original.
 */
export const en = {
  nav: {
    home: "Home",
    about: "About",
    companies: "Companies",
    consulting: "Consulting",
    virtualOffice: "ALTEC VO",
    contact: "Contact",
    investorPortal: "Investor Portal",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    comingSoon: "coming soon",
    skipToContent: "Skip to content",
    language: "Language",
  },

  home: {
    meta: {
      title: "ALTEC Group — Advisory · Learning · Technology",
      description:
        "The business group that integrates consulting, education and technology to scale SMEs across Latin America. Five companies, one holding, a new category.",
    },
    eyebrow: "ALTEC Group",
    /** Dos líneas para el display gigante de portada. */
    displayLines: ["Advisory Learning", "Technology"],
    title: "Consulting, education and technology as a single system.",
    subtitle:
      "The business group that integrates the three industries that scale SMEs across Latin America.",
    ctaPrimary: "Meet the group",
    ctaSecondary: "Investor Portal",

    differentiator: {
      title: "We are not an existing category.",
      body: "ALTEC operates at the intersection of three industries that have historically been sold separately. We integrate them into a cycle where each one feeds the others.",
      cycleNote: "And the cycle starts over at Advisory.",
      stages: {
        advisory: "Strategic, commercial and technology consulting.",
        learning: "Executive education, certifications and events.",
        technology: "SaaS platforms, automation and AI agents.",
      },
    },

    companies: {
      eyebrow: "Our companies",
      title: "Five companies. One ecosystem.",
      body: "Each keeps its own brand, operation and domain. ALTEC connects them.",
      visit: "Visit site",
    },

    virtualOffice: {
      title: "A firm you can watch work.",
      body: "Every consulting role is an agent with personality, method and context. They work, they meet, they hand off work, and when something needs human judgment they bring it to a person. Eighty percent of the operation runs through agents; the remaining twenty is where you create value.",
      cta: "Explore ALTEC VO",
      liveLabel: "Live office · 12 agents",
      stats: {
        rooms: "rooms",
        agents: "agents",
        ratio: "agents / human",
        inbox: "decision inbox",
      },
    },

    stats: {
      eyebrow: "Traction",
      title: "Group numbers",
      assets: "assets appraised",
      automations: "automations built",
      agents: "AI agents built",
      systems: "systems delivered",
      states: "states covered",
      companies: "companies integrated",
    },

    vision: {
      eyebrow: "Ten-year vision",
      body: "By 2035, ALTEC will be the reference group in the ALT category across Latin America, present in five countries, with a network of more than five hundred certified consultants and a portfolio generating more than five hundred million pesos a year.",
    },
  },

  companies: {
    flowhub: {
      industry: "Technology & Commercial Intelligence",
      metric: "40+ systems · 1,300+ automations · 60+ AI agents",
    },
    scalex: {
      industry: "Scalability Consulting",
      metric: "Proprietary method · Published book · Platform with 4 tools",
    },
    avalluo: {
      industry: "Asset Appraisal",
      metric: "12,000+ assets appraised · 32 states · Proprietary technology",
    },
    boston: {
      industry: "Executive Education (EdTech)",
      metric: "Certified programs · Academic partnerships",
    },
    photocan: {
      industry: "Marketing & Audiovisual",
      metric: "Content production · Brand and communications",
    },
  },

  about: {
    meta: {
      title: "About",
      description:
        "The history, the team and the corporate governance behind ALTEC Group. From Monterrey to Mexico City, building the ALT category.",
    },
    title: "Five companies, one thesis.",
    history: {
      title: "The history",
      items: [
        { year: "2018", text: "Avalluo is founded in Monterrey. The group's first company." },
        { year: "2019", text: "Flow Hub is born as a software and automation factory." },
        { year: "2021", text: "ScaleX Latam launches its scalability method for SMEs." },
        { year: "2023", text: 'The book "Scaling Method for Latin American SMEs" is published.' },
        { year: "2024", text: "Boston Skilling Center is created. Photocan joins the ecosystem." },
        {
          year: "2026",
          text: "ALTEC Group SAPI de CV is incorporated. The five companies come together under a holding based in Mexico City.",
        },
      ],
    },
    thesis: {
      title: "The group's thesis",
      lead: "SMEs in Latin America face three problems at once: they do not sell well (advisory), they do not update their skills (learning) and they do not adopt technology in time (technology).",
      emphasis: "These problems are not solved one at a time. They are solved together.",
      body: "ALTEC exists because we believe an integrated business group — not a single company — is the right structure to attack all three fronts simultaneously.",
    },
    team: {
      title: "Founding team",
      members: [
        {
          name: "Agustín Lozano",
          role: "CEO & Founder",
          bio: "Creator of the five companies. Background in consulting, technology and executive education. Relocating to Mexico City to lead the group.",
        },
        {
          name: "Mario Moreno Cortés",
          role: "COO",
          bio: "Co-founder of Flow Hub and Avalluo. Operations and technology.",
        },
        {
          name: "Román Cantú",
          role: "CRO / Investor Relations",
          bio: "Institutional network. Business development.",
        },
        {
          name: "Gumaro Bracho",
          role: "Strategy Director",
          bio: "The group's strategic bet. Long-term vision.",
        },
      ],
    },
    governance: {
      title: "Corporate governance",
      body: "Three pillars that operate across every company in the group.",
      pillars: [
        {
          name: "OPSP",
          full: "One Page Strategic Plan",
          text: "A living strategic plan for each company, reviewed every quarter.",
        },
        {
          name: "Launch Gate",
          full: "Product validation system",
          text: "Twelve dimensions. Nothing is sold without passing through here.",
        },
        {
          name: "Forecast",
          full: "Capacity projection",
          text: "Team, talent and capacity projected twelve months out.",
        },
      ],
    },
  },

  contact: {
    meta: {
      title: "Contact",
      description:
        "Reach out about investment, consulting or strategic partnerships. Reforma 445, Mexico City.",
    },
    title: "Let's talk.",
    subtitle: "Investment, consulting, partnerships or press. Write to us and we'll reply.",
    form: {
      name: "Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      optional: "(optional)",
      inquiryType: "Type of inquiry",
      choose: "Choose an option",
      message: "Message",
      submit: "Send message",
      sending: "Sending…",
      successTitle: "Message sent.",
      successBody: "Thanks for writing. We'll get back to you shortly.",
      types: {
        investment: "Investment",
        consulting: "Consulting",
        partnership: "Strategic partnership",
        press: "Press",
        other: "Other",
      },
      errors: {
        name: "Enter your name.",
        company: "Enter your company name.",
        email: "Check the email address.",
        phone: "That phone number is too long.",
        inquiryType: "Choose a type of inquiry.",
        message: "Tell us a bit more (at least 10 characters).",
        review: "Check the highlighted fields.",
        send: "We couldn't send your message. Write to us directly at",
      },
    },
    office: "Office",
    legal:
      "All information on this site is confidential and the property of the group.",
  },

  virtualOffice: {
    meta: {
      title: "ALTEC VO · Virtual Office",
      description:
        "ALTEC's consulting firm run by AI agents, shown as a live office. Eighty percent of the operation runs through agents; the human twenty percent is reserved for judgment.",
    },
    title: "A firm you can watch work.",
    subtitle:
      "Every consulting role is an agent with personality, method and context. They work, they meet, they hand off work, and when something needs human judgment, they bring it to you.",
    hinge:
      "The office runs live. Pick a view, click any agent, or open the inbox when someone is waiting on your decision.",
    disclaimer: "Simulation of a full working day. Clients and figures are examples.",
    whyTitle: "Why an office and not a dashboard",
    whyBody:
      "The office is not decoration. It is how you see at a glance who is doing what, where work got stuck, and what needs a person.",
    principles: [
      {
        title: "The 80% that doesn't take your time",
        text: "Analytical, strategic and tactical work runs through agents and automations. Every task is logged with its owner, its client and its evidence.",
      },
      {
        title: "The 20% that is yours",
        text: "Judgment, client relationships, decisions that commit the firm, and being in the room. Nothing that commits money or reputation goes out without approval.",
      },
      {
        title: "The human is an explicit step",
        text: "When an agent needs a decision, it walks to the partner's office and waits in amber. Its work pauses and resumes with your instruction as context.",
      },
    ],
  },

  notFound: {
    code: "Error 404",
    title: "This page doesn't exist.",
    body: "We may have moved it, or it may not be published yet. The site is being built in phases.",
    cta: "Back to home",
  },

  footer: {
    tagline: "Advisory · Learning · Technology.",
    tagline2: "One holding, five companies, a new category.",
    site: "Site",
    companies: "Companies",
    contact: "Contact",
    legal:
      "— Mexico City, Mexico. All information on this site is confidential and the property of the group.",
  },
};

export type Dictionary = typeof en;
