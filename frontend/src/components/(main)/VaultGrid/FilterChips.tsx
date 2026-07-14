import { categories } from "@/lib/mock/earn";

export function FilterChips() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto text-sm">
      <span className="rounded-full bg-muted px-3 py-1.5 font-semibold">
        All
      </span>
      {categories.slice(1).map((category) => (
        <button
          key={category}
          type="button"
          className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
