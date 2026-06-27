using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using LegalPortal.API.Configuration;

namespace LegalPortal.API.Helpers
{
    public interface ISequenceGenerator
    {
        Task<int> GetNextSequenceAsync(string sequenceName);
    }

    public class SequenceGenerator : ISequenceGenerator
    {
        private readonly IAmazonDynamoDB _dynamoDb;

        public SequenceGenerator(IAmazonDynamoDB dynamoDb)
        {
            _dynamoDb = dynamoDb;
        }

        public async Task<int> GetNextSequenceAsync(string sequenceName)
        {
            var request = new UpdateItemRequest
            {
                TableName = TableSettings.CountersTable,
                Key = new Dictionary<string, AttributeValue>
                {
                    { "SequenceName", new AttributeValue { S = sequenceName } }
                },
                UpdateExpression = "ADD CurrentValue :incr",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    { ":incr", new AttributeValue { N = "1" } }
                },
                ReturnValues = ReturnValue.UPDATED_NEW
            };

            var response = await _dynamoDb.UpdateItemAsync(request);
            if (response.Attributes.TryGetValue("CurrentValue", out var val) && int.TryParse(val.N, out var result))
            {
                return result;
            }

            return 1;
        }
    }
}
