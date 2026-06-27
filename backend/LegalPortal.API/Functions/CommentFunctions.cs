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
    public class CommentFunctions : BaseFunction
    {
        private readonly ICommentService _commentService;
        private readonly ILogger<CommentFunctions> _logger;

        public CommentFunctions()
        {
            _commentService = GetService<ICommentService>();
            _logger = GetLogger<CommentFunctions>();
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
                        var list = await _commentService.GetByCaseIdAsync(idVal);
                        return ResponseHelper.CreateOkResponse("Comments retrieved successfully", list);

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateCommentDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _commentService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Comment posted successfully", created);

                    case "DELETE":
                        if (string.IsNullOrEmpty(idVal)) return ResponseHelper.CreateErrorResponse(400, "Comment ID is required.");
                        await _commentService.DeleteAsync(idVal);
                        return ResponseHelper.CreateOkResponse("Comment deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
