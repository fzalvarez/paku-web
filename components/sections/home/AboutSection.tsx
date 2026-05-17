const VALUES = ["Empatía", "Confianza", "Innovación", "Profesionalismo"] as const;

export function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
            ¿Quiénes somos?
          </h2>
          <p className="max-w-4xl mb-12 text-base font-medium leading-relaxed text-muted-foreground md:text-lg md:font-semibold xl:text-xl">
            PAKU es un ecosistema inteligente que combina tecnología y servicio
            para transformar el cuidado de tu mascota. Una experiencia más
            segura, conectada y personalizada en cada etapa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Propósito */}
            <div>
              <h3 className="mb-3 text-xl font-extrabold text-primary md:text-2xl">
                Nuestro propósito
              </h3>
              <p className="text-base font-medium leading-relaxed text-muted-foreground md:font-semibold">
                Brindar un cuidado más confiable y personalizado, integrando
                tecnología y servicio en una sola experiencia.
              </p>
            </div>

            {/* Visión */}
            <div>
              <h3 className="mb-3 text-xl font-extrabold text-primary md:text-2xl">
                Hacia dónde vamos
              </h3>
              <p className="text-base font-medium leading-relaxed text-muted-foreground md:font-semibold">
                Construir un ecosistema digital donde salud, grooming y
                tecnología convivan de forma simple y conectada.
              </p>
            </div>

            {/* Valores */}
            <div>
              <h3 className="mb-3 text-xl font-extrabold text-primary">
                Lo que nos define
              </h3>
              <ul className="flex flex-col gap-2">
                {VALUES.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-base font-medium text-muted-foreground md:font-semibold">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
