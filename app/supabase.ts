import { createClient } from '@supabase/supabase-js';

// 1. 주소 (URL) - 이건 제가 채워뒀습니다. 건드리지 마세요.
const supabaseUrl = 'https://okckpesbufkqhmzcjiab.supabase.co';

// 2. 키 (Key) - 아래 따옴표 '' 사이에 eyJ로 시작하는 긴 키를 붙여넣으세요.
// (한글이나 공백 없이 딱 키만 들어가야 합니다!)
const supabaseKey = 'sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t'; 

export const supabase = createClient(supabaseUrl, supabaseKey);