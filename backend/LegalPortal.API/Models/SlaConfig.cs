using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59SlaConfig")]
    public class SlaConfig
    {
        [DynamoDBHashKey]
        public string ConfigID { get; set; } = string.Empty;

        public string CategoryID { get; set; } = string.Empty;

        public string CategoryName { get; set; } = string.Empty;

        public int SLADays { get; set; }

        public int EscalationThresholdDays { get; set; }

        public string? AutoEscalateTo { get; set; }

        public int NotifyAdminAtDays { get; set; }

        public int NotifyHRAtDays { get; set; }

        public string? UpdatedByAdminID { get; set; }

        public string? UpdatedAt { get; set; }
    }
}
