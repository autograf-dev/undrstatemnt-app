"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Department, Service } from "@/lib/types";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicesCatalogProps {
  className?: string;
  style?: CSSProperties;
  /** Max cards to show per group before See All */
  maxPerGroup?: number;
  /** Show search input */
  showSearch?: boolean;
  /** Triggered when user clicks a service */
  onServiceSelect?: (serviceId: string) => void;
  /** Generate href for See All (e.g., `/services/[group]`). If not provided, defaults to `/services?groupId=...&group=...` */
  buildSeeAllHref?: (groupId: string, groupName: string) => string;
}

type Grouped = {
  id: string;
  name: string;
  services: (Service & { price?: number; imageUrl?: string; groupId?: string; groupName?: string })[];
};

const derivePrice = (s: any): number | undefined => {
  const keys = ["price", "fromPrice", "minPrice", "startingPrice", "startPrice", "amount"];
  for (const k of keys) {
    const v = s?.[k];
    const n = Number(v);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return undefined;
};

const deriveImage = (s: any): string | undefined => {
  const keys = ["image", "imageUrl", "photo", "cover", "thumbnail", "thumbUrl"]; 
  for (const k of keys) {
    const v = s?.[k];
    if (typeof v === "string" && v) return v;
  }
  return undefined;
};

export default function ServicesCatalog({
  className,
  style,
  maxPerGroup = 6,
  showSearch = true,
  onServiceSelect,
  buildSeeAllHref,
}: ServicesCatalogProps) {
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        const raw = Array.isArray(data?.services) && data.services.length > 0
          ? data.services
          : (Array.isArray(data?.calendars) ? data.calendars : []);
        setAllServices(Array.isArray(raw) ? raw : []);
      } catch (e) {
        console.error("ServicesCatalog load error", e);
        setAllServices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const groups: Grouped[] = useMemo(() => {
    const groupNameKeys = [
      "category", "categoryName", "group", "groupName", "department", "departmentName", "folder", "folderName", "calendarGroup"
    ];
    const groupIdKeys = ["categoryId", "groupId", "departmentId", "folderId"];
    const map = new Map<string, Grouped>();
    const q = search.trim().toLowerCase();
    allServices.forEach((s: any) => {
      let name = "";
      for (const k of groupNameKeys) {
        if (typeof s?.[k] === "string" && s[k].trim()) { name = String(s[k]).trim(); break; }
      }
      if (!name) name = "Other";
      let id = "";
      for (const k of groupIdKeys) {
        if (s?.[k] !== undefined && s[k] !== null) { id = String(s[k]); break; }
      }
      const key = id || name.toLowerCase();
      if (!map.has(key)) map.set(key, { id: id || name, name, services: [] });
      const minutesRaw = Number(s.slotDuration ?? s.duration ?? 0);
      const unit = String(s.slotDurationUnit ?? s.durationUnit ?? "").toLowerCase();
      const minutes = minutesRaw > 0 ? (unit === "hours" || unit === "hour" ? minutesRaw * 60 : minutesRaw) : 0;
      const service: Service & { price?: number; imageUrl?: string; groupId?: string; groupName?: string } = {
        id: s.id,
        name: s.name,
        description: s.description,
        durationMinutes: minutes,
        teamMembers: s.teamMembers || [],
      };
      service.price = derivePrice(s);
      service.imageUrl = deriveImage(s);
      service.groupId = id || name;
      service.groupName = name;
      if (q && !(String(service.name).toLowerCase().includes(q) || String(service.description || "").toLowerCase().includes(q))) return;
      map.get(key)!.services.push(service);
    });
    return Array.from(map.values());
  }, [allServices, search]);

  const formatDuration = (mins: number) => {
    const m = Number(mins || 0);
    const h = Math.floor(m / 60);
    const r = m % 60;
    if (h > 0) return r > 0 ? `${h}h ${r}m` : `${h}h`;
    return `${r}m`;
  };

  return (
    <div className={cn("w-full", className)} style={style}>
      {showSearch && (
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services"
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          <div className="service-skeleton" />
          <div className="service-skeleton" />
          <div className="service-skeleton" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {(Array.isArray(groups) ? groups : []).map((g) => {
            const items = g.services.slice(0, Math.max(1, maxPerGroup));
            return (
              <section key={g.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[color:var(--color-orange-primary)]">{g.name}</h3>
                  {g.services.length > items.length && (
                    <a
                      href={buildSeeAllHref ? buildSeeAllHref(g.id, g.name) : `/services?groupId=${encodeURIComponent(g.id)}&group=${encodeURIComponent(g.name)}`}
                      className="text-sm font-semibold text-[color:var(--color-orange-primary)] hover:underline"
                    >
                      See All
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => onServiceSelect?.(s.id)}
                      className="group overflow-hidden rounded-2xl border-2 border-gray-200 hover:border-[color:var(--color-orange-primary)] transition-colors cursor-pointer bg-white"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        <Image
                          src={s.imageUrl || "/image.png"}
                          alt={s.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {typeof (s as any).price === "number" && (
                          <div className="absolute left-3 top-3 rounded-full bg-[color:var(--color-orange-primary)] text-white text-[11px] font-bold px-3 py-1 shadow-md">
                            FROM ${Number((s as any).price).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-[color:var(--color-orange-primary)]">{s.name}</div>
                          <div />
                        </div>
                        {s.description && (
                          <div className="text-sm text-gray-600 line-clamp-2">{s.description}</div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[color:var(--color-orange-primary)]/80">
                          <Clock className="w-4 h-4" /> {formatDuration(s.durationMinutes)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}


