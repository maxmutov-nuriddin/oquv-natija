import { Users } from "lucide-react";

export function EmptyState({ title, text }) {
  return (
    <div className="empty-state">
      <Users size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
