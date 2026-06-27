using System;
using System.Collections.Generic;
using System.Text.Json;
using Amazon.Lambda.APIGatewayEvents;

namespace LegalPortal.API.Helpers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public string Timestamp { get; set; } = string.Empty;
    }

    public static class ResponseHelper
    {
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        private static readonly Dictionary<string, string> CorsHeaders = new Dictionary<string, string>
        {
            { "Access-Control-Allow-Origin", "*" },
            { "Access-Control-Allow-Headers", "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token" },
            { "Access-Control-Allow-Methods", "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT" }
        };

        public static APIGatewayProxyResponse CreateResponse<T>(int statusCode, bool success, string message, T? data)
        {
            var apiResponse = new ApiResponse<T>
            {
                Success = success,
                Message = message,
                Data = data,
                Timestamp = DateTime.UtcNow.ToString("o") // ISO 8601 format
            };

            return new APIGatewayProxyResponse
            {
                StatusCode = statusCode,
                Headers = CorsHeaders,
                Body = JsonSerializer.Serialize(apiResponse, JsonOptions)
            };
        }

        public static APIGatewayProxyResponse CreateOkResponse<T>(string message, T? data)
        {
            return CreateResponse(200, true, message, data);
        }

        public static APIGatewayProxyResponse CreateCreatedResponse<T>(string message, T? data)
        {
            return CreateResponse(201, true, message, data);
        }

        public static APIGatewayProxyResponse CreateErrorResponse(int statusCode, string message)
        {
            return CreateResponse<object>(statusCode, false, message, null);
        }

        public static APIGatewayProxyResponse CreateOptionsResponse()
        {
            return new APIGatewayProxyResponse
            {
                StatusCode = 200,
                Headers = CorsHeaders,
                Body = string.Empty
            };
        }
    }
}
