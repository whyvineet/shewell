from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
import google.generativeai as genai
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from twilio.rest import Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev_secret_key')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Enable CORS for React frontend
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Configure Gemini AI
try:
    GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    logger.info("Gemini AI configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Gemini AI: {e}")
    model = None

# Configure Twilio for SMS notifications
try:
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    logger.info("Twilio configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Twilio: {e}")
    twilio_client = None

# In-memory storage (replace with database in production)
users = {}
profiles = {}
doctors = [
    {
        "id": 1,
        "name": "Dr. Sarah Johnson",
        "specialty": "Obstetrics",
        "location": "New York, NY",
        "insurance": ["Aetna", "Blue Cross Blue Shield", "Cigna"],
        "rating": 4.8,
        "availability": "Next available: Tomorrow",
        "yearsExperience": 15,
        "hospital": "NYC Women's Health Center",
        "phone": "+1234567890",
        "email": "sarah.johnson@example.com"
    },
    {
        "id": 2,
        "name": "Dr. Maria Rodriguez",
        "specialty": "Maternal-Fetal Medicine",
        "location": "New York, NY",
        "insurance": ["Medicare", "Blue Cross Blue Shield", "UnitedHealthcare"],
        "rating": 4.9,
        "availability": "Next available: Monday",
        "yearsExperience": 20,
        "hospital": "Mount Sinai Hospital",
        "phone": "+1234567891",
        "email": "maria.rodriguez@example.com"
    },
    {
        "id": 3,
        "name": "Dr. Emily Chen",
        "specialty": "High-Risk Pregnancy",
        "location": "Boston, MA",
        "insurance": ["Cigna", "UnitedHealthcare", "Aetna"],
        "rating": 4.7,
        "availability": "Next available: Thursday",
        "yearsExperience": 12,
        "hospital": "Boston Medical Center",
        "phone": "+1234567892",
        "email": "emily.chen@example.com"
    },
    {
        "id": 4,
        "name": "Dr. Jessica Wilson",
        "specialty": "Prenatal Care",
        "location": "Boston, MA",
        "insurance": ["Blue Cross Blue Shield", "Medicaid", "Humana"],
        "rating": 4.6,
        "availability": "Next available: Friday",
        "yearsExperience": 8,
        "hospital": "Brigham and Women's Hospital",
        "phone": "+1234567893",
        "email": "jessica.wilson@example.com"
    },
    {
        "id": 5,
        "name": "Dr. Lisa Thompson",
        "specialty": "Natural Birth",
        "location": "Chicago, IL",
        "insurance": ["Aetna", "Kaiser Permanente", "Medicare"],
        "rating": 4.5,
        "availability": "Next available: Wednesday",
        "yearsExperience": 10,
        "hospital": "Chicago Women's Hospital",
        "phone": "+1234567894",
        "email": "lisa.thompson@example.com"
    }
]
appointments = {}
chat_histories = {}

# Helper functions
def send_sms_notification(phone_number, message):
    """Send SMS notification via Twilio"""
    if not twilio_client or not TWILIO_PHONE_NUMBER:
        logger.warning("Twilio not configured, skipping SMS notification")
        return False
    
    try:
        message = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS: {e}")
        return False

def generate_ai_response(prompt, chat_history=None):
    """Generate response from Gemini AI"""
    if not model:
        return {"error": "AI service not available"}
    
    try:
        # Add pregnancy-specific context to the prompt
        pregnancy_context = """
        You are a helpful assistant for pregnant women. Provide accurate, empathetic guidance 
        on pregnancy topics including prenatal care, common symptoms, nutrition, and when to consult 
        a doctor. Always encourage regular check-ups and advise seeking professional medical advice 
        for specific health concerns. Never provide specific medical diagnoses or replace professional 
        medical advice.
        """
        
        enhanced_prompt = f"{pregnancy_context}\n\nUser question: {prompt}"
        
        if chat_history:
            # Format chat history for context
            history_text = "\n".join([f"User: {msg['user']}\nAssistant: {msg['ai']}" for msg in chat_history[-5:]])
            enhanced_prompt = f"{enhanced_prompt}\n\nRecent conversation:\n{history_text}"
        
        response = model.generate_content(enhanced_prompt)
        return {"response": response.text}
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        return {"error": f"Failed to generate response: {str(e)}"}

# Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

# User Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Validate input
    required_fields = ['email', 'password', 'name', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    email = data['email'].lower()
    
    # Check if user already exists
    if email in users:
        return jsonify({"error": "Email already registered"}), 409
    
    # Create new user
    user_id = str(uuid.uuid4())
    users[email] = {
        "id": user_id,
        "name": data['name'],
        "email": email,
        "phone": data['phone'],
        "password_hash": generate_password_hash(data['password']),
        "created_at": datetime.now().isoformat()
    }
    
    # Create empty profile
    profiles[user_id] = {
        "name": data['name'],
        "email": email,
        "dueDate": data.get('dueDate', ''),
        "weeksPregnant": data.get('weeksPregnant', 0),
        "doctor": "",
        "upcomingAppointment": "",
        "medicalHistory": {
            "previousPregnancies": 0,
            "allergies": [],
            "conditions": []
        }
    }
    
    # Set session
    session['user_id'] = user_id
    session['email'] = email
    
    # Send welcome SMS
    if data.get('phone'):
        message = f"Welcome to SheWell, {data['name']}! Thank you for registering. We're here to support you through your pregnancy journey."
        send_sms_notification(data['phone'], message)
    
    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": user_id,
            "name": data['name'],
            "email": email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.json
    
    # Validate input
    if 'email' not in data or 'password' not in data:
        return jsonify({"error": "Email and password required"}), 400
    
    email = data['email'].lower()
    
    # Check if user exists
    if email not in users:
        return jsonify({"error": "Invalid email or password"}), 401
    
    user = users[email]
    
    # Verify password
    if not check_password_hash(user['password_hash'], data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Set session
    session['user_id'] = user['id']
    session['email'] = email
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": email
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout a user"""
    session.pop('user_id', None)
    session.pop('email', None)
    return jsonify({"message": "Logout successful"})

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' not in session:
        return jsonify({"authenticated": False}), 401
    
    user_id = session['user_id']
    email = session['email']
    
    if email not in users:
        session.pop('user_id', None)
        session.pop('email', None)
        return jsonify({"authenticated": False}), 401
    
    user = users[email]
    
    return jsonify({
        "authenticated": True,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": email
        }
    })

# Profile Routes
@app.route('/api/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if user_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    return jsonify(profiles[user_id])

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    if user_id not in profiles:
        return jsonify({"error": "Profile not found"}), 404
    
    # Update profile
    for key, value in data.items():
        if key == 'medicalHistory':
            for med_key, med_value in value.items():
                profiles[user_id]['medicalHistory'][med_key] = med_value
        else:
            profiles[user_id][key] = value
    
    return jsonify({
        "message": "Profile updated successfully",
        "profile": profiles[user_id]
    })

# Doctor Finder Routes
@app.route('/api/doctors', methods=['GET'])
def find_doctors():
    """Find doctors based on criteria"""
    location = request.args.get('location', '').lower()
    specialty = request.args.get('specialty', '')
    insurance = request.args.get('insurance', '')
    
    filtered_doctors = doctors
    
    if location:
        filtered_doctors = [d for d in filtered_doctors if location in d['location'].lower()]
    
    if specialty:
        filtered_doctors = [d for d in filtered_doctors if d['specialty'] == specialty]
    
    if insurance:
        filtered_doctors = [d for d in filtered_doctors if insurance in d['insurance']]
    
    return jsonify(filtered_doctors)

@app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get doctor details by ID"""
    doctor = next((d for d in doctors if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    
    return jsonify(doctor)

# Appointment Routes
@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    # Validate input
    required_fields = ['doctor_id', 'date', 'time', 'reason']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    doctor_id = data['doctor_id']
    doctor = next((d for d in doctors if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    
    # Create appointment
    appointment_id = str(uuid.uuid4())
    
    if user_id not in appointments:
        appointments[user_id] = []
    
    appointment = {
        "id": appointment_id,
        "doctor_id": doctor_id,
        "doctor_name": doctor['name'],
        "date": data['date'],
        "time": data['time'],
        "reason": data['reason'],
        "status": "scheduled",
        "created_at": datetime.now().isoformat()
    }
    
    appointments[user_id].append(appointment)
    
    # Send confirmation SMS
    user_email = session['email']
    user = users[user_email]
    if user.get('phone'):
        message = f"Your appointment with {doctor['name']} has been scheduled for {data['date']} at {data['time']}. Please arrive 15 minutes early."
        send_sms_notification(user['phone'], message)
    
    return jsonify({
        "message": "Appointment scheduled successfully",
        "appointment": appointment
    }), 201

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """Get user appointments"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if user_id not in appointments:
        return jsonify([])
    
    return jsonify(appointments[user_id])

@app.route('/api/appointments/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update an appointment"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    if user_id not in appointments:
        return jsonify({"error": "Appointment not found"}), 404
    
    appointment_index = None
    for i, appointment in enumerate(appointments[user_id]):
        if appointment['id'] == appointment_id:
            appointment_index = i
            break
    
    if appointment_index is None:
        return jsonify({"error": "Appointment not found"}), 404
    
    # Update appointment
    for key, value in data.items():
        appointments[user_id][appointment_index][key] = value
    
    appointment = appointments[user_id][appointment_index]
    
    # Send update SMS for rescheduled appointments
    if data.get('status') == 'rescheduled' or (data.get('date') or data.get('time')):
        user_email = session['email']
        user = users[user_email]
        if user.get('phone'):
            message = f"Your appointment with {appointment['doctor_name']} has been rescheduled to {appointment['date']} at {appointment['time']}."
            send_sms_notification(user['phone'], message)
    
    return jsonify({
        "message": "Appointment updated successfully",
        "appointment": appointment
    })

@app.route('/api/appointments/<appointment_id>', methods=['DELETE'])
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if user_id not in appointments:
        return jsonify({"error": "Appointment not found"}), 404
    
    appointment_index = None
    for i, appointment in enumerate(appointments[user_id]):
        if appointment['id'] == appointment_id:
            appointment_index = i
            break
    
    if appointment_index is None:
        return jsonify({"error": "Appointment not found"}), 404
    
    # Get appointment details for SMS
    appointment = appointments[user_id][appointment_index]
    
    # Remove appointment
    del appointments[user_id][appointment_index]
    
    # Send cancellation SMS
    user_email = session['email']
    user = users[user_email]
    if user.get('phone'):
        message = f"Your appointment with {appointment['doctor_name']} on {appointment['date']} at {appointment['time']} has been cancelled."
        send_sms_notification(user['phone'], message)
    
    return jsonify({
        "message": "Appointment cancelled successfully"
    })

# Chatbot Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat with Gemini AI"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    if 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
    
    # Initialize chat history for user if it doesn't exist
    if user_id not in chat_histories:
        chat_histories[user_id] = []
    
    user_message = data['message']
    
    # Generate AI response
    ai_result = generate_ai_response(user_message, chat_histories[user_id])
    
    if 'error' in ai_result:
        return jsonify(ai_result), 500
    
    ai_response = ai_result['response']
    
    # Add to chat history
    chat_histories[user_id].append({
        "user": user_message,
        "ai": ai_response,
        "timestamp": datetime.now().isoformat()
    })
    
    # Limit chat history size
    if len(chat_histories[user_id]) > 50:
        chat_histories[user_id] = chat_histories[user_id][-50:]
    
    return jsonify({
        "response": ai_response
    })

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """Get user chat history"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if user_id not in chat_histories:
        return jsonify([])
    
    return jsonify(chat_histories[user_id])

@app.route('/api/chat/clear', methods=['POST'])
def clear_chat_history():
    """Clear user chat history"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    chat_histories[user_id] = []
    
    return jsonify({
        "message": "Chat history cleared successfully"
    })

# Diet Advice Routes
@app.route('/api/diet/generate', methods=['POST'])
def generate_diet_plan():
    """Generate personalized diet plan"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    # Get user profile for pregnancy stage info
    profile = profiles.get(user_id, {})
    weeks_pregnant = profile.get('weeksPregnant', 0)
    
    # Determine trimester
    trimester = 1
    if weeks_pregnant > 27:
        trimester = 3
    elif weeks_pregnant > 13:
        trimester = 2
    
    # Create AI prompt for diet plan
    prompt = f"""
    Generate a personalized pregnancy diet plan with the following details:
    - Age: {data.get('age', 'N/A')}
    - Current weight: {data.get('weight', 'N/A')} kg
    - Height: {data.get('height', 'N/A')} cm
    - Activity level: {data.get('activityLevel', 'N/A')}
    - Dietary restrictions: {', '.join(data.get('dietaryRestrictions', []))}
    - Health goals: {', '.join(data.get('healthGoals', []))}
    - Weeks pregnant: {weeks_pregnant} (Trimester {trimester})
    
    Include:
    1. Daily calorie needs
    2. Macro breakdown (protein, carbs, fats)
    3. Key nutrients for this stage of pregnancy
    4. Sample meal plan for one day
    5. Specific foods to include
    6. Foods to avoid
    7. Pregnancy-specific nutrition tips
    """
    
    # Generate AI response
    ai_result = generate_ai_response(prompt)
    
    if 'error' in ai_result:
        return jsonify(ai_result), 500
    
    return jsonify({
        "dietPlan": ai_result['response'],
        "trimester": trimester,
        "weeksPregnant": weeks_pregnant
    })

# Reminder System Routes
@app.route('/api/reminders', methods=['POST'])
def create_reminder():
    """Create a new reminder"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    data = request.json
    
    # Validate input
    required_fields = ['title', 'date', 'time', 'type']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Initialize reminders for user if they don't exist
    if 'reminders' not in profiles.get(user_id, {}):
        profiles[user_id]['reminders'] = []
    
    # Create reminder
    reminder_id = str(uuid.uuid4())
    reminder = {
        "id": reminder_id,
        "title": data['title'],
        "date": data['date'],
        "time": data['time'],
        "type": data['type'],
        "description": data.get('description', ''),
        "createdAt": datetime.now().isoformat()
    }
    
    profiles[user_id]['reminders'].append(reminder)
    
    return jsonify({
        "message": "Reminder created successfully",
        "reminder": reminder
    }), 201

@app.route('/api/reminders', methods=['GET'])
def get_reminders():
    """Get user reminders"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if 'reminders' not in profiles.get(user_id, {}):
        profiles[user_id]['reminders'] = []
    
    return jsonify(profiles[user_id]['reminders'])

@app.route('/api/reminders/<reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    """Delete a reminder"""
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    
    if 'reminders' not in profiles.get(user_id, {}):
        return jsonify({"error": "Reminder not found"}), 404
    
    reminder_index = None
    for i, reminder in enumerate(profiles[user_id]['reminders']):
        if reminder['id'] == reminder_id:
            reminder_index = i
            break
    
    if reminder_index is None:
        return jsonify({"error": "Reminder not found"}), 404
    
    # Remove reminder
    del profiles[user_id]['reminders'][reminder_index]
    
    return jsonify({
        "message": "Reminder deleted successfully"
    })

# Run the application
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_ENV') == 'development')