using System;

namespace LegalPortal.API.Configuration
{
    public static class TableSettings
    {
        public static string OfficialsTable => Environment.GetEnvironmentVariable("OFFICIALS_TABLE") ?? "ep59Officials";
        public static string UsersTable => Environment.GetEnvironmentVariable("USERS_TABLE") ?? "ep59Users";
        public static string RolesTable => Environment.GetEnvironmentVariable("ROLES_TABLE") ?? "ep59Roles";
        public static string CasesTable => Environment.GetEnvironmentVariable("CASES_TABLE") ?? "ep59Cases";
        public static string CategoriesTable => Environment.GetEnvironmentVariable("CATEGORIES_TABLE") ?? "ep59Categories";
        public static string CommentsTable => Environment.GetEnvironmentVariable("COMMENTS_TABLE") ?? "ep59Comments";
        public static string CaseAssignmentsTable => Environment.GetEnvironmentVariable("CASE_ASSIGNMENTS_TABLE") ?? "ep59CaseAssignments";
        public static string CaseStatusHistoryTable => Environment.GetEnvironmentVariable("CASE_STATUS_HISTORY_TABLE") ?? "ep59CaseStatusHistory";
        public static string AttachmentsTable => Environment.GetEnvironmentVariable("ATTACHMENTS_TABLE") ?? "ep59Attachments";
        public static string NotificationsTable => Environment.GetEnvironmentVariable("NOTIFICATIONS_TABLE") ?? "ep59Notifications";
        public static string WhistleblowerReportsTable => Environment.GetEnvironmentVariable("WHISTLEBLOWER_REPORTS_TABLE") ?? "ep59WhistleblowerReports";
        public static string CaseMessagesTable => Environment.GetEnvironmentVariable("CASE_MESSAGES_TABLE") ?? "ep59CaseMessages";
        public static string CaseDocumentRequestsTable => Environment.GetEnvironmentVariable("CASE_DOCUMENT_REQUESTS_TABLE") ?? "ep59CaseDocumentRequests";
        public static string SlaConfigTable => Environment.GetEnvironmentVariable("SLA_CONFIG_TABLE") ?? "ep59SlaConfig";
        public static string AuditLogsTable => Environment.GetEnvironmentVariable("AUDIT_LOGS_TABLE") ?? "ep59AuditLogs";
        public static string RefreshTokensTable => Environment.GetEnvironmentVariable("REFRESH_TOKENS_TABLE") ?? "ep59RefreshTokens";

        // New tables
        public static string EscalationRulesTable => Environment.GetEnvironmentVariable("ESCALATION_RULES_TABLE") ?? "ep59EscalationRules";
        public static string AIChatSessionsTable => Environment.GetEnvironmentVariable("AI_CHAT_SESSIONS_TABLE") ?? "ep59AIChatSessions";
        public static string AIQueryLogTable => Environment.GetEnvironmentVariable("AI_QUERY_LOG_TABLE") ?? "ep59AIQueryLog";
        public static string PolicyDocumentsTable => Environment.GetEnvironmentVariable("POLICY_DOCUMENTS_TABLE") ?? "ep59PolicyDocuments";
        public static string HearingsTable => Environment.GetEnvironmentVariable("HEARINGS_TABLE") ?? "ep59Hearings";
        public static string ICCMembersTable => Environment.GetEnvironmentVariable("ICC_MEMBERS_TABLE") ?? "ep59ICCMembers";

        public static string CountersTable => Environment.GetEnvironmentVariable("COUNTERS_TABLE") ?? "ep59Counters";
        public static string AwsRegion => Environment.GetEnvironmentVariable("AWS_REGION") ?? "eu-west-1";
    }
}
