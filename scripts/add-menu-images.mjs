import { drizzle } from "drizzle-orm/mysql2";
import { menuItems } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

// Unsplash image URLs for each menu item
const imageUrls = {
  // とりあえず (Appetizers)
  "枝豆のアーリオオーリオ": "https://images.unsplash.com/photo-1583937443566-6743fbb3a48d?w=800&q=80",
  "自家製ピクルス盛り合わせ": "https://images.unsplash.com/photo-1589621316382-008455b857cd?w=800&q=80",
  "クリームチーズの醤油漬け": "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&q=80",
  "鶏皮ポン酢 - 柚子胡椒添え": "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&q=80",
  "たたききゅうりの梅和え": "https://images.unsplash.com/photo-1604908815453-c0d5e9a5d6e5?w=800&q=80",

  // 冷菜 (Cold Dishes)
  "鮮魚のカルパッチョ - 季節のソースで": "https://images.unsplash.com/photo-1580959375944-1ab5b8c78f88?w=800&q=80",
  "朝採れ野菜のバーニャカウダ": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "生ハムと旬のフルーツ": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
  "よだれ鶏 - 自家製辣油": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&q=80",
  "アボカドとマグロのタルタル": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",

  // 温菜 (Hot Dishes)
  "トリュフ香るフライドポテト": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  "海老とマッシュルームのアヒージョ（バゲット付き）": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80",
  "だし巻き玉子 - 蟹あんかけ": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
  "牛すじの赤ワイン煮込み": "https://images.unsplash.com/photo-1595777216528-071e0127ccf4?w=800&q=80",
  "カマンベールチーズのオーブン焼き - 蜂蜜添え": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80",

  // 揚げ物 (Fried)
  "若鶏の唐揚げ - ネギ塩だれ": "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
  "里芋の唐揚げ": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80",
  "タコのフリット - スイートチリソース": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80",
  "カニクリームコロッケ": "https://images.unsplash.com/photo-1625938145312-c9f7b4c78e23?w=800&q=80",
  "ごぼうチップス": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800&q=80",

  // 焼き物・メイン (Grilled & Mains)
  "国産牛イチボのグリル": "https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80",
  "大山鶏のハーブ焼き": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
  "豚肩ロースの西京焼き": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80",
  "本日のお魚料理（スタッフにお尋ねください）": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
  "旬野菜のグリル盛り合わせ": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80",

  // 〆もの (Finishers)
  "鯛出汁茶漬け": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
  "濃厚カルボナーラ": "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
  "ポルチーニ茸のリゾット": "https://images.unsplash.com/photo-1476124369491-c0df1a7f1db6?w=800&q=80",
  "焼きおにぎり（2個）": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
  "本日のパスタ": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",

  // デザート (Desserts)
  "バスクチーズケーキ": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  "自家製ティラミス": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
  "季節のジェラート": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80",
  "ガトーショコラ": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80",
  "アフォガート": "https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=800&q=80",

  // ビール (Beer)
  "生ビール（プレミアムモルツ）": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
  "瓶ビール（アサヒスーパードライ）": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80",
  "シャンディガフ": "https://images.unsplash.com/photo-1527281400156-a0e9e7d6c4f8?w=800&q=80",
  "ノンアルコールビール": "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=800&q=80",

  // ハイボール・サワー (Highball & Sour)
  "角ハイボール": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
  "自家製ジンジャーハイボール": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
  "瀬戸内レモンサワー": "https://images.unsplash.com/photo-1587223075055-82e9a937ddff?w=800&q=80",
  "ウーロンハイ": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
  "緑茶ハイ": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",

  // ワイン・果実酒 (Wine & Fruit Liquor)
  "グラスワイン（赤・白）": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  "自家製サングリア": "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&q=80",
  "梅酒（ロック・ソーダ割り）": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",

  // ソフトドリンク (Soft Drinks)
  "自家製ジンジャーエール": "https://images.unsplash.com/photo-1527960669845-e2b9a7e97b8c?w=800&q=80",
  "オレンジジュース": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  "コーラ": "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=800&q=80",
  "ウーロン茶": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80",
};

async function updateImages() {
  console.log("Updating menu item images...");
  
  let updateCount = 0;
  
  for (const [itemName, imageUrl] of Object.entries(imageUrls)) {
    try {
      const result = await db
        .update(menuItems)
        .set({ imageUrl })
        .where(eq(menuItems.name, itemName));
      
      console.log(`Updated: ${itemName}`);
      updateCount++;
    } catch (error) {
      console.error(`Failed to update ${itemName}:`, error);
    }
  }
  
  console.log(`\nSuccessfully updated ${updateCount} menu items with images`);
  process.exit(0);
}

updateImages().catch((error) => {
  console.error("Update failed:", error);
  process.exit(1);
});
