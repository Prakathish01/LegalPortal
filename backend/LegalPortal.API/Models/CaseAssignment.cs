using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59CaseAssignments")]
    public class CaseAssignment
    {
        [DynamoDBHashKey]
        public string AssignmentID { get; set; } = string.Empty;
        
        public string CaseID { get; set; } = string.Empty;
        
        public string OfficialID { get; set; } = string.Empty;
        
        public string AssignedByAdminID { get; set; } = string.Empty;
        
        public string AssignedAt { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public string? HandoffNotes { get; set; }

        public string? TransferredFromOfficialID { get; set; }

        public string? TransferredAt { get; set; }

        [DynamoDBIgnore]
        public string AssignedToUserID 
        { 
            get => OfficialID; 
            set => OfficialID = value; 
        }

        [DynamoDBIgnore]
        public string AssignedByUserID 
        { 
            get => AssignedByAdminID; 
            set => AssignedByAdminID = value; 
        }

        [DynamoDBIgnore]
        public string AssignedDate 
        { 
            get => AssignedAt; 
            set => AssignedAt = value; 
        }
    }
}
