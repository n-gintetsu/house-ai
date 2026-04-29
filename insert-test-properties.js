const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
)

const testData = [
  {
    name: '大宮駅徒歩3分 新築マンション',
    property_type: 'sale',
    price: 4580,
    address: '埼玉県さいたま市大宮区',
    layout: '3LDK',
    area: 75.2,
    walk_minutes: 3,
    published: true,
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
  },
  {
    name: 'さいたま市 築浅賃貸アパート',
    property_type: 'rent',
    rent: 85000,
    address: '埼玉県さいたま市浦和区',
    layout: '2LDK',
    area: 58.0,
    walk_minutes: 8,
    published: true,
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  },
  {
    name: '川口市 中古一戸建て',
    property_type: 'sale',
    price: 3200,
    address: '埼玉県川口市',
    layout: '4LDK',
    area: 95.5,
    walk_minutes: 12,
    published: true,
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  },
  {
    name: '浦和駅近 1Kマンション',
    property_type: 'rent',
    rent: 65000,
    address: '埼玉県さいたま市浦和区',
    layout: '1K',
    area: 28.5,
    walk_minutes: 5,
    published: true,
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  },
  {
    name: '大宮区 収益マンション一棟',
    property_type: 'sale',
    price: 12800,
    address: '埼玉県さいたま市大宮区',
    layout: '1K×8戸',
    area: 320.0,
    walk_minutes: 7,
    published: true,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  },
]

async function insert() {
  const { data, error } = await supabase.from('properties').insert(testData).select()
  if (error) {
    console.error('❌ エラー:', error.message)
  } else {
    console.log(`✅ ${data.length}件のテスト物件を追加しました！`)
  }
}

insert()
