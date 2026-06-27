using Amazon.DynamoDBv2.DataModel;

namespace LegalPortal.API.Models
{
    [DynamoDBTable("ep59Counters")]
    public class SequenceCounter
    {
        [DynamoDBHashKey]
        public string SequenceName { get; set; } = string.Empty;
        public int CurrentValue { get; set; }
    }
}
