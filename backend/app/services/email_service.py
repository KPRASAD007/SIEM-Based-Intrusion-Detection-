import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging
from ..models.schemas import AlertModel

# Mock logger for local testing if SMTP is not configured
logger = logging.getLogger("email_service")
logging.basicConfig(level=logging.INFO)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.ethereal.email")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "") # e.g. Ethereal username
SMTP_PASS = os.getenv("SMTP_PASS", "") # e.g. Ethereal password
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@cyberdetect.local")

async def send_alert_email(alert: AlertModel, db):
    """
    Sends an email notification based on alert severity.
    Critical/High alerts get an immediate 'URGENT' email.
    """
    
    # Priority logic
    priority_flag = "Normal"
    subject_prefix = "[CyberDetect SOC] Alert Triggered"
    
    if alert.severity == "critical":
        priority_flag = "High"
        subject_prefix = "[URGENT] CRITICAL SECURITY ALERT"
    elif alert.severity == "high":
        priority_flag = "High"
        subject_prefix = "[URGENT] HIGH SECURITY ALERT"
    
    # Do not email for low/informational unless requested
    if alert.severity in ["low", "info"]:
        return
        
    subject = f"{subject_prefix} - {alert.rule_name}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: {'#991B1B' if alert.severity == 'critical' else '#EF4444' if alert.severity == 'high' else '#F59E0B'}">
          {subject_prefix}
        </h2>
        <p>A new security alert has been triggered in the <strong>CyberDetect Lab</strong> environment.</p>
        
        <table style="border-collapse: collapse; width: 100%; max-width: 600px; margin-top: 20px;">
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Rule Name:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{alert.rule_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Severity:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; text-transform: uppercase;">{alert.severity}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>MITRE ATT&CK:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{alert.mitre_attack_id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Source IP:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{alert.source_ip or 'N/A'}</td>
          </tr>
          <tr style="background-color: #f8f9fa;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Affected Host:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{alert.affected_host or 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Time Triggered:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">{alert.triggered_time.strftime('%Y-%m-%d %H:%M:%S UTC')}</td>
          </tr>
        </table>
        
        <p style="margin-top: 30px;">
          <a href="{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/alerts" 
             style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Investigate in SOC Dashboard
          </a>
        </p>
        
        <p style="margin-top: 40px; font-size: 12px; color: #777;">
          This is an automated message from the CyberDetect Detection Engine.<br>
          Please do not reply directly to this email.
        </p>
      </body>
    </html>
    """

    # Determine recipients by querying all users with a configured alert_email
    recipients = []
    cursor = db.users.find({"alert_email": {"$exists": True, "$ne": ""}})
    async for user in cursor:
        recipients.append(user["alert_email"])
        
    if not recipients:
        recipients.append(ADMIN_EMAIL)

    for target_email in recipients:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = "soc@cyberdetect.local"
        msg["To"] = target_email
        
        # Priority headers
        if priority_flag == "High":
            msg['X-Priority'] = '1 (Highest)'
            msg['X-MSMail-Priority'] = 'High'
            msg['Importance'] = 'High'

        msg.attach(MIMEText(html_content, "html"))

        if not SMTP_USER or not SMTP_PASS:
             logger.info("================ EMAIL DISPATCH MOCK ================")
             logger.info(f"To: {target_email}")
             logger.info(f"Subject: {subject}")
             logger.info(f"Priority: {priority_flag}")
             logger.info("Body preview: A new security alert has been triggered...")
             logger.info("=====================================================")
             logger.info("(SMTP Credentials missing, outputting to console instead)")
             continue

        try:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
            server.quit()
            logger.info(f"Successfully sent alert email to {target_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {target_email}: {e}")
