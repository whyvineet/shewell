import os
import google.generativeai as genai
import logging
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        """Initialize the Gemini AI service"""
        try:
            load_dotenv()
            api_key = os.getenv('GOOGLE_API_KEY')
            if not api_key:
                logger.warning("Google API key not configured")
                self.model = None
                return
                
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini AI model initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemini AI: {e}")
            self.model = None
    
    def generate_response(self, prompt, chat_history=None, pregnancy_week=None):
        """Generate AI response with pregnancy context"""
        if not self.model:
            logger.warning("Gemini AI model not initialized")
            return {"error": "AI service not available"}
        
        try:
            # Create pregnancy-specific context based on week if available
            pregnancy_context = self._get_pregnancy_context(pregnancy_week)
            
            enhanced_prompt = f"{pregnancy_context} {prompt}"
            response = self.model.generate_response(enhanced_prompt, chat_history=chat_history)
            return {"response": response}
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return {"error": "AI response generation failed"}
        
    def _get_pregnancy_context(self, pregnancy_week):
        """Generate pregnancy context based on week"""
        if not pregnancy_week:
            return ""
        
        try:
            week = int(pregnancy_week)
            if week < 1 or week > 40:
                return ""
            
            if week < 13:
                return "During the first trimester of pregnancy, "
            elif week < 28:
                return "During the second trimester of pregnancy, "
            else:
                return "During the third trimester of pregnancy, "
        except Exception as e:
            logger.error(f"Error getting pregnancy context: {e}")
            return ""
        