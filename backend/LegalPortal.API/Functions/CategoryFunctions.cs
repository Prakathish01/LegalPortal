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
    public class CategoryFunctions : BaseFunction
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryFunctions> _logger;

        public CategoryFunctions()
        {
            _categoryService = GetService<ICategoryService>();
            _logger = GetLogger<CategoryFunctions>();
        }

        public async Task<APIGatewayProxyResponse> HandleRequest(APIGatewayProxyRequest request, ILambdaContext context)
        {
            return await ExecuteWithLoggingAsync(async () =>
            {
                if (request.HttpMethod == "OPTIONS") return ResponseHelper.CreateOptionsResponse();

                string? categoryId = null;
                if (request.PathParameters != null && request.PathParameters.TryGetValue("id", out var val))
                {
                    categoryId = val;
                }

                switch (request.HttpMethod)
                {
                    case "GET":
                        if (string.IsNullOrEmpty(categoryId))
                        {
                            var list = await _categoryService.GetAllAsync();
                            return ResponseHelper.CreateOkResponse("Categories retrieved successfully", list);
                        }
                        else
                        {
                            return ResponseHelper.CreateErrorResponse(400, "Category retrieval by individual ID is not supported directly, please fetch all categories.");
                        }

                    case "POST":
                        var createDto = JsonSerializer.Deserialize<CreateCategoryDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (createDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var created = await _categoryService.CreateAsync(createDto);
                        return ResponseHelper.CreateCreatedResponse("Category created successfully", created);

                    case "PUT":
                        if (string.IsNullOrEmpty(categoryId)) return ResponseHelper.CreateErrorResponse(400, "Category ID is required.");
                        var updateDto = JsonSerializer.Deserialize<UpdateCategoryDto>(request.Body ?? string.Empty, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (updateDto == null) return ResponseHelper.CreateErrorResponse(400, "Invalid request body.");
                        var updated = await _categoryService.UpdateAsync(categoryId, updateDto);
                        return ResponseHelper.CreateOkResponse("Category updated successfully", updated);

                    case "DELETE":
                        if (string.IsNullOrEmpty(categoryId)) return ResponseHelper.CreateErrorResponse(400, "Category ID is required.");
                        await _categoryService.DeleteAsync(categoryId);
                        return ResponseHelper.CreateOkResponse("Category deleted successfully", (object?)null);

                    default:
                        return ResponseHelper.CreateErrorResponse(405, "Method Not Allowed");
                }
            }, _logger);
        }
    }
}
