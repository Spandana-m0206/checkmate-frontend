import { Link } from "react-router";

const menuItemClass =
  "flex w-full items-center gap-3 rounded-md bg-surface-raised px-4 py-3 text-left font-bold text-content transition-colors hover:bg-edge-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

interface MenuButtonProps {
  icon: string;
  label: string;
  /** Renders a link when set, a button otherwise. */
  to?: string;
  onClick?: () => void;
}

export default function MenuButton({
  icon,
  label,
  to,
  onClick,
}: MenuButtonProps) {
  const content = (
    <>
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      {label}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={menuItemClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={menuItemClass}>
      {content}
    </button>
  );
}
