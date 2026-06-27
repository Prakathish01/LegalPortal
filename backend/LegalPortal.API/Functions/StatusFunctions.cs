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
    public class StatusFunctions : BaseFunction
    {
        private readonly ICaseService _caseService;
        private readonly ILogger<StatusFunctions> _logger;

        public StatusFunctions()
        {
            _caseService = GetService<ICaseService>();
            _logger = GetLogger<StatusFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();
                if (request.HttpMethod != "PUT") return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");

                var dto = JsonSerializer.Deserialize<UpdateCaseStatusDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (dto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");

                await _caseService.UpdateStatusAsync(dto);
                return ResponseHelper.CreateOkResponse("Case status updated successfully", (object?)null);
            }, _logger);
        }
    }
}
