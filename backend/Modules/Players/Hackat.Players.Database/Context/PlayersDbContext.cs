using Hackat.Players.Database.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hackat.Players.Database.Context;

public class PlayersDbContext(DbContextOptions<PlayersDbContext> options) : DbContext(options)
{
    /// <summary>У каждого модуля своя схема БД.</summary>
    public const string SchemaName = "players";

    public DbSet<Player> Players => Set<Player>();

    public DbSet<PlayerProgress> PlayerProgress => Set<PlayerProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<Player>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Nickname).HasMaxLength(32).IsRequired();
            e.Property(u => u.NormalizedNickname).HasMaxLength(32).IsRequired();
            e.Property(u => u.GuestTokenHash).HasMaxLength(64).IsRequired();

            e.HasIndex(u => u.NormalizedNickname).IsUnique();
            e.HasIndex(u => u.GuestTokenHash).IsUnique();
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
