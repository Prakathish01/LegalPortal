using System;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Lambda.Core;
using Amazon.Lambda.APIGatewayEvents;
using LegalPortal.API.DTOs;
using LegalPortal.API.Helpers;
using LegalPortal.API.Services.Interfaces;
using Microsoft.Extensions.Logging;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace LegalPortal.API.Functions
{
    public class AuthFunctions : BaseFunction
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthFunctions> _logger;

        public AuthFunctions()
        {
            _authService = GetService<IAuthService>();
            _logger = GetLogger<AuthFunctions>();
        }

        public async Task<APIGatewayProxyResponse> Login(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();
                if (request.HttpMethod != "POST") return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");

                var loginRequest = JsonSerializer.Deserialize<LoginRequest>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (loginRequest == null)
                {
                    return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                }

                var response = await _authService.LoginAsync(loginRequest);
                return ResponseHelper.CreateOkResponse("Login successful", response);
            }, _logger);
        }
    }
}
