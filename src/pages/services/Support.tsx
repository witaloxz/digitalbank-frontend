import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { HeadphonesIcon, Send, Check, MessageCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Support = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!subject || !message) {
      toast.error(t("servicesPage.fillAll"));
      return;
    }
    setSent(true);
    toast.success(t("servicesPage.support.sent"));
  };

  const contacts = [
    { icon: Phone, label: t("servicesPage.support.phone"), value: "0800 123 4567" },
    { icon: Mail, label: t("servicesPage.support.email"), value: "support@bankdash.com" },
    {
      icon: MessageCircle,
      label: t("servicesPage.support.liveChat"),
      value: t("servicesPage.support.available247"),
    },
  ];

  return (
    <DashboardLayout title={t("servicesPage.support.title")}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {!sent ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5 text-primary" />
                {t("servicesPage.support.sendMessage")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("servicesPage.support.subject")}</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t("servicesPage.support.subjectPlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("servicesPage.support.message")}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("servicesPage.support.messagePlaceholder")}
                  rows={5}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full gap-2">
                <Send className="h-4 w-4" />
                {t("servicesPage.support.sendBtn")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              {t("servicesPage.support.sentTitle")}
            </h3>
            <p className="mb-4 text-muted-foreground">{t("servicesPage.support.sentDesc")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSent(false);
                setSubject("");
                setMessage("");
              }}
            >
              {t("servicesPage.support.sendAnother")}
            </Button>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            {t("servicesPage.support.contactChannels")}
          </h3>
          {contacts.map((c, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Support;