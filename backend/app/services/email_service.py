import smtplib
import os
import logging
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from ..models.schemas import AlertModel

# Configuration
logger = logging.getLogger("email_service")
logging.basicConfig(level=logging.INFO)

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "krishnaprasadt004@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "ornmeufhfzhgudcg")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "krishnaprasadt004@gmail.com")

def _transmit_email(subject, html_body, recipients, severity):
    """Blocking SMTP transmission logic called in a separate thread."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"CyberDetect SOC <{SMTP_USER}>"
        
        if severity in ["critical", "high"]:
            msg['X-Priority'] = '1 (Highest)'
            msg['Importance'] = 'High'

        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.set_debuglevel(0)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            
            for recipient in recipients:
                if not recipient or "@" not in recipient: continue
                msg["To"] = recipient
                server.send_message(msg)
                logger.info(f"SUCCESS: Alert email sent to {recipient}")
        return True
    except Exception as e:
        logger.error(f"CRITICAL SMTP FAILURE: {str(e)}")
        return False

async def send_alert_email(alert: AlertModel, db=None):
    """
    Sends a beautifully formatted security alert email.
    Universal: Sends for ALL alerts to ensure the lab user sees every event.
    """
    logger.info(f"Initiating email dispatch for alert: {alert.rule_name}")

    # Determine Priority & Styling
    subject_prefix = "[CyberDetect SOC] Alert"
    theme_color = "#3b82f6" # Default blue
    
    if alert.severity == "critical":
        subject_prefix = "[URGENT] CRITICAL SECURITY BREACH"
        theme_color = "#991b1b" # Dark red
    elif alert.severity == "high":
        subject_prefix = "[ALERT] HIGH SEVERITY EVENT"
        theme_color = "#ef4444" # Red
    elif alert.severity == "medium":
        theme_color = "#f59e0b" # Orange

    subject = f"{subject_prefix}: {alert.rule_name}"

    # Format Timestamp
    t = alert.triggered_time
    if isinstance(t, str):
        try:
            t = datetime.fromisoformat(t.replace('Z', '+00:00'))
        except:
            t = datetime.utcnow()
    display_time = t.strftime('%Y-%m-%d %H:%M:%S UTC')

    # Build HTML Template
    html_report = f"""
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <div style="background-color: {theme_color}; padding: 25px; color: #ffffff; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800;">{subject_prefix}</h1>
          </div>
          <div style="padding: 30px;">
            <p style="margin-top: 0; font-size: 14px; color: #475569;">A security detection rule has been triggered in the <strong>CyberDetect Laboratory</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 11px; width: 140px; font-weight: bold; text-transform: uppercase;">Detection Rule</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">{alert.rule_name}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Confidence Level</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: {theme_color};">{alert.severity.upper()}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Target Host</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-family: 'Courier New', Courier, monospace; color: #0f172a; font-size: 13px;">{alert.affected_host or 'Local Endpoint'}</td>
              </tr>
               <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">MITRE Tactic</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{alert.mitre_attack_id or 'General Behavioral'}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Detection Time</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{display_time}</td>
              </tr>
            </table>
            
            <div style="margin-top: 30px; padding: 20px; background-color: #f1f5f9; border-left: 4px solid {theme_color}; border-radius: 4px; font-size: 13px; color: #334155;">
              <strong style="color: {theme_color};">Analyst Note:</strong> This telemetry was forwarded in real-time. Please review the process ancestry and network connections in the <strong>Case Management</strong> module.
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">&copy; 2024 CyberDetect Lab • SOC Autonomous Reporting</p>
          </div>
        </div>
      </body>
    </html>
    """

    # Dispatch Logic
    try:
        # Collect recipients (Dynamic from DB + Fallback)
        recipients = [ADMIN_EMAIL]
        if db is not None:
            try:
                # Fetch all users who have an alert email configured
                cursor = db.users.find({"alert_email": {"$exists": True, "$ne": ""}})
                users = await cursor.to_list(length=50) if hasattr(cursor, 'to_list') else []
                for user in users:
                    email = user.get("alert_email")
                    if email: recipients.append(email)
            except Exception as e:
                logger.error(f"DB Error fetching recipients: {e}")

        # Unique recipients
        recipients = list(set(recipients))

        # Offload blocking SMTP to thread
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _transmit_email, subject, html_report, recipients, alert.severity)

    except Exception as e:
        logger.error(f"CRITICAL DISPATCH FAILURE: {str(e)}")

