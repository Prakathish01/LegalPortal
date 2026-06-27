using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59EscalationRules")]
    public class EscalationRule
    {
        [DynamoDBHashKey]
        public string RuleID { get; set; } = string.Empty;

        public string RuleName { get; set; } = string.Empty;

        public string TriggerStatus { get; set; } = string.Empty;

        public int TriggerAfterDays { get; set; }

        public string EscalateTo { get; set; } = string.Empty;

        public string NotifyAdminID { get; set; } = string.Empty;

        public bool SendEmailAlert { get; set; }

        public bool IsActive { get; set; }

        public string CreatedByAdminID { get; set; } = string.Empty;

        public string CreatedAt { get; set; } = string.Empty;

        public string UpdatedAt { get; set; } = string.Empty;
    }
}
