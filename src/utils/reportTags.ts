import type { CaseDefinition, Report } from '../types';

interface QuestionTagMeta {
    shortLabel?: string;
    isDangerSign: boolean;
}

export interface DiseaseQuestionLookup {
    byDisease: Record<string, Record<string, QuestionTagMeta>>;
    byQuestionId: Record<string, QuestionTagMeta>;
}

export interface ReportDisplayTags {
    symptoms: string[];
    dangerSigns: string[];
}

function normalizeDiseaseKey(disease: string): string {
    return disease.trim().toLowerCase();
}

function normalizeText(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function formatLabel(text: string): string {
    const trimmed = text.trim().replace(/\s+/g, ' ');
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const LEADING_AUXILIARY = /^(does|do|is|are|has|have|can|could|did|was|were|will|would|should)\s+/i;
const LEADING_SUBJECT = /^(the\s+person|person|the\s+patient|patient|they|he|she|there|the)\s+/i;

export function cleanQuestionTextToLabel(text: string): string {
    let label = text.trim().replace(/\s+/g, ' ');
    label = label.replace(/[?!.]+$/g, '');
    label = label.replace(LEADING_AUXILIARY, '');
    label = label.replace(LEADING_SUBJECT, '');
    return formatLabel(label);
}

function cleanStoredTag(tag: string): string {
    const trimmed = tag.trim();
    if (!trimmed) return '';
    const looksLikeQuestion = /[?]$/.test(trimmed) || LEADING_AUXILIARY.test(trimmed);
    return looksLikeQuestion ? cleanQuestionTextToLabel(trimmed) : formatLabel(trimmed.replace(/[?!.]+$/g, ''));
}

function dedupeOrdered(items: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const item of items) {
        const normalized = normalizeText(item);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push(item);
    }

    return result;
}

function normalizeStoredTag(tag: string): string {
    return tag.trim().replace(/\s+/g, ' ');
}

function getQuestionMeta(
    questionId: string,
    diseaseLookup: Record<string, QuestionTagMeta>,
    globalLookup: Record<string, QuestionTagMeta>
): QuestionTagMeta | undefined {
    return diseaseLookup[questionId] ?? globalLookup[questionId];
}

export function buildDiseaseQuestionLookup(definitions: CaseDefinition[]): DiseaseQuestionLookup {
    return definitions.reduce<DiseaseQuestionLookup>(
        (acc, def) => {
            const questionMap: Record<string, QuestionTagMeta> = {};
            for (const question of def.questions) {
                const meta = {
                    shortLabel: question.shortLabel,
                    isDangerSign: question.isDangerSign,
                };
                questionMap[question.id] = meta;
                acc.byQuestionId[question.id] = meta;
            }
            acc.byDisease[normalizeDiseaseKey(def.disease)] = questionMap;
            return acc;
        },
        { byDisease: {}, byQuestionId: {} }
    );
}

export function getReportDisplayTags(
    report: Pick<Report, 'disease' | 'answers' | 'symptoms' | 'dangerSigns'>,
    lookup?: DiseaseQuestionLookup
): ReportDisplayTags {
    const diseaseLookup = lookup?.byDisease[normalizeDiseaseKey(report.disease)] ?? {};
    const globalLookup = lookup?.byQuestionId ?? {};

    const storedRawSymptoms = dedupeOrdered((report.symptoms ?? []).map(normalizeStoredTag).filter(Boolean));
    const storedRawDangerSigns = dedupeOrdered((report.dangerSigns ?? []).map(normalizeStoredTag).filter(Boolean));
    const hasLookupMeta = Object.keys(globalLookup).length > 0;

    // If lookup metadata is unavailable (offline first load, failed caseDefinitions read),
    // prefer stored tags only to avoid contradictory relabeling.
    if (!hasLookupMeta) {
        const dangerSignSet = new Set(storedRawDangerSigns.map(normalizeText));
        return {
            symptoms: storedRawSymptoms.filter((tag) => !dangerSignSet.has(normalizeText(tag))),
            dangerSigns: storedRawDangerSigns,
        };
    }

    const storedSymptoms = dedupeOrdered(storedRawSymptoms.map(cleanStoredTag).filter(Boolean));
    const storedDangerSigns = dedupeOrdered(storedRawDangerSigns.map(cleanStoredTag).filter(Boolean));

    const storedDangerSet = new Set(storedDangerSigns.map(normalizeText));

    const answerSymptoms: string[] = [];
    const answerDangerSigns: string[] = [];
    const coveredFromAnswers = new Set<string>();

    for (const answer of report.answers ?? []) {
        if (!answer.answer) continue;

        const meta = getQuestionMeta(answer.questionId, diseaseLookup, globalLookup);
        const cleanedQuestionText = cleanQuestionTextToLabel(answer.questionText);
        const label = formatLabel(meta?.shortLabel || cleanedQuestionText);
        if (!label) continue;

        coveredFromAnswers.add(normalizeText(label));
        coveredFromAnswers.add(normalizeText(cleanedQuestionText));

        if (meta?.isDangerSign === true) {
            answerDangerSigns.push(label);
            continue;
        }

        if (meta?.isDangerSign === false) {
            answerSymptoms.push(label);
            continue;
        }

        const normalizedLabel = normalizeText(label);
        const normalizedQuestionText = normalizeText(cleanedQuestionText);

        if (storedDangerSet.has(normalizedLabel) || storedDangerSet.has(normalizedQuestionText)) {
            answerDangerSigns.push(label);
        } else {
            answerSymptoms.push(label);
        }
    }

    const supplementalStoredDangerSigns = storedDangerSigns.filter(
        (tag) => !coveredFromAnswers.has(normalizeText(tag))
    );
    const supplementalStoredSymptoms = storedSymptoms.filter(
        (tag) => !coveredFromAnswers.has(normalizeText(tag))
    );

    const dangerSigns = dedupeOrdered([...answerDangerSigns, ...supplementalStoredDangerSigns]);
    const dangerSignSet = new Set(dangerSigns.map(normalizeText));
    const symptoms = dedupeOrdered([...answerSymptoms, ...supplementalStoredSymptoms]).filter(
        (tag) => !dangerSignSet.has(normalizeText(tag))
    );

    return { symptoms, dangerSigns };
}

export function getAnswerDisplayLabel(
    disease: string,
    answer: Pick<Report['answers'][number], 'questionId' | 'questionText'>,
    lookup?: DiseaseQuestionLookup
): string {
    const diseaseLookup = lookup?.byDisease[normalizeDiseaseKey(disease)] ?? {};
    const globalLookup = lookup?.byQuestionId ?? {};
    const meta = getQuestionMeta(answer.questionId, diseaseLookup, globalLookup);
    return formatLabel(meta?.shortLabel || cleanQuestionTextToLabel(answer.questionText));
}
