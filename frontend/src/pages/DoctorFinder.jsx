import { useState } from 'react';

const DoctorFinder = () => {
    const [location, setLocation] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [insurance, setInsurance] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const specialties = [
        "Obstetrics", "Maternal-Fetal Medicine", "High-Risk Pregnancy", 
        "Prenatal Care", "Natural Birth", "Cesarean Section Specialist",
        "Reproductive Endocrinology", "Gynecologic Oncology"
    ];

    const insuranceProviders = [
        "Aetna", "Blue Cross Blue Shield", "Cigna", "Humana",
        "Kaiser Permanente", "Medicare", "Medicaid", "UnitedHealthcare"
    ];

    const mockDoctors = [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "Obstetrics",
            location: "New York, NY",
            insurance: ["Aetna", "Blue Cross Blue Shield", "Cigna"],
            rating: 4.8,
            availability: "Next available: Tomorrow",
            yearsExperience: 15,
            hospital: "NYC Women's Health Center"
        },
        {
            id: 2,
            name: "Dr. Maria Rodriguez",
            specialty: "Maternal-Fetal Medicine",
            location: "New York, NY",
            insurance: ["Medicare", "Blue Cross Blue Shield", "UnitedHealthcare"],
            rating: 4.9,
            availability: "Next available: Monday",
            yearsExperience: 20,
            hospital: "Mount Sinai Hospital"
        },
        {
            id: 3,
            name: "Dr. Emily Chen",
            specialty: "High-Risk Pregnancy",
            location: "Boston, MA",
            insurance: ["Cigna", "UnitedHealthcare", "Aetna"],
            rating: 4.7,
            availability: "Next available: Thursday",
            yearsExperience: 12,
            hospital: "Boston Medical Center"
        },
        {
            id: 4,
            name: "Dr. Jessica Wilson",
            specialty: "Prenatal Care",
            location: "Boston, MA",
            insurance: ["Blue Cross Blue Shield", "Medicaid", "Humana"],
            rating: 4.6,
            availability: "Next available: Friday",
            yearsExperience: 8,
            hospital: "Brigham and Women's Hospital"
        },
        {
            id: 5,
            name: "Dr. Lisa Thompson",
            specialty: "Natural Birth",
            location: "Chicago, IL",
            insurance: ["Aetna", "Kaiser Permanente", "Medicare"],
            rating: 4.5,
            availability: "Next available: Wednesday",
            yearsExperience: 10,
            hospital: "Chicago Women's Hospital"
        }
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const filtered = mockDoctors.filter(doctor => {
                const locationMatch = !location || doctor.location.toLowerCase().includes(location.toLowerCase());
                const specialtyMatch = !specialty || doctor.specialty === specialty;
                const insuranceMatch = !insurance || doctor.insurance.includes(insurance);
                return locationMatch && specialtyMatch && insuranceMatch;
            });

            setSearchResults(filtered);
            setIsLoading(false);
            setHasSearched(true);
        }, 1000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">Find a Gynecologist</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch}>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="City, State or Zip"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialty">
                                Specialty
                            </label>
                            <select
                                id="specialty"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                            >
                                <option value="">Select Specialty</option>
                                {specialties.map((s, index) => (
                                    <option key={index} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="insurance">
                                Insurance
                            </label>
                            <select
                                id="insurance"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={insurance}
                                onChange={(e) => setInsurance(e.target.value)}
                            >
                                <option value="">Select Insurance</option>
                                {insuranceProviders.map((i, index) => (
                                    <option key={index} value={i}>{i}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition-colors"
                    >
                        {isLoading ? "Searching..." : "Search"}
                    </button>
                </form>
            </div>

            {hasSearched && (
                <div className="grid md:grid-cols-2 gap-8">
                    {searchResults.map(doctor => (
                        <div key={doctor.id} className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-pink-600 mb-2">{doctor.name}</h2>
                            <p className="text-gray-600 mb-4">{doctor.specialty} &bull; {doctor.location}</p>
                            <p className="text-gray-600 mb-4">Rating: {doctor.rating} &bull; Experience: {doctor.yearsExperience} years</p>
                            <p className="text-gray-600 mb-4">{doctor.availability}</p>
                            <p className="text-gray-600 mb-4">Hospital: {doctor.hospital}</p>
                            <p className="text-gray-600">Accepts: {doctor.insurance.join(", ")}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DoctorFinder;