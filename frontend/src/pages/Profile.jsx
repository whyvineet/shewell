import { useState } from 'react';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        dueDate: '2025-08-15',
        weeksPregnant: 22,
        doctor: 'Dr. Emily Rodriguez',
        upcomingAppointment: '2025-04-10, 10:30 AM',
        medicalHistory: {
            previousPregnancies: 1,
            allergies: ['Penicillin'],
            conditions: ['Gestational Diabetes']
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({ ...profile });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile({
            ...editedProfile,
            [name]: value
        });
    };

    const handleMedicalChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile({
            ...editedProfile,
            medicalHistory: {
                ...editedProfile.medicalHistory,
                [name]: value.split(',').map(item => item.trim())
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProfile(editedProfile);
        setIsEditing(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">My Pregnancy Profile</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-pink-600">Personal Information</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.dueDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weeksPregnant">
                                    Weeks Pregnant
                                </label>
                                <input
                                    type="number"
                                    id="weeksPregnant"
                                    name="weeksPregnant"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.weeksPregnant}
                                    onChange={handleChange}
                                    min="1"
                                    max="42"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="doctor">
                                    Current Gynecologist
                                </label>
                                <input
                                    type="text"
                                    id="doctor"
                                    name="doctor"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.doctor}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="upcomingAppointment">
                                    Next Appointment
                                </label>
                                <input
                                    type="text"
                                    id="upcomingAppointment"
                                    name="upcomingAppointment"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={editedProfile.upcomingAppointment}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-pink-600 mb-4">Medical History</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="previousPregnancies">
                                        Previous Pregnancies
                                    </label>
                                    <input
                                        type="number"
                                        id="previousPregnancies"
                                        name="previousPregnancies"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={editedProfile.medicalHistory.previousPregnancies}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile,
                                            medicalHistory: {
                                                ...editedProfile.medicalHistory,
                                                previousPregnancies: parseInt(e.target.value)
                                            }
                                        })}
                                        min="0"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="allergies">
                                        Allergies (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="allergies"
                                        name="allergies"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={editedProfile.medicalHistory.allergies.join(', ')}
                                        onChange={handleMedicalChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="conditions">
                                        Medical Conditions (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        id="conditions"
                                        name="conditions"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        value={editedProfile.medicalHistory.conditions.join(', ')}
                                        onChange={handleMedicalChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditedProfile({ ...profile });
                                    setIsEditing(false);
                                }}
                                className="border border-pink-600 text-pink-600 hover:bg-pink-50 font-medium py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div>
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Personal Details</h3>
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-600">Name:</span>
                                        <span className="ml-2 text-gray-800">{profile.name}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Email:</span>
                                        <span className="ml-2 text-gray-800">{profile.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Pregnancy Information</h3>
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-600">Due Date:</span>
                                        <span className="ml-2 text-gray-800">{new Date(profile.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Weeks Pregnant:</span>
                                        <span className="ml-2 text-gray-800">{profile.weeksPregnant} weeks</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Medical Care</h3>
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-600">Current Gynecologist:</span>
                                        <span className="ml-2 text-gray-800">{profile.doctor}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Next Appointment:</span>
                                        <span className="ml-2 text-gray-800">{profile.upcomingAppointment}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Medical History</h3>
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <span className="font-medium text-gray-600">Previous Pregnancies:</span>
                                        <span className="ml-2 text-gray-800">{profile.medicalHistory.previousPregnancies}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Allergies:</span>
                                        <span className="ml-2 text-gray-800">
                                            {profile.medicalHistory.allergies.length > 0
                                                ? profile.medicalHistory.allergies.join(', ')
                                                : 'None'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Medical Conditions:</span>
                                        <span className="ml-2 text-gray-800">
                                            {profile.medicalHistory.conditions.length > 0
                                                ? profile.medicalHistory.conditions.join(', ')
                                                : 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-pink-600 mb-6">Pregnancy Timeline</h2>
                <div className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-pink-200"></div>
                    <div className="relative z-10">
                        {[
                            { week: 12, title: "First Trimester Complete", description: "Baby's organs are formed" },
                            { week: 20, title: "Halfway Point", description: "Anatomy scan completed" },
                            { week: 28, title: "Third Trimester Begins", description: "Baby's movements become stronger" },
                            { week: 36, title: "Full Term Approaching", description: "Baby is nearly ready for birth" }
                        ].map((milestone, index) => (
                            <div key={index} className={`mb-8 flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className={`relative w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                                    <div className={`absolute ${index % 2 === 0 ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full ${milestone.week <= profile.weeksPregnant ? 'bg-pink-500' : 'bg-gray-300'} flex items-center justify-center`}>
                                        <span className="text-white font-bold">{milestone.week}</span>
                                    </div>
                                    <div className={`bg-white p-4 rounded shadow ${milestone.week <= profile.weeksPregnant ? 'border-pink-500 border-2' : 'border border-gray-200'}`}>
                                        <h3 className={`font-bold ${milestone.week <= profile.weeksPregnant ? 'text-pink-600' : 'text-gray-500'}`}>{milestone.title}</h3>
                                        <p className="text-gray-600">{milestone.description}</p>
                                        <p className="text-sm font-medium mt-2">
                                            {milestone.week <= profile.weeksPregnant ? 'Completed' : `Coming in ${milestone.week - profile.weeksPregnant} weeks`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;