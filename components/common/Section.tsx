/**
 * Sección contenedora con ancho máximo centrado.
 * TODO: Implementar variantes de padding y ancho.
 */
interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={className}>
      {children}
    </section>
  );
}
