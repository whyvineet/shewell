from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from models import db, User, Doctor, Appointment
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from twilio.rest import Client
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime
from deep_translator import GoogleTranslator


# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'development-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shewell.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

# Configure Twilio if environment variables are available
if os.getenv('TWILIO_ACCOUNT_SID') and os.getenv('TWILIO_AUTH_TOKEN'):
    twilio_client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
    twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
else:
    twilio_client = None
    twilio_phone_number = None

# Configure Google Generative AI
genai.configure(api_key='your_api_key_here')  # Replace with your actual API key
gemini_model = genai.GenerativeModel('gemini-2.0-flash')

# Helper function to check if user is logged in
def login_required(user_type=None):
    if 'user_id' not in session:
        flash('Please log in to access this page', 'error')
        return redirect(url_for('login'))
    
    if user_type and session.get('user_type') != user_type:
        flash(f'You must be logged in as a {user_type} to access this page', 'error')
        return redirect(url_for('dashboard'))
    
    return None

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user_type = request.form.get('user_type')
        
        if user_type == 'patient':
            user = User.query.filter_by(email=email).first()
        else:
            user = Doctor.query.filter_by(email=email).first()
            
        if user and user.check_password(password):
            session['user_id'] = user.id
            session['user_type'] = user_type
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        
        flash('Invalid email or password', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/periods')
def periods():
    return render_template('periods.html')


@app.route('/register_patient', methods=['POST'])
def register_patient():
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    password = request.form.get('password')

    if User.query.filter_by(email=email).first():
        flash('Email is already registered', 'error')
        return redirect(url_for('register'))

    new_user = User(name=name, email=email, phone=phone)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    flash('Patient registered successfully! Please log in.', 'success')
    return redirect(url_for('login'))

@app.route('/register_doctor', methods=['POST'])
def register_doctor():
    name = request.form.get('name')
    email = request.form.get('email')
    phone = request.form.get('phone')
    specialization = request.form.get('specialization')
    password = request.form.get('password')

    if Doctor.query.filter_by(email=email).first():
        flash('Email is already registered', 'error')
        return redirect(url_for('register'))

    new_doctor = Doctor(name=name, email=email, phone=phone, specialization=specialization, experience=0, available_days="")
    new_doctor.set_password(password)
    db.session.add(new_doctor)
    db.session.commit()

    flash('Doctor registered successfully! Please log in.', 'success')
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    redirect_result = login_required()
    if redirect_result:
        return redirect_result

    if session['user_type'] == 'patient':
        return redirect(url_for('patient_dashboard'))
    elif session['user_type'] == 'doctor':
        return redirect(url_for('doctor_dashboard'))
    else:
        flash('Invalid user type', 'error')
        return redirect(url_for('home'))

@app.route('/patient_dashboard')
def patient_dashboard():
    redirect_result = login_required('patient')
    if redirect_result:
        return redirect_result

    user = User.query.get(session['user_id'])
    appointments = Appointment.query.filter_by(user_id=user.id).all()
    return render_template('patient_dashboard.html', user=user, appointments=appointments)

@app.route('/doctor_dashboard')
def doctor_dashboard():
    redirect_result = login_required('doctor')
    if redirect_result:
        return redirect_result

    doctor = Doctor.query.get(session['user_id'])
    appointments = Appointment.query.filter_by(doctor_id=doctor.id).all()
    now = datetime.now()
    return render_template('doctor_dashboard.html', doctor=doctor, appointments=appointments, now=now)

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_type', None)
    flash('You have been logged out', 'info')
    return redirect(url_for('home'))

@app.route('/doctors')
def doctors():
    redirect_result = login_required('patient')
    if redirect_result:
        return redirect_result
        
    doctors_list = Doctor.query.all()
    return render_template('doctors.html', doctors=doctors_list)

@app.route('/book_appointment/<int:doctor_id>', methods=['GET', 'POST'])
def book_appointment(doctor_id):
    redirect_result = login_required('patient')
    if redirect_result:
        return redirect_result
        
    doctor = Doctor.query.get_or_404(doctor_id)
    
    if request.method == 'POST':
        date = request.form.get('date')
        time = request.form.get('time')
        
        appointment = Appointment(
            user_id=session['user_id'],
            doctor_id=doctor_id,
            date=datetime.strptime(date, '%Y-%m-%d'),
            time=time
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        # Send SMS notification via Twilio if configured
        if twilio_client and twilio_phone_number:
            user = User.query.get(session['user_id'])
            try:
                message = twilio_client.messages.create(
                    body=f"Hello {user.name}, your appointment with Dr. {doctor.name} is confirmed for {date} at {time}.",
                    from_=twilio_phone_number,
                    to=user.phone
                )
            except Exception as e:
                app.logger.error(f"Failed to send SMS: {e}")
        
        flash('Appointment booked successfully!', 'success')
        return redirect(url_for('dashboard'))
        
    return render_template('book_appointment.html', doctor=doctor)

@app.route('/chatbot')
def chatbot():
    redirect_result = login_required('patient')
    if redirect_result:
        return redirect_result
    
    return render_template('chatbot.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    redirect_result = login_required('patient')
    if redirect_result is not None:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400

    user_message = data.get('message')
    selected_language = data.get('language', 'en')  # Default to English

    if not gemini_model:
        return jsonify({'response': 'AI chatbot is not configured. Please check your environment variables.'}), 503
    
    
    def translate_text(text, target_language="en"):
        try:
            return GoogleTranslator(source='auto', target=target_language).translate(text)
        except Exception as e:
            app.logger.error(f"Translation error: {e}")
            return text  # Return original text if translation fails

    # Translate user message to English for processing
    user_message_translated = translate_text(user_message, target_language='en')

    # Add context for pregnancy-related questions
    prompt = f"""
    You are a supportive AI assistant for pregnant women on the SheWell platform.
    Provide helpful, accurate information about pregnancy, but always recommend 
    consulting with their doctor for medical advice. The question is: {user_message_translated}
    """

    try:
        response = gemini_model.generate_content(prompt)
        ai_response = response.text.strip() if response and hasattr(response, 'text') else "I'm sorry, I couldn't process your request."

        # Translate AI response back to the user's selected language
        translated_response = translate_text(ai_response, target_language=selected_language)

        return jsonify({'response': translated_response})
    except Exception as e:
        app.logger.error(f"Failed to generate AI response: {e}")
        return jsonify({'response': 'Sorry, I was unable to process your request. Please try again later.'}), 500

@app.route('/admin/add_doctor', methods=['GET', 'POST'])
def add_doctor():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        specialization = request.form.get('specialization')
        experience = request.form.get('experience')
        phone = request.form.get('phone')
        available_days = request.form.get('available_days')
        
        # Check if email already exists
        existing_doctor = Doctor.query.filter_by(email=email).first()
        if existing_doctor:
            flash('Email already registered', 'error')
            return render_template('admin_add_doctor.html')
        
        doctor = Doctor(
            name=name, 
            email=email, 
            specialization=specialization,
            experience=experience,
            phone=phone,
            available_days=available_days
        )
        doctor.set_password(password)
        
        db.session.add(doctor)
        db.session.commit()
        
        flash('Doctor added successfully!', 'success')
        return redirect(url_for('home'))
        
    return render_template('admin_add_doctor.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)