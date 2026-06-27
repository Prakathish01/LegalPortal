using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Cases")]
    public class Case
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int CaseID { get; set; }
        
        public int UserID { get; set; }
        
        public int CategoryID { get; set; }
        
        public string Subject { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public string Priority { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;
        
        public string CreatedDate { get; set; } = string.Empty;
        
        public string? ClosedDate { get; set; }

        public int? AssignedOfficialID { get; set; }

        public string? DueDate { get; set; }

        public int SLADays { get; set; }

        public bool IsAnonymous { get; set; }

        public string? WithdrawalReason { get; set; }

        public int? ClosedBy { get; set; }

        public int? SatisfactionScore { get; set; }
    }
}
