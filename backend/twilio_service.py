import os
from twilio.rest import Client
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TwilioService:
    def __init__(self):
        """Initialize Twilio client with environment variables"""
        try:
            load_dotenv()

            self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
            self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
            self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
            
            if not self.account_sid or not self.auth_token or not self.phone_number:
                logger.warning("Twilio credentials not fully configured")
                self.client = None
            else:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("Twilio client initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Twilio client: {e}")
            self.client = None
    
    def send_sms(self, to_number, message):
        """Send SMS message to specified number"""
        if not self.client:
            logger.warning("Twilio client not initialized, skipping SMS")
            return False
        
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.phone_number,
                to=to_number
            )
            logger.info(f"SMS sent successfully to {to_number}: {message.sid}")
            return True
        except Exception as e:
            logger.error(f"Error sending SMS to {to_number}: {e}")
            return False
    
    def send_appointment_confirmation(self, to_number, doctor_name, date, time):
        """Send appointment confirmation SMS"""
        message = f"Your appointment with {doctor_name} has been scheduled for {date} at {time}. Please arrive 15 minutes early."
        return self.send_sms(to_number, message)
    
    def send_appointment_reminder(self, to_number, doctor_name, date, time):
        """Send appointment reminder SMS"""
        message = f"Reminder: You have an appointment with {doctor_name} tomorrow at {time}. Please remember to bring your medical records."
        return self.send_sms(to_number, message)
    
    def send_appointment_cancellation(self, to_number, doctor_name, date, time):
        """Send appointment cancellation SMS"""
        message = f"Your appointment with {doctor_name} on {date} at {time} has been cancelled."
        return self.send_sms(to_number, message)
    
    def send_welcome_message(self, to_number, name):
        """Send welcome message to new user"""
        message = f"Welcome to SheWell, {name}! Thank you for registering. We're here to support you through your pregnancy journey."
        return self.send_sms(to_number, message)
    
    def send_milestone_notification(self, to_number, name, week, milestone):
        """Send pregnancy milestone notification"""
        message = f"Hi {name}! You've reached week {week} of your pregnancy. {milestone}"
        return self.send_sms(to_number, message)
    
    def send_diet_tip(self, to_number, name, tip):
        """Send nutrition tip"""
        message = f"Nutrition tip for {name}: {tip}"
        return self.send_sms(to_number, message)