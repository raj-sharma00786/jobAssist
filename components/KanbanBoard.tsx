"use client";

import { useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Code2, ExternalLink, Filter, ChevronDown, Check } from "lucide-react";
import { updateProblemStatus } from "@/app/actions/problemActions";

// ═══════════ TYPES ═══════════
export interface ProblemWithStatus {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  company: string;
  url: string | null;
  status: string; // 'UNSEEN' | 'UNSOLVED' | 'NEEDS_REVISION' | 'MASTERED'
}

const STATUSES = ["UNSEEN", "UNSOLVED", "NEEDS_REVISION", "MASTERED"] as const;

const COLUMN_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  UNSEEN: {
    label: "UNSEEN",
    color: "text-body",
    dotColor: "bg-outline-variant",
    badgeBg: "bg-surface-container",
    badgeText: "text-body",
    badgeBorder: "border-outline-variant",
  },
  UNSOLVED: {
    label: "UNSOLVED",
    color: "text-error",
    dotColor: "bg-error",
    badgeBg: "bg-error/15",
    badgeText: "text-error",
    badgeBorder: "border-error/30",
  },
  NEEDS_REVISION: {
    label: "NEEDS REVISION",
    color: "text-info",
    dotColor: "bg-info",
    badgeBg: "bg-info/15",
    badgeText: "text-info",
    badgeBorder: "border-info/30",
  },
  MASTERED: {
    label: "MASTERED",
    color: "text-success",
    dotColor: "bg-success",
    badgeBg: "bg-success/15",
    badgeText: "text-success",
    badgeBorder: "border-success/30",
  },
};

const DIFFICULTY_DOT: Record<string, string> = {
  Hard: "bg-error",
  Medium: "bg-primary",
  Easy: "bg-success",
};

// ═══════════ COMPONENT ═══════════
export default function KanbanBoard({
  initialProblems,
}: {
  initialProblems: ProblemWithStatus[];
}) {
  const [problems, setProblems] = useState<ProblemWithStatus[]>(initialProblems);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive unique companies from the data
  const companies = useMemo(() => {
    const unique = Array.from(new Set(problems.map((p) => p.company))).sort();
    return ["All", ...unique];
  }, [problems]);

  // Filter problems by selected company
  const filtered = useMemo(() => {
    if (selectedCompany === "All") return problems;
    return problems.filter((p) => p.company === selectedCompany);
  }, [problems, selectedCompany]);

  // ── Drag handler ──
  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    const problem = problems.find((p) => p.id === draggableId);
    if (!problem || problem.status === newStatus) return;

    // Optimistic update
    setProblems((prev) =>
      prev.map((p) => (p.id === draggableId ? { ...p, status: newStatus } : p))
    );

    // Sync with DB in background
    updateProblemStatus(draggableId, newStatus).catch(() => {
      // Rollback on failure
      setProblems((prev) =>
        prev.map((p) =>
          p.id === draggableId ? { ...p, status: problem.status } : p
        )
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-display">
            Company Curated Lists
          </h1>
          <p className="text-body text-base mt-1">
            Track your progress across top tech companies.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-outline-variant hover:border-primary transition-colors text-sm"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
              Filtering by:{" "}
              <span className="font-semibold">{selectedCompany}</span>
            </span>
            <ChevronDown
              className={`w-4 h-4 text-primary transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container border border-outline-variant rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => {
                    setSelectedCompany(company);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                    selectedCompany === company
                      ? "bg-primary/10 text-primary"
                      : "text-body hover:bg-surface-container-highest hover:text-display"
                  }`}
                >
                  {company}
                  {selectedCompany === company && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ KANBAN BOARD ═══════════ */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map((status) => {
            const col = COLUMN_CONFIG[status];
            const columnProblems = filtered.filter((p) => p.status === status);

            return (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-surface/60 border rounded-2xl p-4 min-h-[300px] transition-colors ${
                      snapshot.isDraggingOver
                        ? "border-primary/40 bg-primary/[0.03]"
                        : "border-outline-variant"
                    }`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.15em] ${col.color}`}
                      >
                        {col.label}
                      </span>
                      <span
                        className={`text-[10px] font-bold min-w-[28px] text-center py-0.5 px-2 rounded-full border ${col.badgeBg} ${col.badgeText} ${col.badgeBorder}`}
                      >
                        {columnProblems.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {columnProblems.map((problem, index) => (
                        <Draggable
                          key={problem.id}
                          draggableId={problem.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`bg-surface border rounded-xl p-4 transition-all group select-none ${
                                dragSnapshot.isDragging
                                  ? "border-primary/50 shadow-xl shadow-[var(--color-primary)]/10 rotate-[1deg] scale-[1.02]"
                                  : "border-outline-variant hover:border-primary/50"
                              }`}
                            >
                              {/* Title + Code icon */}
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="text-sm font-semibold text-display leading-snug pr-2">
                                  {problem.title}
                                </h4>
                                <Code2 className="w-4 h-4 text-outline-variant shrink-0 mt-0.5" />
                              </div>

                              {/* Tags */}
                              <div className="flex items-center gap-2 flex-wrap mb-4">
                                <span
                                  className={`w-2.5 h-2.5 rounded-full ${
                                    DIFFICULTY_DOT[problem.difficulty] ||
                                    "bg-outline-variant"
                                  }`}
                                />
                                <span className="text-[11px] font-medium text-body bg-surface-container px-2 py-0.5 rounded">
                                  {problem.company}
                                </span>
                                <span className="text-[11px] font-medium text-body bg-surface-container px-2 py-0.5 rounded">
                                  {problem.category}
                                </span>
                              </div>

                              {/* Solve button */}
                              <div className="flex items-center justify-end">
                                {problem.url ? (
                                  <a
                                    href={problem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-80 active:scale-95 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Solve
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-body italic">
                                    No link
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty state */}
                      {columnProblems.length === 0 && (
                        <div className="text-center py-8 text-body text-xs">
                          No problems here yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
