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
    public class AttachmentFunctions : BaseFunction
    {
        private readonly IAttachmentService _attachmentService;
        private readonly ILogger<AttachmentFunctions> _logger;

        public AttachmentFunctions()
        {
            _attachmentService = GetService<IAttachmentService>();
            _logger = GetLogger<AttachmentFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                string? idVal = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("id", out var tempVal))
                {
                    idVal = tempVal;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (string.IsNullOrEmpty(idVal)) return ResponseHelper.CreateErrorResponse(400, "Case ID is required.");
                        var list = await _attachmentService.GetByCaseIdAsync(idVal);
                        return ResponseHelper.CreateOkResponse("Attachments retrieved successfully", list);

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateAttachmentDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _attachmentService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Attachment uploaded successfully", created);

                    case "DELETE":
                        if (string.IsNullOrEmpty(idVal)) return ResponseHelper.CreateErrorResponse(400, "Attachment ID is required.");
                        await _attachmentService.DeleteAsync(idVal);
                        return ResponseHelper.CreateOkResponse("Attachment deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
