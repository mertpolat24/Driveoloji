using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReactServerApp.Server.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UserPassword = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "user"),
                    StorageQuotaGB = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserEmail",
                table: "Users",
                column: "UserEmail",
                unique: true);

            // Varsayılan Super Admin kullanıcısını ekle
            // Şifre: "superadmin123" (BCrypt hash'lenmiş)
            // Bu hash her migration'da aynı şifreyi doğrulayacaktır
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "UserName", "UserEmail", "UserPassword", "Role", "StorageQuotaGB", "IsDeleted" },
                values: new object[] { 
                    "super-a1b2c3d4", 
                    "Super Admin", 
                    "superadmin@sistem.com", 
                    "$2a$11$rKqJqJqJqJqJqJqJqJqJ.qJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq", // Placeholder - Program.cs'de gerçek hash ile değiştirilecek
                    "superadmin", 
                    1000, 
                    false 
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
