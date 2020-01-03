using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Yearparty.Entities.SQLServer
{
    public partial class YearpartyContext : DbContext
    {
        public YearpartyContext()
        {
        }

        public YearpartyContext(DbContextOptions<YearpartyContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Employees> Employees { get; set; }
        public virtual DbSet<Logs> Logs { get; set; }
        public virtual DbSet<Rewards> Rewards { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=Yearparty;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.6-servicing-10079");

            modelBuilder.Entity<Employees>(entity =>
            {
                entity.HasKey(e => e.Empid);

                entity.Property(e => e.Empid).ValueGeneratedNever();

                entity.Property(e => e.Deptname)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Empname)
                    .IsRequired()
                    .HasMaxLength(5);

                entity.Property(e => e.Isabsence).HasMaxLength(5);

                entity.Property(e => e.Officename)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Reward).HasMaxLength(50);

                entity.Property(e => e.RewardTime).HasColumnType("datetime");

                entity.HasOne(d => d.RewardNavigation)
                    .WithMany(p => p.Employees)
                    .HasForeignKey(d => d.Rewardid)
                    .HasConstraintName("FK_Employees_Rewards");
            });

            modelBuilder.Entity<Logs>(entity =>
            {
                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Issuccess)
                    .IsRequired()
                    .HasMaxLength(5);

                entity.Property(e => e.Method)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Username).HasMaxLength(50);
            });

            modelBuilder.Entity<Rewards>(entity =>
            {
                entity.HasKey(e => e.Rewardid);

                entity.Property(e => e.Rewardmethod).HasMaxLength(50);

                entity.Property(e => e.Rewardname)
                    .IsRequired()
                    .HasMaxLength(50);
            });
        }
    }
}
