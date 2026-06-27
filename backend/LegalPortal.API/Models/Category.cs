using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Categories")]
    public class Category
    {
        [DynamoDBHashKey]
        public string CategoryID { get; set; } = string.Empty;
        
        public string CategoryName { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;

        public int SLADays { get; set; }

        public int EscalationThresholdDays { get; set; }

        public string? AutoEscalateTo { get; set; }

        public bool RequiresICC { get; set; }

        public bool IsActive { get; set; }

        public string? CreatedAt { get; set; }
    }
}
