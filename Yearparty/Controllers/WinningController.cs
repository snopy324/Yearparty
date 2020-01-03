using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using Yearparty.Entities.SQLServer;
using Microsoft.AspNetCore.Hosting;
using System;
using Newtonsoft.Json;
using System.Drawing;

namespace Yearparty.Controllers
{

#if DEBUG
    [Route("api/[controller]")]
#else
    [Route("api/dead")]
#endif

    [ApiController]
    public class WinningController : ControllerBase
    {
        int TestingUsage = 1000;
        private readonly YearpartyContext _context;
        private readonly IHostingEnvironment _env;
        private static string _name = string.Empty;

        private static DateTime? testStart = null;
        public WinningController(YearpartyContext context, IHostingEnvironment env)
        {
            _env = env;
            _context = context;
            testStart = testStart ?? DateTime.Now;
        }

        [HttpGet]
        public IEnumerable<Employees> GetEmployees()
        {
            // var emps = _context.Employees.OrderByDescending(e => e.Empid).Take(TestingUsage).Where(e => string.IsNullOrEmpty(e.Reward)).ToList();
            var emps = _context.Employees.Take(TestingUsage).Where(e => string.IsNullOrEmpty(e.Reward)).ToList();
            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), emps, true);
            return emps;
        }

        [HttpGet("GetRewardedData")]
        public IEnumerable<object> GetRewardedData()
        {
            var data = _context.Rewards.OrderBy(r => r.Rewardindex).Select(r => new
            {
                id = r.Rewardid,
                name = r.Rewardname,
                amount = r.Rewardamount,
                numberToSendOut = r.Employees.Where(e => e.Isabsence == null).Count(),
                method = r.Rewardmethod
            });
            //var data = _context.Employees.Take(TestingUsage).Where(e => e.Reward != null).GroupBy(e => e.Reward).Select(g => new { key = g.Key, count = g.Count() }).ToList();
            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), data, true);
            return data;
        }


        [HttpPost("NewRewardItem")]
        public IEnumerable<object> NewRewardItem(Rewards reward)
        {
            reward.Rewardindex = _context.Rewards.Select(r => r.Rewardindex).ToArray().Min() - 1;
            var updateItems = _context.Rewards.Where(r => r.Rewardindex < 0 && r.Employees.Count() == 0);
            foreach (var i in updateItems)
            {
                i.Rewardamount = 0;
            }

            _context.Add(reward);
            _context.UpdateRange(updateItems);
            _context.SaveChanges();

            return GetRewardedData();
        }


        [HttpPost]
        public bool saveWinning(Employees employee)
        {
            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), employee, true);

            var emp = _context.Employees.Find(employee.Empid);
            if (!string.IsNullOrEmpty(emp.Reward))
            {
                LogToDb(ControllerContext.RouteData.Values["action"].ToString(), employee, false);
                return false;
            }

            emp.Reward = employee.Reward;
            emp.Rewardid = employee.Rewardid;
            emp.RewardTime = DateTime.Now;
            _context.Update(emp);
            _context.SaveChanges();

            return true;
        }


        [HttpGet("logIn")]
        public string logIn(string name)
        {
            if (_name == string.Empty)
            {
                _name = name;
            }

            return _name;
        }

        [HttpPost("logOut")]
        public bool logOut(IEnumerable<Employees> emps)
        {
            _name = string.Empty;
            CollectData(emps);
            return true;
        }


        [HttpGet("HeathlyCheck")]
        public string HeathlyCheck()
        {
            return "OK";
        }

        [HttpGet("ResetData")]
        public bool ResetData()
        {
            CheckGroupRate();

            foreach (var emp in _context.Employees)
            {
                ResetEmployee(emp);
            }
            _context.Rewards.RemoveRange(_context.Rewards.Where(r => r.Rewardindex < 0));
            _context.Employees.UpdateRange(_context.Employees);
            _context.SaveChanges();

            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), null, true);

            testStart = DateTime.Now;

            return true;
        }

        [HttpGet("ClearData")]
        public bool ClearData()
        {
            _context.Logs.RemoveRange(_context.Logs);
            _context.SaveChanges();

            return true;
        }

        [HttpPost("CollectData")]
        public bool CollectData(IEnumerable<Employees> emps)
        {
            // var group = _context.Employees.Where(e => !string.IsNullOrEmpty(e.Reward)).GroupBy(e => e.Deptname).Select(g => new { g.Key, Count = g.Count() });

            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), emps, true);

            return true;
        }

        [HttpGet("CheckGroupRate")]
        public object CheckGroupRate()
        {
            // var group = _context.Employees.Where(e => !string.IsNullOrEmpty(e.Reward)).GroupBy(e => e.Deptname).Select(g => new { g.Key, Count = g.Count() });
            var group = _context.Employees.GroupBy(e => e.Deptname)
            .Select(g => new
            {
                key = g.Key,
                count = g.Where(e => e.RewardTime.HasValue && e.Isabsence == null).Count()
            });

            var empslist = _context.Employees.Where(e => e.RewardTime.HasValue && e.Isabsence == null).OrderBy(e => e.RewardTime);

            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), group, true);
            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), empslist, true);
            Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}"));
            using (StreamWriter sw = new StreamWriter(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}/RewardListJson.txt"), true))
            using (StreamWriter swTxt = new StreamWriter(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}/RewardListDB.txt"), true))
            {
                int index = 0;
                foreach (var emp in empslist)
                {
                    swTxt.WriteLine(emp.Empid.ToString("00000"));
                    sw.WriteLine(JsonConvert.SerializeObject(new { emp.Empid, emp.Empname, emp.Rewardid }));
                    index++;
                    if (index % 10 == 0)
                    {
                        sw.WriteLine("========================================================================");
                    }
                }
            }

            using (StreamWriter sw = new StreamWriter(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/CheckGroupRateDatas.txt"), true))
            {
                sw.WriteLine(string.Join('\t', group.Select(g => g.count)) + "\t" + DateTime.Now + "\t" + CheckRun(testStart.Value.ToString("MMddHHmmss")));
            }


            return group;
        }

        [NonAction]
        public bool LogToDb(string methodName, object data, bool isSuccess = false)
        {
            _context.Logs.Add(new Logs
            {
                Method = methodName,
                Data = JsonConvert.SerializeObject(data),
                Issuccess = isSuccess.ToString(),
                Date = DateTime.Now,
                Username = _name
            });
            _context.SaveChanges();

            return true;
        }

        [HttpGet("logOutAll")]
        public bool logOutAll()
        {
            _name = string.Empty;
            return true;
        }

        [HttpPost("SnapShotSave")]
        public bool SnapShotSave(object imageBase64)
        {
            Bitmap bm = new Bitmap(Base64StringToImage(imageBase64.ToString().Replace("data:image/jpeg;base64,", "")));
            Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}"));
            bm.Save(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/Datas", testStart.Value.ToString("MMddHHmmss"), $"snapshot_{DateTime.Now.ToString("MMddHHmmss")}.jpg"));
            return true;
        }

        [HttpPost("SnapShotText")]
        public bool SnapShotText(IEnumerable<string> empids)
        {
            Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}"));
            using (StreamWriter sw = new StreamWriter(Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{testStart.Value.ToString("MMddHHmmss")}/RewardListText.txt"), true))
            {
                foreach (var emp in empids)
                {
                    sw.WriteLine(emp);
                }
            }
            return true;
        }

        [HttpPost("RemoveRewarded")]
        public bool RemoveRewarded(Employees emp)
        {
            var employee = _context.Employees.Find(emp.Empid);

            if (employee.RewardTime == null)
            {
                return false;
            }

            employee.Isabsence = "true";

            LogToDb(ControllerContext.RouteData.Values["action"].ToString(), employee, true);

            _context.Employees.Update(employee);
            _context.SaveChanges();
            return true;
        }

        [NonAction]
        public static Image Base64StringToImage(string base64String)
        {
            // Convert base 64 string to byte[]
            byte[] Buffer = Convert.FromBase64String(base64String);

            byte[] data = null;
            Image oImage = null;
            MemoryStream oMemoryStream = null;
            Bitmap oBitmap = null;
            //建立副本
            data = (byte[])Buffer.Clone();
            try
            {
                oMemoryStream = new MemoryStream(data);
                //設定資料流位置
                oMemoryStream.Position = 0;
                oImage = System.Drawing.Image.FromStream(oMemoryStream);
                //建立副本
                oBitmap = new Bitmap(oImage);
            }
            catch
            {
                throw;
            }
            finally
            {
                oMemoryStream.Close();
                oMemoryStream.Dispose();
                oMemoryStream = null;
            }
            //return oImage;
            return oBitmap;
        }

        [NonAction]
        public void ResetEmployee(Employees emp)
        {
            emp.Reward = null;
            emp.Rewardid = null;
            emp.RewardTime = null;
            emp.Isabsence = null;
        }

        [HttpGet("CheckRun")]
        public bool CheckRun(string folderName)
        {

            var txtPath = Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{folderName}/RewardListText.txt");
            var DBPath = Path.Combine(Directory.GetCurrentDirectory(), $"wwwroot/Datas/{folderName}/RewardListDB.txt");
            if (!System.IO.File.Exists(txtPath))
            {
                return false;
            }
            using (StreamReader srTxt = new StreamReader(txtPath))
            using (StreamReader srDB = new StreamReader(DBPath))
            {
                return srTxt.ReadToEnd() == srDB.ReadToEnd();
            }
        }

    }
}