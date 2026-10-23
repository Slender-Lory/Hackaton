using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hackat.Players.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitPlayers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "players");

            migrationBuilder.CreateTable(
                name: "Players",
                schema: "players",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nickname = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    NormalizedNickname = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    GuestTokenHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastSeenAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlayerProgress",
                schema: "players",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Percent = table.Column<int>(type: "integer", nullable: false),
                    Difficulty = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    State = table.Column<string>(type: "jsonb", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerProgress", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerProgress_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalSchema: "players",
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayerProgress_PlayerId_ProfessionCode",
                schema: "players",
                table: "PlayerProgress",
                columns: new[] { "PlayerId", "ProfessionCode" },
                unique: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerProgress",
                schema: "players");

            migrationBuilder.DropTable(
                name: "Players",
                schema: "players");
        }
    }
}
