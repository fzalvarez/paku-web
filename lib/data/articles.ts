import type { Article } from "@/lib/blog";

/**
 * Artículos del blog. Para publicar uno nuevo: agregarlo aquí (slug único, fechas
 * ISO, categoría de `CATEGORIES` en `lib/blog.ts`). La ruta, el sitemap, el RSS y
 * las páginas de categoría se generan solos.
 *
 * Contenido informativo general: los artículos de salud deben revisarse con un
 * veterinario antes de publicarse.
 */
export const ARTICLES: Article[] = [
  // ── Nuevos (2026-10) ────────────────────────────────────────────────────────
  {
    slug: "edad-de-los-perros-en-anos-humanos",
    title: "¿Cuántos años tiene tu perro en años humanos?",
    excerpt:
      "La regla de multiplicar por 7 es un mito. Te contamos cómo envejecen de verdad los perros y qué cuidados necesita cada etapa.",
    category: "salud",
    tags: ["perros", "cachorros", "senior"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1200&q=80",
    imageAlt: "Cachorro pastor australiano echado sobre la tierra mirando a la cámara",
    takeaways: [
      "Multiplicar por 7 no funciona: los perros maduran muy rápido los dos primeros años.",
      "Las razas grandes envejecen antes que las pequeñas.",
      "Cada etapa pide cuidados distintos: socializar al cachorro y adaptar el ritmo del senior.",
    ],
    blocks: [
      {
        type: "p",
        text: "Seguro lo has escuchado: “un año de perro equivale a siete años humanos”. Es una regla fácil de recordar, pero no describe bien cómo envejecen. Un perro de un año ya puede tener crías y un cuerpo casi adulto, algo que ningún niño de siete años tiene.",
      },
      { type: "h2", text: "Por qué la regla del 7 no funciona" },
      {
        type: "p",
        text: "Los perros maduran muy rápido al principio y luego más despacio. Como referencia general, el primer año de vida equivale a unos 15 años humanos y el segundo suma otros 9, así que un perro de dos años estaría alrededor de los 24. A partir de ahí, cada año suma aproximadamente entre 4 y 5 años humanos en razas pequeñas y medianas, y algo más en razas grandes y gigantes.",
      },
      {
        type: "p",
        text: "En 2019, un equipo de la Universidad de California en San Diego propuso una fórmula basada en cambios del ADN de labradores: edad humana ≈ 16 × ln(edad del perro) + 31. Es curiosa, pero se estudió en una sola raza: tómala como una aproximación, no como un cálculo exacto.",
      },
      { type: "h2", text: "El tamaño cambia todo" },
      {
        type: "p",
        text: "Un chihuahua y un gran danés de la misma edad no están en la misma etapa. Las razas grandes y gigantes viven menos y llegan antes a la vejez; las pequeñas suelen tener una vida más larga. Por eso, en general, se considera senior a un perro grande desde los 7 años y a uno pequeño desde los 10, aproximadamente.",
      },
      { type: "h2", text: "Cuidados según la etapa" },
      {
        type: "ul",
        items: [
          "Cachorro (hasta ~1 año; en razas gigantes, hasta los 18–24 meses): es el momento de socializar y acostumbrarlo a que le toquen las patas, las orejas y la boca. Eso hará que el baño y el corte de uñas sean un trámite tranquilo toda su vida.",
          "Adulto: rutina estable de ejercicio, alimentación y aseo. Es la etapa ideal para detectar a tiempo cambios en la piel, el peso o el pelaje.",
          "Senior: sesiones de baño más cortas y tranquilas, superficies que no resbalen, agua tibia y mucho cuidado al manipular articulaciones. Revisa bultos nuevos y cambios de comportamiento.",
        ],
      },
      {
        type: "tip",
        text: "Si tu perro senior se cansa o se pone nervioso durante el baño, divide los cuidados en sesiones más cortas y pide que lo manipulen con calma.",
      },
      { type: "h2", text: "Señales de que está envejeciendo" },
      {
        type: "p",
        text: "Hocico con canas, más horas de sueño, menos ganas de jugar, rigidez al levantarse o cambios en la vista y el oído son normales con los años. Lo que no es normal es que aparezcan de golpe: ante cualquier cambio brusco, consulta con tu veterinario.",
      },
    ],
  },
  {
    slug: "cuanto-duerme-un-perro",
    title: "¿Cuánto duerme tu perro y por qué sueña?",
    excerpt:
      "Los perros duermen mucho más que nosotros, y también sueñan. Descubre cuántas horas son normales y cuándo prestar atención.",
    category: "comportamiento",
    tags: ["perros", "sueño", "cachorros", "senior"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?w=1200&q=80",
    imageAlt: "Perro de pelo rojizo descansando en su cama junto a unas plantas",
    takeaways: [
      "Un perro adulto duerme entre 12 y 14 horas al día; cachorros y seniors, más.",
      "Mover las patas o gemir dormido es normal: está soñando.",
      "Un cambio brusco en sus horas de sueño merece una visita al veterinario.",
    ],
    blocks: [
      {
        type: "p",
        text: "Si sientes que tu perro se pasa el día durmiendo, no estás exagerando. Los perros necesitan bastante más sueño que las personas, y lo reparten en varias siestas a lo largo del día y la noche.",
      },
      { type: "h2", text: "¿Cuántas horas es normal?" },
      {
        type: "ul",
        items: [
          "Perro adulto: entre 12 y 14 horas al día, en promedio.",
          "Cachorros: pueden llegar a 18–20 horas; dormir es parte de su crecimiento.",
          "Seniors: también duermen más y se cansan antes.",
          "Razas grandes y perros muy activos suelen necesitar más descanso después del ejercicio.",
        ],
      },
      { type: "h2", text: "Sí, los perros sueñan" },
      {
        type: "p",
        text: "Igual que nosotros, los perros pasan por una fase de sueño profundo llamada REM. Ahí es cuando verás que mueven las patas como si corrieran, mueven los ojos bajo los párpados, gimen o hasta ladran bajito. Es normal: muy probablemente está repasando lo que vivió en el día.",
      },
      {
        type: "tip",
        text: "No lo despiertes de golpe mientras sueña: puede asustarse. Si necesitas despertarlo, llámalo por su nombre con voz suave.",
      },
      { type: "h2", text: "¿Por qué duerme pegado a ti?" },
      {
        type: "p",
        text: "Los perros son animales sociales y descansan más tranquilos cerca de su grupo, que hoy es su familia humana. Que elija dormir a tus pies o en la puerta de tu cuarto es una muestra de confianza. Si duerme o no en tu cama es una decisión de cada casa; lo importante es que tenga también su propio lugar cómodo y tranquilo.",
      },
      { type: "h2", text: "Cómo ayudarlo a descansar mejor" },
      {
        type: "ul",
        items: [
          "Una cama propia, lejos de corrientes de aire y del paso constante de la casa.",
          "Horarios estables de paseo, comida y descanso.",
          "Ejercicio y juego suficientes durante el día.",
          "Un último paseo corto antes de dormir.",
        ],
      },
      { type: "h2", text: "Cuándo consultar al veterinario" },
      {
        type: "p",
        text: "Presta atención si de pronto duerme mucho más (o mucho menos) que de costumbre, le cuesta levantarse, ronca muy fuerte cuando antes no lo hacía o parece que le falta el aire al dormir. Los perros de hocico chato, como bulldogs y pugs, son más propensos a problemas respiratorios durante el sueño.",
      },
    ],
  },
  {
    slug: "sentido-de-manada-en-perros",
    title: "Tu perro y su manada: por qué necesita sentirse parte de la familia",
    excerpt:
      "Para tu perro, tu familia es su grupo. Entender ese sentido de pertenencia ayuda a que viva más tranquilo y seguro.",
    category: "comportamiento",
    tags: ["perros", "bienestar", "ansiedad"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=1200&q=80",
    imageAlt: "Perro blanco con manchas negras paseando por la calle junto a su humano",
    takeaways: [
      "Los perros son animales sociales: su familia humana es su grupo.",
      "La idea del “macho alfa” está superada; funciona mejor el refuerzo positivo.",
      "Rutinas estables y salidas graduales ayudan a prevenir la ansiedad por separación.",
    ],
    blocks: [
      {
        type: "p",
        text: "Te sigue de cuarto en cuarto, te recibe como si llevaras un año fuera y se acomoda donde estás tú. No es casualidad: los perros son animales profundamente sociales y necesitan sentirse parte de un grupo. Hoy, ese grupo eres tú y tu familia.",
      },
      { type: "h2", text: "De dónde viene el sentido de pertenencia" },
      {
        type: "p",
        text: "Los antepasados de los perros vivían y sobrevivían en grupo. Tras miles de años junto a las personas, esa necesidad de compañía se trasladó a nosotros: muchos perros prefieren la compañía humana incluso a la de otros perros. Sentirse parte del grupo les da seguridad.",
      },
      { type: "h2", text: "El mito del “macho alfa”" },
      {
        type: "p",
        text: "Durante años se dijo que había que “dominar” al perro para ser su líder. Esa idea salió de observar lobos en cautiverio y hoy está superada. Tu perro no compite contigo por el poder: necesita reglas claras, coherencia y saber qué esperas de él. Premiar lo que hace bien funciona mucho mejor que castigar.",
      },
      { type: "h2", text: "Señales de que se siente parte de la familia" },
      {
        type: "ul",
        items: [
          "Te busca con la mirada y te sigue por la casa.",
          "Duerme cerca de ti o en un lugar desde donde te ve.",
          "Te saluda con todo el cuerpo cuando llegas.",
          "Se relaja cuando estás cerca, aunque haya ruido o visitas.",
        ],
      },
      { type: "h2", text: "Cuando quedarse solo le cuesta" },
      {
        type: "p",
        text: "Algunos perros sufren mucho al separarse de su familia. Ladridos o aullidos continuos, destrozos junto a la puerta o hacer sus necesidades dentro de casa solo cuando se queda solo pueden ser señales de ansiedad por separación.",
      },
      {
        type: "ul",
        items: [
          "Practica salidas cortas y ve alargándolas poco a poco.",
          "Haz que tus salidas y llegadas sean tranquilas, sin despedidas dramáticas.",
          "Déjale juguetes que lo entretengan, como los rellenables con premios.",
          "Si el problema persiste, consulta con un veterinario o un especialista en comportamiento.",
        ],
      },
      { type: "h2", text: "Rutinas que le dan seguridad" },
      {
        type: "p",
        text: "Horarios estables de comida, paseo y descanso le dicen que su mundo es predecible. Lo mismo pasa con los cuidados: un baño en un lugar tranquilo, sin otros perros alrededor y cerca de casa, suele ser menos estresante que un traslado largo y una sala de espera llena.",
      },
      {
        type: "tip",
        text: "Si tu perro se pone nervioso lejos de casa, busca opciones de baño a domicilio o en espacios donde lo atiendan solo a él.",
      },
    ],
  },
  {
    slug: "conoce-a-tu-gato-lenguaje-felino",
    title: "Conoce a tu gato: lo que te dice con la cola, los ojos y el ronroneo",
    excerpt:
      "Los gatos hablan con todo el cuerpo. Aprende a leer sus señales para entender cuándo está tranquilo, cuándo jugar y cuándo darle espacio.",
    category: "comportamiento",
    tags: ["gatos", "bienestar"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80",
    imageAlt: "Gato blanco y negro asomado sobre un mueble, mirando atento a la cámara",
    takeaways: [
      "Cola en alto: saludo amistoso. Cola esponjada o que golpea: mejor darle espacio.",
      "Un parpadeo lento es una señal de confianza; puedes devolvérselo.",
      "El ronroneo suele ser bienestar, pero también puede aparecer con estrés o dolor.",
    ],
    blocks: [
      {
        type: "p",
        text: "Los gatos tienen fama de misteriosos, pero en realidad se comunican todo el tiempo. La diferencia es que lo hacen con la cola, las orejas, los ojos y la postura más que con la voz. Conocer esas señales hace la convivencia mucho más fácil.",
      },
      { type: "h2", text: "La cola, su termómetro emocional" },
      {
        type: "ul",
        items: [
          "Cola vertical, a veces con la punta curvada: está contento de verte. Es un saludo.",
          "Cola esponjada: se asustó o se siente amenazado.",
          "Cola que golpea el suelo o se agita de lado a lado: está irritado o sobreestimulado. Mejor dejarlo tranquilo.",
          "Cola enroscada alrededor del cuerpo: está relajado o descansando.",
        ],
      },
      { type: "h2", text: "Los ojos y el parpadeo lento" },
      {
        type: "p",
        text: "Cuando tu gato te mira y cierra los ojos despacio, te está diciendo que se siente seguro contigo. Puedes devolverle el gesto parpadeando lento: es una de las formas más sencillas de “hablar gato”. En cambio, las pupilas muy dilatadas junto con orejas hacia atrás suelen indicar miedo o tensión.",
      },
      { type: "h2", text: "El ronroneo no siempre significa lo mismo" },
      {
        type: "p",
        text: "La mayoría de las veces ronronea porque está a gusto. Pero los gatos también ronronean cuando están estresados, adoloridos o enfermos, como una forma de calmarse. Por eso conviene mirar el contexto: un ronroneo con el cuerpo tenso o escondido en un rincón no es buena señal.",
      },
      { type: "h2", text: "Otros gestos que vale la pena conocer" },
      {
        type: "ul",
        items: [
          "Amasar con las patas: comportamiento que viene de cuando era cachorro; lo asocia con comodidad.",
          "Frotarse contigo o con los muebles: deja su olor para marcar lo que considera suyo, tú incluido.",
          "Mostrar la barriga: indica confianza, pero no siempre es una invitación a tocarla.",
          "Traerte “regalos”: es parte de su instinto cazador; no lo regañes.",
        ],
      },
      { type: "h2", text: "Aseo: el gato se limpia solo, pero no del todo" },
      {
        type: "p",
        text: "Los gatos dedican varias horas al día a acicalarse, así que rara vez necesitan baño. Lo que sí ayuda es cepillarlos con regularidad, sobre todo a los de pelo largo: retiras pelo muerto, evitas nudos y reduces las bolas de pelo. Si deja de asearse o se lame en exceso una zona, consulta con el veterinario.",
      },
      {
        type: "tip",
        text: "Acostúmbralo al cepillo desde pequeño, en sesiones cortas y con premios. Un gato que disfruta el cepillado es un gato con menos nudos.",
      },
    ],
  },
  {
    slug: "limpieza-de-dientes-del-perro",
    title: "Cómo cuidar los dientes de tu perro (y por qué importa)",
    excerpt:
      "El sarro y el mal aliento no son “normales”. Te explicamos cómo cepillar los dientes de tu perro paso a paso y qué evitar.",
    category: "salud",
    tags: ["perros", "dientes", "higiene"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&q=80",
    imageAlt: "Beagle sonriente con la boca abierta mirando a la cámara",
    takeaways: [
      "El mal aliento fuerte y el sarro son señales de un problema dental.",
      "Usa siempre pasta para perros: la pasta humana puede ser tóxica para ellos.",
      "Cepillar a diario es lo ideal; varias veces por semana ya hace una gran diferencia.",
    ],
    blocks: [
      {
        type: "p",
        text: "La salud dental suele quedar al final de la lista, pero es de las más importantes. Según la Asociación Americana de Medicina Veterinaria (AVMA), la mayoría de perros ya muestra signos de enfermedad periodontal hacia los 3 años. Y una boca enferma no solo duele: las bacterias pueden afectar otros órganos.",
      },
      { type: "h2", text: "Señales de que algo no va bien" },
      {
        type: "ul",
        items: [
          "Mal aliento fuerte y persistente.",
          "Sarro amarillento o marrón, sobre todo en muelas y colmillos.",
          "Encías rojas, inflamadas o que sangran.",
          "Babeo excesivo, dificultad para masticar o que mastique de un solo lado.",
          "Dientes flojos o rotos.",
        ],
      },
      { type: "h2", text: "Cepillado paso a paso" },
      {
        type: "ul",
        items: [
          "Elige el momento: cuando esté tranquilo, por ejemplo después de un paseo.",
          "Primero acostúmbralo a que le toques la boca y los labios, y prémialo.",
          "Deja que pruebe la pasta para perros en tu dedo: suelen tener sabores que les gustan.",
          "Usa un cepillo para perros o un dedal de silicona y haz movimientos circulares suaves.",
          "Concéntrate en la cara externa de los dientes, donde más se acumula el sarro.",
          "Empieza con pocos segundos y ve alargando. Termina siempre con un premio.",
        ],
      },
      {
        type: "tip",
        text: "Nunca uses pasta dental humana: suele tener flúor y algunas llevan xilitol, un endulzante muy tóxico para los perros.",
      },
      { type: "h2", text: "¿Cada cuánto?" },
      {
        type: "p",
        text: "Lo ideal es todos los días, porque la placa se convierte en sarro en pocos días. Si no es posible, cepillar varias veces por semana ya marca una diferencia enorme frente a no hacerlo nunca.",
      },
      { type: "h2", text: "Snacks y juguetes dentales" },
      {
        type: "p",
        text: "Pueden ayudar a reducir la placa, pero no reemplazan el cepillado. Elige productos del tamaño adecuado para tu perro y vigílalo mientras los usa.",
      },
      { type: "h2", text: "Cuándo ir al veterinario" },
      {
        type: "p",
        text: "Cuando el sarro ya está instalado, el cepillado no lo quita: hace falta una limpieza profesional, que el veterinario realiza con anestesia para limpiar también debajo de la encía. Las razas pequeñas y las de hocico chato suelen necesitarla con más frecuencia. Incluye la revisión de la boca en sus controles anuales.",
      },
    ],
  },
  {
    slug: "cada-cuanto-banar-a-tu-perro",
    title: "¿Cada cuánto bañar a tu perro según su tipo de pelo?",
    excerpt:
      "Ni muy seguido ni muy poco: la frecuencia ideal de baño depende del pelaje, la piel y la actividad de tu perro. Aquí una guía práctica.",
    category: "cuidado",
    tags: ["perros", "baño", "pelaje", "piel"],
    publishedAt: "2026-10-08",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=1200&q=80",
    imageAlt: "Samoyedo blanco de pelo abundante sentado sobre un fondo rosado",
    takeaways: [
      "No hay una regla única: depende del pelaje, la piel y la actividad.",
      "Bañar en exceso reseca la piel; el cepillado entre baños es clave.",
      "Sécalo por completo, sobre todo los de doble capa y en temporadas húmedas.",
    ],
    blocks: [
      {
        type: "p",
        text: "Es una de las preguntas que más nos hacen. La respuesta corta: depende. Bañar demasiado elimina los aceites naturales que protegen la piel, y bañar muy poco deja que se acumulen suciedad, olor y nudos. Estas referencias te ayudan a encontrar el punto medio.",
      },
      { type: "h2", text: "Frecuencia orientativa según el pelaje" },
      {
        type: "ul",
        items: [
          "Pelo corto (beagle, bóxer, pug): cada 6 a 8 semanas suele bastar, con un cepillado semanal.",
          "Pelo largo o rizado (shih tzu, poodle, schnauzer): cada 3 a 4 semanas, porque acumulan más suciedad y forman nudos. Cepíllalos varias veces por semana.",
          "Doble capa (husky, samoyedo, golden): pocos baños y mucho cepillado, sobre todo en época de muda.",
          "Pelo duro (terriers): baños espaciados para no ablandar la textura del pelo.",
        ],
      },
      { type: "h2", text: "Otros factores que cambian la frecuencia" },
      {
        type: "ul",
        items: [
          "Actividad: si se revuelca en el parque o va a la playa, necesitará baños más seguidos.",
          "Piel: los perros con piel grasa pueden necesitar más baños; los de piel seca o sensible, menos y con productos específicos.",
          "Indicaciones del veterinario: si tiene dermatitis o alergias, sigue el plan y el champú que te indiquen.",
        ],
      },
      { type: "h2", text: "Cómo hacer que el baño le haga bien" },
      {
        type: "ul",
        items: [
          "Usa champú para perros: el pH de su piel es distinto al nuestro.",
          "Agua tibia, nunca caliente.",
          "Enjuaga muy bien: los restos de champú irritan.",
          "Cuida los oídos para que no entre agua.",
          "Sécalo por completo, piel incluida.",
        ],
      },
      {
        type: "tip",
        text: "En climas húmedos como el de Lima, un secado incompleto favorece la aparición de hongos y mal olor, sobre todo en perros de pelo abundante.",
      },
      { type: "h2", text: "El cepillado, el mejor aliado entre baños" },
      {
        type: "p",
        text: "Cepillar con regularidad retira pelo muerto, reparte los aceites naturales, evita nudos y te permite revisar la piel. Con un buen cepillado, muchos perros pueden espaciar más los baños sin oler mal.",
      },
    ],
  },

  // ── Existentes (2024-10), reestructurados por secciones ─────────────────────
  {
    slug: "como-cuidar-la-piel-de-perros-y-gatos",
    title: "Cómo cuidar la piel de perros y gatos",
    excerpt:
      "El mantenimiento de la barrera cutánea es fundamental para prevenir alergias y dermatitis estacionales.",
    category: "cuidado",
    tags: ["perros", "gatos", "piel"],
    publishedAt: "2024-10-12",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
    imageAlt: "Profesional revisando la piel de un perro",
    takeaways: [
      "Usa champús hipoalergénicos y enjuaga completamente para evitar irritaciones.",
      "Mantén hidratación diaria y consulta suplementos como omega-3 con tu veterinario.",
      "Cepilla con frecuencia para distribuir aceites naturales y detectar anomalías a tiempo.",
    ],
    blocks: [
      {
        type: "p",
        text: "El pelaje y la piel de tu mascota son su primera línea de defensa. Una piel sana refleja una dieta equilibrada, una higiene adecuada y visitas periódicas al groomer profesional.",
      },
      { type: "h2", text: "Alergias estacionales" },
      {
        type: "p",
        text: "Las alergias estacionales son uno de los problemas más comunes: el polvo, el polen y los ácaros pueden desencadenar picazón, enrojecimiento e inflamación. Para prevenirlas, es recomendable bañar a tu mascota con champús hipoalergénicos y secarla bien después de cada paseo.",
      },
      { type: "h2", text: "Hidratación" },
      {
        type: "p",
        text: "La hidratación también juega un papel clave. Al igual que en los humanos, una piel deshidratada se vuelve escamosa y propensa a infecciones. Asegúrate de que tu mascota beba suficiente agua y considera suplementos de omega-3 si el veterinario lo aprueba.",
      },
      { type: "h2", text: "Cepillado diario" },
      {
        type: "p",
        text: "Finalmente, no subestimes la importancia de un buen cepillado diario: distribuye los aceites naturales del pelaje, elimina el pelo muerto y te permite detectar a tiempo cualquier anomalía en la piel.",
      },
    ],
  },
  {
    slug: "beneficios-del-bano-regular-en-casa",
    title: "Beneficios del baño regular en casa",
    excerpt:
      "Mantener una higiene constante entre servicios profesionales ayuda a fortalecer el vínculo afectivo con tu mascota.",
    category: "cuidado",
    tags: ["perros", "gatos", "baño"],
    publishedAt: "2024-10-10",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80",
    imageAlt: "Perro feliz durante su baño",
    takeaways: [
      "El baño regular reduce olores y ayuda a prevenir pulgas y garrapatas.",
      "Es un buen momento para revisar piel, orejas y uñas.",
      "Usa siempre productos para mascotas y enjuaga bien.",
    ],
    blocks: [
      {
        type: "p",
        text: "Los servicios de grooming profesional son indispensables, pero el cuidado en casa entre sesiones marca una gran diferencia en la salud y el bienestar de tu mascota.",
      },
      { type: "h2", text: "Higiene y prevención" },
      {
        type: "p",
        text: "Bañar a tu perro o gato regularmente, con la frecuencia adecuada para su raza y tipo de pelaje, elimina la suciedad acumulada, reduce los olores y previene la aparición de parásitos como pulgas y garrapatas. Además, el momento del baño es una oportunidad perfecta para revisar el estado general de la piel, las orejas y las uñas.",
      },
      { type: "h2", text: "Un momento para fortalecer el vínculo" },
      {
        type: "p",
        text: "Más allá de la higiene, el baño en casa refuerza el vínculo entre el dueño y la mascota. La manipulación suave, las caricias y la comunicación durante el proceso ayudan a que tu compañero asocie el cuidado con experiencias positivas, reduciendo el estrés en futuras visitas al groomer.",
      },
      {
        type: "tip",
        text: "Usa siempre productos específicos para mascotas, ya que el pH de su piel es diferente al humano, y enjuaga bien para evitar residuos que puedan causar irritación.",
      },
    ],
  },
  {
    slug: "proteccion-para-el-frio-guia-completa",
    title: "Protección para el frío: guía completa",
    excerpt:
      "No todas las razas necesitan abrigo; descubre cómo identificar si tu mascota requiere protección extra.",
    category: "temporadas",
    tags: ["perros", "invierno", "cachorros", "senior"],
    publishedAt: "2024-10-05",
    author: "Equipo Paku",
    image: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=1200&q=80",
    imageAlt: "Cachorro con suéter de invierno",
    takeaways: [
      "Las razas de pelo corto, los cachorros y los seniors sienten más el frío.",
      "Las razas nórdicas no necesitan abrigo y pueden sobrecalentarse.",
      "Protege las almohadillas: el frío puede agrietarlas.",
    ],
    blocks: [
      {
        type: "p",
        text: "Con la llegada del invierno, muchos dueños se preguntan si sus mascotas necesitan ropa o protección especial frente al frío. La respuesta depende de varios factores: la raza, el tamaño, la edad y el estado de salud del animal.",
      },
      { type: "h2", text: "Quiénes necesitan abrigo" },
      {
        type: "p",
        text: "Las razas de pelaje corto y fino, como el chihuahua, el galgo o el dachshund, son especialmente sensibles a las bajas temperaturas. Lo mismo ocurre con los cachorros, los animales mayores y aquellos que padecen enfermedades crónicas. Para ellos, un buen abrigo o una chompa puede marcar la diferencia en los paseos matutinos.",
      },
      { type: "h2", text: "Quiénes no" },
      {
        type: "p",
        text: "En cambio, razas como el husky siberiano, el samoyedo o el malamute de Alaska están preparadas genéticamente para el frío. Abrigarlas en exceso puede generar incomodidad o incluso sobrecalentamiento.",
      },
      { type: "h2", text: "Cuida sus almohadillas" },
      {
        type: "p",
        text: "Además de la ropa, considera proteger las almohadillas de tus mascotas con cremas específicas, ya que el frío y las superficies heladas pueden agrietarlas.",
      },
      { type: "tip", text: "Si tú tienes frío, probablemente tu mascota también." },
    ],
  },
];
