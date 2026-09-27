import type { Dictionary } from "./en";

export const es: Dictionary = {
  nav: {
    home: "Home",
    about: "Nosotros",
    companies: "Empresas",
    consulting: "Consultoría",
    virtualOffice: "ALTEC VO",
    contact: "Contacto",
    investorPortal: "Portal Inversionista",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    comingSoon: "próximamente",
    skipToContent: "Saltar al contenido",
    language: "Idioma",
  },

  home: {
    meta: {
      title: "ALTEC Group — Advisory · Learning · Technology",
      description:
        "Grupo empresarial que integra consultoría, educación y tecnología para escalar PyMEs en Latinoamérica. Cinco empresas, un holding, una categoría nueva.",
    },
    eyebrow: "ALTEC Group",
    displayLines: ["Advisory Learning", "Technology"],
    title: "Consultoría, educación y tecnología como un solo sistema.",
    subtitle:
      "El grupo empresarial que integra las tres industrias que escalan PyMEs en Latinoamérica.",
    ctaPrimary: "Conoce el grupo",
    ctaSecondary: "Portal del Inversionista",

    differentiator: {
      title: "No somos una categoría existente.",
      body: "ALTEC opera en la intersección de tres industrias que históricamente se venden por separado. Nosotros las integramos en un ciclo donde cada una alimenta a las demás.",
      cycleNote: "Y el ciclo vuelve a empezar en Advisory.",
      stages: {
        advisory: "Consultoría estratégica, comercial y tecnológica.",
        learning: "Educación ejecutiva, certificaciones y eventos.",
        technology: "Plataformas SaaS, automatización y agentes de IA.",
      },
    },

    companies: {
      eyebrow: "Nuestras empresas",
      title: "Cinco compañías. Un ecosistema.",
      body: "Cada una mantiene su marca, su operación y su dominio. ALTEC las conecta.",
      visit: "Visitar sitio",
    },

    virtualOffice: {
      title: "Una firma que puedes ver trabajar.",
      body: "Cada rol de la consultoría es un agente con personalidad, método y contexto. Trabajan, se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, lo traen a una persona. El ochenta por ciento de la operación pasa por agentes; el veinte restante es donde tú creas valor.",
      cta: "Conocer ALTEC VO",
      liveLabel: "Oficina en vivo · 12 agentes",
      stats: {
        rooms: "salas",
        agents: "agentes",
        ratio: "agentes / humano",
        inbox: "bandeja de decisiones",
      },
    },

    stats: {
      eyebrow: "Tracción",
      title: "Números del grupo",
      assets: "activos valuados",
      automations: "automatizaciones creadas",
      agents: "agentes de IA construidos",
      systems: "sistemas entregados",
      states: "estados con presencia",
      companies: "empresas integradas",
    },

    vision: {
      eyebrow: "Visión a 10 años",
      body: "Para 2035, ALTEC será el grupo de referencia en la categoría ALT en Latinoamérica, con presencia en cinco países, una red de más de quinientos consultores certificados y un portafolio que genere más de quinientos millones de pesos anuales.",
    },
  },

  companies: {
    flowhub: {
      industry: "Tecnología e Inteligencia Comercial",
      metric: "+40 sistemas · +1,300 automatizaciones · +60 agentes IA",
    },
    scalex: {
      industry: "Consultoría de Escalabilidad",
      metric: "Método propio · Libro publicado · Plataforma con 4 herramientas",
    },
    avalluo: {
      industry: "Valuación de Activos",
      metric: "+12,000 activos valuados · 32 estados · Tecnología propia",
    },
    boston: {
      industry: "Educación Ejecutiva (EdTech)",
      metric: "Programas certificados · Alianzas académicas",
    },
    photocan: {
      industry: "Marketing y Audiovisual",
      metric: "Producción de contenido · Marca y comunicación",
    },
  },

  about: {
    meta: {
      title: "Nosotros",
      description:
        "La historia, el equipo y el gobierno corporativo detrás del grupo ALTEC. Desde Monterrey hasta CDMX, construyendo la categoría ALT.",
    },
    title: "Cinco empresas, una tesis.",
    history: {
      title: "La historia",
      items: [
        { year: "2018", text: "Se funda Avalluo en Monterrey. Primera empresa del futuro grupo." },
        { year: "2019", text: "Nace Flow Hub como fábrica de software y automatizaciones." },
        { year: "2021", text: "ScaleX Latam lanza su método de escalabilidad para PyMEs." },
        { year: "2023", text: 'Se publica el libro "Método de Escala para PyMEs Latinoamericanas".' },
        { year: "2024", text: "Se crea Boston Skilling Center. Photocan se integra al ecosistema." },
        {
          year: "2026",
          text: "Se constituye ALTEC Group SAPI de CV. Las cinco empresas se integran bajo un holding con sede en CDMX.",
        },
      ],
    },
    thesis: {
      title: "Tesis del grupo",
      lead: "Las PyMEs en Latinoamérica enfrentan tres problemas simultáneos: no saben vender bien (advisory), no actualizan sus competencias (learning) y no adoptan tecnología a tiempo (technology).",
      emphasis: "Estos problemas no se resuelven uno a la vez. Se resuelven juntos.",
      body: "ALTEC existe porque creemos que un grupo empresarial integrado — no una sola empresa — es la estructura correcta para atacar estos tres frentes al mismo tiempo.",
    },
    team: {
      title: "Equipo fundador",
      members: [
        {
          name: "Agustín Lozano",
          role: "CEO & Founder",
          bio: "Creador de las cinco empresas. Experiencia en consultoría, tecnología y educación ejecutiva. Reubicación a CDMX para dirigir el grupo.",
        },
        {
          name: "Mario Moreno Cortés",
          role: "COO",
          bio: "Cofundador de Flow Hub y Avalluo. Operación y tecnología.",
        },
        {
          name: "Román Cantú",
          role: "CRO / Relaciones con Inversionistas",
          bio: "Red de contactos institucionales. Desarrollo de negocio.",
        },
        {
          name: "Gumaro Bracho",
          role: "Director de Estrategia",
          bio: "Apuesta estratégica del grupo. Visión de largo plazo.",
        },
      ],
    },
    governance: {
      title: "Gobierno corporativo",
      body: "Tres pilares que operan en todas las empresas del grupo.",
      pillars: [
        {
          name: "OPSP",
          full: "One Page Strategic Plan",
          text: "Plan estratégico vivo de cada empresa, revisado trimestralmente.",
        },
        {
          name: "Launch Gate",
          full: "Sistema de validación de productos",
          text: "Doce dimensiones. Nada se vende sin pasar por aquí.",
        },
        {
          name: "Forecast",
          full: "Proyección de capacidad",
          text: "Proyección de equipo, talento y capacidad a doce meses.",
        },
      ],
    },
  },

  contact: {
    meta: {
      title: "Contacto",
      description:
        "Contáctanos para inversión, consultoría o alianzas estratégicas. Reforma 445, CDMX, México.",
    },
    title: "Hablemos.",
    subtitle: "Inversión, consultoría, alianzas o prensa. Escríbenos y te respondemos.",
    form: {
      name: "Nombre",
      company: "Empresa",
      email: "Correo electrónico",
      phone: "Teléfono",
      optional: "(opcional)",
      inquiryType: "Tipo de consulta",
      choose: "Elige una opción",
      message: "Mensaje",
      submit: "Enviar mensaje",
      sending: "Enviando…",
      successTitle: "Mensaje enviado.",
      successBody: "Gracias por escribirnos. Te respondemos en breve.",
      types: {
        investment: "Inversión",
        consulting: "Consultoría",
        partnership: "Alianza estratégica",
        press: "Prensa",
        other: "Otro",
      },
      errors: {
        name: "Escribe tu nombre.",
        company: "Escribe el nombre de tu empresa.",
        email: "Revisa el correo electrónico.",
        phone: "El teléfono es demasiado largo.",
        inquiryType: "Elige un tipo de consulta.",
        message: "Cuéntanos un poco más (mínimo 10 caracteres).",
        review: "Revisa los campos marcados.",
        send: "No pudimos enviar el mensaje. Escríbenos directo a",
      },
    },
    office: "Oficina",
    legal: "Toda la información de este sitio es confidencial y propiedad del grupo.",
  },

  virtualOffice: {
    meta: {
      title: "ALTEC VO · Oficina Virtual",
      description:
        "La firma de consultoría de ALTEC operada por agentes de IA, representada como una oficina en tiempo real. El 80% de la operación pasa por agentes; el 20% humano se reserva para el criterio.",
    },
    title: "Una firma que puedes ver trabajar.",
    subtitle:
      "Cada rol de la consultoría es un agente con personalidad, método y contexto. Trabajan, se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, te lo traen.",
    hinge:
      "La oficina corre en vivo. Elige una vista, haz clic en cualquier agente o abre la bandeja cuando alguien espere tu decisión.",
    disclaimer: "Simulación de una jornada completa. Clientes y cifras son de ejemplo.",
    whyTitle: "Por qué una oficina y no un tablero",
    whyBody:
      "La oficina no es decoración. Es la forma de ver de un vistazo quién está haciendo qué, dónde se atoró el trabajo y qué necesita de una persona.",
    principles: [
      {
        title: "El 80% que no te quita tiempo",
        text: "La operación analítica, estratégica y táctica pasa por agentes y automatizaciones. Cada tarea queda registrada con su dueño, su cliente y su evidencia.",
      },
      {
        title: "El 20% que sí es tuyo",
        text: "Criterio, relación con el cliente, decisiones que comprometen a la firma y presencia en campo. Nada que comprometa dinero o reputación sale sin aprobación.",
      },
      {
        title: "El humano es un paso del flujo",
        text: "Cuando un agente necesita una decisión, camina a la oficina del socio y espera en ámbar. Su trabajo se pausa y se reanuda con tu instrucción como contexto.",
      },
    ],
  },

  notFound: {
    code: "Error 404",
    title: "Esta página no existe.",
    body: "Puede que la hayamos movido, o que todavía no la publiquemos. El sitio se está construyendo por fases.",
    cta: "Volver al inicio",
  },

  footer: {
    tagline: "Advisory · Learning · Technology.",
    tagline2: "Un holding, cinco empresas, una categoría nueva.",
    site: "Sitio",
    companies: "Empresas",
    contact: "Contacto",
    legal:
      "— CDMX, México. Toda la información de este sitio es confidencial y propiedad del grupo.",
  },
};
