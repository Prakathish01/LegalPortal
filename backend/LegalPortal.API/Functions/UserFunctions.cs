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
    public class UserFunctions : BaseFunction
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserFunctions> _logger;

        public UserFunctions()
        {
            _userService = GetService<IUserService>();
            _logger = GetLogger<UserFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                int? userId = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("id", out var val))
                {
                    if (int.TryParse(val, out var parsedId))
                    {
                        userId = parsedId;
                    }
                    else
                    {
                        return ResponseHelper.CreateErrorResponse(400, "User ID must be an integer.");
                    }
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (!userId.HasValue)
                        {
                            var list = await _userService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Users retrieved successfully", list);
                        }
                        else
                        {
                            var item = await _userService.GetByIdAsync(userId.Value);
                            return ResponseHelper.CreateOkResponse("User retrieved successfully", item);
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateUserDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _userService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("User created successfully", created);

                    case "PUT":
                        if (!userId.HasValue) return ResponseHelper.CreateErrorResponse(400, "User ID is required.");
                        var updateDto = JsonSerializer.Deserialize<UpdateUserDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (updateDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var updated = await _userService.UpdateAsync(userId.Value, updateDto);
                        return ResponseHelper.CreateOkResponse("User updated successfully", updated);

                    case "DELETE":
                        if (!userId.HasValue) return ResponseHelper.CreateErrorResponse(400, "User ID is required.");
                        await _userService.DeleteAsync(userId.Value);
                        return ResponseHelper.CreateOkResponse("User deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
