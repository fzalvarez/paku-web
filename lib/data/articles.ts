export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  readingTime: string;
  date: string;
  image: string;
  imageAlt: string;
}

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: "como-cuidar-la-piel-de-perros-y-gatos",
    title: "Cómo cuidar la piel de perros y gatos",
    excerpt:
      "El mantenimiento de la barrera cutánea es fundamental para prevenir alergias y dermatitis estacionales.",
    body: `El pelaje y la piel de tu mascota son su primera línea de defensa. Una piel sana refleja una dieta equilibrada, una higiene adecuada y visitas periódicas al groomer profesional.

Las alergias estacionales son uno de los problemas más comunes: el polvo, el polen y los ácaros pueden desencadenar picazón, enrojecimiento e inflamación. Para prevenirlas, es recomendable bañar a tu mascota con champús hipoalergénicos y secarla bien después de cada paseo.

La hidratación también juega un papel clave. Al igual que en los humanos, una piel deshidratada se vuelve escamosa y propensa a infecciones. Asegúrate de que tu mascota beba suficiente agua y considera suplementos de omega-3 si el veterinario lo aprueba.

Finalmente, no subestimes la importancia de un buen cepillado diario: distribuye los aceites naturales del pelaje, elimina el pelo muerto y te permite detectar a tiempo cualquier anomalía en la piel.`,
    category: "Cuidado",
    readingTime: "5 min de lectura",
    date: "12 Oct 2024",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
    imageAlt: "Profesional revisando la piel de un perro",
  },
  {
    id: 2,
    slug: "beneficios-del-bano-regular-en-casa",
    title: "Beneficios del baño regular en casa",
    excerpt:
      "Mantener una higiene constante entre servicios profesionales ayuda a fortalecer el vínculo afectivo con tu mascota.",
    body: `Los servicios de grooming profesional son indispensables, pero el cuidado en casa entre sesiones marca una gran diferencia en la salud y el bienestar de tu mascota.

Bañar a tu perro o gato regularmente, con la frecuencia adecuada para su raza y tipo de pelaje, elimina la suciedad acumulada, reduce los olores y previene la aparición de parásitos como pulgas y garrapatas. Además, el momento del baño es una oportunidad perfecta para revisar el estado general de la piel, las orejas y las uñas.

Más allá de la higiene, el baño en casa refuerza el vínculo entre el dueño y la mascota. La manipulación suave, las caricias y la comunicación durante el proceso ayudan a que tu compañero asocie el cuidado con experiencias positivas, reduciendo el estrés en futuras visitas al groomer.

Recuerda usar siempre productos específicos para mascotas, ya que el pH de su piel es diferente al humano, y asegúrate de enjuagar bien para evitar residuos que puedan causar irritación.`,
    category: "Tips",
    readingTime: "4 min de lectura",
    date: "10 Oct 2024",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80",
    imageAlt: "Perro feliz durante su baño",
  },
  {
    id: 3,
    slug: "proteccion-para-el-frio-guia-completa",
    title: "Protección para el frío: Guía completa",
    excerpt:
      "No todas las razas necesitan abrigo; descubre cómo identificar si tu mascota requiere protección extra.",
    body: `Con la llegada del invierno, muchos dueños se preguntan si sus mascotas necesitan ropa o protección especial frente al frío. La respuesta depende de varios factores: la raza, el tamaño, la edad y el estado de salud del animal.

Las razas de pelaje corto y fino, como el Chihuahua, el Greyhound o el Dachshund, son especialmente sensibles a las bajas temperaturas. Lo mismo ocurre con los cachorros, los animales mayores y aquellos que padecen enfermedades crónicas. Para ellos, un buen abrigo o jersey puede marcar la diferencia en los paseos matutinos.

En cambio, razas como el Husky Siberiano, el Samoyedo o el Malamute de Alaska están genéticamente preparadas para el frío extremo. Abrigarlas en exceso puede generar incomodidad o incluso sobrecalentamiento.

Además de la ropa, considera proteger las almohadillas de tus mascotas con cremas específicas, ya que el frío y las superficies heladas pueden agrietarlas. Y recuerda: si tú tienes frío, probablemente tu mascota también.`,
    category: "Invierno",
    readingTime: "7 min de lectura",
    date: "05 Oct 2024",
    image: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=1200&q=80",
    imageAlt: "Cachorro con suéter de invierno",
  },
];
