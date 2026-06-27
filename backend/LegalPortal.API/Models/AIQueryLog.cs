using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59AIQueryLog")]
    public class AIQueryLog
    {
        [DynamoDBHashKey]
        public string QueryID { get; set; } = string.Empty;

        public string SessionID { get; set; } = string.Empty;

        public string UserID { get; set; } = string.Empty;

        public string Query { get; set; } = string.Empty;

        public List<RetrievedChunk> RetrievedChunks { get; set; } = new List<RetrievedChunk>();

        public string Response { get; set; } = string.Empty;

        public List<string> CitedDocuments { get; set; } = new List<string>();

        public bool? WasHelpful { get; set; }

        public string? FeedbackNote { get; set; }

        public int LatencyMs { get; set; }

        public string Timestamp { get; set; } = string.Empty;
    }

    public class RetrievedChunk
    {
        public string SourceDoc { get; set; } = string.Empty;
        public string ChunkText { get; set; } = string.Empty;
        public double SimilarityScore { get; set; }
    }
}
