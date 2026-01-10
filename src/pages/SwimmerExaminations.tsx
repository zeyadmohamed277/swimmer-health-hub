import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Activity, Heart, TrendingUp, Scale } from 'lucide-react';

interface InBodyExamination {
  id: string;
  examination_date: string;
  weight: number;
  height: number | null;
  muscle_mass: number | null;
  body_fat_percentage: number | null;
  body_water_percentage: number | null;
  bone_mass: number | null;
  bmi: number | null;
  basal_metabolic_rate: number | null;
  notes: string | null;
}

interface MedicalResult {
  id: string;
  examination_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  notes: string | null;
  status: 'pending' | 'normal' | 'attention' | 'critical';
}

export default function SwimmerExaminations() {
  const { user } = useAuth();
  const [inBodyExams, setInBodyExams] = useState<InBodyExamination[]>([]);
  const [medicalResults, setMedicalResults] = useState<MedicalResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExaminations();
    }
  }, [user]);

  const fetchExaminations = async () => {
    if (!user) return;

    const [inBodyResponse, medicalResponse] = await Promise.all([
      supabase
        .from('inbody_examinations')
        .select('*')
        .eq('swimmer_id', user.id)
        .order('examination_date', { ascending: false }),
      supabase
        .from('medical_results')
        .select('*')
        .eq('swimmer_id', user.id)
        .order('examination_date', { ascending: false }),
    ]);

    if (inBodyResponse.error) {
      console.error('Error fetching in-body exams:', inBodyResponse.error);
    } else {
      setInBodyExams(inBodyResponse.data || []);
    }

    if (medicalResponse.error) {
      console.error('Error fetching medical results:', medicalResponse.error);
    } else {
      setMedicalResults((medicalResponse.data || []) as MedicalResult[]);
    }

    setLoading(false);
  };

  const latestInBody = inBodyExams[0];
  const latestMedical = medicalResults[0];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading examinations...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Health & Examination Results</h1>
          <p className="text-muted-foreground mt-1">
            View your in-body and medical examination history
          </p>
        </div>

        {/* Quick Stats */}
        {(latestInBody || latestMedical) && (
          <div className="grid gap-4 md:grid-cols-4">
            {latestInBody && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weight</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latestInBody.weight} kg</div>
                    <p className="text-xs text-muted-foreground">
                      Last recorded {format(new Date(latestInBody.examination_date), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Muscle Mass</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestInBody.muscle_mass ? `${latestInBody.muscle_mass} kg` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Body composition metric
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latestInBody.body_fat_percentage ? `${latestInBody.body_fat_percentage}%` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fat percentage
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
            {latestMedical && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestMedical.heart_rate ? `${latestMedical.heart_rate} bpm` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Resting heart rate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Examination History */}
        <Tabs defaultValue="inbody" className="w-full">
          <TabsList>
            <TabsTrigger value="inbody">In-Body Examinations</TabsTrigger>
            <TabsTrigger value="medical">Medical Results</TabsTrigger>
          </TabsList>

          <TabsContent value="inbody" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>In-Body Examination History</CardTitle>
                <CardDescription>
                  Your body composition measurements over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inBodyExams.length != 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No in-body examinations recorded yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Weight (kg)</TableHead>
                        <TableHead>Muscle Mass (kg)</TableHead>
                        <TableHead>Body Fat (%)</TableHead>
                        <TableHead>BMI</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inBodyExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">
                            {format(new Date(exam.examination_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{exam.weight}</TableCell>
                          <TableCell>{exam.muscle_mass ?? '-'}</TableCell>
                          <TableCell>{exam.body_fat_percentage ?? '-'}</TableCell>
                          <TableCell>{exam.bmi ?? '-'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {exam.notes ?? '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Medical Results History</CardTitle>
                <CardDescription>
                  Your medical examination records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalResults.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No medical results recorded yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Blood Pressure</TableHead>
                        <TableHead>Heart Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicalResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            {format(new Date(result.examination_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {result.blood_pressure_systolic && result.blood_pressure_diastolic
                              ? `${result.blood_pressure_systolic}/${result.blood_pressure_diastolic}`
                              : '-'}
                          </TableCell>
                          <TableCell>{result.heart_rate ?? '-'} bpm</TableCell>
                          <TableCell>
                            <StatusBadge status={result.status} />
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {result.notes ?? '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}