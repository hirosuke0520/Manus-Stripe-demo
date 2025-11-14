import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CartItem {
  menuItemId: number;
  name: string;
  priceYen: number;
  quantity: number;
}

export default function Menu() {
  const searchParams = new URLSearchParams(useSearch());
  const tableNumber = searchParams.get("table") || "";
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: categories = [] } = trpc.menu.getCategories.useQuery();
  const { data: menuItems = [] } = trpc.menu.getAllItems.useQuery();

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceYen * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const addToCart = (item: typeof menuItems[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, priceYen: item.priceYen, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (menuItemId: number) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const cartData = encodeURIComponent(JSON.stringify(cart));
    setLocation(`/checkout?table=${encodeURIComponent(tableNumber)}&cart=${cartData}`);
  };

  if (!tableNumber) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">テーブル {tableNumber}</h1>
            <p className="text-sm text-muted-foreground">メニューからお選びください</p>
          </div>
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="relative">
                <ShoppingCart className="w-5 h-5 mr-2" />
                カート
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-2 py-1">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>ご注文内容</SheetTitle>
                <SheetDescription>
                  テーブル {tableNumber}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      カートは空です
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <Card key={item.menuItemId}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 className="font-medium">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  ¥{item.priceYen.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.menuItemId)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.menuItemId, -1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.menuItemId, 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <span className="ml-auto font-medium">
                                ¥{(item.priceYen * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>合計</span>
                    <span>¥{cartTotal.toLocaleString()}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    お会計に進む
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Menu Content */}
      <div className="container py-6">
        <Tabs defaultValue={categories[0]?.id.toString()} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-2 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id.toString()}
                className="flex-1 min-w-[100px]"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id.toString()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems
                  .filter((item) => item.categoryId === category.id)
                  .map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow overflow-hidden">
                      {item.imageUrl && (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {item.description && (
                              <CardDescription className="mt-1">
                                {item.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-2 text-base font-bold">
                            ¥{item.priceYen.toLocaleString()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => addToCart(item)}
                          className="w-full"
                          variant="default"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          カートに追加
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
