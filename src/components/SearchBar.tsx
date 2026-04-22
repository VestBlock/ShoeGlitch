'use client';

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  function handleChange(nextValue: string) {
    onChange?.(nextValue);
    onSearch?.(nextValue);
  }

  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-glitch"
      />
    </div>
  );
}

export default SearchBar;
