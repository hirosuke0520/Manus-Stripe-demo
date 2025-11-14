import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { UtensilsCrossed } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [tableNumber, setTableNumber] = useState("");

  const handleStart = () => {
    if (tableNumber.trim()) {
      setLocation(`/menu?table=${encodeURIComponent(tableNumber)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">{APP_TITLE}</CardTitle>
          <CardDescription className="text-base">
            テーブル番号を入力してご注文を開始してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="tableNumber" className="text-sm font-medium">
              テーブル番号
            </label>
            <Input
              id="tableNumber"
              type="text"
              placeholder="例: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleStart();
                }
              }}
              className="text-lg text-center"
            />
          </div>
          <Button
            onClick={handleStart}
            disabled={!tableNumber.trim()}
            className="w-full text-lg py-6"
            size="lg"
          >
            メニューを見る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
