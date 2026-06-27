using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59RefreshTokens")]
    public class RefreshToken
    {
        [DynamoDBHashKey]
        public string TokenHash { get; set; } = string.Empty;

        public string UserID { get; set; } = string.Empty;

        public string UserRole { get; set; } = string.Empty;

        public string IssuedAt { get; set; } = string.Empty;

        public long ExpiresAt { get; set; }

        public bool IsRevoked { get; set; }

        public string? RevokedAt { get; set; }

        public string? DeviceInfo { get; set; }
    }
}
