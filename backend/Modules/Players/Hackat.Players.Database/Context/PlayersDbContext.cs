using Hackat.Players.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Database.Context;

public class PlayersDbContext(DbContextOptions<PlayersDbContext> options) : DbContext(options)
{
    /// <summary>У каждого модуля своя схема БД.</summary>
    public const string SchemaName = "players";

    public DbSet<Player> Players => Set<Player>();

    public DbSet<PlayerProgress> PlayerProgress => Set<PlayerProgress>();

    public DbSet<PlayerSession> PlayerSessions => Set<PlayerSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<Player>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Nickname).HasMaxLength(32).IsRequired();
            e.Property(u => u.NormalizedNickname).HasMaxLength(32).IsRequired();
            e.Property(u => u.Email).HasMaxLength(254);
            e.Property(u => u.NormalizedEmail).HasMaxLength(254);
            e.Property(u => u.PasswordHash).HasMaxLength(256);
            e.Ignore(u => u.IsRegistered);

            // NULL у гостей не мешает уникальности в PostgreSQL.
            e.HasIndex(u => u.NormalizedEmail).IsUnique();
        });

        modelBuilder.Entity<PlayerSession>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.TokenHash).HasMaxLength(64).IsRequired();
            e.HasIndex(u => u.TokenHash).IsUnique();

            e.HasOne(u => u.Player)
                .WithMany(u => u.Sessions)
                .HasForeignKey(u => u.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayerProgress>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.ProfessionCode).HasMaxLength(32).IsRequired();
            e.Property(u => u.Difficulty).HasConversion<string>().HasMaxLength(16);
            e.Property(u => u.State).HasColumnType("jsonb");
            e.Property(u => u.Revision).IsConcurrencyToken();

            e.HasIndex(u => new { u.PlayerId, u.ProfessionCode }).IsUnique();

            e.HasOne(u => u.Player)
                .WithMany(u => u.Progress)
                .HasForeignKey(u => u.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
