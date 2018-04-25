using System;
using System.Linq;
using IMOMaritimeSingleWindow.Data;
using IMOMaritimeSingleWindow.Helpers;
using IMOMaritimeSingleWindow.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IMOMaritimeSingleWindow.Controllers
{
    [Route("api/[controller]")]
    public class OrganizationPortCallController : Controller
    {
        readonly open_ssnContext _context;

        public OrganizationPortCallController(open_ssnContext context)
        {
            _context = context;
        }

        [HttpGet("organization/{id}")]
        public IActionResult GetByOrganizationId(int id)
        {
            var results = _context.OrganizationPortCall.Where(opc => id == opc.OrganizationId).ToList();
            return Json(results);
        }

        [HttpGet("portcall/{id}")]
        public IActionResult GetByPortCallId(int id)
        {
            var results = _context.OrganizationPortCall.Where(opc => id == opc.PortCallId).ToList();
            return Json(results);
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] PortCall portCall)
        {
            try
            {
                var clearanceAgencies = _context.Organization.Where(org => org.OrganizationTypeId == Constants.Integers.DatabaseTableIds.ORGANIZATION_TYPE_GOVERNMENT_AGENCY).ToList();
                if (clearanceAgencies.Any())
                {
                    foreach (Organization agency in clearanceAgencies)
                    {
                        _context.OrganizationPortCall.Add(new OrganizationPortCall {
                            OrganizationId = agency.OrganizationId,
                            PortCallId = portCall.PortCallId
                        });
                    }
                    _context.SaveChanges();
                    return Json(portCall);
                }
                else
                {
                    return Json("Warning: clearance list for port call is empty: no government agencies could be found");
                }
            }
            catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException)
            {
                Npgsql.PostgresException innerEx = (Npgsql.PostgresException)ex.InnerException;
                return BadRequest("PostgreSQL Error Code: " + innerEx.SqlState);
            }
        }

        [HttpPost("save")]
        public IActionResult Save([FromBody] OrganizationPortCall organizationPortCall)
        {
            try
            {
                if (_context.OrganizationPortCall.Any(opc => opc.OrganizationPortCallId == organizationPortCall.OrganizationPortCallId))
                {
                    _context.OrganizationPortCall.Update(organizationPortCall);
                }
                else
                {
                    _context.OrganizationPortCall.Add(organizationPortCall);
                }
                _context.SaveChanges();
            }
            catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException)
            {
                Npgsql.PostgresException innerEx = (Npgsql.PostgresException)ex.InnerException;
                return BadRequest("PostgreSQL Error Code: " + innerEx.SqlState);
            }
            return Json(organizationPortCall);
        }
    }
}