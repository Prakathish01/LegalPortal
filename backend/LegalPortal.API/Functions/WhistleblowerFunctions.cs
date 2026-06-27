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
    public class WhistleblowerFunctions : BaseFunction
    {
        private readonly IWhistleblowerService _whistleblowerService;
        private readonly ILogger<WhistleblowerFunctions> _logger;

        public WhistleblowerFunctions()
        {
            _whistleblowerService = GetService<IWhistleblowerService>();
            _logger = GetLogger<WhistleblowerFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                string? refNum = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("referenceNumber", out var val))
                {
                    refNum = val;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (string.IsNullOrEmpty(refNum))
                        {
                            var list = await _whistleblowerService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Whistleblower reports retrieved successfully", list);
                        }
                        else
                        {
                            var item = await _whistleblowerService.GetByReferenceNumberAsync(refNum);
                            if (item == null) return ResponseHelper.CreateErrorResponse(404, $"Whistleblower report with reference number '{refNum}' not found.");
                            return ResponseHelper.CreateOkResponse("Whistleblower report retrieved successfully", item);
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateWhistleblowerReportDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _whistleblowerService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Whistleblower report submitted successfully", created);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
