import { useState } from 'react';

const DietAdvice = () => {
    const [formData, setFormData] = useState({
        age: '',
        gender: 'female',
        height: '',
        weight: '',
        activityLevel: '',
        dietaryRestrictions: [],
        healthGoals: ['Healthy Pregnancy'],
        submitted: false
    });

    const dietaryRestrictionOptions = [
        "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
        "Nut-Free", "Low-Sodium", "Low-Sugar", "Kosher", "Halal"
    ];

    const healthGoalOptions = [
        "Healthy Pregnancy", "Weight Management", "Increase Energy",
        "Improve Digestion", "Better Sleep", "Manage Chronic Condition", 
        "Overall Health"
    ];

    const activityLevelOptions = [
        { value: "sedentary", label: "Sedentary (little or no exercise)" },
        { value: "light", label: "Lightly Active (light exercise 1-3 days/week)" },
        { value: "moderate", label: "Moderately Active (moderate exercise 3-5 days/week)" },
        { value: "active", label: "Active (hard exercise 6-7 days/week)" },
        { value: "veryActive", label: "Very Active (very hard exercise, physical job or training twice/day)" }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCheckboxChange = (e, category) => {
        const { value, checked } = e.target;
        if (checked) {
            setFormData({
                ...formData,
                [category]: [...formData[category], value]
            });
        } else {
            setFormData({
                ...formData,
                [category]: formData[category].filter(item => item !== value)
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormData({
            ...formData,
            submitted: true
        });
    };

    const mealPlan = {
        title: "Pregnancy Nutrition Plan",
        description: "A personalized meal plan designed to support a healthy pregnancy while respecting your dietary preferences.",
        dailyCalories: 2200 + (formData.activityLevel === "active" ? 300 : 0),
        macroBreakdown: {
            protein: "25%",
            carbs: "50%",
            fats: "25%"
        },
        meals: [
            {
                type: "Breakfast",
                options: [
                    "Oatmeal with fresh fruit and a sprinkle of nuts",
                    "Whole-grain toast with avocado and a boiled egg",
                    "Smoothie with spinach, banana, and almond milk"
                ]
            },
            {
                type: "Lunch",
                options: [
                    "Grilled chicken salad with mixed greens and olive oil dressing",
                    "Lentil soup with a side of whole-grain bread",
                    "Quinoa bowl with roasted vegetables and a dollop of yogurt"
                ]
            },
            {
                type: "Dinner",
                options: [
                    "Baked salmon with steamed broccoli and quinoa",
                    "Turkey meatballs with whole-grain pasta and marinara sauce",
                    "Vegetable stir-fry with tofu and brown rice"
                ]
            },
            {
                type: "Snacks",
                options: [
                    "Greek yogurt with a handful of berries",
                    "Carrot sticks with hummus",
                    "A small handful of mixed nuts",
                    "Apple slices with peanut butter"
                ]
            }
        ],
        tips: [
            "Stay hydrated by drinking at least 10 glasses of water daily.",
            "Include foods rich in folic acid, such as leafy greens and fortified cereals.",
            "Consume calcium-rich foods like dairy or fortified plant-based alternatives.",
            "Avoid raw or undercooked foods and limit caffeine intake.",
            "Eat small, frequent meals to manage nausea and maintain energy levels."
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">Personalized Diet Advice</h1>
            
            {!formData.submitted ? (
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="age">
                                    Age
                                </label>
                                <input 
                                    type="number" 
                                    id="age" 
                                    name="age" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    min="18"
                                    max="120"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="height">
                                    Height (cm)
                                </label>
                                <input 
                                    type="number" 
                                    id="height" 
                                    name="height" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    min="100"
                                    max="250"
                                    value={formData.height}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
                                    Weight (kg)
                                </label>
                                <input 
                                    type="number" 
                                    id="weight" 
                                    name="weight" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    min="30"
                                    max="300"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="activityLevel">
                                    Activity Level
                                </label>
                                <select 
                                    id="activityLevel" 
                                    name="activityLevel" 
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={formData.activityLevel}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Activity Level</option>
                                    {activityLevelOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Dietary Restrictions (Select all that apply)
                            </label>
                            <div className="grid md:grid-cols-3 gap-2">
                                {dietaryRestrictionOptions.map((restriction, index) => (
                                    <div key={index} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`restriction-${index}`} 
                                            value={restriction} 
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            checked={formData.dietaryRestrictions.includes(restriction)}
                                            onChange={(e) => handleCheckboxChange(e, 'dietaryRestrictions')}
                                        />
                                        <label htmlFor={`restriction-${index}`} className="ml-2 block text-sm text-gray-700">
                                            {restriction}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Health Goals (Select all that apply)
                            </label>
                            <div className="grid md:grid-cols-3 gap-2">
                                {healthGoalOptions.map((goal, index) => (
                                    <div key={index} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`goal-${index}`} 
                                            value={goal} 
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            checked={formData.healthGoals.includes(goal)}
                                            onChange={(e) => handleCheckboxChange(e, 'healthGoals')}
                                        />
                                        <label htmlFor={`goal-${index}`} className="ml-2 block text-sm text-gray-700">
                                            {goal}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-center">
                            <button 
                                type="submit" 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                            >
                                Get Personalized Diet Advice
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-blue-600">{mealPlan.title}</h2>
                        <p className="text-gray-600 mt-2">{mealPlan.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-blue-600 mb-1">Daily Calories</h3>
                            <p className="text-2xl font-bold">{mealPlan.dailyCalories} kcal</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-blue-600 mb-1">Protein</h3>
                            <p className="text-2xl font-bold">{mealPlan.macroBreakdown.protein}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="font-semibold text-blue-600 mb-1">Carbs</h3>
                            <p className="text-2xl font-bold">{mealPlan.macroBreakdown.carbs}</p>
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4">Your Meal Plan</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {mealPlan.meals.map((meal, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                        <h4 className="text-lg font-semibold text-blue-600 mb-2">{meal.type}</h4>
                                        <ul>
                                                {meal.options.map((option, idx) => (
                                                <li key={idx} className="text-gray-600">{option}</li>
                                                ))}
                                        </ul>
                                </div>
                                ))}
                        </div>
                        </div>

                        <div>
                        <h3 className="text-xl font-semibold text-blue-600 mb-4">Nutrition Tips</h3>
                        <ul className="list-disc list-inside text-gray-600">
                                {mealPlan.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                                ))}
                        </ul>
                        </div>
                </div>
                )}
        </div>
        );
}

export default DietAdvice;
