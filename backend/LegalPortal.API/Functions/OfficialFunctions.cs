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
    public class OfficialFunctions : BaseFunction
    {
        private readonly IOfficialService _officialService;
        private readonly ILogger<OfficialFunctions> _logger;

        public OfficialFunctions()
        {
            _officialService = GetService<IOfficialService>();
            _logger = GetLogger<OfficialFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                string? staffId = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("staffId", out var val))
                {
                    staffId = val;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (string.IsNullOrEmpty(staffId))
                        {
                            var list = await _officialService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Officials retrieved successfully", list);
                        }
                        else
                        {
                            var item = await _officialService.GetByStaffIdAsync(staffId);
                            return ResponseHelper.CreateOkResponse("Official retrieved successfully", item);
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateOfficialDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _officialService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Official created successfully", created);

                    case "PUT":
                        if (string.IsNullOrEmpty(staffId)) return ResponseHelper.CreateErrorResponse(400, "Staff ID is required.");
                        var updateDto = JsonSerializer.Deserialize<UpdateOfficialDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (updateDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var updated = await _officialService.UpdateAsync(staffId, updateDto);
                        return ResponseHelper.CreateOkResponse("Official updated successfully", updated);

                    case "DELETE":
                        if (string.IsNullOrEmpty(staffId)) return ResponseHelper.CreateErrorResponse(400, "Staff ID is required.");
                        await _officialService.DeleteAsync(staffId);
                        return ResponseHelper.CreateOkResponse("Official deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
