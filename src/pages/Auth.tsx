import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Waves,
  User,
  Users,
  ChevronRight,
  ChevronLeft,
  Award,
} from "lucide-react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/Context/LanguageContext";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  nationalId: z.string().min(5, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fatherName: z.string().optional(),
  fatherNationalId: z.string().optional(),
  motherName: z.string().optional(),
  motherNationalId: z.string().optional(),
  allergies: z.string().optional(),
  previousSurgeries: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

const coachSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AppRole = "swimmer" | "coach" | null;
type SignupFormData = z.infer<typeof signupSchema>;
type FormErrors = Partial<Record<keyof SignupFormData | "name", string>>;

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female"];

export default function Auth() {
  const [role, setRole] = useState<AppRole>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  const { t } = useTranslation();
  const { lang, toggleLanguage } = useLanguage();

  if (!lang) return null; // safe now

  // Swimmer form data
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    nationalId: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    email: "",
    password: "",
    fatherName: "",
    fatherNationalId: "",
    motherName: "",
    motherNationalId: "",
    allergies: "",
    previousSurgeries: "",
    chronicDiseases: "",
  });

  // Coach form data
  const [coachData, setCoachData] = useState({
    name: "",
    password: "",
  });

  const updateFormData = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateCoachData = (field: "name" | "password", value: string) => {
    setCoachData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateSection = (section: number): boolean => {
    const newErrors: FormErrors = {};

    if (section === 1) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = "Full name must be at least 2 characters";
      }
      if (!formData.nationalId || formData.nationalId.length < 5) {
        newErrors.nationalId = "National ID is required";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
      if (!formData.bloodType) {
        newErrors.bloodType = "Blood type is required";
      }
      if (
        !formData.email ||
        !z.string().email().safeParse(formData.email).success
      ) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCoachForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!coachData.name || coachData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!coachData.password || coachData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 1));
  };

  const handleSwimmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentSection < 3) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Account created successfully!");
      navigate("/profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCoachForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Welcome, Coach!");
      navigate("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelect = (selectedRole: AppRole) => {
    setRole(selectedRole);
    setErrors({});
  };

  const handleBackToRoleSelection = () => {
    setRole(null);
    setCurrentSection(1);
    setErrors({});
  };

  // Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen gradient-ocean-vertical flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 gradient-ocean backdrop-blur-sm rounded-full animate-float">
                
                <Waves className="w-16 h-16 text-white " />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold  mb-4">
              {t("Auth.title")}
            </h1>
            <p className="text-xl">{t("Auth.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Swimmer Card */}
            <div
              onClick={() => handleRoleSelect("swimmer")}
              className="role-card role-card-swimmer bg-white/95 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 gradient-ocean rounded-full">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t("Auth.IamSwimmer")}
                </h2>
                <p className="text-muted-foreground">
                  {t("Auth.Sdesc")}
                </p>
                <Button className="gradient-ocean text-white mt-4 w-full">
                  {t("Auth.Scon")}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Coach Card */}
            <div
              onClick={() => handleRoleSelect("coach")}
              className="role-card role-card-coach bg-white/95 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {t("Auth.IamCoach")}
                </h2>
                <p className="text-muted-foreground">
                  {t("Auth.Cdesc")}
                </p>
                <Button className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white mt-4 w-full">
                  {t("Auth.Ccon")}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Coach Form
  if (role === "coach") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <button
              onClick={handleBackToRoleSelection}
              className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">{t("Auth.CSignup")}</CardTitle>
            <CardDescription>
              {t("Auth.CSdesc")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCoachSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Auth.name")}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("Auth.name")}
                  value={coachData.name}
                  onChange={(e) => updateCoachData("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("Auth.Password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("Auth.Password")}
                  value={coachData.password}
                  onChange={(e) => updateCoachData("password", e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : t("buttons.Continue")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Swimmer Multi-Step Form
  return (
    <div className="min-h-screen gradient-ocean-vertical flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center pb-2 relative">
          <button
            onClick={handleBackToRoleSelection}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-4">
            <div className="p-3 gradient-ocean rounded-full">
              <Waves className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Swimmer Registration
          </CardTitle>
          <CardDescription>
            Step {currentSection} of 3:{" "}
            {currentSection === 1
              ? "Personal Information"
              : currentSection === 2
              ? "Parent's Information"
              : "Medical History"}
          </CardDescription>

          {/* Progress Steps */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  step <= currentSection
                    ? "gradient-ocean scale-100"
                    : "bg-muted scale-90"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSwimmerSubmit} className="space-y-4">
            {/* Section 1: Personal Information */}
            {currentSection === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) =>
                        updateFormData("fullName", e.target.value)
                      }
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID *</Label>
                    <Input
                      id="nationalId"
                      placeholder="Enter your national ID"
                      value={formData.nationalId}
                      onChange={(e) =>
                        updateFormData("nationalId", e.target.value)
                      }
                      className={errors.nationalId ? "border-destructive" : ""}
                    />
                    {errors.nationalId && (
                      <p className="text-xs text-destructive">
                        {errors.nationalId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) =>
                        updateFormData("dateOfBirth", e.target.value)
                      }
                      className={errors.dateOfBirth ? "border-destructive" : ""}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-xs text-destructive">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => updateFormData("gender", value)}
                    >
                      <SelectTrigger
                        className={errors.gender ? "border-destructive" : ""}
                      >
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
                      <p className="text-xs text-destructive">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Blood Type *</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) =>
                        updateFormData("bloodType", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.bloodType ? "border-destructive" : ""}
                      >
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
                      <p className="text-xs text-destructive">
                        {errors.bloodType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Section 2: Parent's Information */}
            {currentSection === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Father's Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        placeholder="Enter father's name"
                        value={formData.fatherName}
                        onChange={(e) =>
                          updateFormData("fatherName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherNationalId">
                        Father's National ID
                      </Label>
                      <Input
                        id="fatherNationalId"
                        placeholder="Enter father's national ID"
                        value={formData.fatherNationalId}
                        onChange={(e) =>
                          updateFormData("fatherNationalId", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Mother's Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        placeholder="Enter mother's name"
                        value={formData.motherName}
                        onChange={(e) =>
                          updateFormData("motherName", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherNationalId">
                        Mother's National ID
                      </Label>
                      <Input
                        id="motherNationalId"
                        placeholder="Enter mother's national ID"
                        value={formData.motherNationalId}
                        onChange={(e) =>
                          updateFormData("motherNationalId", e.target.value)
                        }
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
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any allergies you have"
                    value={formData.allergies}
                    onChange={(e) =>
                      updateFormData("allergies", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousSurgeries">Previous Surgeries</Label>
                  <Textarea
                    id="previousSurgeries"
                    placeholder="List any previous surgeries"
                    value={formData.previousSurgeries}
                    onChange={(e) =>
                      updateFormData("previousSurgeries", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronicDiseases">Chronic Diseases</Label>
                  <Textarea
                    id="chronicDiseases"
                    placeholder="List any chronic diseases"
                    value={formData.chronicDiseases}
                    onChange={(e) =>
                      updateFormData("chronicDiseases", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentSection > 1 && (
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
                className="flex-1 gradient-ocean hover:opacity-90 transition-opacity text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Please wait..."
                ) : currentSection < 3 ? (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
