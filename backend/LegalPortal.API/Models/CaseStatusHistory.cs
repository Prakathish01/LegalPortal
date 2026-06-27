using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseStatusHistory")]
    public class CaseStatusHistory
    {
        [DynamoDBHashKey]
        public string HistoryID { get; set; } = string.Empty;
        
        public int CaseID { get; set; }
        
        public string? OldStatus { get; set; }
        
        public string NewStatus { get; set; } = string.Empty;
        
        public int ChangedByUserID { get; set; }

        public string ChangedByRole { get; set; } = string.Empty;
        
        public string Timestamp { get; set; } = string.Empty;

        public string Notes { get; set; } = string.Empty;
    }
}
