using Microsoft.EntityFrameworkCore;
using ReactServerApp.Server.Data;
using ReactServerApp.Server.Models;
using ReactServerApp.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 5GB'a kadar dosya yükleme desteği için form options ayarla
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 5L * 1024 * 1024 * 1024; // 5GB
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Entity Framework Core Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Migration'ları uygula (veritabanını oluştur/güncelle)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    
    // Super admin kullanıcısını kontrol et ve oluştur (eğer yoksa)
    var superAdmin = dbContext.Users.FirstOrDefault(u => u.Role == "superadmin" && !u.IsDeleted);
    if (superAdmin == null)
    {
        var superAdminPassword = PasswordHasher.HashPassword("superadmin123");
        var newSuperAdmin = new User
        {
            UserId = "super-a1b2c3d4",
            UserName = "Super Admin",
            UserEmail = "superadmin@sistem.com",
            UserPassword = superAdminPassword,
            Role = "superadmin",
            StorageQuotaGB = 1000,
            IsDeleted = false
        };
        dbContext.Users.Add(newSuperAdmin);
        dbContext.SaveChanges();
    }
    
    // Admin kullanıcısını kontrol et ve oluştur (eğer yoksa)
    var admin = dbContext.Users.FirstOrDefault(u => u.UserEmail == "admin@sistem.com" && !u.IsDeleted);
    if (admin == null)
    {
        var adminPassword = PasswordHasher.HashPassword("adminpassword");
        var newAdmin = new User
        {
            UserId = "adm-a1b2c3d4",
            UserName = "Adminoloji",
            UserEmail = "admin@sistem.com",
            UserPassword = adminPassword,
            Role = "admin",
            StorageQuotaGB = 500,
            IsDeleted = false
        };
        dbContext.Users.Add(newAdmin);
        dbContext.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Routing middleware'i ekle
app.UseRouting();

// Authorization (gerekirse burada)
app.UseAuthorization();

// API Controllers'ı map et (static files'tan ÖNCE olmalı)
app.MapControllers();

// Static files ve SPA fallback (API routes'tan SONRA)
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("/index.html");

app.Run();
