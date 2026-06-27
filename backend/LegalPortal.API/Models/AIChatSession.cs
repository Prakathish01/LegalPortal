using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59AIChatSessions")]
    public class AIChatSession
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        public string UserID { get; set; } = string.Empty;

        public List<Dictionary<string, string>> History { get; set; } = new List<Dictionary<string, string>>();

        public int MessageCount { get; set; }

        public string StartedAt { get; set; } = string.Empty;

        public string LastActivityAt { get; set; } = string.Empty;

        public long TTL { get; set; }
    }
}
