using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using LegalPortal.API.DTOs;
using LegalPortal.API.Helpers;
using LegalPortal.API.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace LegalPortal.API.Functions
{
    public class NotificationFunctions : BaseFunction
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationFunctions> _logger;

        public NotificationFunctions()
        {
            _notificationService = GetService<INotificationService>();
            _logger = GetLogger<NotificationFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                int? notificationId = null;
                // Parse /{id}/read
                if (request.PathParameters != null && request.PathParameters.TryGetValue("id", out var val) && int.TryParse(val, out var parsedId))
                {
                    notificationId = parsedId;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        int? queryUserId = null;
                        if (request.QueryStringParameters != null && request.QueryStringParameters.TryGetValue("userId", out var uIdStr) && int.TryParse(uIdStr, out var uId))
                        {
                            queryUserId = uId;
                        }

                        if (!queryUserId.HasValue)
                        {
                            return ResponseHelper.CreateErrorResponse(400, "userId query parameter is required.");
                        }

                        var list = await _notificationService.GetByUserIdAsync(queryUserId.Value);
                        return ResponseHelper.CreateOkResponse("Notifications retrieved successfully", list);

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateNotificationDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _notificationService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Notification created successfully", created);

                    case "PUT":
                        // Handles PUT /notifications/{id}/read
                        if (!notificationId.HasValue) return ResponseHelper.CreateErrorResponse(400, "Notification ID is required.");
                        
                        // We check if the path ends with /read (in request.Path or context)
                        bool isReadAction = request.Path.Contains("/read", StringComparison.OrdinalIgnoreCase);
                        if (!isReadAction) return ResponseHelper.CreateErrorResponse(400, "Invalid notification update action. Use PUT /notifications/{id}/read");

                        await _notificationService.MarkAsReadAsync(notificationId.Value);
                        return ResponseHelper.CreateOkResponse("Notification marked as read successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
