export type StageId = "lead" | "contacted" | "qualified" | "demo" | "compliance" | "live" | "lost";
export type SeqId = "school" | "activation" | "recovery";
export type ActionType = "whatsapp" | "call" | "email" | "session" | "review" | "admin";
export type CheckId = string;

export interface StageDef {
  id: StageId;
  label: string;
  short: string;
  hint: string;
}

export interface CheckDef {
  id: CheckId;
  label: string;
  detail: string;
}

export interface QualificationDef {
  id: string;
  label: string;
  type: "number" | "bool";
  hint: string;
}

export interface SequenceStep {
  gap: number;
  type: ActionType;
  title: string;
  detail: string;
  script?: string;
}

export interface Sequence {
  id: SeqId;
  label: string;
  steps: SequenceStep[];
}

export interface Script {
  title: string;
  channel: string;
  when?: string;
  subject?: string;
  body: string;
}

export interface Objection {
  q: string;
  a: string;
}

export interface SourcingLink {
  label: string;
  detail: string;
  href: string;
}

export interface RedFlag {
  title: string;
  detail: string;
}

export interface Failure {
  reason: string;
  note: string;
}

export interface Qualification {
  staffCount: number | null;
  monthlyPayroll: number | null;
  paidByTransfer: boolean | null;
  decisionMaker: boolean | null;
  registered: boolean | null;
  noDeductions: boolean | null;
  consentPossible: boolean | null;
  demoDone: boolean;
}

export interface Compliance {
  checks: Record<string, boolean | null>;
  failReason: string;
  fixable: boolean | null;
}

export interface Metrics {
  employees: number;
  ewaActive: number;
  savingsFunded: number;
  revenue: number;
}

export interface NextAction {
  seq: SeqId;
  step: number;
  type: ActionType;
  title: string;
  detail: string;
  script: string | null;
  due: string;
}

export type ActivityType = "note" | "done" | "stage";

export interface Activity {
  date: string;
  type: ActivityType;
  text: string;
}

export interface Employer {
  id: string;
  name: string;
  segment: string;
  city: string;
  contact: string;
  role: string;
  phone: string;
  email: string;
  source: string;
  staffEstimate: number;
  stage: StageId;
  createdAt: string;
  qualification: Qualification;
  compliance: Compliance;
  metrics: Metrics;
  nextAction: NextAction | null;
  activity: Activity[];
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  detail: string;
  due: string;
  type: ActionType;
  done: boolean;
  route?: string;
  anchor?: string;
}

export interface DailyLog {
  whatsapp: number;
  calls: number;
  demos: number;
  packs: number;
}

export interface WeeklyTargets {
  whatsapp: number;
  calls: number;
  demos: number;
  compliancePacks: number;
  onboardings: number;
}

export interface QuarterTargets {
  employersLive: number;
  activeEmployees: number;
  revenuePerEmployee: number;
  compliancePass: number;
  activation: number;
  savingsRate: number;
  retention: number;
  repayment: number;
}

export interface Baseline {
  asOf: string;
  employersTotal: number;
  employersPassed: number;
  employersLive: number;
  employees: number;
  revenue: number;
  signups30d: number;
  kyc: number;
  savingsFunded: number;
  retained30d: number;
  ewaPenetration: number;
  savingsRate: number;
  repayment: number;
}

export interface AppState {
  version?: number;
  employers: Employer[];
  tasks: Task[];
  log: Record<string, DailyLog>;
  checklist: Record<string, boolean>;
  baseline: Baseline;
  targets: { weekly: WeeklyTargets; quarter: QuarterTargets };
  revPerEmployee: number;
  revPerActive: number;
}

export interface ActionItem {
  key: string;
  kind: "employer" | "task";
  employer?: Employer;
  task?: Task;
  type: ActionType;
  title: string;
  detail: string;
  due: string;
  script?: string | null;
}

export interface GateResult {
  ok: boolean;
  message: string;
}
