import { drizzle } from "drizzle-orm/mysql2";
import { categories, menuItems } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const categoriesData = [
  { name: "とりあえず", nameEn: "Appetizers", displayOrder: 1 },
  { name: "冷菜", nameEn: "Cold Dishes", displayOrder: 2 },
  { name: "温菜", nameEn: "Hot Dishes", displayOrder: 3 },
  { name: "揚げ物", nameEn: "Fried", displayOrder: 4 },
  { name: "焼き物・メイン", nameEn: "Grilled & Mains", displayOrder: 5 },
  { name: "〆もの", nameEn: "Finishers", displayOrder: 6 },
  { name: "デザート", nameEn: "Desserts", displayOrder: 7 },
  { name: "ビール", nameEn: "Beer", displayOrder: 8 },
  { name: "ハイボール・サワー", nameEn: "Highball & Sour", displayOrder: 9 },
  { name: "ワイン・果実酒", nameEn: "Wine & Fruit Liquor", displayOrder: 10 },
  { name: "ソフトドリンク", nameEn: "Soft Drinks", displayOrder: 11 },
];

const menuItemsData = [
  // とりあえず (Category 1)
  { categoryId: 1, name: "枝豆のアーリオオーリオ", description: "ガーリックオイルで香ばしく仕上げた枝豆", priceYen: 480, displayOrder: 1 },
  { categoryId: 1, name: "自家製ピクルス盛り合わせ", description: "季節野菜の自家製ピクルス", priceYen: 580, displayOrder: 2 },
  { categoryId: 1, name: "クリームチーズの醤油漬け", description: "まろやかなクリームチーズと醤油の絶妙なハーモニー", priceYen: 520, displayOrder: 3 },
  { categoryId: 1, name: "鶏皮ポン酢 - 柚子胡椒添え", description: "カリッと焼いた鶏皮にさっぱりポン酢", priceYen: 550, displayOrder: 4 },
  { categoryId: 1, name: "たたききゅうりの梅和え", description: "爽やかな梅の風味が効いたきゅうり", priceYen: 450, displayOrder: 5 },

  // 冷菜 (Category 2)
  { categoryId: 2, name: "鮮魚のカルパッチョ - 季節のソースで", description: "本日仕入れた新鮮な魚介のカルパッチョ", priceYen: 980, displayOrder: 1 },
  { categoryId: 2, name: "朝採れ野菜のバーニャカウダ", description: "契約農家から届く新鮮野菜とアンチョビソース", priceYen: 880, displayOrder: 2 },
  { categoryId: 2, name: "生ハムと旬のフルーツ", description: "イタリア産生ハムと季節のフルーツの組み合わせ", priceYen: 950, displayOrder: 3 },
  { categoryId: 2, name: "よだれ鶏 - 自家製辣油", description: "しっとり蒸し鶏に特製辣油をたっぷりと", priceYen: 780, displayOrder: 4 },
  { categoryId: 2, name: "アボカドとマグロのタルタル", description: "濃厚なアボカドと新鮮マグロの贅沢な一品", priceYen: 920, displayOrder: 5 },

  // 温菜 (Category 3)
  { categoryId: 3, name: "トリュフ香るフライドポテト", description: "トリュフオイルで仕上げた贅沢なポテト", priceYen: 680, displayOrder: 1 },
  { categoryId: 3, name: "海老とマッシュルームのアヒージョ（バゲット付き）", description: "ぷりぷり海老とマッシュルームをニンニクオイルで", priceYen: 1280, displayOrder: 2 },
  { categoryId: 3, name: "だし巻き玉子 - 蟹あんかけ", description: "ふわふわのだし巻きに濃厚な蟹あんをかけて", priceYen: 880, displayOrder: 3 },
  { categoryId: 3, name: "牛すじの赤ワイン煮込み", description: "じっくり煮込んだ柔らかい牛すじ", priceYen: 1180, displayOrder: 4 },
  { categoryId: 3, name: "カマンベールチーズのオーブン焼き - 蜂蜜添え", description: "とろけるチーズに蜂蜜の甘みが絶妙", priceYen: 980, displayOrder: 5 },

  // 揚げ物 (Category 4)
  { categoryId: 4, name: "若鶏の唐揚げ - ネギ塩だれ", description: "ジューシーな唐揚げに特製ネギ塩だれ", priceYen: 780, displayOrder: 1 },
  { categoryId: 4, name: "里芋の唐揚げ", description: "ほくほくの里芋を香ばしく揚げて", priceYen: 580, displayOrder: 2 },
  { categoryId: 4, name: "タコのフリット - スイートチリソース", description: "カリッと揚げたタコにスイートチリソース", priceYen: 880, displayOrder: 3 },
  { categoryId: 4, name: "カニクリームコロッケ", description: "濃厚な蟹の風味が広がるクリーミーなコロッケ", priceYen: 850, displayOrder: 4 },
  { categoryId: 4, name: "ごぼうチップス", description: "パリパリ食感のごぼうチップス", priceYen: 480, displayOrder: 5 },

  // 焼き物・メイン (Category 5)
  { categoryId: 5, name: "国産牛イチボのグリル", description: "柔らかくジューシーな国産牛イチボ", priceYen: 2480, displayOrder: 1 },
  { categoryId: 5, name: "大山鶏のハーブ焼き", description: "ハーブの香りが食欲をそそる鶏肉", priceYen: 1380, displayOrder: 2 },
  { categoryId: 5, name: "豚肩ロースの西京焼き", description: "味噌の風味が効いた柔らかい豚肉", priceYen: 1280, displayOrder: 3 },
  { categoryId: 5, name: "本日のお魚料理（スタッフにお尋ねください）", description: "市場から仕入れた旬の魚料理", priceYen: 1580, displayOrder: 4 },
  { categoryId: 5, name: "旬野菜のグリル盛り合わせ", description: "季節の野菜をシンプルにグリルで", priceYen: 980, displayOrder: 5 },

  // 〆もの (Category 6)
  { categoryId: 6, name: "鯛出汁茶漬け", description: "上品な鯛の出汁が効いたお茶漬け", priceYen: 880, displayOrder: 1 },
  { categoryId: 6, name: "濃厚カルボナーラ", description: "クリーミーで濃厚なカルボナーラ", priceYen: 980, displayOrder: 2 },
  { categoryId: 6, name: "ポルチーニ茸のリゾット", description: "香り高いポルチーニ茸のリゾット", priceYen: 1080, displayOrder: 3 },
  { categoryId: 6, name: "焼きおにぎり（2個）", description: "香ばしく焼き上げたおにぎり", priceYen: 580, displayOrder: 4 },
  { categoryId: 6, name: "本日のパスタ", description: "シェフおすすめの日替わりパスタ", priceYen: 1080, displayOrder: 5 },

  // デザート (Category 7)
  { categoryId: 7, name: "バスクチーズケーキ", description: "濃厚でなめらかなバスクチーズケーキ", priceYen: 680, displayOrder: 1 },
  { categoryId: 7, name: "自家製ティラミス", description: "コーヒーの香りが効いたティラミス", priceYen: 650, displayOrder: 2 },
  { categoryId: 7, name: "季節のジェラート", description: "季節のフルーツを使ったジェラート", priceYen: 580, displayOrder: 3 },
  { categoryId: 7, name: "ガトーショコラ", description: "濃厚なチョコレートの味わい", priceYen: 680, displayOrder: 4 },
  { categoryId: 7, name: "アフォガート", description: "バニラアイスにエスプレッソをかけて", priceYen: 650, displayOrder: 5 },

  // ビール (Category 8)
  { categoryId: 8, name: "生ビール（プレミアムモルツ）", description: "キレのある喉越しのプレミアムビール", priceYen: 680, displayOrder: 1 },
  { categoryId: 8, name: "瓶ビール（アサヒスーパードライ）", description: "辛口でキレのあるスーパードライ", priceYen: 650, displayOrder: 2 },
  { categoryId: 8, name: "シャンディガフ", description: "ビールとジンジャーエールのカクテル", priceYen: 680, displayOrder: 3 },
  { categoryId: 8, name: "ノンアルコールビール", description: "ビールの味わいをノンアルコールで", priceYen: 480, displayOrder: 4 },

  // ハイボール・サワー (Category 9)
  { categoryId: 9, name: "角ハイボール", description: "定番の角ハイボール", priceYen: 580, displayOrder: 1 },
  { categoryId: 9, name: "自家製ジンジャーハイボール", description: "自家製ジンジャーシロップを使ったハイボール", priceYen: 680, displayOrder: 2 },
  { categoryId: 9, name: "瀬戸内レモンサワー", description: "瀬戸内産レモンを使った爽やかなサワー", priceYen: 650, displayOrder: 3 },
  { categoryId: 9, name: "ウーロンハイ", description: "すっきりとしたウーロンハイ", priceYen: 550, displayOrder: 4 },
  { categoryId: 9, name: "緑茶ハイ", description: "さっぱりとした緑茶ハイ", priceYen: 550, displayOrder: 5 },

  // ワイン・果実酒 (Category 10)
  { categoryId: 10, name: "グラスワイン（赤・白）", description: "本日のおすすめワイン", priceYen: 680, displayOrder: 1 },
  { categoryId: 10, name: "自家製サングリア", description: "フルーツたっぷりの自家製サングリア", priceYen: 780, displayOrder: 2 },
  { categoryId: 10, name: "梅酒（ロック・ソーダ割り）", description: "まろやかな梅酒", priceYen: 650, displayOrder: 3 },

  // ソフトドリンク (Category 11)
  { categoryId: 11, name: "自家製ジンジャーエール", description: "生姜の風味が効いた自家製ジンジャーエール", priceYen: 480, displayOrder: 1 },
  { categoryId: 11, name: "オレンジジュース", description: "フレッシュなオレンジジュース", priceYen: 450, displayOrder: 2 },
  { categoryId: 11, name: "コーラ", description: "定番のコーラ", priceYen: 400, displayOrder: 3 },
  { categoryId: 11, name: "ウーロン茶", description: "すっきりとしたウーロン茶", priceYen: 400, displayOrder: 4 },
];

async function seed() {
  console.log("Seeding categories...");
  
  // Insert categories
  for (const category of categoriesData) {
    await db.insert(categories).values(category);
  }
  
  console.log(`Inserted ${categoriesData.length} categories`);
  
  console.log("Seeding menu items...");
  
  // Insert menu items
  for (const item of menuItemsData) {
    await db.insert(menuItems).values(item);
  }
  
  console.log(`Inserted ${menuItemsData.length} menu items`);
  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
