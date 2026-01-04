import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Search, Users, AlertTriangle, Activity, Eye } from 'lucide-react';

interface SwimmerProfile {
  id: string;
  email: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
}

interface InBodyExamination {
  id: string;
  swimmer_id: string;
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
  swimmer_id: string;
  examination_date: string;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  notes: string | null;
  status: 'pending' | 'normal' | 'attention' | 'critical';
}

interface SwimmerWithData extends SwimmerProfile {
  latestInBody: InBodyExamination | null;
  latestMedical: MedicalResult | null;
}

export default function CoachDashboard() {
  const [swimmers, setSwimmers] = useState<SwimmerWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSwimmer, setSelectedSwimmer] = useState<SwimmerWithData | null>(null);
  const [swimmerInBody, setSwimmerInBody] = useState<InBodyExamination[]>([]);
  const [swimmerMedical, setSwimmerMedical] = useState<MedicalResult[]>([]);

  useEffect(() => {
    fetchSwimmers();
  }, []);

  const fetchSwimmers = async () => {
    // Get all swimmer profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Get all swimmer role user IDs
    const { data: swimmerRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'swimmer');

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      setLoading(false);
      return;
    }

    const swimmerUserIds = new Set(swimmerRoles?.map(r => r.user_id) || []);
    const swimmerProfiles = profiles?.filter(p => swimmerUserIds.has(p.id)) || [];

    // Fetch latest examinations for each swimmer
    const [inBodyResponse, medicalResponse] = await Promise.all([
      supabase.from('inbody_examinations').select('*').order('examination_date', { ascending: false }),
      supabase.from('medical_results').select('*').order('examination_date', { ascending: false }),
    ]);

    const inBodyMap = new Map<string, InBodyExamination>();
    (inBodyResponse.data || []).forEach((exam) => {
      if (!inBodyMap.has(exam.swimmer_id)) {
        inBodyMap.set(exam.swimmer_id, exam);
      }
    });

    const medicalMap = new Map<string, MedicalResult>();
    ((medicalResponse.data || []) as MedicalResult[]).forEach((result) => {
      if (!medicalMap.has(result.swimmer_id)) {
        medicalMap.set(result.swimmer_id, result);
      }
    });

    const swimmersWithData: SwimmerWithData[] = swimmerProfiles.map((profile) => ({
      ...profile,
      latestInBody: inBodyMap.get(profile.id) || null,
      latestMedical: medicalMap.get(profile.id) || null,
    }));

    setSwimmers(swimmersWithData);
    setLoading(false);
  };

  const fetchSwimmerDetails = async (swimmer: SwimmerWithData) => {
    setSelectedSwimmer(swimmer);

    const [inBodyResponse, medicalResponse] = await Promise.all([
      supabase
        .from('inbody_examinations')
        .select('*')
        .eq('swimmer_id', swimmer.id)
        .order('examination_date', { ascending: false }),
      supabase
        .from('medical_results')
        .select('*')
        .eq('swimmer_id', swimmer.id)
        .order('examination_date', { ascending: false }),
    ]);

    setSwimmerInBody(inBodyResponse.data || []);
    setSwimmerMedical((medicalResponse.data || []) as MedicalResult[]);
  };

  const filteredSwimmers = swimmers.filter((swimmer) =>
    swimmer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    swimmer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const swimmersNeedingAttention = swimmers.filter(
    (s) => s.latestMedical?.status === 'attention' || s.latestMedical?.status === 'critical'
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor swimmer health and examination results
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swimmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swimmers.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered swimmers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              <AlertTriangle className="h-4 w-4 text-attention" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swimmersNeedingAttention.length}</div>
              <p className="text-xs text-muted-foreground">
                Swimmers requiring follow-up
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Examinations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {swimmers.filter((s) => s.latestInBody || s.latestMedical).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Swimmers with records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Swimmers needing attention */}
        {swimmersNeedingAttention.length > 0 && (
          <Card className="border-attention/50 bg-attention/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-attention">
                <AlertTriangle className="w-5 h-5" />
                Swimmers Requiring Attention
              </CardTitle>
              <CardDescription>
                These swimmers have health statuses that may require follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {swimmersNeedingAttention.map((swimmer) => (
                  <Dialog key={swimmer.id}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => fetchSwimmerDetails(swimmer)}
                      >
                        {swimmer.full_name}
                        <StatusBadge status={swimmer.latestMedical?.status || 'pending'} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <SwimmerDetailDialog
                        swimmer={selectedSwimmer}
                        inBodyExams={swimmerInBody}
                        medicalResults={swimmerMedical}
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Swimmers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Swimmers</CardTitle>
            <CardDescription>
              View and search all registered swimmers
            </CardDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredSwimmers.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No swimmers match your search' : 'No swimmers registered yet'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Latest Weight</TableHead>
                    <TableHead>Body Fat %</TableHead>
                    <TableHead>Medical Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSwimmers.map((swimmer) => (
                    <TableRow key={swimmer.id}>
                      <TableCell className="font-medium">{swimmer.full_name}</TableCell>
                      <TableCell>{swimmer.email}</TableCell>
                      <TableCell>
                        {swimmer.latestInBody?.weight ? `${swimmer.latestInBody.weight} kg` : '-'}
                      </TableCell>
                      <TableCell>
                        {swimmer.latestInBody?.body_fat_percentage
                          ? `${swimmer.latestInBody.body_fat_percentage}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={swimmer.latestMedical?.status || 'pending'} />
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => fetchSwimmerDetails(swimmer)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <SwimmerDetailDialog
                              swimmer={selectedSwimmer}
                              inBodyExams={swimmerInBody}
                              medicalResults={swimmerMedical}
                            />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function SwimmerDetailDialog({
  swimmer,
  inBodyExams,
  medicalResults,
}: {
  swimmer: SwimmerWithData | null;
  inBodyExams: InBodyExamination[];
  medicalResults: MedicalResult[];
}) {
  if (!swimmer) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{swimmer.full_name}</DialogTitle>
        <DialogDescription>{swimmer.email}</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="inbody" className="mt-4">
        <TabsList>
          <TabsTrigger value="inbody">In-Body ({inBodyExams.length})</TabsTrigger>
          <TabsTrigger value="medical">Medical ({medicalResults.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="inbody" className="mt-4">
          {inBodyExams.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No in-body examinations</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Muscle Mass</TableHead>
                  <TableHead>Body Fat %</TableHead>
                  <TableHead>BMI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inBodyExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{format(new Date(exam.examination_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{exam.weight} kg</TableCell>
                    <TableCell>{exam.muscle_mass ?? '-'} kg</TableCell>
                    <TableCell>{exam.body_fat_percentage ?? '-'}%</TableCell>
                    <TableCell>{exam.bmi ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          {medicalResults.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No medical results</p>
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
                    <TableCell>{format(new Date(result.examination_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {result.blood_pressure_systolic && result.blood_pressure_diastolic
                        ? `${result.blood_pressure_systolic}/${result.blood_pressure_diastolic}`
                        : '-'}
                    </TableCell>
                    <TableCell>{result.heart_rate ?? '-'} bpm</TableCell>
                    <TableCell>
                      <StatusBadge status={result.status} />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{result.notes ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}