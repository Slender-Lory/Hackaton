using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hackat.Players.Database.Migrations
{
    /// <inheritdoc />
    public partial class AccountsAndSessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Никнеймы больше не уникальны.
            migrationBuilder.DropIndex(
                name: "IX_Players_NormalizedNickname",
                schema: "players",
                table: "Players");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                schema: "players",
                table: "Players",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RegisteredAt",
                schema: "players",
                table: "Players",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PlayerSessions",
                schema: "players",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    TokenHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastUsedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerSessions_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalSchema: "players",
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Players_NormalizedEmail",
                schema: "players",
                table: "Players",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSessions_PlayerId",
                schema: "players",
                table: "PlayerSessions",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayerSessions_TokenHash",
                schema: "players",
                table: "PlayerSessions",
                column: "TokenHash",
                unique: true);

            // Токены существующих гостей становятся их бессрочными сессиями — никто не теряет доступ.
            migrationBuilder.Sql("""
                INSERT INTO players."PlayerSessions" ("PlayerId", "TokenHash", "CreatedAt", "LastUsedAt", "ExpiresAt")
                SELECT "Id", "GuestTokenHash", "CreatedAt", "LastSeenAt", NULL
                FROM players."Players";
                """);

            migrationBuilder.DropIndex(
                name: "IX_Players_GuestTokenHash",
                schema: "players",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "GuestTokenHash",
                schema: "players",
                table: "Players");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Откат: у каждого игрока остаётся одна (последняя) сессия как гостевой токен.
            // Восстановление уникального индекса никнеймов упадёт, если уже появились одинаковые никнеймы.
            migrationBuilder.AddColumn<string>(
                name: "GuestTokenHash",
                schema: "players",
                table: "Players",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE players."Players" p
                SET "GuestTokenHash" = COALESCE(
                    (SELECT s."TokenHash" FROM players."PlayerSessions" s
                     WHERE s."PlayerId" = p."Id" ORDER BY s."LastUsedAt" DESC LIMIT 1),
                    md5(random()::text) || md5(random()::text));
                """);

            migrationBuilder.DropTable(
                name: "PlayerSessions",
                schema: "players");

            migrationBuilder.DropIndex(
                name: "IX_Players_NormalizedEmail",
                schema: "players",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "Email",
                schema: "players",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                schema: "players",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                schema: "players",
                table: "Players");

            migrationBuilder.DropColumn(
                name: "RegisteredAt",
                schema: "players",
                table: "Players");

            migrationBuilder.CreateIndex(
                name: "IX_Players_GuestTokenHash",
                schema: "players",
                table: "Players",
                column: "GuestTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Players_NormalizedNickname",
                schema: "players",
                table: "Players",
                column: "NormalizedNickname",
                unique: true);
        }
    }
}
