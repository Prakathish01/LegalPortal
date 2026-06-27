using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59SlaConfig")]
    public class SlaConfig
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int CategoryID { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public int SLADays { get; set; }

        public int EscalationThresholdDays { get; set; }

        public int? AutoEscalateTo { get; set; }
    }
}
