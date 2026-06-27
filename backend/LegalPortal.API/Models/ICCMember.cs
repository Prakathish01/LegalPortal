using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59ICCMembers")]
    public class ICCMember
    {
        [DynamoDBHashKey]
        public string MemberID { get; set; } = string.Empty;

        public string? OfficialID { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string MemberRole { get; set; } = string.Empty;

        public string TermStartDate { get; set; } = string.Empty;

        public string TermEndDate { get; set; } = string.Empty;

        public bool HasRecusalConflict { get; set; }

        public string? RecusalReason { get; set; }

        public string Status { get; set; } = string.Empty;

        public string AddedByAdminID { get; set; } = string.Empty;

        public string CreatedAt { get; set; } = string.Empty;
    }
}
