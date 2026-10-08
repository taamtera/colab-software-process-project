'use client';

import { useLanguage } from '@/lib/LanguageProvider';
import { TORContract } from '@/types';
import { getAnnouncementStage } from '@/lib/torPresentation';
import { ProjectStages } from './ProjectStages';

export function ProjectObservations({ project }: { project: TORContract }) {
  const { t } = useLanguage();
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-800 dark:text-slate-200">
      <h2 className="font-bold">{t("Project announcement stages")}</h2>
      <ProjectStages project={project} />
      <p className="text-xs text-slate-500">{t("Latest stage date:")} {project.statusPublishedAt || t("Not available")}{t("· Bidding open:")} {project.biddingOpenVerified ? t("Verified") : t("Unverified")}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          [t("Matched keywords"), project.titleMatchedKeywords?.join(', ') || t("Not available")],
          [t("First seen"), project.firstSeenAt || t("Not available")], [t("Last seen"), project.lastSeenAt || t("Not available")],
          [t("Linked project ID"), project.linkedProjectId || t("Not available")]
        ].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words">{value}</dd></div>)}
      </dl>
      <h3 className="font-semibold">{t("Latest retained observation per stage")}</h3>
      <p className="text-xs text-slate-500">{t("One retained observation per stage. These entries do not provide a complete announcement history.")}</p>
      <div className="grid gap-2">
        {Object.entries(project.stageObservations ?? {}).map(([code, observation]) => observation && (
          <div key={code} className="rounded border border-slate-200 dark:border-slate-800 p-3">
            <strong>{t(getAnnouncementStage(code))}</strong> · {observation.publishedAt || t("Date unavailable")}
            <p>{observation.title || t("Title unavailable")}</p>
            {(observation.documentUrl || observation.url) && <a className="text-sky-600 underline" href={observation.documentUrl || observation.url || ''} target="_blank" rel="noreferrer">{t("View stage document")}</a>}
          </div>
        ))}
      </div>
    </section>
  );
}
