using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hackat.Players.Database.Migrations
{
    /// <inheritdoc />
    public partial class AccountsOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ТЗ v2.0: прогресс гостя хранится только в браузере. Гости удаляются с сервера
            // (их сессии и прогресс — каскадом); остаются только аккаунты с почтой и паролем.
            migrationBuilder.Sql("""
                DELETE FROM players."Players" WHERE "RegisteredAt" IS NULL;
                """);

            migrationBuilder.DropColumn(
                name: "RegisteredAt",
                schema: "players",
                table: "Players");

            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "ExpiresAt",
                schema: "players",
                table: "PlayerSessions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)),
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "players",
                table: "Players",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmail",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(254)",
                oldMaxLength: 254,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(254)",
                oldMaxLength: 254,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "ExpiresAt",
                schema: "players",
                table: "PlayerSessions",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                schema: "players",
                table: "Players",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmail",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(254)",
                oldMaxLength: 254);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "players",
                table: "Players",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(254)",
                oldMaxLength: 254);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "RegisteredAt",
                schema: "players",
                table: "Players",
                type: "timestamp with time zone",
                nullable: true);

            // При откате все оставшиеся игроки — аккаунты.
            migrationBuilder.Sql("""
                UPDATE players."Players" SET "RegisteredAt" = "CreatedAt";
                """);
        }
    }
}
