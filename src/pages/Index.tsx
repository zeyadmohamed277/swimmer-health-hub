import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, User, Users, Activity, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'swimmer') {
        navigate('/profile');
      } else if (role === 'coach') {
        navigate('/dashboard');
      }
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen gradient-surface">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-ocean flex items-center justify-center mb-6 shadow-lg">
            <Waves className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SwimHealth
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional swimmer health management system for tracking medical assessments, 
            in-body examinations, and performance metrics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-ocean hover:opacity-90 transition-opacity w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Swimmer Profiles</CardTitle>
              <CardDescription>
                Complete personal profiles with contact information and emergency details
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>In-Body Analysis</CardTitle>
              <CardDescription>
                Track body composition including weight, muscle mass, and body fat percentage
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Medical Tracking</CardTitle>
              <CardDescription>
                Record and monitor medical results with status indicators for follow-up
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Coach Dashboard</CardTitle>
              <CardDescription>
                Comprehensive overview of all swimmers with search and filtering capabilities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Role-based access control ensures swimmers only see their own data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-primary">Ready to Start?</CardTitle>
              <CardDescription>
                Create your account and begin tracking health metrics today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full">Create Account</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}