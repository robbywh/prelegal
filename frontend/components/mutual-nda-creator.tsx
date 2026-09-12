"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FIELD_ANCHORS,
  STANDARD_TERMS_CLAUSES,
  buildPlainTextDocument,
  defaultFormValues,
  downloadFileName,
  formatConfidentialityTerm,
  formatEffectiveDate,
  formatMndaTerm,
  type MutualNdaFormValues,
  type PartyInfo,
} from "@/lib/mutual-nda";

function renderClauseBody(body: string): ReactNode {
  const tokens = body.split(/(\*\*.+?\*\*|\[\[.+?\]\])/g).filter(Boolean);
  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("[[") && token.endsWith("]]")) {
      const label = token.slice(2, -2);
      const anchor = FIELD_ANCHORS[label];
      return (
        <a key={index} href={anchor ? `#${anchor}` : undefined} className="underline">
          {label}
        </a>
      );
    }
    return token;
  });
}

type PartyKey = "partyOne" | "partyTwo";

function PartyFieldset({
  label,
  party,
  onChange,
}: {
  label: string;
  party: PartyInfo;
  onChange: (field: keyof PartyInfo, value: string) => void;
}) {
  return (
    <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {label}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Print name
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={party.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Jane Doe"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={party.title}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="CEO"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Company
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={party.company}
            onChange={(e) => onChange("company", e.target.value)}
            placeholder="Acme, Inc."
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Notice address (email or postal)
          <input
            className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={party.noticeAddress}
            onChange={(e) => onChange("noticeAddress", e.target.value)}
            placeholder="legal@acme.com"
          />
        </label>
      </div>
    </fieldset>
  );
}

export default function MutualNdaCreator() {
  const [values, setValues] = useState<MutualNdaFormValues>(defaultFormValues);

  const updateParty = (key: PartyKey) => (field: keyof PartyInfo, value: string) => {
    setValues((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const documentText = useMemo(() => buildPlainTextDocument(values), [values]);

  const handleDownload = () => {
    const blob = new Blob([documentText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadFileName(values);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid flex-1 grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-2 lg:gap-8">
      <section aria-label="Mutual NDA details form" className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mutual NDA creator</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Fill in the fields below. The document on the right updates as you type — download
            it once you&rsquo;re done.
          </p>
        </div>

        <PartyFieldset label="Party 1" party={values.partyOne} onChange={updateParty("partyOne")} />
        <PartyFieldset label="Party 2" party={values.partyTwo} onChange={updateParty("partyTwo")} />

        <fieldset className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Terms
          </legend>

          <label className="flex flex-col gap-1 text-sm">
            Purpose
            <textarea
              className="min-h-16 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={values.purpose}
              onChange={(e) => setValues((prev) => ({ ...prev, purpose: e.target.value }))}
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Effective date
            <input
              type="date"
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={values.effectiveDate}
              onChange={(e) => setValues((prev) => ({ ...prev, effectiveDate: e.target.value }))}
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">MNDA term</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mndaTermType"
                checked={values.mndaTermType === "expires"}
                onChange={() => setValues((prev) => ({ ...prev, mndaTermType: "expires" }))}
              />
              Expires
              <input
                type="number"
                min={1}
                className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={values.mndaTermYears}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, mndaTermYears: Number(e.target.value) || 1 }))
                }
                disabled={values.mndaTermType !== "expires"}
              />
              year(s) from Effective Date
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mndaTermType"
                checked={values.mndaTermType === "continues"}
                onChange={() => setValues((prev) => ({ ...prev, mndaTermType: "continues" }))}
              />
              Continues until terminated
            </label>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Term of confidentiality</span>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={values.confidentialityTermType === "years"}
                onChange={() =>
                  setValues((prev) => ({ ...prev, confidentialityTermType: "years" }))
                }
              />
              <input
                type="number"
                min={1}
                className="w-16 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                value={values.confidentialityTermYears}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    confidentialityTermYears: Number(e.target.value) || 1,
                  }))
                }
                disabled={values.confidentialityTermType !== "years"}
              />
              year(s) from Effective Date (or until trade secret status ends)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="confidentialityTermType"
                checked={values.confidentialityTermType === "perpetuity"}
                onChange={() =>
                  setValues((prev) => ({ ...prev, confidentialityTermType: "perpetuity" }))
                }
              />
              In perpetuity
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Governing law (state)
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={values.governingLaw}
              onChange={(e) => setValues((prev) => ({ ...prev, governingLaw: e.target.value }))}
              placeholder="Delaware"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Jurisdiction (city or county and state)
            <input
              className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={values.jurisdiction}
              onChange={(e) => setValues((prev) => ({ ...prev, jurisdiction: e.target.value }))}
              placeholder="New Castle, DE"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            MNDA modifications (optional)
            <textarea
              className="min-h-16 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={values.modifications}
              onChange={(e) => setValues((prev) => ({ ...prev, modifications: e.target.value }))}
            />
          </label>
        </fieldset>

        <button
          type="button"
          onClick={handleDownload}
          className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Download completed MNDA (.md)
        </button>
      </section>

      <section
        aria-label="Mutual NDA preview"
        className="max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-6 font-serif text-sm leading-6 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <h2 className="text-center text-lg font-semibold">Mutual Non-Disclosure Agreement</h2>

        <h3 className="mt-6 text-base font-semibold">Cover Page</h3>

        <div className="mt-3 space-y-3">
          <div id="field-purpose">
            <div className="font-semibold">Purpose</div>
            <div>{values.purpose || "[Purpose]"}</div>
          </div>
          <div id="field-effective-date">
            <div className="font-semibold">Effective Date</div>
            <div>{formatEffectiveDate(values)}</div>
          </div>
          <div id="field-mnda-term">
            <div className="font-semibold">MNDA Term</div>
            <div>{formatMndaTerm(values)}</div>
          </div>
          <div id="field-term-of-confidentiality">
            <div className="font-semibold">Term of Confidentiality</div>
            <div>{formatConfidentialityTerm(values)}</div>
          </div>
          <div>
            <div className="font-semibold">Governing Law &amp; Jurisdiction</div>
            <div id="field-governing-law">
              Governing Law: {values.governingLaw || "[Fill in state]"}
            </div>
            <div id="field-jurisdiction">
              Jurisdiction: {values.jurisdiction || "[Fill in city or county and state]"}
            </div>
          </div>
          {values.modifications && (
            <div>
              <div className="font-semibold">MNDA Modifications</div>
              <div>{values.modifications}</div>
            </div>
          )}
        </div>

        <p className="mt-4">
          By signing this Cover Page, each party agrees to enter into this MNDA as of the
          Effective Date.
        </p>

        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-zinc-300 p-2 text-left dark:border-zinc-700" />
              <th className="border border-zinc-300 p-2 text-center dark:border-zinc-700">
                Party 1
              </th>
              <th className="border border-zinc-300 p-2 text-center dark:border-zinc-700">
                Party 2
              </th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Print Name", "name"],
                ["Title", "title"],
                ["Company", "company"],
                ["Notice Address", "noticeAddress"],
              ] as [string, keyof PartyInfo][]
            ).map(([label, field]) => (
              <tr key={field}>
                <td className="border border-zinc-300 p-2 font-semibold dark:border-zinc-700">
                  {label}
                </td>
                <td className="border border-zinc-300 p-2 dark:border-zinc-700">
                  {values.partyOne[field] || "—"}
                </td>
                <td className="border border-zinc-300 p-2 dark:border-zinc-700">
                  {values.partyTwo[field] || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className="mt-8 text-base font-semibold">Standard Terms</h3>

        <ol className="mt-3 space-y-4">
          {STANDARD_TERMS_CLAUSES.map((clause) => (
            <li key={clause.number}>
              <strong>{clause.title}.</strong> {renderClauseBody(clause.body)}
            </li>
          ))}
        </ol>

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0), free to use under{" "}
          <a
            className="underline"
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY 4.0
          </a>
          . Cover Page fields above were completed using Prelegal; the Standard Terms are
          reproduced unmodified from the{" "}
          <a
            className="underline"
            href="https://commonpaper.com/standards/mutual-nda/1.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            original template
          </a>
          .
        </p>
      </section>
    </div>
  );
}
