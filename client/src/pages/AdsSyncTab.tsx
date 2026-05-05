import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, Zap, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function AdsSyncTab() {
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const testMetaConnection = trpc.ads.testMetaConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setSyncStatus("success");
        setSyncMessage("✅ Conexão com Meta Ads estabelecida com sucesso!");
      } else {
        setSyncStatus("error");
        setSyncMessage(`❌ ${data.message}`);
      }
    },
    onError: (error) => {
      setSyncStatus("error");
      setSyncMessage(`❌ Erro: ${error.message}`);
    },
  });

  const handleTestConnection = async () => {
    setSyncStatus("loading");
    setSyncMessage("Testando conexão...");
    await testMetaConnection.mutateAsync();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6" /> Sincronização de Campanhas
        </h2>
        <p className="text-muted-foreground mt-2">
          Sincronize automaticamente os dados das suas campanhas do Google Ads e Meta Ads
        </p>
      </div>

      {/* Status Alert */}
      {syncStatus !== "idle" && (
        <Alert className={syncStatus === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertCircle className={`h-4 w-4 ${syncStatus === "success" ? "text-green-600" : "text-red-600"}`} />
          <AlertDescription className={syncStatus === "success" ? "text-green-800" : "text-red-800"}>
            {syncMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Meta Ads Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-indigo-50">Meta Ads</Badge>
                Testar Conexão
              </CardTitle>
              <CardDescription>
                Valide se suas credenciais do Facebook estão corretas
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Account ID</p>
              <p className="font-mono text-sm">1536672876562340</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-muted-foreground mb-3">
                Clique no botão abaixo para testar a conexão com a API do Meta Ads:
              </p>
              <Button
                onClick={handleTestConnection}
                disabled={testMetaConnection.isPending}
                className="gap-2"
              >
                {testMetaConnection.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Testar Conexão
                  </>
                )}
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Status da Conexão</p>
                <div className="flex items-center gap-2">
                  {syncStatus === "success" ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-600">Conectado</span>
                    </>
                  ) : syncStatus === "error" ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">Erro</span>
                    </>
                  ) : (
                    <>
                      <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                      <span className="font-medium text-slate-600">Não testado</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Último Teste</p>
                <p className="font-medium text-slate-600">
                  {syncStatus === "idle" ? "Nunca" : "Agora"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Ads Card */}
      <Card className="opacity-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">Google Ads</Badge>
                Sincronização
              </CardTitle>
              <CardDescription>
                Sincronize campanhas do Google Ads (em desenvolvimento)
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
              <p className="font-mono text-sm">920-715-3288</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A integração com Google Ads está em desenvolvimento. Será disponibilizada em breve.
          </p>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solução de Problemas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">❌ Erro: "Invalid OAuth access token"</p>
            <p className="text-muted-foreground">
              Seu token do Facebook expirou ou é inválido. Gere um novo token no Facebook Business Manager:
              <br />
              Configurações → Contas de Usuário do Sistema → Gerar Token
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">❌ Erro: "Cannot parse access token"</p>
            <p className="text-muted-foreground">
              Verifique se o token foi copiado completamente sem espaços extras no início ou fim.
            </p>
          </div>
          <div>
            <p className="font-medium mb-1">✅ Conexão Bem-sucedida</p>
            <p className="text-muted-foreground">
              Se a conexão for bem-sucedida, as campanhas serão sincronizadas automaticamente a cada hora.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
