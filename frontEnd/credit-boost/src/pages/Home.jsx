import React, { useState, useEffect, useContext } from 'react';
import { CreditCard, GraduationCap, Star, ChevronRight, Sparkles, Trophy, Target, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from './Layouts/AuthenticatedLayout';
import PassportCard from '@/components/CreditPassport/PassportCard';
import { AppContext } from '@/context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Use actual user data from context if available
    if (user) {
      setUserData({
        firstName: user.firstName || user.username || 'User',
        lastName: user.lastName || '',
        email: user.email || '',
        updatedAt: new Date().toISOString()
      });
    } else {
      // Fallback to mock data if no user in context
      setUserData({
        firstName: "User",
        lastName: "",
        email: "user@example.com",
        updatedAt: new Date().toISOString()
      });
    }
  }, [user]);

  const stats = [
    {
      title: "Credit Score",
      value: "780",
      icon: <CreditCard className="h-10 w-10" />,
      color: "text-secondary",
      borderColor: "border-secondary",
      bgGradient: "from-secondary/10 to-white",
      description: "Your latest credit score",
      trend: "neutral"
    },
    {
      title: "Learn Score",
      value: "066",
      icon: <GraduationCap className="h-10 w-10" />,
      color: "text-primary",
      borderColor: "border-primary",
      bgGradient: "from-primary/10 to-white",
      description: "30 modules completed",
      trend: "up"
    },
    {
      title: "Game Score",
      value: "636",
      icon: <Trophy className="h-10 w-10" />,
      color: "text-accent",
      borderColor: "border-accent",
      bgGradient: "from-accent/10 to-white",
      description: "Top 10% of players",
      trend: "up"
    }
  ];

  const tasks = [
    {
      name: 'Master Your Credit Score',
      icon: <Target className="h-6 w-6" />,
      link: '/credit-score',
      description: 'Upload your financial history and unlock your credit potential.',
      features: ['Personalized analysis', 'Monthly tracking', 'Improvement tips'],
      gradient: "from-secondary to-secondary-light",
      buttonText: 'Analyze Score'
    },
    {
      name: 'Financial Dashboard',
      icon: <CreditCard className="h-6 w-6" />,
      link: '/financial-dashboard',
      description: 'Comprehensive analysis of your financial data and personalized recommendations.',
      features: ['Data-driven insights', 'Credit simulation', 'Personalized recommendations'],
      gradient: "from-green-500 to-green-400",
      buttonText: 'View Dashboard'
    },
    {
      name: 'Universal Credit Passport',
      icon: <Shield className="h-6 w-6" />,
      link: '/credit-passport',
      description: 'Secure blockchain-based credit identity system.',
      features: ['Blockchain security', 'Global accessibility', 'User-controlled sharing'],
      gradient: "from-blue-500 to-blue-400",
      buttonText: 'Access Passport'
    },
    {
      name: 'Financial Growth Journey',
      icon: <Sparkles className="h-6 w-6" />,
      link: '/learn',
      description: 'Embark on an interactive learning adventure.',
      features: ['Interactive quizzes', 'Achievement badges', 'Community rankings'],
      gradient: "from-primary to-primary-light",
      buttonText: 'Start Journey'
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col gap-8">
        {/* Welcome Message */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {userData?.firstName || 'User'}!</h1>
          <p className="text-muted-foreground">Here's your financial dashboard overview.</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-xl p-6 shadow-sm border ${stat.borderColor} hover:scale-105 transition-all duration-300`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${stat.bgGradient} opacity-20`} />
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <h3 className="text-lg font-bold font-brand">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`border-4 ${stat.borderColor} rounded-full h-16 w-16 flex items-center justify-center bg-card shadow-inner`}>
                  <span className="font-bold text-xl font-brand">{stat.value}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Passport Card */}
        <div className="mb-6">
          <h2 className="text-brand-credit font-brand mb-4">Your Credit Passport</h2>
          <PassportCard 
            userData={userData}
            creditScore={780}
            onView={() => navigate('/credit-passport')}
            onShare={() => navigate('/credit-passport')}
          />
        </div>

        {/* Resources Section */}
        <div>
          <h2 className="text-brand-credit font-brand mb-6">Your Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="group bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-border"
              >
                <div className="relative">
                  <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-background to-card opacity-50 group-hover:scale-110 transition-transform duration-300" />
                  
                  <div className="space-y-4">
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${task.gradient} text-white`}>
                      {task.icon}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold font-brand mb-2">{task.name}</h3>
                      <p className="text-muted-foreground">{task.description}</p>
                      
                      <div className="mt-4 space-y-2">
                        {task.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-border" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(task.link)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${task.gradient} text-white rounded-lg font-medium hover:opacity-90 transition-opacity font-brand`}
                    >
                      {task.buttonText}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Home;