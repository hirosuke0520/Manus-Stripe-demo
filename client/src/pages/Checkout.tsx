import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  menuItemId: number;
  name: string;
  priceYen: number;
  quantity: number;
}

export default function Checkout() {
  const searchParams = new URLSearchParams(useSearch());
  const tableNumber = searchParams.get("table") || "";
  const cartData = searchParams.get("cart") || "[]";
  const [, setLocation] = useLocation();

  const cart: CartItem[] = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(cartData));
    } catch {
      return [];
    }
  }, [cartData]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Stripe決済ページに移動します...");
        window.open(data.checkoutUrl, '_blank');
        // Also navigate to a waiting page
        setLocation(`/payment-pending?orderId=${data.orderId}`);
      } else {
        toast.error("決済URLの取得に失敗しました");
      }
    },
    onError: (error) => {
      toast.error("注文の作成に失敗しました: " + error.message);
    },
  });

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceYen * item.quantity, 0);
  }, [cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("カートが空です");
      return;
    }

    createOrderMutation.mutate({
      tableNumber,
      items: cart.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
      ...(customerName && { customerName }),
      ...(customerEmail && { customerEmail }),
      ...(notes && { notes }),
    });
  };

  if (!tableNumber || cart.length === 0) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ご注文の確認</CardTitle>
            <CardDescription>テーブル {tableNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">注文内容</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
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
                  <span>¥{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Customer Info (Optional) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">お客様情報（任意）</h3>
                <div className="space-y-2">
                  <Label htmlFor="customerName">お名前</Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="山田太郎"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">メールアドレス</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="example@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">備考・アレルギー情報など</Label>
                  <Textarea
                    id="notes"
                    placeholder="例: アレルギーがある、辛さ控えめなど"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/menu?table=${encodeURIComponent(tableNumber)}`)}
                  className="flex-1"
                >
                  メニューに戻る
                </Button>
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="flex-1"
                  size="lg"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    "注文を確定して支払いへ"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
