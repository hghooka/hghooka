import { useMemo, useState } from "react";
import { buildAtlas, COMPARTMENTS } from "@/lib/moa-atlas";
import MoaAtlas3D from "@/components/MoaAtlas3D";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Atom, Search, Target, Layers, Info } from "lucide-react";

export default function MoaAtlasPage() {
  const atlas = useMemo(() => buildAtlas(), []);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();

  const filteredView = useMemo(() => {
    const sorted = [...atlas.targets].sort(
      (a, b) => b.drugs.length - a.drugs.length,
    );
    if (!q) return sorted.map((t) => ({ t, drugs: t.drugs }));
    return sorted
      .map((t) => {
        const matchTarget =
          t.label.toLowerCase().includes(q) ||
          t.moaClass.toLowerCase().includes(q) ||
          t.pathway.toLowerCase().includes(q);
        const drugs = matchTarget
          ? t.drugs
          : t.drugs.filter(
              (d) =>
                d.brand.toLowerCase().includes(q) ||
                d.generic.toLowerCase().includes(q) ||
                d.agent.includes(q),
            );
        return { t, drugs };
      })
      .filter((r) => r.drugs.length > 0);
  }, [atlas, q]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
          <Atom className="h-8 w-8 text-primary" /> Molecular MOA Atlas
        </h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          An interactive, compartment-by-compartment map of the cancer cell.
          Every oncology agent from the NCI A–Z list is classified by its
          molecular mechanism of action and placed on the target it engages —
          from extracellular ligands and membrane receptors, through cytoplasmic
          kinases and mitochondria, down to the nucleus.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          value={atlas.classifiedAgents}
          label="Agents classified"
        />
        <StatCard
          icon={<Atom className="h-4 w-4" />}
          value={atlas.targets.length}
          label="Molecular targets"
        />
        <StatCard
          icon={<Layers className="h-4 w-4" />}
          value={new Set(atlas.targets.map((t) => t.compartment)).size}
          label="Cell compartments"
        />
        <StatCard
          icon={<Search className="h-4 w-4" />}
          value={atlas.totalDrugs}
          label="Brand entries"
        />
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p>
          <span className="font-medium text-foreground">
            Educational reference, not clinical guidance.
          </span>{" "}
          Each agent is shown at a single representative molecular target;
          many drugs act through multiple or context-dependent mechanisms, and
          combination products are placed under their primary novel agent.
          Always verify mechanism, indication and dosing against the official
          prescribing information.
        </p>
      </div>

      <MoaAtlas3D
        atlas={atlas}
        searchQuery={search}
        onSearchChange={(q) => setSearch(q)}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Agents by molecular target</CardTitle>
              <CardDescription>
                Searchable reference for every classified agent and the target
                it acts on.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drug, target or pathway…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredView.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No agents or targets match "{search}".
            </p>
          )}
          {filteredView.map(({ t, drugs }) => (
            <div
              key={t.key}
              className="rounded-lg border border-border/60 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: COMPARTMENTS[t.compartment].color,
                  }}
                />
                <h3 className="font-semibold text-foreground">{t.label}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {t.moaClass}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {COMPARTMENTS[t.compartment].label.split(" · ")[0]}
                </Badge>
                <span className="ml-auto text-xs text-muted-foreground">
                  {drugs.length} agent{drugs.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {drugs.map((d, i) => (
                  <span
                    key={`${d.brand}-${i}`}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                    title={
                      d.generic.toLowerCase() !== d.brand.toLowerCase()
                        ? `${d.brand} · ${d.generic}`
                        : d.brand
                    }
                  >
                    {d.brand}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-xl font-bold leading-none text-foreground">
            {value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
