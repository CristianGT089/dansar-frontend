"use client";

import { ChevronDown, ChevronRight, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FeatureStatus, SubFeatureStatus, SubRole } from "@/types";

const ROLES: { value: SubRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "contador", label: "Contador" },
  { value: "viewer", label: "Visualizador" },
];

interface FeatureTreeProps {
  features: FeatureStatus[];
  canToggleParent: boolean;       // superadmin only
  canManageChildren: boolean;     // admin or superadmin
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

function Toggle({ enabled, onChange, disabled }: { enabled: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
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
  onChange,
  disabled,
}: {
  roles: SubRole[];
  onChange: (roles: SubRole[]) => void;
  disabled?: boolean;
}) {
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
      {ROLES.map(({ value, label }) => {
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
  canToggleParent,
  canManageChildren,
  onToggleParent,
  onToggleChild,
  onSetRoles,
  isPending,
}: {
  feature: FeatureStatus;
  canToggleParent: boolean;
  canManageChildren: boolean;
  onToggleParent: (key: string, enabled: boolean) => void;
  onToggleChild: (key: string, enabled: boolean) => void;
  onSetRoles: (key: string, roles: SubRole[]) => void;
  isPending?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = feature.children.length > 0;

  return (
    <Card className={!feature.is_enabled ? "opacity-60" : ""}>
      <CardContent className="p-0">
        {/* Parent row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="text-muted-foreground hover:text-foreground"
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <div>
              <p className="font-medium">{feature.name}</p>
              <p className="text-xs text-muted-foreground">{feature.module} · {feature.key}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChildren && (
              <span className="text-xs text-muted-foreground">
                {feature.children.filter((c) => c.is_enabled).length}/{feature.children.length} activas
              </span>
            )}
            {canToggleParent ? (
              <Toggle
                enabled={feature.is_enabled}
                onChange={(v) => onToggleParent(feature.key, v)}
                disabled={isPending}
              />
            ) : (
              <Badge variant={feature.is_enabled ? "success" : "secondary"}>
                {feature.is_enabled ? "Activa" : "Inactiva"}
              </Badge>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && expanded && (
          <div className="border-t divide-y bg-muted/20">
            {feature.children.map((child) => (
              <SubFeatureRow
                key={child.key}
                child={child}
                parentEnabled={feature.is_enabled}
                canManage={canManageChildren}
                onToggle={onToggleChild}
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

function SubFeatureRow({
  child,
  parentEnabled,
  canManage,
  onToggle,
  onSetRoles,
  isPending,
}: {
  child: SubFeatureStatus;
  parentEnabled: boolean;
  canManage: boolean;
  onToggle: (key: string, enabled: boolean) => void;
  onSetRoles: (key: string, roles: SubRole[]) => void;
  isPending?: boolean;
}) {
  const blocked = !parentEnabled;

  return (
    <div className={`flex items-center justify-between px-4 py-3 pl-10 ${blocked ? "opacity-40" : ""}`}>
      <div className="flex items-center gap-2">
        {blocked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
        <div>
          <p className="text-sm font-medium">{child.name}</p>
          <p className="text-xs text-muted-foreground">{child.key}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {canManage && child.is_enabled && (
          <RoleSelector
            roles={child.allowed_roles}
            onChange={(roles) => onSetRoles(child.key, roles)}
            disabled={blocked || isPending}
          />
        )}
        {canManage ? (
          <Toggle
            enabled={child.is_enabled}
            onChange={(v) => onToggle(child.key, v)}
            disabled={blocked || isPending}
          />
        ) : (
          <Badge variant={child.is_enabled ? "success" : "secondary"}>
            {child.is_enabled ? "Activa" : "Inactiva"}
          </Badge>
        )}
      </div>
    </div>
  );
}
