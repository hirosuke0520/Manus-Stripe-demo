import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ClipboardList, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const statusLabels: Record<string, string> = {
  pending: "注文受付",
  paid: "支払済",
  preparing: "調理中",
  served: "提供済",
  completed: "完了",
  cancelled: "キャンセル",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  served: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StaffDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: orders = [], refetch: refetchOrders } = trpc.staff.getAllOrders.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  const { data: orderDetails } = trpc.staff.getOrderDetails.useQuery(
    { orderId: selectedOrderId! },
    { enabled: !!selectedOrderId }
  );

  const { data: dailySales } = trpc.staff.getDailySales.useQuery(
    { date: selectedDate },
    { enabled: !!user }
  );

  const { data: monthlySales } = trpc.staff.getMonthlySales.useQuery(
    { year: selectedDate.getFullYear(), month: selectedDate.getMonth() + 1 },
    { enabled: !!user }
  );

  const updateStatusMutation = trpc.staff.updateOrderStatus.useMutation({
    onSuccess: () => {
      toast.success("ステータスを更新しました");
      refetchOrders();
      setSelectedOrderId(null);
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>スタッフログインが必要です</CardTitle>
            <CardDescription>
              このページはスタッフ専用です。ログインしてください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              ログイン
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ['pending', 'paid', 'preparing'].includes(o.status));
  const completedOrders = orders.filter((o) => ['served', 'completed'].includes(o.status));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">スタッフダッシュボード</h1>
              <p className="text-sm text-muted-foreground">ようこそ、{user.name}さん</p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              自動更新中
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="orders">
              <ClipboardList className="w-4 h-4 mr-2" />
              注文管理
            </TabsTrigger>
            <TabsTrigger value="daily">
              <Calendar className="w-4 h-4 mr-2" />
              日次売上
            </TabsTrigger>
            <TabsTrigger value="monthly">
              <TrendingUp className="w-4 h-4 mr-2" />
              月次売上
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">進行中の注文</h2>
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    現在、進行中の注文はありません
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              テーブル {order.tableNumber}
                            </CardTitle>
                            <CardDescription>注文 #{order.id}</CardDescription>
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">金額</span>
                            <span className="font-bold">
                              ¥{order.totalAmountYen.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">注文時刻</span>
                            <span className="text-sm">
                              {new Date(order.createdAt).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">完了した注文</h2>
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    完了した注文はありません
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {completedOrders.slice(0, 10).map((order) => (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="font-medium">テーブル {order.tableNumber}</p>
                              <p className="text-sm text-muted-foreground">注文 #{order.id}</p>
                            </div>
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">¥{order.totalAmountYen.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Daily Sales Tab */}
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>日次売上</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">売上合計</p>
                    <p className="text-3xl font-bold">
                      ¥{(dailySales?.totalSales || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">注文件数</p>
                    <p className="text-3xl font-bold">{dailySales?.orderCount || 0}件</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">平均客単価</p>
                  <p className="text-2xl font-bold">
                    ¥
                    {dailySales?.orderCount
                      ? Math.round(dailySales.totalSales / dailySales.orderCount).toLocaleString()
                      : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Sales Tab */}
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>月次売上</CardTitle>
                <CardDescription>
                  {selectedDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">売上合計</p>
                    <p className="text-3xl font-bold">
                      ¥{(monthlySales?.totalSales || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">注文件数</p>
                    <p className="text-3xl font-bold">{monthlySales?.orderCount || 0}件</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">平均客単価</p>
                  <p className="text-2xl font-bold">
                    ¥
                    {monthlySales?.orderCount
                      ? Math.round(monthlySales.totalSales / monthlySales.orderCount).toLocaleString()
                      : 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrderId} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>注文詳細 #{selectedOrderId}</DialogTitle>
            <DialogDescription>
              テーブル {orderDetails?.order.tableNumber}
            </DialogDescription>
          </DialogHeader>
          {orderDetails && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">注文内容</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b">
                        <div>
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
                  <div className="flex justify-between pt-4 text-lg font-bold border-t-2">
                    <span>合計</span>
                    <span>¥{orderDetails.order.totalAmountYen.toLocaleString()}</span>
                  </div>
                </div>

                {orderDetails.order.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">備考</h3>
                    <p className="text-muted-foreground">{orderDetails.order.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">ステータス変更</h3>
                  <Select
                    value={orderDetails.order.status}
                    onValueChange={(value) => {
                      updateStatusMutation.mutate({
                        orderId: orderDetails.order.id,
                        status: value as any,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
