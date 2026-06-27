using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;

namespace LegalPortal.API.Helpers
{
    public class IntToStringConverter : IPropertyConverter
    {
        public DynamoDBEntry ToEntry(object value)
        {
            if (value is int intValue)
            {
                return new Primitive(intValue.ToString());
            }
            return new Primitive(string.Empty);
        }

        public object FromEntry(DynamoDBEntry entry)
        {
            var primitive = entry as Primitive;
            if (primitive != null && int.TryParse(primitive.Value as string, out var result))
            {
                return result;
            }
            return 0;
        }
    }
}
