import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Calendar, Phone, AlertCircle, Heart, Pill, Stethoscope, Syringe } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from "react-router-dom";



interface Profile {
  id: string;
  email: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  national_id: string | null;
  gender: string | null;
  blood_type: string | null;
  father_name: string | null;
  father_national_id: string | null;
  mother_name: string | null;
  mother_national_id: string | null;
  allergies: string | null;
  previous_surgeries: string | null;
  chronic_diseases: string | null;
}

interface MedicalResult {
  id: string;
  examination_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  status: string | null;
  notes: string | null;
}

const isAbnormalBloodPressure = (systolic: number | null, diastolic: number | null): boolean => {
  if (systolic === null || diastolic === null) return false;
  return systolic > 140 || systolic < 90 || diastolic > 90 || diastolic < 60;
};

const isAbnormalHeartRate = (heartRate: number | null): boolean => {
  if (heartRate === null) return false;
  return heartRate > 100 || heartRate < 60;
};

export default function SwimmerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [medicalResults, setMedicalResults] = useState<MedicalResult[]>([]);
  const [loading, setLoading] = useState(true);

const location = useLocation();
const swimmer = location.state?.swimmer;

if (!swimmer) {
  return <p>No swimmer data found</p>;
}
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [profileRes, medicalRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('medical_results').select('*').eq('swimmer_id', user.id).order('examination_date', { ascending: false }).limit(5),
    ]);

    if (profileRes.error) {
      console.error('Error fetching profile:', profileRes.error);
      toast.error('Failed to load profile');
    } else if (profileRes.data) {
      setProfile(profileRes.data);
    }

    if (medicalRes.error) {
      console.error('Error fetching medical results:', medicalRes.error);
    } else {
      setMedicalResults(medicalRes.data || []);
    }

    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                <AvatarImage src="" alt={profile?.full_name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile?.full_name ? getInitials(profile.full_name) : <User className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left space-y-2">
                <h1 className="text-3xl font-bold">{profile?.full_name || 'Swimmer'}</h1>
                {profile?.date_of_birth && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Born {format(new Date(profile.date_of_birth), 'MMMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  {profile?.blood_type && (
                    <Badge variant="secondary">Blood Type: {profile.blood_type}</Badge>
                  )}
                  {profile?.gender && (
                    <Badge variant="outline">{profile.gender}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Medical History Section */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Health Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Medical History
              </CardTitle>
              <CardDescription>Your health information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Pill className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Allergies</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.allergies || 'None reported'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Syringe className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Previous Surgeries</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.previous_surgeries || 'None reported'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Chronic Diseases</p>
                    <p className="text-sm text-muted-foreground">
                      {profile?.chronic_diseases || 'None reported'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Medical Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Medical Records
              </CardTitle>
              <CardDescription>Upload and manage your medical files</CardDescription>
            </CardHeader>
            <CardContent>

                <form action="/action_page.php">
                <input type="file" id="myFile" name="filename"
                accept='.pdf,.jpg,.jpeg,.png,.gif'
                multiple
                />
                </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Recent Medical Results
              </CardTitle>
              <CardDescription>Latest examination results</CardDescription>
            </CardHeader>
            <CardContent>
              {medicalResults.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No medical results recorded yet
                </p>
              ) : (
                <div className="space-y-3">
                  {medicalResults.map((result) => {
                    const bpAbnormal = isAbnormalBloodPressure(result.blood_pressure_systolic, result.blood_pressure_diastolic);
                    const hrAbnormal = isAbnormalHeartRate(result.heart_rate);
                    const hasAbnormal = bpAbnormal || hrAbnormal;

                    return (
                      <div
                        key={result.id}
                        className={`p-3 rounded-lg border ${
                          hasAbnormal ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            {format(new Date(result.examination_date), 'MMM d, yyyy')}
                          </span>
                          {hasAbnormal && (
                            <Badge variant="destructive" className="text-xs">
                              Abnormal
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className={bpAbnormal ? 'text-destructive font-medium' : ''}>
                            <span className="text-muted-foreground">BP: </span>
                            {result.blood_pressure_systolic && result.blood_pressure_diastolic
                              ? `${result.blood_pressure_systolic}/${result.blood_pressure_diastolic}`
                              : 'N/A'}
                          </div>
                          <div className={hrAbnormal ? 'text-destructive font-medium' : ''}>
                            <span className="text-muted-foreground">HR: </span>
                            {result.heart_rate ? `${result.heart_rate} bpm` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emergency Contact</p>
                <p className="font-medium">{profile?.emergency_contact || 'Not provided'}</p>
                {profile?.emergency_phone && (
                  <p className="text-sm text-muted-foreground">{profile.emergency_phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}