import { Link } from 'react-router-dom';

const Home = () => {
    const features = [
        {
            title: "Find Gynecologists",
            description: "Connect with top-rated gynecologists specializing in pregnancy care",
            icon: "👩‍⚕️",
            link: "/doctor-finder"
        },
        {
            title: "Pregnancy Diet",
            description: "Get personalized nutrition advice tailored to each trimester of pregnancy",
            icon: "🥗",
            link: "/diet-advice"
        },
        {
            title: "Track Pregnancy",
            description: "Monitor your pregnancy milestones and manage your health information",
            icon: "👶",
            link: "/profile"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-pink-600 mb-4">Welcome to SheWell</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Your personalized pregnancy care platform for connecting with gynecologists, getting nutrition advice, and managing your pregnancy journey.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h2 className="text-2xl font-semibold text-pink-600 mb-2">{feature.title}</h2>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <Link
                            to={feature.link}
                            className="inline-block bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center p-8 bg-pink-50 rounded-lg">
                <h2 className="text-2xl font-bold text-pink-600 mb-4">Why Choose SheWell?</h2>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Specialized Care</h3>
                        <p className="text-gray-600">Connect with gynecologists who specialize in pregnancy and prenatal care.</p>
                    </div>
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Trimester-Specific Guidance</h3>
                        <p className="text-gray-600">Receive advice tailored to your current stage of pregnancy.</p>
                    </div>
                    <div className="p-4">
                        <h3 className="text-xl font-semibold mb-2">Community Support</h3>
                        <p className="text-gray-600">Join a community of expecting mothers sharing similar experiences.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;