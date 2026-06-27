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
    public class ComplaintFunctions : BaseFunction
    {
        private readonly ICaseService _caseService;
        private readonly ILogger<ComplaintFunctions> _logger;

        public ComplaintFunctions()
        {
            _caseService = GetService<ICaseService>();
            _logger = GetLogger<ComplaintFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                string? caseId = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("caseId", out var val))
                {
                    caseId = val;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (string.IsNullOrEmpty(caseId))
                        {
                            var list = await _caseService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Complaints retrieved successfully", list);
                        }
                        else
                        {
                            var item = await _caseService.GetByIdAsync(caseId);
                            return ResponseHelper.CreateOkResponse("Complaint retrieved successfully", item);
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateCaseDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _caseService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Complaint created successfully", created);

                    case "PUT":
                        if (string.IsNullOrEmpty(caseId)) return ResponseHelper.CreateErrorResponse(400, "Case ID is required.");
                        var updateDto = JsonSerializer.Deserialize<UpdateCaseDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (updateDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var updated = await _caseService.UpdateAsync(caseId, updateDto);
                        return ResponseHelper.CreateOkResponse("Complaint updated successfully", updated);

                    case "DELETE":
                        if (string.IsNullOrEmpty(caseId)) return ResponseHelper.CreateErrorResponse(400, "Case ID is required.");
                        await _caseService.DeleteAsync(caseId);
                        return ResponseHelper.CreateOkResponse("Complaint deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
