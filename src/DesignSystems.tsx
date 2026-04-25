import { useEffect, useState } from "react";
import designSystems from "./data/designSystems.json";

type Locale = "zh" | "en";

interface DesignSystem {
  title: string;
  description: Record<Locale, string>;
  website: string;
  github: string;
  image: string | null;
  tags: Array<Record<Locale, string>>;
}

interface TagOption {
  key: string;
  label: Record<Locale, string>;
}

const localeCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageDescription: string;
    officialSite: string;
    github: string;
    searchPlaceholder: string;
    searchLabel: string;
    allTags: string;
    filterLabel: string;
    resultCount: (count: number) => string;
    emptyState: string;
  }
> = {
  zh: {
    pageTitle: "设计系统收藏",
    pageDescription: "收藏精选优质设计系统，覆盖设计规范、组件库与产品实践。",
    officialSite: "官网",
    github: "GitHub",
    searchPlaceholder: "搜索名称、描述或标签",
    searchLabel: "搜索",
    allTags: "全部",
    filterLabel: "按标签筛选",
    resultCount: (count) => `共 ${count} 个结果`,
    emptyState: "当前筛选条件下暂无设计系统。",
  },
  en: {
    pageTitle: "Design System Collection",
    pageDescription: "A curated set of quality design systems spanning guidelines, component libraries, and product practices.",
    officialSite: "Website",
    github: "GitHub",
    searchPlaceholder: "Search by title, description, or tag",
    searchLabel: "Search",
    allTags: "All",
    filterLabel: "Filter by tag",
    resultCount: (count) => `${count} result${count === 1 ? "" : "s"}`,
    emptyState: "No design systems match the current filters.",
  },
};

export function DesignSystems() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const copy = localeCopy[locale];
  const systems = designSystems as DesignSystem[];
  const tagMap = new Map<string, TagOption>();

  for (const system of systems) {
    for (const tag of system.tags) {
      if (!tagMap.has(tag.en)) {
        tagMap.set(tag.en, {
          key: tag.en,
          label: tag,
        });
      }
    }
  }

  const tags = Array.from(tagMap.values()).sort((a, b) =>
    a.label[locale].localeCompare(b.label[locale], locale === "zh" ? "zh-CN" : "en"),
  );
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredSystems = systems.filter((system) => {
    const matchesTag = selectedTag
      ? system.tags.some((tag) => tag.en === selectedTag)
      : true;

    if (!matchesTag) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchHaystack = [
      system.title,
      system.description[locale],
      ...system.tags.map((tag) => tag[locale]),
      ...system.tags.map((tag) => tag.en),
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchHaystack.includes(normalizedQuery);
  });

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{copy.pageTitle}</h1>
              <p className="mt-1 text-sm leading-6 text-gray-500">{copy.pageDescription}</p>
            </div>
            <div
              className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-100 p-1 self-start"
              role="group"
              aria-label="language switcher"
            >
              {(["zh", "en"] as const).map((nextLocale) => {
                const active = locale === nextLocale;
                return (
                  <button
                    key={nextLocale}
                    type="button"
                    onClick={() => setLocale(nextLocale)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {nextLocale === "zh" ? "中文" : "English"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex min-w-0 flex-col gap-2 lg:max-w-md lg:flex-1">
                <span className="text-sm font-medium text-gray-700">{copy.searchLabel}</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <div className="flex flex-col gap-2 lg:items-end">
                <p className="text-sm font-medium text-gray-700">{copy.filterLabel}</p>
                <p className="text-sm text-gray-500">{copy.resultCount(filteredSystems.length)}</p>
              </div>
            </div>
            <div className="-mx-4 overflow-x-auto px-4 pb-1">
              <div className="flex w-max min-w-full gap-2 sm:w-auto sm:min-w-0 sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTag === null
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  {copy.allTags}
                </button>
                {tags.map((tag) => {
                  const active = selectedTag === tag.key;
                  return (
                    <button
                      key={tag.key}
                      type="button"
                      onClick={() => setSelectedTag(tag.key)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {tag.label[locale]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {filteredSystems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSystems.map((ds) => (
                <article
                  key={ds.title}
                  className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:outline hover:outline-2 hover:outline-blue-400"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
                    {ds.image && (
                      <img
                        src={ds.image}
                        alt={ds.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    {!ds.image && (
                      <div className="text-4xl font-bold text-gray-400">
                        {ds.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-lg">
                      {ds.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">
                      {ds.description[locale]}
                    </p>
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {ds.tags.map((tag) => (
                          <span
                            key={`${ds.title}-${tag.en}`}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700"
                          >
                            {`【${tag[locale]}】`}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={ds.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                      >
                        {copy.officialSite}
                      </a>
                      <a
                        href={ds.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        {copy.github}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-12 text-center text-sm text-gray-500">
              {copy.emptyState}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
