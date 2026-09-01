import './Card.css';

export default function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`card card-${variant} card-p-${padding} ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
