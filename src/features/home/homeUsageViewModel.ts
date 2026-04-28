import type {
  AccountSnapshot,
  LocalUsageDay,
  LocalUsageSnapshot,
  RateLimitSnapshot,
} from "../../types";
import { formatRelativeTime } from "../../utils/time";
import { getUsageLabels } from "../app/utils/usageLabels";
import {
  buildWindowCaption,
  formatAccountTypeLabel,
  formatCompactNumber,
  formatCount,
  formatCreditsBalance,
  formatDayCount,
  formatDayLabel,
  formatDuration,
  formatDurationCompact,
  formatPlanType,
  isUsageDayActive,
} from "./homeFormatters";
import type { HomeStatCard, UsageMetric } from "./homeTypes";
import { i18n } from "@/i18n/config";

type HomeUsageViewModel = {
  accountCards: HomeStatCard[];
  accountMeta: string | null;
  updatedLabel: string | null;
  usageCards: HomeStatCard[];
  usageDays: LocalUsageDay[];
  usageInsights: HomeStatCard[];
};

export function buildHomeUsageViewModel({
  accountInfo,
  accountRateLimits,
  localUsageSnapshot,
  usageMetric,
  usageShowRemaining,
}: {
  accountInfo: AccountSnapshot | null;
  accountRateLimits: RateLimitSnapshot | null;
  localUsageSnapshot: LocalUsageSnapshot | null;
  usageMetric: UsageMetric;
  usageShowRemaining: boolean;
}): HomeUsageViewModel {
  const t = i18n.t.bind(i18n);
  const usageTotals = localUsageSnapshot?.totals ?? null;
  const usageDays = localUsageSnapshot?.days ?? [];
  const latestUsageDay = usageDays[usageDays.length - 1] ?? null;
  const last7Days = usageDays.slice(-7);
  const last7Tokens = last7Days.reduce((total, day) => total + day.totalTokens, 0);
  const last7Input = last7Days.reduce((total, day) => total + day.inputTokens, 0);
  const last7Cached = last7Days.reduce(
    (total, day) => total + day.cachedInputTokens,
    0,
  );
  const last7AgentMs = last7Days.reduce(
    (total, day) => total + (day.agentTimeMs ?? 0),
    0,
  );
  const last30AgentMs = usageDays.reduce(
    (total, day) => total + (day.agentTimeMs ?? 0),
    0,
  );
  const averageDailyAgentMs =
    last7Days.length > 0 ? Math.round(last7AgentMs / last7Days.length) : 0;
  const last7AgentRuns = last7Days.reduce(
    (total, day) => total + (day.agentRuns ?? 0),
    0,
  );
  const last30AgentRuns = usageDays.reduce(
    (total, day) => total + (day.agentRuns ?? 0),
    0,
  );
  const averageTokensPerRun =
    last7AgentRuns > 0 ? Math.round(last7Tokens / last7AgentRuns) : null;
  const averageRunDurationMs =
    last7AgentRuns > 0 ? Math.round(last7AgentMs / last7AgentRuns) : null;
  const last7ActiveDays = last7Days.filter(isUsageDayActive).length;
  const last30ActiveDays = usageDays.filter(isUsageDayActive).length;
  const averageActiveDayAgentMs =
    last7ActiveDays > 0 ? Math.round(last7AgentMs / last7ActiveDays) : null;
  const peakAgentDay = usageDays.reduce<
    | { day: string; agentTimeMs: number }
    | null
  >((best, day) => {
    const value = day.agentTimeMs ?? 0;
    if (value <= 0) {
      return best;
    }
    if (!best || value > best.agentTimeMs) {
      return { day: day.day, agentTimeMs: value };
    }
    return best;
  }, null);

  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of usageDays) {
    if (isUsageDayActive(day)) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  const usageCards: HomeStatCard[] =
    usageMetric === "tokens"
      ? [
          {
            label: t("home.usage.today"),
            value: formatCompactNumber(latestUsageDay?.totalTokens ?? 0),
            suffix: t("home.usage.tokens"),
            caption: latestUsageDay
              ? `${formatDayLabel(latestUsageDay.day)} · ${t("home.usage.inputOutput", {
                  input: formatCount(latestUsageDay.inputTokens),
                  output: formatCount(latestUsageDay.outputTokens),
                })}`
              : t("home.usage.latestAvailableDay"),
          },
          {
            label: t("home.usage.last7Days"),
            value: formatCompactNumber(usageTotals?.last7DaysTokens ?? last7Tokens),
            suffix: t("home.usage.tokens"),
            caption: t("home.usage.avgPerDay", {
              value: formatCompactNumber(usageTotals?.averageDailyTokens),
            }),
          },
          {
            label: t("home.usage.last30Days"),
            value: formatCompactNumber(usageTotals?.last30DaysTokens ?? last7Tokens),
            suffix: t("home.usage.tokens"),
            caption: t("home.usage.totalWithValue", {
              value: formatCount(usageTotals?.last30DaysTokens ?? last7Tokens),
            }),
          },
          {
            label: t("home.usage.cacheHitRate"),
            value: usageTotals
              ? `${usageTotals.cacheHitRatePercent.toFixed(1)}%`
              : "--",
            caption: t("home.usage.last7DaysCaption"),
          },
          {
            label: t("home.usage.cachedTokens"),
            value: formatCompactNumber(last7Cached),
            suffix: t("home.usage.saved"),
            caption:
              last7Input > 0
                ? t("home.usage.promptTokenShare", {
                    value: `${((last7Cached / last7Input) * 100).toFixed(1)}%`,
                  })
                : t("home.usage.last7DaysCaption"),
          },
          {
            label: t("home.usage.avgPerRun"),
            value:
              averageTokensPerRun === null
                ? "--"
                : formatCompactNumber(averageTokensPerRun),
            suffix: t("home.usage.tokens"),
            caption:
              last7AgentRuns > 0
                ? t("home.usage.runsInLast7Days", {
                    value: formatCount(last7AgentRuns),
                  })
                : t("home.usage.noRunsYet"),
          },
          {
            label: t("home.usage.peakDay"),
            value: formatDayLabel(usageTotals?.peakDay),
            caption: `${formatCompactNumber(usageTotals?.peakDayTokens)} ${t("home.usage.tokens")}`,
          },
        ]
      : [
          {
            label: t("home.usage.last7Days"),
            value: formatDurationCompact(last7AgentMs),
            suffix: t("home.usage.agentTime"),
            caption: t("home.usage.avgPerDay", {
              value: formatDurationCompact(averageDailyAgentMs),
            }),
          },
          {
            label: t("home.usage.last30Days"),
            value: formatDurationCompact(last30AgentMs),
            suffix: t("home.usage.agentTime"),
            caption: t("home.usage.totalWithValue", {
              value: formatDuration(last30AgentMs),
            }),
          },
          {
            label: t("home.usage.runs"),
            value: formatCount(last7AgentRuns),
            suffix: t("home.usage.runsUnit"),
            caption: t("home.usage.last30DaysRuns", {
              value: formatCount(last30AgentRuns),
            }),
          },
          {
            label: t("home.usage.avgPerRun"),
            value: formatDurationCompact(averageRunDurationMs),
            caption:
              last7AgentRuns > 0
                ? t("home.usage.acrossRuns", {
                    value: formatCount(last7AgentRuns),
                  })
                : t("home.usage.noRunsYet"),
          },
          {
            label: t("home.usage.avgPerActiveDay"),
            value: formatDurationCompact(averageActiveDayAgentMs),
            caption:
              last7ActiveDays > 0
                ? t("home.usage.activeDaysInLast7", {
                    value: formatCount(last7ActiveDays),
                  })
                : t("home.usage.noActiveDaysYet"),
          },
          {
            label: t("home.usage.peakDay"),
            value: formatDayLabel(peakAgentDay?.day ?? null),
            caption: t("home.usage.agentTimeCaption", {
              value: formatDurationCompact(peakAgentDay?.agentTimeMs ?? 0),
            }),
          },
        ];

  const usageInsights = [
    {
      label: t("home.usage.longestStreak"),
      value: longestStreak > 0 ? formatDayCount(longestStreak) : "--",
      caption:
        longestStreak > 0
          ? t("home.usage.acrossCurrentUsageRange")
          : t("home.usage.noActiveStreakYet"),
      compact: true,
    },
    {
      label: t("home.usage.activeDays"),
      value: last7Days.length > 0 ? `${last7ActiveDays} / ${last7Days.length}` : "--",
      caption:
        usageDays.length > 0
          ? t("home.usage.activeDaysInCurrentRange", {
              active: last30ActiveDays,
              total: usageDays.length,
            })
          : t("home.usage.noActivityYet"),
      compact: true,
    },
  ] satisfies HomeStatCard[];

  const usagePercentLabels = getUsageLabels(accountRateLimits, usageShowRemaining);
  const planLabel = formatPlanType(accountRateLimits?.planType ?? accountInfo?.planType);
  const creditsBalance = formatCreditsBalance(accountRateLimits?.credits?.balance);
  const accountCards: HomeStatCard[] = [];

  if (usagePercentLabels.sessionPercent !== null) {
    accountCards.push({
      label: usageShowRemaining
        ? t("home.usage.sessionLeft")
        : t("home.usage.sessionUsage"),
      value: `${usagePercentLabels.sessionPercent}%`,
      caption: buildWindowCaption(
        usagePercentLabels.sessionResetLabel,
        accountRateLimits?.primary?.windowDurationMins,
        t("home.usage.currentWindow"),
      ),
    });
  }

  if (usagePercentLabels.showWeekly && usagePercentLabels.weeklyPercent !== null) {
    accountCards.push({
      label: usageShowRemaining
        ? t("home.usage.weeklyLeft")
        : t("home.usage.weeklyUsage"),
      value: `${usagePercentLabels.weeklyPercent}%`,
      caption: buildWindowCaption(
        usagePercentLabels.weeklyResetLabel,
        accountRateLimits?.secondary?.windowDurationMins,
        t("home.usage.longerWindow"),
      ),
    });
  }

  if (accountRateLimits?.credits?.hasCredits) {
    accountCards.push(
      accountRateLimits.credits.unlimited
        ? {
            label: t("home.usage.credits"),
            value: t("home.usage.unlimited"),
            caption: t("home.usage.availableBalance"),
          }
        : {
            label: t("home.usage.credits"),
            value: creditsBalance ?? "--",
            suffix: creditsBalance ? t("home.usage.credits") : null,
            caption: t("home.usage.availableBalance"),
          },
    );
  }

  if (planLabel) {
    accountCards.push({
      label: t("home.usage.plan"),
      value: planLabel,
      caption: formatAccountTypeLabel(accountInfo?.type),
    });
  }

  return {
    accountCards,
    accountMeta: accountInfo?.email ?? null,
    updatedLabel: localUsageSnapshot
      ? t("home.usage.updated", {
          value: formatRelativeTime(localUsageSnapshot.updatedAt),
        })
      : null,
    usageCards,
    usageDays,
    usageInsights,
  };
}
