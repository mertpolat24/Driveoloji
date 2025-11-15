using BCrypt.Net;

namespace ReactServerApp.Server.Services
{
    /// <summary>
    /// Şifre hash'leme ve doğrulama servisi
    /// </summary>
    public static class PasswordHasher
    {
        /// <summary>
        /// Şifreyi hash'le
        /// </summary>
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        /// <summary>
        /// Şifreyi doğrula
        /// </summary>
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}

