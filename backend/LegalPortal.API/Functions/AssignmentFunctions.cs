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
    public class AssignmentFunctions : BaseFunction
    {
        private readonly ICaseAssignmentService _assignmentService;
        private readonly ILogger<AssignmentFunctions> _logger;

        public AssignmentFunctions()
        {
            _assignmentService = GetService<ICaseAssignmentService>();
            _logger = GetLogger<AssignmentFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                int? caseId = null;
                string? assignmentId = null;

                if (request.PathParameters != null && request.PathParameters.TryGetValue("id", out var idVal))
                {
                    if (int.TryParse(idVal, out var parsedId))
                    {
                        caseId = parsedId;
                    }
                    assignmentId = idVal;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (!caseId.HasValue)
                        {
                            var all = await _assignmentService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Assignments retrieved successfully", all);
                        }
                        else
                        {
                            var item = await _assignmentService.GetByCaseIdAsync(caseId.Value);
                            if (item == null) return ResponseHelper.CreateErrorResponse(404, $"No assignment found for Case ID {caseId.Value}.");
                            return ResponseHelper.CreateOkResponse("Assignment retrieved successfully", item);
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateCaseAssignmentDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _assignmentService.CreateAsync(createDto);
                        return ResponseHelper.CreateOkResponse("Assignment created successfully", created);

                    case "PUT":
                        if (string.IsNullOrEmpty(assignmentId)) return ResponseHelper.CreateErrorResponse(400, "Assignment ID is required.");
                        var updateDto = JsonSerializer.Deserialize<UpdateCaseAssignmentDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (updateDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var updated = await _assignmentService.UpdateAsync(assignmentId, updateDto);
                        return ResponseHelper.CreateOkResponse("Assignment updated successfully", updated);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
