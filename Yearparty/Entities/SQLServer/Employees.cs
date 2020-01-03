using System;
using System.Collections.Generic;

namespace Yearparty.Entities.SQLServer
{
    public partial class Employees
    {
        public int Empid { get; set; }
        public string Empname { get; set; }
        public string Deptname { get; set; }
        public string Officename { get; set; }
        public string Reward { get; set; }
        public int? Rewardid { get; set; }
        public DateTime? RewardTime { get; set; }
        public string Isabsence { get; set; }

        public virtual Rewards RewardNavigation { get; set; }
    }
}
