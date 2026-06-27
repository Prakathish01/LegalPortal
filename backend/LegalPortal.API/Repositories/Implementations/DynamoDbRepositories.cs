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
        public RoleRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Role?> GetByIdAsync(string roleId)
        {
            if (string.IsNullOrEmpty(roleId)) return null;
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
        public UserRepository(IDynamoDBContext context) { _context = context; }

        public async Task<User?> GetByIdAsync(string userId)
        {
            if (string.IsNullOrEmpty(userId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            return await _context.LoadAsync<User>(userId, config);
        }

        public async Task<User?> GetByEmployeeIdAsync(string employeeId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            var conditions = new List<ScanCondition> { new ScanCondition("EmployeeID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, employeeId) };
            var results = await _context.ScanAsync<User>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            var conditions = new List<ScanCondition> { new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email) };
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

        public async Task DeleteAsync(string userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.UsersTable };
            await _context.DeleteAsync<User>(userId, config);
        }
    }

    public class OfficialRepository : IOfficialRepository
    {
        private readonly IDynamoDBContext _context;
        public OfficialRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Official?> GetByIdAsync(string officialId)
        {
            if (string.IsNullOrEmpty(officialId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            return await _context.LoadAsync<Official>(officialId, config);
        }

        public async Task<Official?> GetByStaffIDAsync(string staffId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("StaffID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, staffId) };
            var results = await _context.ScanAsync<Official>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
        }

        public async Task<Official?> GetByEmailAsync(string email)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("Email", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, email) };
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
            var official = await GetByStaffIDAsync(staffId);
            if (official != null)
            {
                var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.OfficialsTable };
                await _context.DeleteAsync<Official>(official.OfficialID, config);
            }
        }
    }

    public class CaseRepository : ICaseRepository
    {
        private readonly IDynamoDBContext _context;
        public CaseRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Case?> GetByIdAsync(string caseId)
        {
            if (string.IsNullOrEmpty(caseId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            return await _context.LoadAsync<Case>(caseId, config);
        }

        public async Task<List<Case>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            return await _context.ScanAsync<Case>(null, config).GetRemainingAsync();
        }

        public async Task<List<Case>> GetByUserIdAsync(string userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            var conditions = new List<ScanCondition> { new ScanCondition("UserID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, userId) };
            return await _context.ScanAsync<Case>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Case @case)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            await _context.SaveAsync(@case, config);
        }

        public async Task DeleteAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CasesTable };
            await _context.DeleteAsync<Case>(caseId, config);
        }
    }

    public class CategoryRepository : ICategoryRepository
    {
        private readonly IDynamoDBContext _context;
        public CategoryRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Category?> GetByIdAsync(string categoryId)
        {
            if (string.IsNullOrEmpty(categoryId)) return null;
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

        public async Task DeleteAsync(string categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CategoriesTable };
            await _context.DeleteAsync<Category>(categoryId, config);
        }
    }

    public class CommentRepository : ICommentRepository
    {
        private readonly IDynamoDBContext _context;
        public CommentRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Comment?> GetByIdAsync(string commentId)
        {
            if (string.IsNullOrEmpty(commentId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            return await _context.LoadAsync<Comment>(commentId, config);
        }

        public async Task<List<Comment>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
            return await _context.ScanAsync<Comment>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Comment comment)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            await _context.SaveAsync(comment, config);
        }

        public async Task DeleteAsync(string commentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CommentsTable };
            await _context.DeleteAsync<Comment>(commentId, config);
        }
    }

    public class CaseAssignmentRepository : ICaseAssignmentRepository
    {
        private readonly IDynamoDBContext _context;
        public CaseAssignmentRepository(IDynamoDBContext context) { _context = context; }

        public async Task<CaseAssignment?> GetByIdAsync(string assignmentId)
        {
            if (string.IsNullOrEmpty(assignmentId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            return await _context.LoadAsync<CaseAssignment>(assignmentId, config);
        }

        public async Task<CaseAssignment?> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseAssignmentsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
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
        public CaseStatusHistoryRepository(IDynamoDBContext context) { _context = context; }

        public async Task<List<CaseStatusHistory>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseStatusHistoryTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
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
        public AttachmentRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Attachment?> GetByIdAsync(string attachmentId)
        {
            if (string.IsNullOrEmpty(attachmentId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            return await _context.LoadAsync<Attachment>(attachmentId, config);
        }

        public async Task<List<Attachment>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
            return await _context.ScanAsync<Attachment>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Attachment attachment)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            await _context.SaveAsync(attachment, config);
        }

        public async Task DeleteAsync(string attachmentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AttachmentsTable };
            await _context.DeleteAsync<Attachment>(attachmentId, config);
        }
    }

    public class NotificationRepository : INotificationRepository
    {
        private readonly IDynamoDBContext _context;
        public NotificationRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Notification?> GetByIdAsync(string notificationId)
        {
            if (string.IsNullOrEmpty(notificationId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            return await _context.LoadAsync<Notification>(notificationId, config);
        }

        public async Task<List<Notification>> GetByUserIdAsync(string userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("ReceiverID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, userId) };
            return await _context.ScanAsync<Notification>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Notification notification)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            await _context.SaveAsync(notification, config);
        }

        public async Task DeleteAsync(string notificationId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.NotificationsTable };
            await _context.DeleteAsync<Notification>(notificationId, config);
        }
    }

    public class WhistleblowerRepository : IWhistleblowerRepository
    {
        private readonly IDynamoDBContext _context;
        public WhistleblowerRepository(IDynamoDBContext context) { _context = context; }

        public async Task<WhistleblowerReport?> GetByIdAsync(string reportId)
        {
            if (string.IsNullOrEmpty(reportId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            return await _context.LoadAsync<WhistleblowerReport>(reportId, config);
        }

        public async Task<WhistleblowerReport?> GetByReferenceNumberAsync(string referenceNumber)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.WhistleblowerReportsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("ReferenceNumber", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, referenceNumber) };
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
        public CaseMessageRepository(IDynamoDBContext context) { _context = context; }

        public async Task<CaseMessage?> GetByIdAsync(string messageId)
        {
            if (string.IsNullOrEmpty(messageId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            return await _context.LoadAsync<CaseMessage>(messageId, config);
        }

        public async Task<List<CaseMessage>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseMessagesTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
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
        public CaseDocumentRequestRepository(IDynamoDBContext context) { _context = context; }

        public async Task<CaseDocumentRequest?> GetByIdAsync(string requestId)
        {
            if (string.IsNullOrEmpty(requestId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            return await _context.LoadAsync<CaseDocumentRequest>(requestId, config);
        }

        public async Task<List<CaseDocumentRequest>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.CaseDocumentRequestsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
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
        public SlaConfigRepository(IDynamoDBContext context) { _context = context; }

        public async Task<SlaConfig?> GetByConfigIdAsync(string configId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            return await _context.LoadAsync<SlaConfig>(configId, config);
        }

        public async Task<SlaConfig?> GetByCategoryIdAsync(string categoryId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CategoryID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, categoryId) };
            var results = await _context.ScanAsync<SlaConfig>(conditions, config).GetRemainingAsync();
            return results.FirstOrDefault();
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

        public async Task DeleteAsync(string configId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.SlaConfigTable };
            await _context.DeleteAsync<SlaConfig>(configId, config);
        }
    }

    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly IDynamoDBContext _context;
        public AuditLogRepository(IDynamoDBContext context) { _context = context; }

        public async Task<AuditLog?> GetByIdAsync(string logId)
        {
            if (string.IsNullOrEmpty(logId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
            return await _context.LoadAsync<AuditLog>(logId, config);
        }

        public async Task<List<AuditLog>> GetByActorIdAsync(string actorId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AuditLogsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("ActorID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, actorId) };
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
        public RefreshTokenRepository(IDynamoDBContext context) { _context = context; }

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

    public class EscalationRuleRepository : IEscalationRuleRepository
    {
        private readonly IDynamoDBContext _context;
        public EscalationRuleRepository(IDynamoDBContext context) { _context = context; }

        public async Task<EscalationRule?> GetByIdAsync(string ruleId)
        {
            if (string.IsNullOrEmpty(ruleId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.EscalationRulesTable };
            return await _context.LoadAsync<EscalationRule>(ruleId, config);
        }

        public async Task<List<EscalationRule>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.EscalationRulesTable };
            return await _context.ScanAsync<EscalationRule>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(EscalationRule rule)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.EscalationRulesTable };
            await _context.SaveAsync(rule, config);
        }

        public async Task DeleteAsync(string ruleId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.EscalationRulesTable };
            await _context.DeleteAsync<EscalationRule>(ruleId, config);
        }
    }

    public class AIChatSessionRepository : IAIChatSessionRepository
    {
        private readonly IDynamoDBContext _context;
        public AIChatSessionRepository(IDynamoDBContext context) { _context = context; }

        public async Task<AIChatSession?> GetByIdAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIChatSessionsTable };
            return await _context.LoadAsync<AIChatSession>(sessionId, config);
        }

        public async Task<List<AIChatSession>> GetByUserIdAsync(string userId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIChatSessionsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("UserID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, userId) };
            return await _context.ScanAsync<AIChatSession>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(AIChatSession session)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIChatSessionsTable };
            await _context.SaveAsync(session, config);
        }

        public async Task DeleteAsync(string sessionId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIChatSessionsTable };
            await _context.DeleteAsync<AIChatSession>(sessionId, config);
        }
    }

    public class AIQueryLogRepository : IAIQueryLogRepository
    {
        private readonly IDynamoDBContext _context;
        public AIQueryLogRepository(IDynamoDBContext context) { _context = context; }

        public async Task<AIQueryLog?> GetByIdAsync(string queryId)
        {
            if (string.IsNullOrEmpty(queryId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIQueryLogTable };
            return await _context.LoadAsync<AIQueryLog>(queryId, config);
        }

        public async Task<List<AIQueryLog>> GetBySessionIdAsync(string sessionId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIQueryLogTable };
            var conditions = new List<ScanCondition> { new ScanCondition("SessionID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, sessionId) };
            return await _context.ScanAsync<AIQueryLog>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(AIQueryLog log)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.AIQueryLogTable };
            await _context.SaveAsync(log, config);
        }
    }

    public class PolicyDocumentRepository : IPolicyDocumentRepository
    {
        private readonly IDynamoDBContext _context;
        public PolicyDocumentRepository(IDynamoDBContext context) { _context = context; }

        public async Task<PolicyDocument?> GetByIdAsync(string documentId)
        {
            if (string.IsNullOrEmpty(documentId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.PolicyDocumentsTable };
            return await _context.LoadAsync<PolicyDocument>(documentId, config);
        }

        public async Task<List<PolicyDocument>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.PolicyDocumentsTable };
            return await _context.ScanAsync<PolicyDocument>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(PolicyDocument document)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.PolicyDocumentsTable };
            await _context.SaveAsync(document, config);
        }

        public async Task DeleteAsync(string documentId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.PolicyDocumentsTable };
            await _context.DeleteAsync<PolicyDocument>(documentId, config);
        }
    }

    public class HearingRepository : IHearingRepository
    {
        private readonly IDynamoDBContext _context;
        public HearingRepository(IDynamoDBContext context) { _context = context; }

        public async Task<Hearing?> GetByIdAsync(string hearingId)
        {
            if (string.IsNullOrEmpty(hearingId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.HearingsTable };
            return await _context.LoadAsync<Hearing>(hearingId, config);
        }

        public async Task<List<Hearing>> GetByCaseIdAsync(string caseId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.HearingsTable };
            var conditions = new List<ScanCondition> { new ScanCondition("CaseID", Amazon.DynamoDBv2.DocumentModel.ScanOperator.Equal, caseId) };
            return await _context.ScanAsync<Hearing>(conditions, config).GetRemainingAsync();
        }

        public async Task SaveAsync(Hearing hearing)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.HearingsTable };
            await _context.SaveAsync(hearing, config);
        }

        public async Task DeleteAsync(string hearingId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.HearingsTable };
            await _context.DeleteAsync<Hearing>(hearingId, config);
        }
    }

    public class ICCMemberRepository : IICCMemberRepository
    {
        private readonly IDynamoDBContext _context;
        public ICCMemberRepository(IDynamoDBContext context) { _context = context; }

        public async Task<ICCMember?> GetByIdAsync(string memberId)
        {
            if (string.IsNullOrEmpty(memberId)) return null;
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.ICCMembersTable };
            return await _context.LoadAsync<ICCMember>(memberId, config);
        }

        public async Task<List<ICCMember>> GetAllAsync()
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.ICCMembersTable };
            return await _context.ScanAsync<ICCMember>(null, config).GetRemainingAsync();
        }

        public async Task SaveAsync(ICCMember member)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.ICCMembersTable };
            await _context.SaveAsync(member, config);
        }

        public async Task DeleteAsync(string memberId)
        {
            var config = new DynamoDBOperationConfig { OverrideTableName = TableSettings.ICCMembersTable };
            await _context.DeleteAsync<ICCMember>(memberId, config);
        }
    }
}
