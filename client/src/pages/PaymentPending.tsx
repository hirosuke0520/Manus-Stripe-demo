import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";

export default function PaymentPending() {
  const searchParams = new URLSearchParams(useSearch());
  const orderId = searchParams.get("orderId");
  const [, setLocation] = useLocation();

  if (!orderId) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">お支払いをお待ちしています</CardTitle>
            <CardDescription>注文番号: #{orderId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">
                    別のタブでStripe決済ページが開いています
                  </p>
                  <p className="text-sm text-blue-700 mt-2">
                    決済ページでお支払いを完了してください。<br />
                    お支払い完了後、自動的に確認ページに移動します。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">テスト決済について</h3>
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <strong>テストカード番号:</strong> 4242 4242 4242 4242
                </p>
                <p className="text-sm">
                  <strong>有効期限:</strong> 任意の未来の日付（例: 12/34）
                </p>
                <p className="text-sm">
                  <strong>CVC:</strong> 任意の3桁の数字（例: 123）
                </p>
                <p className="text-sm">
                  <strong>郵便番号:</strong> 任意の番号
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                決済ページが開かない場合や、お支払いをキャンセルした場合は、<br />
                下のボタンからトップページに戻ってください。
              </p>
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                className="w-full"
              >
                トップページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
