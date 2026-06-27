using System;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;

namespace LegalPortal.API.Functions
{
    public class ApiGatewayRouter : BaseFunction
    {
        private readonly AuthFunctions _auth = new AuthFunctions();
        private readonly UserFunctions _users = new UserFunctions();
        private readonly OfficialFunctions _officials = new OfficialFunctions();
        private readonly ComplaintFunctions _complaints = new ComplaintFunctions();
        private readonly CategoryFunctions _categories = new CategoryFunctions();
        private readonly CommentFunctions _comments = new CommentFunctions();
        private readonly AttachmentFunctions _attachments = new AttachmentFunctions();
        private readonly AssignmentFunctions _assignments = new AssignmentFunctions();
        private readonly NotificationFunctions _notifications = new NotificationFunctions();
        private readonly StatusFunctions _status = new StatusFunctions();
        private readonly WhistleblowerFunctions _whistleblower = new WhistleblowerFunctions();

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            var path = request.Path?.ToLowerInvariant() ?? string.Empty;

            // Normalize path by removing trailing slash
            if (path.Length > 1 && path.EndsWith("/"))
            {
                path = path.Substring(0, path.Length - 1);
            }

            if (path.StartsWith("/login", StringComparison.OrdinalIgnoreCase))
            {
                return await _auth.Login(request, context);
            }
            if (path.StartsWith("/users", StringComparison.OrdinalIgnoreCase))
            {
                return await _users.HandleRequest(request, context);
            }
            if (path.StartsWith("/officials", StringComparison.OrdinalIgnoreCase))
            {
                return await _officials.HandleRequest(request, context);
            }
            if (path.StartsWith("/complaints", StringComparison.OrdinalIgnoreCase))
            {
                return await _complaints.HandleRequest(request, context);
            }
            if (path.StartsWith("/categories", StringComparison.OrdinalIgnoreCase))
            {
                return await _categories.HandleRequest(request, context);
            }
            if (path.StartsWith("/comments", StringComparison.OrdinalIgnoreCase))
            {
                return await _comments.HandleRequest(request, context);
            }
            if (path.StartsWith("/attachments", StringComparison.OrdinalIgnoreCase))
            {
                return await _attachments.HandleRequest(request, context);
            }
            if (path.StartsWith("/assignments", StringComparison.OrdinalIgnoreCase))
            {
                return await _assignments.HandleRequest(request, context);
            }
            if (path.StartsWith("/notifications", StringComparison.OrdinalIgnoreCase))
            {
                return await _notifications.HandleRequest(request, context);
            }
            if (path.StartsWith("/status", StringComparison.OrdinalIgnoreCase))
            {
                return await _status.HandleRequest(request, context);
            }
            if (path.StartsWith("/whistleblower", StringComparison.OrdinalIgnoreCase))
            {
                return await _whistleblower.HandleRequest(request, context);
            }

            return new APIGatewayProxyResponse
            {
                StatusCode = 404,
                Body = "{\"success\":false,\"message\":\"API Route Not Found\"}",
                Headers = new System.Collections.Generic.Dictionary<string, string>
                {
                    { "Content-Type", "application/json" },
                    { "Access-Control-Allow-Origin", "*" },
                    { "Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token" },
                    { "Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT" }
                }
            };
        }
    }
}
