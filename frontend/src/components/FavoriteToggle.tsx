interface Props {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function FavoriteToggle({ active, onToggle, disabled }: Props) {
  return (
    <button
      type="button"
      className={`favorite-toggle ${active ? 'favorite-toggle--active' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      title={active ? '즐겨찾기 해제' : '즐겨찾기에 추가'}
    >
      {active ? '★' : '☆'}
    </button>
  );
}
