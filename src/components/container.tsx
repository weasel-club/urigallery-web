import { cn } from "@/lib/utils";

export default function Container({
  children,
  className,
  ref,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn("max-w-2xl mx-auto px-2", className)}
      ref={ref}
      style={style}
    >
      {children}
    </div>
  );
}
