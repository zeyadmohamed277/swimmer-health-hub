import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Waves,
  User,
  Users,
  Activity,
  Shield,
  TrendingUp,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/Context/LanguageContext";
export default function Index() {
  const { t } = useTranslation();
  const { lang, toggleLanguage } = useLanguage();

  if (!lang) return null; // safe now
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && role) {
      if (role === "swimmer") {
        navigate("/profile");
      } else if (role === "coach") {
        navigate("/dashboard");
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

  return (
    <div className="min-h-screen gradient-surface">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <button
          onClick={toggleLanguage}
          className="
        px-3 py-1 rounded-md text-sm font-semibold
        border border-gray-300 dark:border-gray-700
        hover:bg-gray-100 dark:hover:bg-gray-800
        text-black
      "
        >
          {lang === "en" ? "AR" : "EN"}
        </button>

        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-ocean flex items-center justify-center mb-6 shadow-lg">
            <Waves className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("home.SwimHealth")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="gradient-ocean hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                {t("home.getStarted")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t("home.Sign In")}
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
              <CardTitle>{t("home.Swimmer Profiles")}</CardTitle>
              <CardDescription>
                {t("home.Profile descriptions")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.In-Body Analysis")}</CardTitle>
              <CardDescription>{t("home.tracking")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.Medical Tracking")}</CardTitle>
              <CardDescription>{t("home.medicalTrackingDesc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.Coach Dashboard")}</CardTitle>
              <CardDescription>{t("home.dashboardDesc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>{t("home.Secure & Private")}</CardTitle>
              <CardDescription>{t("home.secureDesc")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="animate-fade-in border-border/50 hover:shadow-md transition-shadow bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="text-primary">
                {t("home.Ready to Start?")}
              </CardTitle>
              <CardDescription>{t("home.joinUsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full">{t("home.createAccount")}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
