import { createClient } from '@supabase/supabase-js'

// イベント主催者への共有URL機能のための同期用バックエンド（Supabase）。
// anonキーはSupabaseの設計上クライアント（ブラウザ）に公開しても安全なキーで、
// アクセス制御はデータベース側のRow Level Security（RLSポリシー）で行う。
// このアプリは管理者ログインを持たない社内ツールのため、RLSは匿名ロールに
// 読み書きを許可しており、共有URLの安全性はトークンの推測困難性に依存する。
const SUPABASE_URL = 'https://wljltrphqdfltcrlsivv.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsamx0cnBocWRmbHRjcmxzaXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MjQwMjQsImV4cCI6MjEwNTIwMDAyNH0.Qy5WJtcwg0wyvfh6Dp9R6-5EXjF96uwhsHkH3XW9Pzo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
