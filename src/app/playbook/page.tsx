"use client";

import Link from "next/link";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Eyebrow, PageHeader, Pill } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/dialog";
import { OBJECTIONS, QUALIFICATION, SCRIPTS, SEQUENCES } from "@/lib/data";
import { displayStepTitle } from "@/lib/domain";
import type { Script, SequenceStep } from "@/lib/types";
import { copyText } from "@/lib/utils";

function ScriptCard({ id }: { id: string }) {
  const script = SCRIPTS[id] as Script | undefined;
  if (!script) return null;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13.5px] font-semibold">{script.title}</div>
          <div className="text-[10.5px] text-muted">
            {script.channel}
            {script.when ? ` · ${script.when}` : ""}
          </div>
        </div>
        <Button
          variant="subtle"
          size="sm"
          onClick={async () => {
            await copyText(script.subject ? `Subject: ${script.subject}\n\n${script.body}` : script.body);
            toast.success("Copied to clipboard.");
          }}
        >
          <Copy className="h-3 w-3" /> Copy
        </Button>
      </div>
      {script.subject ? (
        <div className="mt-2 rounded-md bg-[#f4efe2] px-2.5 py-1.5 text-[11.5px]">
          Subject: {script.subject}
        </div>
      ) : null}
      <pre className="script-body mt-2.5">{script.body}</pre>
    </Card>
  );
}

function StepTimeline({ seqId, compact }: { seqId: string; compact?: boolean }) {
  const steps = SEQUENCES[seqId]?.steps ?? [];
  return (
    <div className="mt-1">
      {steps.map((step: SequenceStep, i: number) => {
        const script = step.script ? SCRIPTS[step.script] : undefined;
        return (
          <div key={`${seqId}-${i}`} className={compact ? "flex gap-3 pb-2.5" : "flex gap-3 pb-3.5"}>
            <div className="relative">
              <div className="grid h-[25px] w-[25px] place-items-center rounded-full border-2 border-card bg-[#f0ebdf] text-[9.5px] font-bold text-ink-soft">
                {i + 1}
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <TypeChip type={step.type} />
                <strong className="text-[12.5px]">{displayStepTitle(step.title)}</strong>
                <em className="ml-auto text-[10px] not-italic text-muted">Day {step.gap}</em>
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted">{step.detail}</p>
              {script ? (
                <details className="mt-1">
                  <summary className="cursor-pointer text-[10.5px] font-semibold text-brand">
                    View script · {script.channel}
                  </summary>
                  <pre className="script-body mt-1.5">{script.body}</pre>
                  <Button
                    variant="subtle"
                    size="sm"
                    className="mt-1.5"
                    onClick={async () => {
                      await copyText(script.body);
                      toast.success("Copied to clipboard.");
                    }}
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </details>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeChip({ type }: { type: string }) {
  const label: Record<string, string> = {
    whatsapp: "WA",
    call: "CALL",
    email: "MAIL",
    session: "SESS",
    review: "CHECK",
    admin: "TASK",
  };
  return <span className={`type-chip type-${type}`}>{label[type] ?? "TASK"}</span>;
}

export default function PlaybookPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Say it the same way every time"
        title="Playbook"
        description="The exact words for the first call, the cadence, the staff session and the payday push. Copy, replace the brackets, send."
      />

      <Tabs defaultValue="pitch">
        <TabsList className="mb-4 flex gap-1 overflow-x-auto border-b border-line">
          {[
            ["pitch", "The pitch"],
            ["qualify", "Qualify"],
            ["outreach", "Outreach"],
            ["activate", "Activate"],
            ["objections", "Objections"],
            ["recovery", "Recovery"],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pitch">
          <Card className="mb-4 p-6">
            <Eyebrow>One breath</Eyebrow>
            <h2 className="serif mt-2 max-w-[760px] text-[28px] font-medium leading-[1.15] tracking-[-0.02em]">
              “We run your payroll for free. Your staff get a salary account with savings and access
              to pay they have already earned. The school pays nothing.”
            </h2>
            <p className="mt-2 text-[13px] text-muted">Then stop talking. The next question is theirs.</p>
            <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
              {[
                ["The school gets", ["Payroll run free, every month", "Salaries paid on time", "No setup fee, no per-staff fee", "A cleaner payroll record"]],
                ["The staff get", ["A salary account in their name", "Savings on payday", "Earned-salary access, capped", "No loan-app spiral"]],
                ["ChequeIn earns", ["When staff save", "When staff use earned salary", "Later: credit through the partner bank", "Not from the employer"]],
              ].map(([title, items]) => (
                <div key={String(title)}>
                  <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{title}</h4>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {(items as string[]).map((item) => (
                      <li key={item} className="relative pl-3 text-[12px] before:absolute before:left-0 before:text-brand-bright before:content-['–']">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <div className="mb-4 grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <Eyebrow>The maths that matters</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">₦300 × staff</h2>
              <p className="mt-1 text-[11px] text-muted">
                Baseline revenue per employee per month. 106 employees produce ₦31,905.
              </p>
              <div className="mt-2 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
                <div className="flex items-baseline gap-2 bg-[#fbf7ee] px-3 py-2">
                  <span className="w-20 text-[11px] text-muted">45 staff</span>
                  <strong className="serif text-[19px]">₦13,500</strong>
                  <em className="text-[10px] not-italic text-muted">per month</em>
                </div>
                <div className="flex items-baseline gap-2 bg-[#fbf7ee] px-3 py-2">
                  <span className="w-20 text-[11px] text-muted">10 employers</span>
                  <strong className="serif text-[19px]">₦135,000</strong>
                  <em className="text-[10px] not-italic text-muted">per month</em>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                At 50% activation and ₦900 per active user, the same school is worth ₦20,250 a month.
              </p>
            </Card>
            <Card className="p-4">
              <Eyebrow>Who to target</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Schools, 10–150 staff</h2>
              <ul className="mt-2 flex flex-col gap-1.5 text-[12px]">
                {["Monthly payroll, paid by transfer", "CAC + TIN already in place", "Owner or proprietor reachable", "Two of your three live employers are schools — copy that"].map((item) => (
                  <li key={item} className="relative pl-3.5 before:absolute before:left-0 before:text-brand-bright before:content-['→']">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-muted">
                Clinics and agencies are the next segment — same payroll profile, but check seasonality.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/pipeline">Open pipeline <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </Card>
            <ScriptCard id="call_opener" />
          </div>

          <Card className="p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <Eyebrow>Between yes and first payroll</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">What happens next</h2>
              </div>
              <Pill>the handoff is the sale</Pill>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["1", "Same day", "Send the document list", "WhatsApp, not email. Photos are fine. Name the two documents you actually need first."],
                ["2", "Within 48h", "Run compliance", "Send the pack to the partner bank and tell the employer what is still missing — not that it is 'in review'."],
                ["3", "Day 3–5", "Book the staff session", "Put it in the calendar for payday week. The session is the product, not an afterthought."],
                ["4", "Payday", "First payroll + session", "Run payroll, then 20 minutes with staff. Help the ones who get stuck, in person."],
                ["5", "Payday +1", "Activation nudge", "Send the employer the list of staff who did not finish. Then send the payday savings push."],
              ].map(([n, when, title, body]) => (
                <div key={n} className="border-t-2 border-line-strong pt-2">
                  <div className="serif text-[22px] leading-none text-gold">{n}</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-muted">{when}</div>
                  <h4 className="mt-0.5 text-[12.5px] font-semibold">{title}</h4>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] text-muted">
              Most deals die in this gap, not in the pitch. Keep the next action in the system and the
              employer never waits on you.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="qualify">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <Eyebrow>12 minutes, first call</Eyebrow>
                  <h2 className="mt-0.5 text-[18px] font-semibold">The six questions</h2>
                </div>
                <Pill>score ≥ 7/10</Pill>
              </div>
              <div className="flex flex-col">
                {QUALIFICATION.map((q, i) => (
                  <div key={q.id} className="flex gap-2.5 border-b border-[#f1ece0] py-2 last:border-0">
                    <span className="pt-0.5 font-mono text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <strong className="text-[12.5px]">{q.label}</strong>
                      <p className="text-[10.5px] text-muted">{q.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Staff count and payroll value are numbers. The rest are yes/no. Ask them in this order
                — the cash question early saves everyone time.
              </p>
            </Card>
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <Eyebrow>Kill criteria</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Say no early</h2>
                <ul className="mt-1 flex flex-col">
                  {[
                    ["Cash payroll", "no salary trail, no account."],
                    ["No CAC or TIN", "will fail the bank review."],
                    ["Under 10 staff", "revenue never covers onboarding."],
                    ["No decision maker", "you are collecting maybes."],
                    ["Another lender’s deduction", "partner sign-off first."],
                  ].map(([title, body]) => (
                    <li key={title} className="border-b border-[#f1ece0] py-2 text-[12px] last:border-0">
                      <strong className="text-danger">{title}</strong> — {body}
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 rounded-lg border border-[#eee2c8] bg-[#fbf6e9] px-2.5 py-2 text-[11.5px] text-[#6a5628]">
                  Seven of eleven employers failed after sign-up. Most of those conversations should
                  never have reached compliance. Every “no” on this call buys you an hour for a school
                  that can actually go live.
                </div>
              </Card>
              <Card className="p-5">
                <Eyebrow>The compliance question</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Ask for documents now</h2>
                <p className="mt-1 text-[11.5px] text-muted">
                  “To get you live we need eight documents. Can you send photos of the CAC, TIN and
                  staff list today? I’ll tell you exactly what’s missing before we book the demo.”
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={async () => {
                    await copyText(SCRIPTS.wa_docs.body);
                    toast.success("Document request copied.");
                  }}
                >
                  Copy the request
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="outreach">
          <Card className="mb-4 p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <Eyebrow>{SEQUENCES.school.label}</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Eight touches, 21 days</h2>
              </div>
              <Pill>WhatsApp first</Pill>
            </div>
            <p className="mb-3 text-[12px] text-muted">
              The cadence schedules itself when you add an employer. Each touch below is already
              written. Do not skip the break-up — it is the one that gets replies.
            </p>
            <StepTimeline seqId="school" />
          </Card>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-[18px] font-semibold">Send it well</h2>
              <ul className="mt-2 flex flex-col gap-2 text-[12px]">
                {["WhatsApp before 9am — that is when administrators do admin.", "One message, one ask. Never two questions.", "Voice notes after a reply; they convert better than paragraphs.", "Log every send in Today. The scorecard depends on it."].map((item) => (
                  <li key={item} className="relative pl-3.5 before:absolute before:left-0 before:text-brand-bright before:content-['→']">{item}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="text-[18px] font-semibold">The only metric</h2>
              <p className="mt-1 text-[12px] text-muted">
                Demos booked per 25 messages. If it is under one, the list is wrong — not the script.
                Change the list before you change the words.
              </p>
              <div className="mt-2 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
                <div className="flex items-baseline gap-2 bg-[#fbf7ee] px-3 py-2">
                  <span className="w-20 text-[11px] text-muted">25 sent</span>
                  <strong className="serif text-[19px]">1 demo</strong>
                  <em className="text-[10px] not-italic text-muted">minimum</em>
                </div>
                <div className="flex items-baseline gap-2 bg-[#fbf7ee] px-3 py-2">
                  <span className="w-20 text-[11px] text-muted">8 demos</span>
                  <strong className="serif text-[19px]">2 live</strong>
                  <em className="text-[10px] not-italic text-muted">target</em>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activate">
          <Card className="mb-4 p-5">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <Eyebrow>{SEQUENCES.activation.label}</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">Sign-up is not activation</h2>
              </div>
              <Pill>8% save · 33% EWA</Pill>
            </div>
            <p className="mb-3 text-[12px] text-muted">
              24 of 25 recent sign-ups completed KYC. Two funded savings. One came back within 30
              days. The gap is not the app — it is the absence of a human at the moment salary lands.
            </p>
            <StepTimeline seqId="activation" compact />
          </Card>
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <ScriptCard id="activation_session" />
            <ScriptCard id="payday_push" />
          </div>
          <Card className="bg-gradient-to-br from-[#123528] to-[#0d251d] p-5 text-[#f8f4e8]">
            <Eyebrow className="text-[#9cb0a3]">The rule</Eyebrow>
            <p className="serif mt-1.5 text-[21px] leading-snug">
              “A new employer without a staff session is a payroll, not a customer. The session is the
              product.”
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="objections">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <Eyebrow>Expect these</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Objections</h2>
              <div className="mt-1">
                {OBJECTIONS.map((o) => (
                  <details key={o.q} className="border-b border-[#f0ebdf] py-1">
                    <summary className="cursor-pointer py-1.5 text-[12.5px] font-semibold">{o.q}</summary>
                    <p className="pb-2 text-[12px] text-muted">{o.a}</p>
                    <Button
                      variant="subtle"
                      size="sm"
                      className="mb-2"
                      onClick={async () => {
                        await copyText(o.a);
                        toast.success("Answer copied.");
                      }}
                    >
                      <Copy className="h-3 w-3" /> Copy answer
                    </Button>
                  </details>
                ))}
              </div>
            </Card>
            <div className="flex flex-col gap-4">
              <Card className="p-5">
                <Eyebrow>Tone</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">How to say it</h2>
                <ul className="mt-2 flex flex-col gap-2 text-[12px]">
                  {["Slow down on “free”. Let the silence do the work.", "Never argue with “we already have someone”. Offer a parallel month.", "Do not defend the EWA fee. Explain the cap and the alternative.", "If they are cash-paid, say no in the first call. Politely.", "Ask for the decision maker by name. “Who signs payroll?”"].map((item) => (
                    <li key={item} className="relative pl-3.5 before:absolute before:left-0 before:text-brand-bright before:content-['→']">{item}</li>
                  ))}
                </ul>
              </Card>
              <Card className="p-5">
                <Eyebrow>After the demo</Eyebrow>
                <h2 className="mt-0.5 text-[18px] font-semibold">The close</h2>
                <p className="mt-1 text-[11.5px] text-muted">
                  “I’ll send the document list today. If you send the CAC, TIN and staff list by Friday,
                  I can hold an onboarding slot for the first week of next month. Does that work?”
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={async () => {
                    await copyText(SCRIPTS.wa_docs.body);
                    toast.success("Document list copied.");
                  }}
                >
                  Copy document list
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recovery">
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <Eyebrow>The seven</Eyebrow>
              <h2 className="mt-0.5 text-[18px] font-semibold">Triage, don’t re-sell</h2>
              <p className="mb-2 text-[12px] text-muted">
                These employers already said yes once. Do not pitch them again — find the exact blocker
                and remove it.
              </p>
              <StepTimeline seqId="recovery" compact />
            </Card>
            <div className="flex flex-col gap-4">
              <ScriptCard id="recovery_call" />
              <ScriptCard id="recovery_docs" />
            </div>
          </div>
          <Card className="p-5">
            <Eyebrow>Decision rule</Eyebrow>
            <h2 className="mt-0.5 text-[18px] font-semibold">Fixable or out</h2>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              {[
                ["Fixable", "Missing or expired document, name mismatch, consent not collected. Give it 14 days and a named next action."],
                ["Not a fit", "Cash payroll, no registration, refuses consent, or 14 days of silence. Park it, log why, revisit next term."],
                ["Unknown", "Do not leave it here. Unknown is how seven deals sat dead for weeks."],
              ].map(([title, body]) => (
                <div key={title} className="border-t-2 border-line-strong pt-2">
                  <strong className="text-[12.5px]">{title}</strong>
                  <p className="mt-0.5 text-[11.5px] text-muted">{body}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
