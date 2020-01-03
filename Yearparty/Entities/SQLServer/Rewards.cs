using System;
using System.Collections.Generic;

namespace Yearparty.Entities.SQLServer
{
    public partial class Rewards
    {
        public Rewards()
        {
            Employees = new HashSet<Employees>();
        }

        public int Rewardid { get; set; }
        public string Rewardname { get; set; }
        public int Rewardamount { get; set; }
        public int? Rewardindex { get; set; }
        public string Rewardmethod { get; set; }

        public virtual ICollection<Employees> Employees { get; set; }
    }
}
