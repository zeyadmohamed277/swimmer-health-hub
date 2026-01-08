import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Waves, User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { z } from 'zod';

const signupSchema = z.object({
  // Section 1: Personal Information
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  nationalId: z.string().min(5, 'National ID is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  bloodType: z.string().min(1, 'Blood type is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Section 2: Parent's Information (optional for coaches)
  fatherName: z.string().optional(),
  fatherNationalId: z.string().optional(),
  motherName: z.string().optional(),
  motherNationalId: z.string().optional(),
  // Section 3: Medical History (optional)
  allergies: z.string().optional(),
  previousSurgeries: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AppRole = 'swimmer' | 'coach';
type SignupFormData = z.infer<typeof signupSchema>;
type FormErrors = Partial<Record<keyof SignupFormData, string>>;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female'];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [currentSection, setCurrentSection] = useState(1);
  const [role, setRole] = useState<AppRole>('swimmer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form fields
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    nationalId: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    email: '',
    password: '',
    fatherName: '',
    fatherNationalId: '',
    motherName: '',
    motherNationalId: '',
    allergies: '',
    previousSurgeries: '',
    chronicDiseases: '',
  });
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const updateFormData = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateSection = (section: number): boolean => {
    const newErrors: FormErrors = {};
    
    if (section === 1) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }
      if (!formData.nationalId || formData.nationalId.length < 5) {
        newErrors.nationalId = 'National ID is required';
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.gender) {
        newErrors.gender = 'Gender is required';
      }
      if (!formData.bloodType) {
        newErrors.bloodType = 'Blood type is required';
      }
      if (!formData.email || !z.string().email().safeParse(formData.email).success) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = (): boolean => {
    try {
      loginSchema.parse({ email: formData.email, password: formData.password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      if (!validateLogin()) return;
    } else if (currentSection < 3) {
      handleNext();
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          nationalId: formData.nationalId,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodType: formData.bloodType,
          email: formData.email,
          password: formData.password,
          fatherName: formData.fatherName,
          fatherNationalId: formData.fatherNationalId,
          motherName: formData.motherName,
          motherNationalId: formData.motherNationalId,
          allergies: formData.allergies,
          previousSurgeries: formData.previousSurgeries,
          chronicDiseases: formData.chronicDiseases,
        }, role);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      nationalId: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      email: '',
      password: '',
      fatherName: '',
      fatherNationalId: '',
      motherName: '',
      motherNationalId: '',
      allergies: '',
      previousSurgeries: '',
      chronicDiseases: '',
    });
    setCurrentSection(1);
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-surface">
      <Card className="w-full max-w-2xl shadow-lg border-border/50">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full gradient-ocean flex items-center justify-center">
            <Waves className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isLogin
                ? 'Sign in to access your swimmer health dashboard'
                : `Step ${currentSection} of 3: ${
                    currentSection === 1
                      ? 'Personal Information'
                      : currentSection === 2
                      ? "Parent's Information"
                      : 'Medical History'
                  }`}
            </CardDescription>
          </div>
          
          {!isLogin && (
            <div className="flex justify-center gap-2 pt-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === currentSection
                      ? 'bg-primary'
                      : step < currentSection
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Section 1: Personal Information */}
                {currentSection === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => updateFormData('fullName', e.target.value)}
                          className={errors.fullName ? 'border-destructive' : ''}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nationalId">National ID *</Label>
                        <Input
                          id="nationalId"
                          type="text"
                          placeholder="Enter National ID"
                          value={formData.nationalId}
                          onChange={(e) => updateFormData('nationalId', e.target.value)}
                          className={errors.nationalId ? 'border-destructive' : ''}
                        />
                        {errors.nationalId && (
                          <p className="text-sm text-destructive">{errors.nationalId}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                          className={errors.dateOfBirth ? 'border-destructive' : ''}
                        />
                        {errors.dateOfBirth && (
                          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => updateFormData('gender', value)}
                        >
                          <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((g) => (
                              <SelectItem key={g} value={g}>
                                {g}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <p className="text-sm text-destructive">{errors.gender}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type *</Label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={(value) => updateFormData('bloodType', value)}
                        >
                          <SelectTrigger className={errors.bloodType ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bloodType && (
                          <p className="text-sm text-destructive">{errors.bloodType}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => updateFormData('email', e.target.value)}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className={errors.password ? 'border-destructive' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label>I am a...</Label>
                      <RadioGroup
                        value={role}
                        onValueChange={(value) => setRole(value as AppRole)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="swimmer" id="swimmer" className="peer sr-only" />
                          <Label
                            htmlFor="swimmer"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                          >
                            <User className="mb-2 h-6 w-6" />
                            <span className="font-medium">Swimmer</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="coach" id="coach" className="peer sr-only" />
                          <Label
                            htmlFor="coach"
                            className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                          >
                            <Users className="mb-2 h-6 w-6" />
                            <span className="font-medium">Coach</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {/* Section 2: Parent's Information */}
                {currentSection === 2 && (
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <h3 className="font-semibold text-foreground mb-3">Father's Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">Father's Name</Label>
                          <Input
                            id="fatherName"
                            type="text"
                            placeholder="Father's full name"
                            value={formData.fatherName}
                            onChange={(e) => updateFormData('fatherName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherNationalId">Father's National ID</Label>
                          <Input
                            id="fatherNationalId"
                            type="text"
                            placeholder="Father's National ID"
                            value={formData.fatherNationalId}
                            onChange={(e) => updateFormData('fatherNationalId', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                      <h3 className="font-semibold text-foreground mb-3">Mother's Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherName">Mother's Name</Label>
                          <Input
                            id="motherName"
                            type="text"
                            placeholder="Mother's full name"
                            value={formData.motherName}
                            onChange={(e) => updateFormData('motherName', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherNationalId">Mother's National ID</Label>
                          <Input
                            id="motherNationalId"
                            type="text"
                            placeholder="Mother's National ID"
                            value={formData.motherNationalId}
                            onChange={(e) => updateFormData('motherNationalId', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 3: Medical History */}
                {currentSection === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <Textarea
                        id="allergies"
                        placeholder="List any known allergies (e.g., medications, food, environmental)"
                        value={formData.allergies}
                        onChange={(e) => updateFormData('allergies', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousSurgeries">Previous Surgeries</Label>
                      <Textarea
                        id="previousSurgeries"
                        placeholder="List any previous surgeries with approximate dates"
                        value={formData.previousSurgeries}
                        onChange={(e) => updateFormData('previousSurgeries', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                      <Textarea
                        id="chronicDiseases"
                        placeholder="List any chronic diseases or ongoing health conditions"
                        value={formData.chronicDiseases}
                        onChange={(e) => updateFormData('chronicDiseases', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-2">
              {!isLogin && currentSection > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <Button
                type="submit"
                className="flex-1 gradient-ocean hover:opacity-90 transition-opacity"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In'
                  : currentSection < 3
                  ? (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )
                  : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
