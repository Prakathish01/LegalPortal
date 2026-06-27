using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Roles")]
    public class Role
    {
        [DynamoDBHashKey]
        public string RoleID { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
    }
}
