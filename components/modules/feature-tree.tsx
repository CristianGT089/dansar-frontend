"use client";

import { ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeatureNode, SubRole } from "@/types";

const ALL_ROLES: { value: SubRole; label: string }[] = [
  { value: "admin",    label: "Admin" },
  { value: "contador", label: "Contador" },
  { value: "viewer",   label: "Visualizador" },
];

interface FeatureTreeProps {
  features: FeatureNode[];
  canToggleParent: boolean;
  canManageChildren: boolean;
  onToggleParent: (key: string, enabled: boolean) => void;
  onToggleChild: (key: string, enabled: boolean) => void;
  onSetRoles: (key: string, roles: SubRole[]) => void;
  isPending?: boolean;
}

export function FeatureTree({
  features,
  canToggleParent,
  canManageChildren,
  onToggleParent,
  onToggleChild,
  onSetRoles,
  isPending,
}: FeatureTreeProps) {
  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <FeatureCard
          key={feature.key}
          feature={feature}
          depth={0}
          rootAllowedRoles={feature.allowed_roles as SubRole[]}
          canToggleParent={canToggleParent}
          canManageChildren={canManageChildren}
          onToggleParent={onToggleParent}
          onToggleChild={onToggleChild}
          onSetRoles={onSetRoles}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

function Toggle({ enabled, onChange, disabled }: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        enabled ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function RoleSelector({
  roles,
  availableRoles,
  onChange,
  disabled,
}: {
  roles: SubRole[];
  availableRoles: SubRole[];
  onChange: (roles: SubRole[]) => void;
  disabled?: boolean;
}) {
  // Si el padre tiene roles restringidos, solo mostramos esos; si está vacío (irrestricto) mostramos todos
  const options = availableRoles.length > 0
    ? ALL_ROLES.filter((r) => availableRoles.includes(r.value))
    : ALL_ROLES;

  function toggle(role: SubRole) {
    if (roles.includes(role)) {
      onChange(roles.filter((r) => r !== role));
    } else {
      onChange([...roles, role]);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
      {options.map(({ value, label }) => {
        const active = roles.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggle(value)}
            disabled={disabled}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function FeatureCard({
  feature,
  depth,
  rootAllowedRoles,
  canToggleParent,
  canManageChildren,
  onToggleParent,
  onToggleChild,
  onSetRoles,
  isPending,
}: {
  feature: FeatureNode;
  depth: number;
  rootAllowedRoles: SubRole[];
  canToggleParent: boolean;
  canManageChildren: boolean;
  onToggleParent: (key: string, enabled: boolean) => void;
  onToggleChild: (key: string, enabled: boolean) => void;
  onSetRoles: (key: string, roles: SubRole[]) => void;
  isPending?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = feature.children.length > 0;
  const isRoot = depth === 0;

  const onToggle = isRoot ? onToggleParent : onToggleChild;
  const canToggle = isRoot ? canToggleParent : canManageChildren;

  // Hijos solo pueden elegir entre roles que el root permite ([] = todos)
  const childAvailableRoles = isRoot ? (feature.allowed_roles as SubRole[]) : rootAllowedRoles;

  return (
    <Card className={!feature.is_enabled ? "opacity-60" : ""}>
      <CardContent className="p-0">
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth > 0 ? `${depth * 1.5}rem` : 0 }}>
            {hasChildren && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <div className="min-w-0">
              <p className="font-medium">{feature.name}</p>
              <p className="text-xs text-muted-foreground truncate">{feature.module} · {feature.key}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canManageChildren && feature.is_enabled && (
              <RoleSelector
                roles={feature.allowed_roles as SubRole[]}
                availableRoles={isRoot ? [] : rootAllowedRoles}
                onChange={(roles) => onSetRoles(feature.key, roles)}
                disabled={isPending}
              />
            )}
            {hasChildren && (
              <span className="text-xs text-muted-foreground">
                {feature.children.filter((c) => c.is_enabled).length}/{feature.children.length} activas
              </span>
            )}
            {canToggle ? (
              <Toggle
                enabled={feature.is_enabled}
                onChange={(v) => onToggle(feature.key, v)}
                disabled={isPending}
              />
            ) : (
              <Badge variant={feature.is_enabled ? "success" : "secondary"}>
                {feature.is_enabled ? "Activa" : "Inactiva"}
              </Badge>
            )}
          </div>
        </div>

        {hasChildren && expanded && (
          <div className="border-t divide-y bg-muted/20">
            {feature.children.map((child) => (
              <FeatureCard
                key={child.key}
                feature={child}
                depth={depth + 1}
                rootAllowedRoles={childAvailableRoles}
                canToggleParent={canToggleParent}
                canManageChildren={canManageChildren}
                onToggleParent={onToggleParent}
                onToggleChild={onToggleChild}
                onSetRoles={onSetRoles}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
