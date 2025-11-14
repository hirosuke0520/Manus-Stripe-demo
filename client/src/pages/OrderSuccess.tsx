import { useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function OrderSuccess() {
  const searchParams = new URLSearchParams(useSearch());
  const orderId = parseInt(searchParams.get("orderId") || "0");
  const [, setLocation] = useLocation();

  const { data, isLoading } = trpc.order.getById.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  if (!orderId) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>注文が見つかりません</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              トップページに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { order, items } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">ご注文ありがとうございます！</CardTitle>
            <CardDescription>
              注文番号: #{order.id} | テーブル {order.tableNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-center font-medium text-yellow-900">
                お支払いは後ほどStripe決済画面にて行います
              </p>
              <p className="text-center text-sm text-yellow-700 mt-2">
                （現在はデモモードのため、注文のみ受け付けています）
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">ご注文内容</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-2 border-b"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItemName}</p>
                      <p className="text-sm text-muted-foreground">
                        ¥{item.priceYen.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ¥{(item.priceYen * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 text-xl font-bold border-t-2">
                <span>合計金額</span>
                <span>¥{order.totalAmountYen.toLocaleString()}</span>
              </div>
            </div>

            {order.notes && (
              <div className="space-y-2">
                <h3 className="font-semibold">備考</h3>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}

            <div className="pt-4">
              <p className="text-center text-muted-foreground mb-4">
                料理の準備ができ次第、お席までお持ちいたします。<br />
                しばらくお待ちください。
              </p>
              <Button onClick={() => setLocation("/")} className="w-full" size="lg">
                トップページに戻る
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
