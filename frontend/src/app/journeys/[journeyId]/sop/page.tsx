'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Lock, ChevronRight, FileText } from 'lucide-react';

const tableOfContents = [
  { id: 1, title: '什麼是 SOP？' },
  { id: 2, title: '設計模式的思維流程' },
  { id: 3, title: '需求分析 SOP' },
  { id: 4, title: '程式碼重構 SOP' },
  { id: 5, title: '測試驅動開發 SOP' },
];

export default function SopPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1B1B1F] flex items-center justify-center">
        <div className="animate-pulse text-white">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1B1F]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SOP 寶典</h1>
          <p className="text-gray-400">軟體設計模式精通之旅</p>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#2A2A2F] rounded-lg border border-gray-700 p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#F17500]/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#F17500]" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  您無法觀看『SOP 寶典』
                </h2>
                <p className="text-gray-400 max-w-md">
                  此內容僅供已購買課程的學員觀看，請先登入或購買課程以解鎖完整內容。
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  className="bg-[#F17500] hover:bg-[#F17500]/90 text-white px-6"
                >
                  <Link href="/login">
                    登入
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-[#F17500] text-[#F17500] hover:bg-[#F17500]/10"
                >
                  <Link href="/courses">
                    購買課程
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                目錄
              </h3>
              <ul className="space-y-2">
                {tableOfContents.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-[#1B1B1F] text-gray-500 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <span>{item.title}</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-[#2A2A2F] rounded-lg border border-gray-700 p-8">
            <p className="text-gray-400 text-center">
              歡迎回來！請選擇要閱讀的章節。
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                目錄
              </h3>
              <ul className="space-y-2">
                {tableOfContents.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-md bg-[#1B1B1F] text-gray-300 hover:bg-[#3A3A3F] cursor-pointer transition-colors"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0 text-[#F17500]" />
                    <span>{item.title}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
