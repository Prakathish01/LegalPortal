using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Roles")]
    public class Role
    {
        [DynamoDBHashKey(typeof(IntToStringConverter))]
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}
