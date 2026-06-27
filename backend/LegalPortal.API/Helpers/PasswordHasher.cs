using System;
using System.Security.Cryptography;
using System.Text;

namespace LegalPortal.API.Helpers
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return string.Empty;
            
            using (var sha256 = SHA256.Create())
            {
                var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hashedPassword)) return false;
            
            // Supporting both plain text and SHA256 hashed comparisons for compatibility
            if (password == hashedPassword) return true;
            
            return HashPassword(password) == hashedPassword;
        }
    }
}
