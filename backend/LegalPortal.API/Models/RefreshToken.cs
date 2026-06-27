using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59RefreshTokens")]
    public class RefreshToken
    {
        [DynamoDBHashKey]
        public string TokenHash { get; set; } = string.Empty;

        public int UserID { get; set; }

        public string IssuedAt { get; set; } = string.Empty;

        public string ExpiresAt { get; set; } = string.Empty;

        public bool IsRevoked { get; set; }
    }
}
