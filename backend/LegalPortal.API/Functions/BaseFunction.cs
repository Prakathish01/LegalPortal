using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Amazon.Lambda.APIGatewayEvents;
using LegalPortal.API.Services;
using LegalPortal.API.Exceptions;
using LegalPortal.API.Helpers;

namespace LegalPortal.API.Functions
{
    public class BaseFunction
    {
        protected static readonly IServiceProvider ServiceProvider;

        static BaseFunction()
        {
            var services = new ServiceCollection();
            
            // Add Logging
            services.AddLogging(logging =>
            {
                logging.AddConsole();
                logging.SetMinimumLevel(LogLevel.Information);
            });

            // Register repositories and services
            services.AddBackendServices();

            ServiceProvider = services.BuildServiceProvider();
        }

        protected T GetService<T>() where T : notnull
        {
            return ServiceProvider.GetRequiredService<T>();
        }

        protected ILogger<T> GetLogger<T>()
        {
            return ServiceProvider.GetRequiredService<ILogger<T>>();
        }

        protected async Task<APIGatewayProxyResponse> ExecuteWithLoggingAsync(Func<Task<APIGatewayProxyResponse>> action, ILogger logger)
        {
            try
            {
                return await action();
            }
            catch (ValidationException ex)
            {
                logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
                return ResponseHelper.CreateErrorResponse(400, ex.Message);
            }
            catch (UnauthorizedException ex)
            {
                logger.LogWarning(ex, "Unauthorized error: {Message}", ex.Message);
                return ResponseHelper.CreateErrorResponse(401, ex.Message);
            }
            catch (ForbiddenException ex)
            {
                logger.LogWarning(ex, "Forbidden error: {Message}", ex.Message);
                return ResponseHelper.CreateErrorResponse(403, ex.Message);
            }
            catch (NotFoundException ex)
            {
                logger.LogWarning(ex, "Resource not found: {Message}", ex.Message);
                return ResponseHelper.CreateErrorResponse(404, ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Internal server error");
                return ResponseHelper.CreateErrorResponse(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}
