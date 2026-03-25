/**
 * Contenedor con ancho máximo centrado.
 * TODO: Implementar variantes de ancho (sm, md, lg, xl, full).
 */
interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
