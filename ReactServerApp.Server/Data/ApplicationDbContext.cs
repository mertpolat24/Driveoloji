using Microsoft.EntityFrameworkCore;
using ReactServerApp.Server.Models;
using ReactServerApp.Server.Services;

namespace ReactServerApp.Server.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity yapılandırması
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasMaxLength(100);
                entity.Property(e => e.UserName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.UserEmail).IsRequired().HasMaxLength(200);
                entity.Property(e => e.UserPassword).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50).HasDefaultValue("user");
                entity.Property(e => e.StorageQuotaGB).IsRequired().HasDefaultValue(1);
                entity.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);

                // Email unique olmalı (sadece silinmemiş kullanıcılar için)
                entity.HasIndex(e => e.UserEmail).IsUnique();
            });

            // Seed Data - Super Admin kullanıcısı
            // Not: HasData kullanıldığında migration oluşturulurken bu data migration'a eklenir
            // BCrypt hash'leri her seferinde farklı olduğu için migration dosyasında sabit hash kullanılmalı
            // Bu seed data migration dosyasında InsertData ile ekleniyor
        }
    }
}

