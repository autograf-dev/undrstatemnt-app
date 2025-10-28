"use client";

import { CSSProperties, useMemo, useState } from "react";
import ServiceListWidget from "./ServiceListWidget";
import { Department } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface ServicesExplorerProps {
  className?: string;
  style?: CSSProperties;
  /** Optional departments (groups) to seed tabs */
  departments?: Department[];
  /** Initial department id; default 'all' */
  initialDepartmentId?: string;
  /** Show search input */
  showSearch?: boolean;
}

export default function ServicesExplorer({
  className,
  style,
  departments,
  initialDepartmentId = "all",
  showSearch = true,
}: ServicesExplorerProps) {
  const [activeDept, setActiveDept] = useState<string>(initialDepartmentId);

  const onSelect = (serviceId: string) => {
    // This component is display-only; selection can be observed via Plasmic actions if needed
    console.log("Selected service", serviceId);
  };

  return (
    <div className={cn("w-full", className)} style={style}>
      <ServiceListWidget
        departmentId={activeDept}
        showMeta
        showTabs
        departments={departments}
        showSearch={showSearch}
        onServiceSelect={onSelect}
      />
    </div>
  );
}


