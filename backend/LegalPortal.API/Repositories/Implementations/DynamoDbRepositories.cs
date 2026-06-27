using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2.DataModel;
using LegalPortal.API.Configuration;
using LegalPortal.API.Models;
using LegalPortal.API.Repositories.Interfaces;

namespace LegalPortal.API.Repositories.Implementations
{
    public class RoleRepository : IRoleRepository
    {
        private readonly IDynamoDBContext _context;

        public RoleRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Role?> GetByIdAsync(int roleId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RolesTable };
            return await _context.LoadAsync<Role>(roleId, config);
        }

        public async Task<List<Role>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RolesTable };
            return await _context.ScanAsync<Role>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Role role)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RolesTable };
            await _context.SaveAsync(role, config);
        }
    }

    public class UserRepository : IUserRepository
    {
        private readonly IDynamoDBContext _context;

        public UserRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            return await _context.LoadAsync<User>(userId, config);
        }

        public async Task<User?> GetByEmployeeIdAsync(string employeeId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("EmployeeID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, employeeId)
            };
            var results = await _context.ScanAsync<User>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email)
            };
            var results = await _context.ScanAsync<User>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<List<User>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            return await _context.ScanAsync<User>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(User user)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            await _context.SaveAsync(user, config);
        }

        public async Task DeleteAsync(int userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            await _context.DeleteAsync<User>(userId, config);
        }
    }

    public class OfficialRepository : IOfficialRepository
    {
        private readonly IDynamoDBContext _context;

        public OfficialRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Official?> GetByIdAsync(int officialId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("OfficialID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, officialId)
            };
            var results = await _context.ScanAsync<Official>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<Official?> GetByStaffIDAsync(string staffId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("StaffID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, staffId)
            };
            var results = await _context.ScanAsync<Official>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<Official?> GetByEmailAsync(string email)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email)
            };
            var results = await _context.ScanAsync<Official>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<List<Official>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            return await _context.ScanAsync<Official>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Official official)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            await _context.SaveAsync(official, config);
        }

        public async Task DeleteAsync(string staffId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            await _context.DeleteAsync<Official>(staffId, config);
        }
    }

    public class CaseRepository : ICaseRepository
    {
        private readonly IDynamoDBContext _context;

        public CaseRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Case?> GetByIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            return await _context.LoadAsync<Case>(caseId, config);
        }

        public async Task<List<Case>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            return await _context.ScanAsync<Case>(null, config).GetRemainingAsync();
        }

        public async Task<List<Case>> GetByUserIdAsync(int userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("UserID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, userId)
            };
            return await _context.ScanAsync<Case>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Case @case)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            await _context.SaveAsync(@case, config);
        }

        public async Task DeleteAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            await _context.DeleteAsync<Case>(caseId, config);
        }
    }

    public class CategoryRepository : ICategoryRepository
    {
        private readonly IDynamoDBContext _context;

        public CategoryRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Category?> GetByIdAsync(int categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
            return await _context.LoadAsync<Category>(categoryId, config);
        }

        public async Task<List<Category>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
            return await _context.ScanAsync<Category>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Category category)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
            await _context.SaveAsync(category, config);
        }

        public async Task DeleteAsync(int categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
            await _context.DeleteAsync<Category>(categoryId, config);
        }
    }

    public class CommentRepository : ICommentRepository
    {
        private readonly IDynamoDBContext _context;

        public CommentRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Comment?> GetByIdAsync(int commentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            return await _context.LoadAsync<Comment>(commentId, config);
        }

        public async Task<List<Comment>> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            return await _context.ScanAsync<Comment>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Comment comment)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            await _context.SaveAsync(comment, config);
        }

        public async Task DeleteAsync(int commentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            await _context.DeleteAsync<Comment>(commentId, config);
        }
    }

    public class CaseAssignmentRepository : ICaseAssignmentRepository
    {
        private readonly IDynamoDBContext _context;

        public CaseAssignmentRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<CaseAssignment?> GetByIdAsync(string assignmentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            return await _context.LoadAsync<CaseAssignment>(assignmentId, config);
        }

        public async Task<CaseAssignment?> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            var results = await _context.ScanAsync<CaseAssignment>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<List<CaseAssignment>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            return await _context.ScanAsync<CaseAssignment>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(CaseAssignment assignment)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            await _context.SaveAsync(assignment, config);
        }

        public async Task DeleteAsync(string assignmentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            await _context.DeleteAsync<CaseAssignment>(assignmentId, config);
        }
    }

    public class CaseStatusHistoryRepository : ICaseStatusHistoryRepository
    {
        private readonly IDynamoDBContext _context;

        public CaseStatusHistoryRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<List<CaseStatusHistory>> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseStatusHistoryTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            return await _context.ScanAsync<CaseStatusHistory>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(CaseStatusHistory history)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseStatusHistoryTable };
            await _context.SaveAsync(history, config);
        }
    }

    public class AttachmentRepository : IAttachmentRepository
    {
        private readonly IDynamoDBContext _context;

        public AttachmentRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Attachment?> GetByIdAsync(int attachmentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            return await _context.LoadAsync<Attachment>(attachmentId, config);
        }

        public async Task<List<Attachment>> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            return await _context.ScanAsync<Attachment>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Attachment attachment)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            await _context.SaveAsync(attachment, config);
        }

        public async Task DeleteAsync(int attachmentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            await _context.DeleteAsync<Attachment>(attachmentId, config);
        }
    }

    public class NotificationRepository : INotificationRepository
    {
        private readonly IDynamoDBContext _context;

        public NotificationRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<Notification?> GetByIdAsync(int notificationId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            return await _context.LoadAsync<Notification>(notificationId, config);
        }

        public async Task<List<Notification>> GetByUserIdAsync(int userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("UserID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, userId)
            };
            return await _context.ScanAsync<Notification>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Notification notification)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            await _context.SaveAsync(notification, config);
        }

        public async Task DeleteAsync(int notificationId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            await _context.DeleteAsync<Notification>(notificationId, config);
        }
    }

    public class WhistleblowerRepository : IWhistleblowerRepository
    {
        private readonly IDynamoDBContext _context;

        public WhistleblowerRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<WhistleblowerReport?> GetByIdAsync(int reportId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            return await _context.LoadAsync<WhistleblowerReport>(reportId, config);
        }

        public async Task<WhistleblowerReport?> GetByReferenceNumberAsync(string referenceNumber)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("ReferenceNumber", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, referenceNumber)
            };
            var results = await _context.ScanAsync<WhistleblowerReport>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<List<WhistleblowerReport>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            return await _context.ScanAsync<WhistleblowerReport>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(WhistleblowerReport report)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            await _context.SaveAsync(report, config);
        }
    }

    public class CaseMessageRepository : ICaseMessageRepository
    {
        private readonly IDynamoDBContext _context;

        public CaseMessageRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<CaseMessage?> GetByIdAsync(string messageId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            return await _context.LoadAsync<CaseMessage>(messageId, config);
        }

        public async Task<List<CaseMessage>> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            return await _context.ScanAsync<CaseMessage>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(CaseMessage message)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            await _context.SaveAsync(message, config);
        }

        public async Task DeleteAsync(string messageId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            await _context.DeleteAsync<CaseMessage>(messageId, config);
        }
    }

    public class CaseDocumentRequestRepository : ICaseDocumentRequestRepository
    {
        private readonly IDynamoDBContext _context;

        public CaseDocumentRequestRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<CaseDocumentRequest?> GetByIdAsync(string requestId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            return await _context.LoadAsync<CaseDocumentRequest>(requestId, config);
        }

        public async Task<List<CaseDocumentRequest>> GetByCaseIdAsync(int caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId)
            };
            return await _context.ScanAsync<CaseDocumentRequest>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(CaseDocumentRequest request)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            await _context.SaveAsync(request, config);
        }

        public async Task DeleteAsync(string requestId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            await _context.DeleteAsync<CaseDocumentRequest>(requestId, config);
        }
    }

    public class SlaConfigRepository : ISlaConfigRepository
    {
        private readonly IDynamoDBContext _context;

        public SlaConfigRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<SlaConfig?> GetByCategoryIdAsync(int categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            return await _context.LoadAsync<SlaConfig>(categoryId, config);
        }

        public async Task<List<SlaConfig>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            return await _context.ScanAsync<SlaConfig>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(SlaConfig config)
        {
            var opConfig = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            await _context.SaveAsync(config, opConfig);
        }

        public async Task DeleteAsync(int categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            await _context.DeleteAsync<SlaConfig>(categoryId, config);
        }
    }

    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly IDynamoDBContext _context;

        public AuditLogRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<AuditLog?> GetByIdAsync(string logId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
            return await _context.LoadAsync<AuditLog>(logId, config);
        }

        public async Task<List<AuditLog>> GetByActorIdAsync(int actorId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("ActorID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, actorId)
            };
            return await _context.ScanAsync<AuditLog>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(AuditLog log)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
            await _context.SaveAsync(log, config);
        }
    }

    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly IDynamoDBContext _context;

        public RefreshTokenRepository(IDynamoDBContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RefreshTokensTable };
            return await _context.LoadAsync<RefreshToken>(tokenHash, config);
        }

        public async Task SaveAsync(RefreshToken token)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RefreshTokensTable };
            await _context.SaveAsync(token, config);
        }

        public async Task DeleteAsync(string tokenHash)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.RefreshTokensTable };
            await _context.DeleteAsync<RefreshToken>(tokenHash, config);
        }
    }
}
