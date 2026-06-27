using Microsoft.Extensions.DependencyInjection;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Helpers;
using LegalPortal.API.Repositories.Interfaces;
using LegalPortal.API.Repositories.Implementations;
using LegalPortal.API.Services.Interfaces;
using LegalPortal.API.Services.Implementations;

namespace LegalPortal.API.Services
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddBackendServices(this IServiceCollection services)
        {
            // AWS Clients with Region fallback
            services.AddSingleton<IAmazonDynamoDB>(sp =>
            {
                var regionName = System.Environment.GetEnvironmentVariable("AWS_REGION") ?? "eu-west-1";
                var region = Amazon.RegionEndpoint.GetBySystemName(regionName);
                return new AmazonDynamoDBClient(region);
            });
            services.AddSingleton<IDynamoDBContext>(sp => new DynamoDBContext(sp.GetRequiredService<IAmazonDynamoDB>()));

            // Helpers / Generators
            services.AddSingleton<ISequenceGenerator, SequenceGenerator>();

            // Repositories
            services.AddScoped<IRoleRepository, RoleRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IOfficialRepository, OfficialRepository>();
            services.AddScoped<ICaseRepository, CaseRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICommentRepository, CommentRepository>();
            services.AddScoped<ICaseAssignmentRepository, CaseAssignmentRepository>();
            services.AddScoped<ICaseStatusHistoryRepository, CaseStatusHistoryRepository>();
            services.AddScoped<IAttachmentRepository, AttachmentRepository>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IWhistleblowerRepository, WhistleblowerRepository>();
            services.AddScoped<ICaseMessageRepository, CaseMessageRepository>();
            services.AddScoped<ICaseDocumentRequestRepository, CaseDocumentRequestRepository>();
            services.AddScoped<ISlaConfigRepository, SlaConfigRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

            // Services
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IOfficialService, OfficialService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<ICaseService, CaseService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICommentService, CommentService>();
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<ICaseAssignmentService, CaseAssignmentService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IWhistleblowerService, WhistleblowerService>();
            services.AddScoped<ICaseMessageService, CaseMessageService>();
            services.AddScoped<ICaseDocumentRequestService, CaseDocumentRequestService>();
            services.AddScoped<ISlaConfigService, SlaConfigService>();
            services.AddScoped<IAuditLogService, AuditLogService>();
            services.AddScoped<IRefreshTokenService, RefreshTokenService>();

            return services;
        }
    }
}
