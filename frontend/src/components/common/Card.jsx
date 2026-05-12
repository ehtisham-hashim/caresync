import { cn } from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white text-gray-950 shadow-sm p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
