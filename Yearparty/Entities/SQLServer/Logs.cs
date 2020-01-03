using System;
using System.Collections.Generic;

namespace Yearparty.Entities.SQLServer
{
    public partial class Logs
    {
        public int Id { get; set; }
        public string Method { get; set; }
        public string Data { get; set; }
        public string Issuccess { get; set; }
        public DateTime Date { get; set; }
        public string Username { get; set; }
    }
}
